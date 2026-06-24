import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendWeeklyDigestEmail, type DigestTool } from '@/lib/email'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

type ToolRow = {
  name: string
  slug: string
  category_id: string | null
  pricing_model: string
  nonprofit_deal: string | null
}

type Recipient = {
  user_id: string
  email: string
  display_name: string | null
  org_name: string | null
  category_slugs: string[]
  pricing_models: string[]
}

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return req.headers.get('authorization') === `Bearer ${secret}`
}

async function run(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dryRun = new URL(req.url).searchParams.get('dryRun') === '1'
  const admin = createAdminClient()

  // Idempotency: never send the digest twice in one week. This lets BOTH the
  // Vercel Cron backstop and the Sunday agent call this endpoint safely —
  // whichever runs first sends, the other becomes a no-op.
  if (!dryRun) {
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    const { data: recent } = await admin
      .from('agent_runs')
      .select('id')
      .eq('kind', 'weekly_digest')
      .eq('status', 'success')
      .gte('created_at', fiveDaysAgo)
      .limit(1)
    if (recent && recent.length) {
      return NextResponse.json({ ok: true, alreadySent: true, reason: 'Weekly digest already sent in the last 5 days.' })
    }
  }

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const today = new Date().toISOString().slice(0, 10)

  // Category lookup (id -> {name, slug}) and which categories are new this week
  const { data: categories } = await admin.from('categories').select('id, name, slug, created_at')
  const catById = new Map((categories ?? []).map(c => [c.id, { name: c.name, slug: c.slug }]))
  const newCategories = (categories ?? [])
    .filter(c => c.created_at && c.created_at >= since)
    .map(c => ({ name: c.name, slug: c.slug }))

  const toDigestTool = (t: ToolRow): DigestTool & { categorySlug: string | null } => {
    const cat = t.category_id ? catById.get(t.category_id) ?? null : null
    return {
      name: t.name,
      slug: t.slug,
      categoryName: cat?.name ?? null,
      categorySlug: cat?.slug ?? null,
      pricingModel: t.pricing_model,
      nonprofitDeal: t.nonprofit_deal,
    }
  }

  // New (live) tools in the last 7 days
  const { data: newToolsRaw } = await admin
    .from('tools')
    .select('name, slug, category_id, pricing_model, nonprofit_deal, created_at')
    .eq('is_verified', true)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
  const newTools = (newToolsRaw ?? []).map(t => toDigestTool(t as ToolRow))

  // Popular tools (top by saves) for social proof
  const { data: popularRaw } = await admin
    .from('tools')
    .select('name, slug')
    .eq('is_verified', true)
    .order('save_count', { ascending: false })
    .limit(3)
  const popular = (popularRaw ?? []).map(t => ({ name: t.name, slug: t.slug }))

  // Current deal of the week
  const { data: wf } = await admin
    .from('weekly_features')
    .select('blurb, week_start, tools(name, slug, category_id, pricing_model, nonprofit_deal)')
    .lte('week_start', today)
    .order('week_start', { ascending: false })
    .limit(1)
    .maybeSingle()
  let dealOfWeek: (DigestTool & { blurb: string | null }) | null = null
  if (wf?.tools) {
    const tool = (Array.isArray(wf.tools) ? wf.tools[0] : wf.tools) as ToolRow | undefined
    if (tool) dealOfWeek = { ...toDigestTool(tool), blurb: wf.blurb ?? null }
  }

  // Recipients (opted-in, confirmed, non-banned, no test domains)
  const { data: recipients, error: recErr } = await admin.rpc('digest_recipients')
  if (recErr) {
    return NextResponse.json({ error: recErr.message }, { status: 500 })
  }
  const list = (recipients ?? []) as Recipient[]

  let sent = 0
  let skipped = 0
  let failed = 0

  for (const r of list) {
    // Personalize: if the user follows specific categories, only show matching new tools.
    const matches = r.category_slugs?.length
      ? newTools.filter(t => t.categorySlug && r.category_slugs.includes(t.categorySlug))
      : newTools

    // Nothing to say to this user this week
    if (!dealOfWeek && matches.length === 0 && newCategories.length === 0) {
      skipped++
      continue
    }
    if (dryRun) {
      sent++
      continue
    }
    try {
      await sendWeeklyDigestEmail({
        toEmail: r.email,
        orgName: r.org_name ?? r.display_name,
        newTools: matches,
        dealOfWeek,
        newCategories,
        popular,
      })
      sent++
    } catch {
      failed++
    }
  }

  const summary = {
    via: 'cron-endpoint',
    dryRun,
    recipients: list.length,
    sent,
    skipped,
    failed,
    newToolCount: newTools.length,
    dealOfWeek: dealOfWeek?.name ?? null,
    newCategoryCount: newCategories.length,
  }

  if (!dryRun) {
    await admin.from('agent_runs').insert({
      kind: 'weekly_digest',
      status: failed > 0 && sent === 0 ? 'error' : 'success',
      summary,
    })
  }

  return NextResponse.json({ ok: true, ...summary })
}

// Vercel Cron uses GET; allow POST for manual/agent triggers too.
export const GET = run
export const POST = run

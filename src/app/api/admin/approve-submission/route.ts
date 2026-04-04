import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient, ADMIN_EMAIL } from '@/lib/supabase/admin'
import { sendNewToolMatchEmail } from '@/lib/email'

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { submission_id } = await req.json()
  if (!submission_id) return NextResponse.json({ error: 'submission_id required' }, { status: 400 })

  const admin = createAdminClient()

  // Fetch the submission
  const { data: sub, error: subErr } = await admin
    .from('tool_submissions')
    .select('*')
    .eq('id', submission_id)
    .single()

  if (subErr || !sub) return NextResponse.json({ error: 'Submission not found' }, { status: 404 })

  // Find category_id from slug
  let category_id: string | null = null
  if (sub.category_slug) {
    const { data: cat } = await admin
      .from('categories')
      .select('id')
      .eq('slug', sub.category_slug)
      .single()
    category_id = cat?.id ?? null
  }

  // Generate a unique slug
  const baseSlug = toSlug(sub.name)
  let slug = baseSlug
  let attempt = 0
  while (true) {
    const { data: existing } = await admin.from('tools').select('id').eq('slug', slug).maybeSingle()
    if (!existing) break
    attempt++
    slug = `${baseSlug}-${attempt}`
  }

  // Insert the tool
  const { data: tool, error: toolErr } = await admin
    .from('tools')
    .insert({
      name: sub.name,
      slug,
      description: sub.description,
      website_url: sub.website_url,
      category_id,
      pricing_model: sub.pricing_model ?? 'free',
      nonprofit_deal: sub.nonprofit_deal,
      is_verified: true,
    })
    .select()
    .single()

  if (toolErr) return NextResponse.json({ error: toolErr.message }, { status: 500 })

  // Mark submission approved
  await admin
    .from('tool_submissions')
    .update({ status: 'approved' })
    .eq('id', submission_id)

  // ── Notify users whose preferences match this tool ───────────────────────
  try {
    const { data: matchingPrefs } = await admin
      .from('user_preferences')
      .select('user_id')
      .eq('notify_new_tools', true)
      .or(
        `category_slugs.cs.{"${sub.category_slug ?? ''}"},pricing_models.cs.{"${sub.pricing_model ?? ''}"}`
      )

    if (matchingPrefs && matchingPrefs.length > 0) {
      const userIds = matchingPrefs.map(p => p.user_id)

      // Fetch emails + profiles for matched users
      const { data: profiles } = await admin
        .from('profiles')
        .select('id, org_name, display_name')
        .in('id', userIds)

      const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))

      for (const { user_id } of matchingPrefs) {
        try {
          const { data: authUser } = await admin.auth.admin.getUserById(user_id)
          const email = authUser?.user?.email
          if (!email) continue
          const profile = profileMap[user_id]
          await sendNewToolMatchEmail({
            toEmail: email,
            orgName: profile?.org_name || profile?.display_name || null,
            toolName: tool.name,
            toolSlug: tool.slug,
            categoryName: sub.category_slug ?? null,
            pricingModel: tool.pricing_model,
            nonprofitDeal: tool.nonprofit_deal ?? null,
          })
        } catch {
          // Non-fatal: continue sending to other users
        }
      }
    }
  } catch {
    // Notification failure is non-fatal
  }

  return NextResponse.json({ tool })
}

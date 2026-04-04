import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient, ADMIN_EMAIL } from '@/lib/supabase/admin'

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

  return NextResponse.json({ tool })
}

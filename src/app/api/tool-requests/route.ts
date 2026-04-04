import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const CATEGORIES = [
  'crm-donor-management', 'fundraising-payments', 'email-marketing',
  'project-management', 'accounting-finance', 'website-cms',
  'communication-chat', 'design-graphics', 'grant-research-funding',
  'learning-training', 'pro-bono-services', 'advertising-media',
]

// GET /api/tool-requests — list all open requests sorted by votes
export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tool_requests')
    .select('id, name, url, category_slug, description, status, vote_count, created_at, user_id')
    .order('vote_count', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Attach the current user's vote status
  const { data: { user } } = await supabase.auth.getUser()
  let votedIds: string[] = []
  if (user && data && data.length > 0) {
    const { data: votes } = await supabase
      .from('tool_request_votes')
      .select('request_id')
      .eq('user_id', user.id)
      .in('request_id', data.map(r => r.id))
    votedIds = (votes ?? []).map(v => v.request_id)
  }

  const requests = (data ?? []).map(r => ({
    ...r,
    voted: votedIds.includes(r.id),
    is_own: user ? r.user_id === user.id : false,
  }))

  return Response.json({ requests, user_id: user?.id ?? null })
}

// POST /api/tool-requests — submit a new request
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return Response.json({ error: 'Sign in to submit a request' }, { status: 401 })

  const body = await request.json()
  const { name, url, category_slug, description } = body

  if (!name?.trim()) {
    return Response.json({ error: 'Tool name is required' }, { status: 400 })
  }

  if (category_slug && !CATEGORIES.includes(category_slug)) {
    return Response.json({ error: 'Invalid category' }, { status: 400 })
  }

  // Check for duplicate (same user, same tool name)
  const { data: existing } = await supabase
    .from('tool_requests')
    .select('id')
    .eq('user_id', user.id)
    .ilike('name', name.trim())
    .eq('status', 'open')
    .maybeSingle()

  if (existing) {
    return Response.json({ error: 'You already requested this tool' }, { status: 409 })
  }

  // Insert request (vote_count starts at 1 — submitter is first upvote)
  const { data: inserted, error } = await supabase
    .from('tool_requests')
    .insert({
      user_id: user.id,
      name: name.trim(),
      url: url?.trim() || null,
      category_slug: category_slug || null,
      description: description?.trim() || null,
      vote_count: 1,
    })
    .select('id')
    .single()

  if (error || !inserted) {
    return Response.json({ error: error?.message ?? 'Failed to create request' }, { status: 500 })
  }

  // Auto-upvote by the submitter
  await supabase.from('tool_request_votes').insert({
    user_id: user.id,
    request_id: inserted.id,
  })

  return Response.json({ ok: true, id: inserted.id })
}

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient, isAdminEmail } from '@/lib/supabase/admin'
import { revalidateTool } from '@/lib/tools/revalidate'

const ALLOWED_FIELDS = [
  'is_verified',
  'name',
  'description',
  'nonprofit_deal',
  'pricing_model',
  'website_url',
  'logo_url',
]

export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isAdminEmail(user.email)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const updates = Object.fromEntries(
    Object.entries(body).filter(([key]) => ALLOWED_FIELDS.includes(key))
  )

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data, error } = await admin
    .from('tools')
    .update(updates)
    .eq('slug', params.slug)
    .select('id, name, slug, is_verified, description, nonprofit_deal, pricing_model, website_url, logo_url')
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  // Publish the correction. Without this the edit lands in Postgres and the
  // public page keeps serving the superseded terms for up to
  // TOOL_CACHE_TTL_SECONDS — the one failure mode this site cannot afford.
  // Done here rather than in the client form so it cannot be skipped by a
  // caller that forgets, and so a failed follow-up request cannot leave the
  // database and the site disagreeing.
  revalidateTool(params.slug)

  return Response.json({ tool: data, revalidated: params.slug })
}

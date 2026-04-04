import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient, ADMIN_EMAIL } from '@/lib/supabase/admin'
import { sendRequestFulfilledEmail } from '@/lib/email'

// POST /api/admin/fulfill-request
// Marks a tool request as fulfilled and emails the requester
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { request_id, tool_slug } = await request.json()

  if (!request_id || !tool_slug) {
    return Response.json({ error: 'request_id and tool_slug are required' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Fetch the request
  const { data: req } = await admin
    .from('tool_requests')
    .select('id, name, user_id, status')
    .eq('id', request_id)
    .single()

  if (!req) return Response.json({ error: 'Request not found' }, { status: 404 })
  if (req.status === 'fulfilled') return Response.json({ error: 'Already fulfilled' }, { status: 409 })

  // Fetch the tool
  const { data: tool } = await admin
    .from('tools')
    .select('name, slug')
    .eq('slug', tool_slug)
    .single()

  if (!tool) return Response.json({ error: 'Tool not found' }, { status: 404 })

  // Mark as fulfilled
  await admin
    .from('tool_requests')
    .update({ status: 'fulfilled' })
    .eq('id', request_id)

  // Email the original requester if they have an account
  if (req.user_id) {
    try {
      const { data: authUser } = await admin.auth.admin.getUserById(req.user_id)
      const { data: profile } = await admin
        .from('profiles')
        .select('org_name, display_name')
        .eq('id', req.user_id)
        .maybeSingle()

      if (authUser?.user?.email) {
        await sendRequestFulfilledEmail({
          toEmail: authUser.user.email,
          orgName: profile?.org_name || profile?.display_name || null,
          requestName: req.name,
          toolSlug: tool.slug,
          toolName: tool.name,
        })
      }
    } catch (e) {
      // Email failure is non-fatal
      console.error('Failed to send fulfilled email:', e)
    }
  }

  return Response.json({ ok: true })
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient, ADMIN_EMAIL } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { submission_id } = await req.json()
  if (!submission_id) return NextResponse.json({ error: 'submission_id required' }, { status: 400 })

  const admin = createAdminClient()
  const { error } = await admin
    .from('tool_submissions')
    .update({ status: 'rejected' })
    .eq('id', submission_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

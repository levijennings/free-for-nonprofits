import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient, isAdminEmail } from '@/lib/supabase/admin'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user: adminUser } } = await supabase.auth.getUser()
  if (!adminUser || !isAdminEmail(adminUser.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const targetId = params.id
  if (!targetId) return NextResponse.json({ error: 'User id required' }, { status: 400 })

  if (targetId === adminUser.id) {
    return NextResponse.json({ error: "You can't delete your own account from here." }, { status: 400 })
  }

  const admin = createAdminClient()

  // Guard against accidentally deleting another admin account.
  const { data: targetUser, error: fetchError } = await admin.auth.admin.getUserById(targetId)
  if (fetchError || !targetUser?.user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }
  if (isAdminEmail(targetUser.user.email)) {
    return NextResponse.json({ error: 'Cannot delete an admin account.' }, { status: 400 })
  }

  // Deleting the auth.users row cascades through profiles, reviews,
  // saved_tools, tool_favorites, tool_usages, tool_request_votes,
  // user_preferences, and user_survey (all ON DELETE CASCADE in the schema).
  // tool_submissions.submitted_by and tool_requests.user_id are ON DELETE SET
  // NULL, so community submissions/requests survive with the author cleared.
  const { error: deleteError } = await admin.auth.admin.deleteUser(targetId)
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

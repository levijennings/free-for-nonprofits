import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/tool-requests/[id]/vote — toggle upvote
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return Response.json({ error: 'Sign in to vote' }, { status: 401 })

  const { id } = params

  // Check if already voted
  const { data: existing } = await supabase
    .from('tool_request_votes')
    .select('id')
    .eq('user_id', user.id)
    .eq('request_id', id)
    .maybeSingle()

  if (existing) {
    // Remove vote
    await supabase
      .from('tool_request_votes')
      .delete()
      .eq('user_id', user.id)
      .eq('request_id', id)

    // Decrement vote_count (floor at 0)
    await supabase.rpc('decrement_vote_count', { request_id: id })

    return Response.json({ voted: false })
  } else {
    // Add vote
    await supabase.from('tool_request_votes').insert({
      user_id: user.id,
      request_id: id,
    })

    // Increment vote_count
    await supabase.rpc('increment_vote_count', { request_id: id })

    return Response.json({ voted: true })
  }
}

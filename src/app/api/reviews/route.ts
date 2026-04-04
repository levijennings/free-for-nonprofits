import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/reviews?tool_id=xxx
export async function GET(request: NextRequest) {
  const tool_id = request.nextUrl.searchParams.get('tool_id')
  if (!tool_id) return NextResponse.json({ error: 'tool_id required' }, { status: 400 })

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reviews')
    .select('id, rating, comment, created_at, user_id')
    .eq('tool_id', tool_id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ reviews: data ?? [] })
}

// POST /api/reviews — submit or update a review (auth required)
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sign in to leave a review' }, { status: 401 })

  const body = await request.json()
  const { tool_id, rating, comment } = body

  if (!tool_id || typeof rating !== 'number' || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Invalid request — rating must be 1–5' }, { status: 400 })
  }

  const { error } = await supabase
    .from('reviews')
    .upsert(
      {
        tool_id,
        user_id: user.id,
        rating,
        comment: comment?.trim() || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'tool_id,user_id' }
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

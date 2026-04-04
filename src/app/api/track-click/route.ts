import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { tool_id, click_type } = await request.json()

    if (!tool_id || !['affiliate', 'website'].includes(click_type)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const supabase = await createClient()

    // Use service role bypass by inserting directly — RLS allows public inserts on tool_clicks
    const { error } = await supabase.from('tool_clicks').insert({
      tool_id,
      click_type,
      referrer: request.headers.get('referer') || null,
      user_agent: request.headers.get('user-agent') || null,
    })

    if (error) {
      // Don't block the user if tracking fails — just log it
      console.error('Click tracking error:', error.message)
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true }) // Silently succeed — never block navigation
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { nextQuery, safeNextPath } from '@/components/auth/next-param'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim() : ''

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  // The replacement confirmation link has to land the user where the original
  // one would have. Validated to a same-origin path first — this value is
  // client-supplied and ends up inside an email we send.
  const next = safeNextPath(body?.next)
  const { origin } = new URL(request.url)

  const supabase = await createClient()
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: `${origin}/auth/callback${nextQuery(next, '?')}` },
  })

  if (error) {
    // Surface rate limiting (Supabase throttles resend per address) but
    // otherwise respond as if it worked, regardless of whether the address
    // is registered or already confirmed — this endpoint should never be
    // usable to check whether a given email has an account.
    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Please wait a moment before requesting another email.' },
        { status: 429 }
      )
    }
  }

  return NextResponse.json({ ok: true })
}

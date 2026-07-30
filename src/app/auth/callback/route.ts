import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { nextQuery, nextRedirectUrl, safeNextPath } from '@/components/auth/next-param'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // `next` arrives from an email link, so it is attacker-controllable and is
  // validated down to a same-origin path before it is ever redirected to.
  const next = safeNextPath(searchParams.get('next'))

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(nextRedirectUrl(next, origin))
    }
  }

  // The link was expired or already used. Carry the destination through to
  // login so a user who resends the confirmation still ends up where they
  // started rather than on a bare dashboard.
  return NextResponse.redirect(
    `${origin}/login?error=auth_callback_failed${nextQuery(next, '&')}`
  )
}

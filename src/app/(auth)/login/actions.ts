'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { nextQuery, safeNextPath } from '@/components/auth/next-param'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = (formData.get('email') as string) ?? ''
  const password = (formData.get('password') as string) ?? ''
  // Submitted as a hidden field from the login form, which in turn got it from
  // `?next=`. Validated here rather than trusting the render-time check — a
  // form field is exactly as forgeable as a query string.
  const next = safeNextPath(formData.get('next'))

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    // Supabase returns a distinct "email not confirmed" error (separate from
    // the generic invalid-credentials case) when the account exists but
    // hasn't clicked the confirmation link yet. Surface that distinctly so
    // people aren't told their password is wrong when the real issue is an
    // unconfirmed signup.
    const isUnconfirmed =
      (error as { code?: string }).code === 'email_not_confirmed' ||
      /email.*not.*confirmed/i.test(error.message)

    // Keep `next` across the retry so a mistyped password doesn't cost the
    // user their place in the journey.
    redirect(
      `/login?error=${isUnconfirmed ? 'unconfirmed' : 'invalid'}${nextQuery(next, '&')}`
    )
  }

  redirect(next)
}

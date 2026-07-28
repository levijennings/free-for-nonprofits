import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient, ADMIN_EMAILS } from '@/lib/supabase/admin'
import { verifyTurnstile, getClientIp } from '@/lib/captcha'
import { signupSchema } from '@/lib/validations'
import { sendNewSignupAdminEmail } from '@/lib/email'

// How many signups a single IP may attempt before being throttled.
const MAX_ATTEMPTS_PER_HOUR = 5
const MAX_ATTEMPTS_PER_DAY = 15

// Real visitors take at least this long to load the page, read it, and click
// submit. Bots that fill and submit the form immediately land under this.
const MIN_FILL_TIME_MS = 1200

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const { email, password, orgName, honeypot, formRenderedAt, captchaToken } = body
  const ip = getClientIp(request) ?? 'unknown'
  const admin = createAdminClient()

  // ---- Rate limiting (persisted in Postgres so it survives across serverless
  // invocations, unlike an in-memory counter). ----
  await admin.from('signup_attempts').delete().lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

  const { count: hourCount } = await admin
    .from('signup_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('ip_address', ip)
    .gt('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())

  const { count: dayCount } = await admin
    .from('signup_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('ip_address', ip)

  if ((hourCount ?? 0) >= MAX_ATTEMPTS_PER_HOUR || (dayCount ?? 0) >= MAX_ATTEMPTS_PER_DAY) {
    return NextResponse.json(
      { error: 'Too many signup attempts from your network. Please try again later.' },
      { status: 429 }
    )
  }

  // Record this attempt regardless of outcome below, so repeated bot hits
  // still count against the IP's quota.
  await admin.from('signup_attempts').insert({ ip_address: ip })

  // ---- Honeypot: real users never see or fill this field. ----
  if (typeof honeypot === 'string' && honeypot.trim().length > 0) {
    // Return a success-shaped response so the bot has no signal it was caught.
    return NextResponse.json({ ok: true })
  }

  // ---- Timing check: bots that script-fill and submit instantly. ----
  if (typeof formRenderedAt === 'number' && Date.now() - formRenderedAt < MIN_FILL_TIME_MS) {
    return NextResponse.json({ ok: true })
  }

  // ---- Captcha (no-op until NEXT_PUBLIC_TURNSTILE_SITE_KEY / TURNSTILE_SECRET_KEY are set). ----
  if (!(await verifyTurnstile(captchaToken, ip))) {
    return NextResponse.json({ error: 'Captcha verification failed. Please try again.' }, { status: 400 })
  }

  // ---- Validate input. ----
  const parsed = signupSchema.safeParse({ email, password, orgName })
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  }

  // ---- Create the account via the normal (non-admin) client so Supabase's
  // own auth flow — including the confirmation email — behaves exactly as
  // before. ----
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        display_name: parsed.data.orgName || parsed.data.email.split('@')[0],
        org_name: parsed.data.orgName || '',
      },
    },
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // ---- Notify admins of the new signup. Best-effort: a failure here should
  // never surface as a signup failure to the user. ----
  try {
    await sendNewSignupAdminEmail({
      toEmails: ADMIN_EMAILS,
      email: parsed.data.email,
      orgName: parsed.data.orgName || null,
      ip,
      userId: data.user?.id ?? null,
    })
  } catch (e) {
    console.error('Failed to send new-signup admin notification:', e)
  }

  return NextResponse.json({ ok: true })
}

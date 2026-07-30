import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient, ADMIN_EMAILS } from '@/lib/supabase/admin'
import { verifyTurnstile, getClientIp } from '@/lib/captcha'
import { signupSchema } from '@/lib/validations'
import { sendNewSignupAdminEmail } from '@/lib/email'
import { nextQuery, safeNextPath } from '@/components/auth/next-param'

// How many signups a single IP may attempt before being throttled.
const MAX_ATTEMPTS_PER_HOUR = 5
const MAX_ATTEMPTS_PER_DAY = 15

// Floor for "a human was involved at all". This used to be 1200ms, which a
// password manager clears routinely: 1Password/Chrome autofill the whole form
// on page load and a returning user can hit submit inside a second. Those
// people were handed a 403 telling them to email support — a dead end, on the
// signup form, for the users most likely to have strong passwords.
//
// 350ms is below any plausible human round trip but still catches the case
// this check exists for: a script that POSTs the instant the page parses.
// The honeypot and the captcha are the load-bearing bot defences; this is a
// cheap extra signal, and it is tuned to prefer a false negative over a false
// positive.
const MIN_FILL_TIME_MS = 350

/**
 * Reject a submission the bot heuristics flagged.
 *
 * These checks are heuristics, so they will occasionally catch a real person
 * (an aggressive password manager filling the hidden field, a fast form
 * autofill). Returning `{ ok: true }` here — as this route used to — told that
 * person to go and check an email that was never sent, with no error, no way
 * to retry and no record that it happened. A bot learns nothing useful from an
 * explicit rejection that it wouldn't learn from never receiving the email, so
 * the honest failure is strictly better.
 *
 * The `code` lets the client show a real error with a route to support, and
 * the log line is the only telemetry we have for tuning these thresholds.
 *
 * The two reasons get different copy because they have different remedies.
 * A too-fast submission is genuinely retryable — the client timestamps the
 * form at mount, so simply pressing the button again succeeds — so the message
 * says so instead of sending the user to their email client. Only the honeypot
 * case, which a human cannot clear by retrying, offers support as the exit.
 */
function denyAsBot(reason: 'honeypot_filled' | 'fill_time_too_fast', ip: string, email: unknown) {
  console.error('[signup] bot check rejected submission', {
    reason,
    ip,
    email: typeof email === 'string' ? email : null,
    at: new Date().toISOString(),
  })

  if (reason === 'fill_time_too_fast') {
    return NextResponse.json(
      {
        error:
          "That submission came through faster than we could verify. Please press “Create free account” once more — it will go through this time.",
        code: 'bot_check_retryable',
      },
      { status: 403 }
    )
  }

  return NextResponse.json(
    {
      error:
        "We couldn't process this signup — our automated checks flagged it. Please try again, and if it still won't go through, email levi@dvlmnt.com and we'll set your account up manually.",
      code: 'bot_check_failed',
      supportEmail: 'levi@dvlmnt.com',
    },
    { status: 403 }
  )
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const { email, password, orgName, honeypot, formRenderedAt, captchaToken } = body
  const ip = getClientIp(request) ?? 'unknown'
  // Where the user was before signup interrupted them (e.g. the tool page they
  // wanted to claim). Validated to a same-origin path because it is embedded
  // in the confirmation email we send and redirected to on the way back.
  const next = safeNextPath(body?.next)
  const { origin } = new URL(request.url)
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
    return denyAsBot('honeypot_filled', ip, email)
  }

  // ---- Timing check: bots that script-fill and submit instantly. ----
  if (typeof formRenderedAt === 'number' && Date.now() - formRenderedAt < MIN_FILL_TIME_MS) {
    return denyAsBot('fill_time_too_fast', ip, email)
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
      // Without this, Supabase falls back to the project's Site URL and the
      // confirmation link drops the user on a bare dashboard.
      emailRedirectTo: `${origin}/auth/callback${nextQuery(next, '?')}`,
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

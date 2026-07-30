'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Turnstile from '@/components/Turnstile'
import PasswordInput from '@/components/ui/PasswordInput'
import { Field } from '@/components/ui/Field'
import { getPasswordStrength } from '@/lib/password-strength'
import { nextQuery, safeNextPath } from '@/components/auth/next-param'

// Captcha is active only when a site key is configured.
const CAPTCHA_ENABLED = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

export default function SignupPage({ searchParams }: { searchParams?: { next?: string } }) {
  // Carried from wherever signup was triggered (e.g. a tool page's "track this
  // application"), validated before it is used as a link target or sent on to
  // the API, which validates it again.
  const next = safeNextPath(searchParams?.next)
  const nextSuffix = nextQuery(next)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [orgName, setOrgName] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // Set when the server's bot heuristics rejected us, so a false-positive human
  // gets a way out instead of a dead end.
  const [supportEmail, setSupportEmail] = useState('')
  const [success, setSuccess] = useState(false)

  const strength = getPasswordStrength(password)

  // Timestamp the form as soon as this component mounts. Bots that script-fill
  // and submit within a second or two of hitting the page land far below
  // MIN_FILL_TIME_MS on the server and are silently dropped.
  const formRenderedAt = useRef(Date.now())

  // Submit failures used to be silent: focus stayed on the button, nothing was
  // announced, and the form looked hung. Moving focus to the alert both speaks
  // the message and puts the user next to it.
  const errorRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (error) errorRef.current?.focus()
  }, [error])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (CAPTCHA_ENABLED && !captchaToken) {
      setError('Please complete the captcha to continue.')
      return
    }

    setLoading(true)
    setError('')
    setSupportEmail('')

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        orgName,
        honeypot,
        formRenderedAt: formRenderedAt.current,
        captchaToken: captchaToken || undefined,
        next,
      }),
    })

    const data = await res.json().catch(() => ({ error: 'Something went wrong. Please try again.' }))

    if (!res.ok) {
      setError(data.error || 'Something went wrong. Please try again.')
      if (data.code === 'bot_check_failed' && data.supportEmail) {
        setSupportEmail(data.supportEmail)
      }
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-surface-subtle flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-surface rounded-2xl shadow-1 border border-line p-8 text-center">
          <div className="w-16 h-16 bg-accent-subtle rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-fg mb-2">Check your email</h2>
          <p className="text-fg-muted mb-6">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
          </p>
          <Link href={`/login${nextSuffix}`} className="text-accent font-medium hover:text-accent-hover transition-colors">
            Back to sign in →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-subtle flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-1 shrink-0">
              <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  fill="white"
                  d="M13.5 2H4C2.9 2 2 2.9 2 4V16C2 17.1 2.9 18 4 18H13.5L19 10L13.5 2ZM15.8 10C15.8 9.23 15.17 8.6 14.4 8.6C13.63 8.6 13 9.23 13 10C13 10.77 13.63 11.4 14.4 11.4C15.17 11.4 15.8 10.77 15.8 10Z"
                />
              </svg>
            </div>
            <div className="leading-none text-left">
              <div className="text-[9px] font-bold text-fg-subtle tracking-[0.18em] uppercase">Free For</div>
              <div className="text-[17px] font-extrabold tracking-tight text-fg -mt-0.5">
                Non<span className="text-accent">Profits</span>
              </div>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-fg">Claim your free tools</h1>
          <p className="mt-2 text-fg-muted">Save programs, track your tech stack, get notified of new deals.</p>
          <div className="mt-3 flex flex-col gap-1.5 text-sm text-left bg-accent-subtle border border-accent-line rounded-xl px-4 py-3">
            <p className="font-semibold text-accent mb-1">What you unlock:</p>
            <p className="text-fg-muted">✅ Google Ad Grants — $10K/month in free advertising</p>
            <p className="text-fg-muted">✅ Step-by-step claim guides for every tool</p>
            <p className="text-fg-muted">✅ Save tools to your nonprofit&apos;s tech stack</p>
            <p className="text-fg-muted">✅ New deal alerts as programs are added</p>
          </div>
        </div>

        <div className="bg-surface rounded-2xl shadow-1 border border-line p-8">
          <form onSubmit={handleSignup} className="space-y-5">
            <Field
              label="Organization name"
              hint="Shown to other nonprofits on your reviews and activity. Leave blank to stay unlabeled."
            >
              {(field) => (
                <input
                  {...field}
                  type="text"
                  autoComplete="organization"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Habitat for Humanity Chicago"
                  className="w-full px-4 py-2.5 border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent"
                />
              )}
            </Field>

            <Field label="Work email" required>
              {(field) => (
                <input
                  {...field}
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@yournonprofit.org"
                  className="w-full px-4 py-2.5 border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent"
                />
              )}
            </Field>

            <Field label="Password" required>
              {(field) => (
                <>
                  <PasswordInput
                    {...field}
                    minLength={8}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full px-4 py-2.5 border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent"
                  />
                  {password && (
                    <div className="mt-1.5">
                      <div className="flex gap-1" aria-hidden="true">
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              i < strength.score ? strength.barColor : 'bg-surface-inset'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="mt-1 text-xs text-fg-subtle" aria-live="polite">
                        Password strength: {strength.label}
                      </p>
                    </div>
                  )}
                </>
              )}
            </Field>

            {/*
              Honeypot: invisible to real visitors (off-screen, unfocusable,
              excluded from tab order and screen readers) but many bots fill
              every field they can find in the DOM. Any value here fails the
              signup silently server-side.
            */}
            <div
              aria-hidden="true"
              style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}
            >
              <label htmlFor="company_website">Company website</label>
              <input
                id="company_website"
                name="company_website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            {error && (
              <div
                ref={errorRef}
                role="alert"
                tabIndex={-1}
                className="bg-status-warn-bg border border-status-warn/30 rounded-lg px-4 py-3 text-sm text-status-warn"
              >
                <p>{error}</p>
                {supportEmail && (
                  <p className="mt-2">
                    <a href={`mailto:${supportEmail}?subject=Signup%20blocked`} className="font-semibold underline">
                      Email {supportEmail}
                    </a>{' '}
                    and we&apos;ll get you set up.
                  </p>
                )}
              </div>
            )}

            <Turnstile onVerify={setCaptchaToken} onExpire={() => setCaptchaToken('')} />

            <button
              type="submit"
              disabled={loading || (CAPTCHA_ENABLED && !captchaToken)}
              className="w-full py-3 bg-accent hover:bg-accent-hover text-accent-fg font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create free account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-fg-muted">
              Already have an account?{' '}
              <Link href={`/login${nextSuffix}`} className="text-accent font-medium hover:text-accent-hover transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-fg-subtle">
          By creating an account, you agree to our{' '}
          <Link href="/legal/terms" className="underline hover:text-fg-muted">Terms</Link>
          {' '}and{' '}
          <Link href="/legal/privacy" className="underline hover:text-fg-muted">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}

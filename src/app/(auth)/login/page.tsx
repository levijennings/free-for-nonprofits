import Link from 'next/link'
import { login } from './actions'
import PasswordInput from '@/components/ui/PasswordInput'
import ResendConfirmationForm from '@/components/auth/ResendConfirmationForm'
import { DEFAULT_NEXT, nextQuery, safeNextPath } from '@/components/auth/next-param'

interface Props {
  searchParams: { error?: string; next?: string }
}

export default function LoginPage({ searchParams }: Props) {
  // '1' is a legacy alias for 'invalid', kept in case any old links/bookmarks
  // still point at ?error=1.
  const errorType = searchParams.error === '1' ? 'invalid' : searchParams.error

  // Where the user was headed before we interrupted them. Validated on the way
  // in as well as in the server action, so a hostile `?next=` never reaches
  // the markup as a link target either.
  const next = safeNextPath(searchParams.next)
  const nextSuffix = nextQuery(next)

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
          <h1 className="text-3xl font-bold text-fg">Welcome back</h1>
          <p className="mt-2 text-fg-muted">Sign in to your account</p>
        </div>

        <div className="bg-surface rounded-2xl shadow-1 border border-line p-8">
          <form action={login} className="space-y-5">
            {/* Carries the pre-auth destination through the POST. */}
            {next !== DEFAULT_NEXT && <input type="hidden" name="next" value={next} />}

            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-fg mb-1.5">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                name="email"
                required
                autoComplete="email"
                aria-describedby={errorType === 'invalid' ? 'login-error' : undefined}
                aria-invalid={errorType === 'invalid' || undefined}
                placeholder="you@yournonprofit.org"
                className="w-full px-4 py-2.5 border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-sm font-medium text-fg">
                  Password
                </label>
                <Link
                  href={`/reset-password${nextSuffix}`}
                  className="text-xs text-accent hover:text-accent-hover transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id="login-password"
                name="password"
                required
                autoComplete="current-password"
                aria-describedby={errorType === 'invalid' ? 'login-error' : undefined}
                aria-invalid={errorType === 'invalid' || undefined}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent"
              />
            </div>

            {errorType === 'invalid' && (
              <div
                id="login-error"
                role="alert"
                className="bg-status-warn-bg border border-status-warn/30 rounded-lg px-4 py-3 text-sm text-status-warn"
              >
                Invalid email or password. Please try again.
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-accent hover:bg-accent-hover text-accent-fg font-semibold rounded-lg transition-colors"
            >
              Sign in
            </button>
          </form>

          {/* Both of these end in the same place — the user needs a fresh
              confirmation link — so both get the resend form rather than an
              unexplained empty login form. /auth/callback redirects here with
              ?error=auth_callback_failed when the code exchange fails, which
              in practice means the link was expired or already used. */}
          {(errorType === 'unconfirmed' || errorType === 'auth_callback_failed') && (
            <div className="mt-5 space-y-3">
              <div
                role="alert"
                className="bg-status-progress-bg border border-status-progress/30 rounded-lg px-4 py-3 text-sm text-fg"
              >
                {errorType === 'auth_callback_failed'
                  ? 'That confirmation link has expired or has already been used. Enter your email below and we’ll send you a new one.'
                  : 'Your email hasn’t been confirmed yet. Check your inbox for the confirmation link, or resend it below.'}
              </div>
              <ResendConfirmationForm next={next} />
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-fg-muted">
              Don&apos;t have an account?{' '}
              <Link href={`/signup${nextSuffix}`} className="text-accent font-medium hover:text-accent-hover transition-colors">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

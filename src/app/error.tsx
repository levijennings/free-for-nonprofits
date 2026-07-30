'use client'

import { useEffect } from 'react'
import Link from 'next/link'

/**
 * Uncaught server or render errors used to fall through to Next's default
 * screen: no branding, no navigation, no way back. This boundary sits above
 * the route groups, so it renders without the marketing header — it carries
 * its own way out.
 *
 * `digest` is the only thing worth showing a person: it's the id that ties
 * their report to the server log line.
 */
export default function GlobalRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen bg-surface-subtle px-4 py-16">
      <div className="mx-auto max-w-lg">
        <Link href="/" className="mb-8 flex w-fit items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-fg">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                fill="currentColor"
                d="M13.5 2H4C2.9 2 2 2.9 2 4V16C2 17.1 2.9 18 4 18H13.5L19 10L13.5 2ZM15.8 10C15.8 9.23 15.17 8.6 14.4 8.6C13.63 8.6 13 9.23 13 10C13 10.77 13.63 11.4 14.4 11.4C15.17 11.4 15.8 10.77 15.8 10Z"
              />
            </svg>
          </div>
          <div className="leading-none">
            <div className="text-[8px] font-bold uppercase tracking-[0.18em] text-fg-subtle">Free For</div>
            <div className="-mt-0.5 text-[13px] font-extrabold tracking-tight text-fg">
              Non<span className="text-accent">Profits</span>
            </div>
          </div>
        </Link>

        <div className="rounded-lg border border-line bg-surface p-6 shadow-1 sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight text-fg">Something went wrong on our side</h1>
          <p className="mt-3 text-fg-muted">
            This one is us, not you. Nothing you entered was lost — try again, and if it keeps
            happening the links below still work.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-accent px-[18px] py-[11px] text-sm font-semibold text-accent-fg transition-colors duration-fast hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md border border-line-strong bg-surface px-[18px] py-[11px] text-sm font-semibold text-fg transition-colors duration-fast hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              Go home
            </Link>
          </div>

          <ul className="mt-6 space-y-2 border-t border-line pt-6 text-sm text-fg-muted">
            <li>
              <Link href="/eligibility" className="font-medium text-accent hover:underline">
                See what your nonprofit qualifies for
              </Link>
            </li>
            <li>
              <Link href="/tools" className="font-medium text-accent hover:underline">
                Browse the tool catalogue
              </Link>
            </li>
          </ul>

          {error.digest && (
            <p className="mt-6 text-xs text-fg-subtle">
              If you report this, quote <span className="tnum font-medium text-fg-muted">{error.digest}</span> — it
              points us straight at the log line. You can send it to{' '}
              <a href="mailto:levi@dvlmnt.com" className="text-accent hover:underline">
                levi@dvlmnt.com
              </a>
              .
            </p>
          )}
        </div>
      </div>
    </main>
  )
}

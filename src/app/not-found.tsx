import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page not found | Free For NonProfits',
  robots: { index: false, follow: true },
}

/**
 * Reached by a bad URL and by `notFound()` — most often an unrecognised tool
 * slug, which is usually a stale link from a blog or a newsletter. So the
 * routes forward are the two that recover that intent: search the catalogue,
 * or start from the qualifier.
 *
 * Root-level, so it renders outside the marketing layout and carries its own
 * navigation.
 */
export default function NotFound() {
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
          <p className="tnum text-sm font-semibold text-fg-subtle">404</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-fg">We couldn&apos;t find that page</h1>
          <p className="mt-3 text-fg-muted">
            The link may be out of date, or the tool it pointed at may have been renamed. Both
            routes below still work.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/eligibility"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-accent px-[18px] py-[11px] text-sm font-semibold text-accent-fg transition-colors duration-fast hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              See what you qualify for
            </Link>
            <Link
              href="/tools"
              className="inline-flex items-center justify-center rounded-md border border-line-strong bg-surface px-[18px] py-[11px] text-sm font-semibold text-fg transition-colors duration-fast hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              Browse all tools
            </Link>
          </div>

          <p className="mt-6 border-t border-line pt-6 text-sm text-fg-muted">
            Or go back to the{' '}
            <Link href="/" className="font-medium text-accent hover:underline">
              home page
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  )
}

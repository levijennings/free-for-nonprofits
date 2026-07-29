import Link from 'next/link'
import { Suspense } from 'react'
import EligibilityForm from './EligibilityForm'

/**
 * The homepage hero.
 *
 * The old hero was a claim ("free software your nonprofit already qualifies
 * for") followed by two buttons that led to an undifferentiated catalogue. This
 * one asks the three questions that make the catalogue differentiated, then
 * hands off to /eligibility, which does the matching and owns the results.
 *
 * Deliberately no dollar figure here. Only a handful of catalogue rows carry a
 * vendor-stated annual value, so any total large enough to be exciting would be
 * invented. The programme count is real and is what we promise.
 */
export default function EligibilityHero({
  toolCount,
  gatedCount,
}: {
  /** Verified listings in the catalogue. Null when the count query failed. */
  toolCount: number | null
  /** Of those, the ones that actually gate on nonprofit status. */
  gatedCount: number | null
}) {
  const facts = [
    toolCount ? `${toolCount} verified listings` : null,
    gatedCount ? `${gatedCount} gate on nonprofit status` : null,
    'No account needed',
  ].filter(Boolean) as string[]

  return (
    <section className="border-b border-line bg-surface-subtle">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-14 lg:px-8 lg:py-20">
        {/* ---------- Promise ---------- */}
        <div className="max-w-2xl self-center">
          <p className="text-micro uppercase text-accent">Three questions · 30 seconds</p>

          <h1 className="mt-3 text-h1 font-bold tracking-tight text-fg sm:text-display">
            Find out what your nonprofit{' '}
            <span className="text-accent">actually</span> qualifies for
          </h1>

          <p className="mt-5 max-w-prose text-lg text-fg-muted">
            Most directories hand you the same list no matter who you are. Tell us what
            kind of organisation you are, where you are registered and roughly how big
            you are, and we check every listing against the eligibility rules its vendor
            publishes.
          </p>

          <p className="mt-4 max-w-prose text-base text-fg-muted">
            You get the programmes you can apply for — and the ones that would turn you
            down, each with the reason, so you do not lose an afternoon finding out the
            hard way.
          </p>

          <ul className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-fg-subtle">
            {facts.map((fact) => (
              <li key={fact} className="flex items-center gap-2">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-sm bg-accent" />
                {fact}
              </li>
            ))}
          </ul>
        </div>

        {/* ---------- Qualifier ---------- */}
        <div className="self-center rounded-lg border border-line bg-surface p-5 shadow-2 sm:p-6">
          <Suspense fallback={<FormSkeleton />}>
            <EligibilityForm compact />
          </Suspense>

          <p className="mt-4 border-t border-line pt-4 text-xs text-fg-subtle">
            Answers go in the URL, not an account — the result is a link you can send to
            your board.{' '}
            <Link
              href="/tools"
              className="font-medium text-accent underline-offset-2 hover:underline"
            >
              Or browse everything
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  )
}

/** Matches the compact form's rhythm so the card does not jump on hydration. */
function FormSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      {[2, 4, 3].map((rows, i) => (
        <div key={i} className="space-y-1.5">
          <div className="h-4 w-2/3 rounded-sm bg-surface-inset" />
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: rows }).map((_, j) => (
              <div key={j} className="h-7 w-24 rounded-md bg-surface-inset" />
            ))}
          </div>
        </div>
      ))}
      <div className="h-11 w-full rounded-md bg-surface-inset sm:w-48" />
    </div>
  )
}

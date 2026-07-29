import Link from 'next/link'
import {
  ORG_TYPES,
  formatCountries,
  formatUsd,
  verificationAge,
} from '@/lib/eligibility'
import type { EligibilityFields } from '@/lib/eligibility'

/**
 * What it takes to actually claim this.
 *
 * Deliberately conservative: it renders only facts confirmed against a vendor
 * page. Where the step-by-step procedure has not been verified, it says so
 * rather than inventing plausible steps — a wrong claim guide costs someone an
 * afternoon and costs the site its credibility, which is the only asset here.
 */
export default function ClaimGuide({
  tool,
}: {
  tool: EligibilityFields & { name: string; website_url: string | null }
}) {
  const gated = tool.requires_nonprofit_status
  const freshness = verificationAge(tool.last_verified_at)
  const applyUrl = tool.nonprofit_url ?? tool.website_url

  // Open to everyone — there is nothing to claim.
  if (gated === false) {
    return (
      <section className="rounded-lg border border-line bg-surface-subtle p-6">
        <h2 className="text-h3 font-semibold text-fg">Nothing to apply for</h2>
        <p className="mt-2 max-w-prose text-sm text-fg-muted">
          {tool.name} is available to anyone on the same terms. Being a nonprofit does
          not get you a better deal here, and there is no verification step — you can
          just start using it.
        </p>
        {applyUrl && (
          <a
            href={applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex rounded-md border border-line bg-surface px-4 py-2 text-sm font-medium text-fg transition-colors duration-fast hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            Go to {tool.name} →
          </a>
        )}
        {freshness && (
          <p className="mt-4 text-xs text-fg-subtle">{freshness.label}</p>
        )}
      </section>
    )
  }

  const facts: Array<{ label: string; value: string }> = []

  if (tool.steps_count) {
    facts.push({
      label: 'Steps',
      value: `${tool.steps_count} step${tool.steps_count === 1 ? '' : 's'}`,
    })
  }
  if (tool.time_to_claim_days) {
    facts.push({
      label: 'Approval time',
      value: `~${tool.time_to_claim_days} ${tool.time_to_claim_days === 1 ? 'day' : 'days'}`,
    })
  }
  if (tool.annual_value_usd) {
    facts.push({ label: 'Stated value', value: `${formatUsd(tool.annual_value_usd)}/year` })
  }

  const requirements: string[] = []
  if (tool.eligible_org_types?.length) {
    const labels = tool.eligible_org_types.map(
      (t) => ORG_TYPES.find((o) => o.value === t)?.label ?? t
    )
    requirements.push(`Open to: ${labels.join(', ')}`)
  }
  if (tool.eligible_countries?.length) {
    requirements.push(`Available in ${formatCountries(tool.eligible_countries)} only`)
  }
  if (tool.max_budget_usd) {
    requirements.push(
      `Your annual operating budget must be under ${formatUsd(tool.max_budget_usd)}`
    )
  }
  if (tool.min_budget_usd) {
    requirements.push(`Aimed at organisations above ${formatUsd(tool.min_budget_usd)}`)
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-6 shadow-1">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-h3 font-semibold text-fg">How to claim it</h2>
        {freshness && (
          <span
            className={
              freshness.stale
                ? 'rounded-sm bg-status-warn-bg px-2 py-0.5 text-xs text-fg-muted'
                : 'text-xs text-fg-subtle'
            }
          >
            {freshness.label}
          </span>
        )}
      </div>

      {facts.length > 0 && (
        <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
          {facts.map((f) => (
            <div key={f.label}>
              <dt className="text-micro uppercase tracking-wide text-fg-subtle">
                {f.label}
              </dt>
              <dd className="mt-0.5 font-medium tabular-nums text-fg">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {requirements.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-fg">Before you apply</h3>
          <ul className="mt-2 space-y-1.5">
            {requirements.map((r) => (
              <li key={r} className="flex gap-2 text-sm text-fg-muted">
                <span aria-hidden className="select-none text-fg-subtle">
                  —
                </span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tool.renewal && (
        <p className="mt-6 rounded-md bg-surface-inset px-4 py-3 text-sm text-fg-muted">
          This is not permanent — it renews {tool.renewal}. Put a reminder in your
          calendar now, because lapsed grants are usually reapplied for from scratch.
        </p>
      )}

      {/* The honest gap. */}
      <p className="mt-6 max-w-prose text-sm text-fg-muted">
        {tool.steps_count
          ? 'The application itself is handled on the vendor’s own page, linked below. We have confirmed the terms above against that page but have not documented each screen of the form.'
          : 'We have verified this programme’s terms against the vendor’s own page, but have not yet documented the application procedure step by step. Rather than guess at it, we are linking you straight to the source.'}
      </p>

      {applyUrl && (
        <a
          href={applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-fg transition-colors duration-fast hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
        >
          Start the application →
        </a>
      )}

      <p className="mt-4 text-xs text-fg-subtle">
        Terms change without notice.{' '}
        <Link href="/submit" className="underline hover:text-fg-muted">
          Tell us if this is wrong
        </Link>{' '}
        and we will re-verify it.
      </p>
    </section>
  )
}

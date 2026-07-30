import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'
import EligibilityForm from '@/components/eligibility/EligibilityForm'
import ResultsHeading from '@/components/eligibility/ResultsHeading'
import ToolLogo from '@/components/tools/ToolLogo'
import {
  ELIGIBILITY_COLUMNS,
  buildSnapshot,
  formatUsd,
  ORG_TYPES,
  COUNTRIES,
  BUDGET_BANDS,
} from '@/lib/eligibility'
import type {
  EligibilityAnswers,
  EligibilityFields,
  OrgType,
  CountryCode,
} from '@/lib/eligibility'

export const metadata: Metadata = {
  title: 'What does your nonprofit actually qualify for? | Free For NonProfits',
  description:
    'Answer three questions and see which nonprofit software programmes you are eligible for — and which you are not, with the reason why.',
}

interface SearchParams {
  org?: string
  country?: string
  budget?: string
}

type Row = EligibilityFields & {
  id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  pricing_model: string
  nonprofit_deal: string | null
}

export default async function EligibilityPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const orgType = (ORG_TYPES.find((o) => o.value === searchParams.org)?.value ?? null) as OrgType | null
  const country = (COUNTRIES.find((c) => c.value === searchParams.country)?.value ?? null) as CountryCode | null
  const budgetRaw = searchParams.budget ? Number(searchParams.budget) : null
  const budgetUsd = BUDGET_BANDS.some((b) => b.value === budgetRaw) ? budgetRaw : null

  const answered = orgType !== null && country !== null && budgetUsd !== null
  const answers: EligibilityAnswers = { orgType, country, budgetUsd }

  return (
    <main className="min-h-screen bg-surface-subtle">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-10">
          <h1 className="text-h1 font-bold tracking-tight text-fg">
            What do you actually qualify for?
          </h1>
          <p className="mt-3 max-w-prose text-fg-muted">
            Most nonprofit software lists hand you the same catalogue no matter who you
            are. Three questions changes that — including telling you what you{' '}
            <em>cannot</em> get, and why.
          </p>
        </header>

        <section className="rounded-lg border border-line bg-surface p-6 shadow-1 sm:p-8">
          <EligibilityForm />
        </section>

        {answered && <Results answers={answers} />}
      </div>
    </main>
  )
}

async function Results({ answers }: { answers: EligibilityAnswers }) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tools')
    .select(ELIGIBILITY_COLUMNS)
    .eq('is_verified', true)
    .order('annual_value_usd', { ascending: false, nullsFirst: false })
    .order('name')

  const orgLabel = ORG_TYPES.find((o) => o.value === answers.orgType)?.label ?? ''
  const countryLabel = COUNTRIES.find((c) => c.value === answers.country)?.label ?? ''
  const signature = `${answers.orgType}|${answers.country}|${answers.budgetUsd}`

  // The whole proposition of this page is that the answer is accurate. A failed
  // read must never be reported as "0 programmes you can apply for" — that is a
  // confident factual claim about the user's eligibility, invented from an
  // outage. Say what happened instead, and give them the reload.
  if (error || !data) {
    return (
      <div className="mt-12">
        <section className="rounded-lg border border-line bg-surface p-6 sm:p-8">
          <ResultsHeading
            signature={signature}
            className="text-h3 font-semibold text-fg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
          >
            We could not check the catalogue just now
          </ResultsHeading>
          <p className="mt-2 max-w-prose text-fg-muted">
            Your answers are fine — the lookup failed on our side, so we have no result
            to show you. We would rather say that than show you a zero we cannot stand
            behind.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={`/eligibility?${answerQuery(answers)}`}
              className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-fg transition-colors duration-fast hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
            >
              Try again
            </Link>
            <Link
              href="/tools"
              className="rounded-md border border-line px-5 py-2.5 text-sm font-semibold text-fg-muted transition-colors duration-fast hover:border-line-strong hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
            >
              Browse the full catalogue
            </Link>
          </div>
        </section>
      </div>
    )
  }

  const rows = data as unknown as Row[]
  const snap = buildSnapshot(rows, answers)
  const noneEligible = snap.eligible.length === 0

  return (
    <div className="mt-12 space-y-10">
      {/* ---------- Headline ---------- */}
      <section className="rounded-lg border border-accent-line bg-accent-subtle p-6 sm:p-8">
        <ResultsHeading
          signature={signature}
          className="text-sm text-fg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
        >
          For a {orgLabel.toLowerCase()} in {countryLabel}
        </ResultsHeading>
        <p className="mt-2 text-display font-bold tabular-nums text-fg">
          {snap.eligible.length}
        </p>
        <p className="text-lg font-medium text-fg">
          programme{snap.eligible.length === 1 ? '' : 's'} you can apply for
        </p>

        {/* At zero every one of these reads as a dash or a nought, which tells
            the user nothing. The explanation below carries the answer instead. */}
        {!noneEligible && (
          <div className="mt-6 grid gap-4 border-t border-accent-line pt-6 sm:grid-cols-3">
            <Stat
              value={snap.knownValueUsd > 0 ? formatUsd(snap.knownValueUsd) : '—'}
              label={`confirmed annual value, across ${snap.valuedCount} programme${snap.valuedCount === 1 ? '' : 's'}`}
            />
            <Stat
              value={String(snap.unvaluedCount)}
              label="worth real money, but no vendor publishes a figure"
            />
            <Stat
              value={String(snap.open.length)}
              label="tools free to anyone, nonprofit or not"
            />
          </div>
        )}

        {!noneEligible && snap.unvaluedCount > 0 && (
          <p className="mt-5 max-w-prose text-sm text-fg-muted">
            The dollar figure counts only programmes where the vendor states a number.
            Most do not, so treat it as a floor — not an estimate of what you would save.
          </p>
        )}
      </section>

      {/* ---------- Eligible ---------- */}
      {noneEligible ? (
        <NothingEligible
          orgLabel={orgLabel}
          countryLabel={countryLabel}
          ineligibleCount={snap.ineligible.length}
          openCount={snap.open.length}
        />
      ) : (
        <Section
          title="Programmes you can apply for"
          note="Each of these gates on nonprofit status, and you meet the stated criteria."
          count={snap.eligible.length}
        >
          {snap.eligible.map((tool) => (
            <ToolRow key={tool.id} tool={tool} showValue />
          ))}
        </Section>
      )}

      {/* ---------- Ineligible: the trust-builder ----------
          Collapsed by default. It is the most credibility-building thing on
          the page, but at 40+ rows it buries the results if left open. */}
      {snap.ineligible.length > 0 && (
        <details className="group rounded-lg border border-line bg-surface">
          <summary className="cursor-pointer list-none px-5 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
            {/* A real heading, not a styled span: this is the largest section on
                the page, and as a span it was invisible to heading navigation. */}
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-h3 font-semibold text-fg">
                Not open to you{' '}
                <span className="font-normal tabular-nums text-fg-subtle">
                  ({snap.ineligible.length})
                </span>
              </h3>
              <span className="text-sm text-accent group-open:hidden">Show the reasons →</span>
              <span className="hidden text-sm text-fg-subtle group-open:inline">Hide</span>
            </div>
            <span className="mt-1 block max-w-prose text-sm text-fg-muted">
              Every one listed with the reason, so you do not waste an afternoon finding
              out the hard way.
            </span>
          </summary>
          <div className="space-y-2 border-t border-line px-5 py-4">
            {snap.ineligible.map((tool) => (
              <div
                key={tool.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-line bg-surface-subtle px-4 py-3"
              >
                <span className="font-medium text-fg-muted">{tool.name}</span>
                <ul className="flex flex-wrap gap-2">
                  {tool.reasons.map((r) => (
                    <li
                      key={r}
                      className="rounded-sm bg-status-warn-bg px-2 py-1 text-xs text-fg-muted"
                    >
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* ---------- Open to all ---------- */}
      <Section
        id="free-to-anyone"
        title="Free to anyone"
        note="Genuinely useful, but being a nonprofit gets you nothing extra here. There is nothing to apply for."
        count={snap.open.length}
      >
        {snap.open.map((tool) => (
          <ToolRow key={tool.id} tool={tool} />
        ))}
      </Section>

      {/* ---------- Unclassified ---------- */}
      {snap.unknown.length > 0 && (
        <Section
          title="Not yet resolved"
          note="We could not confirm from a vendor page whether these are gated. Rather than guess, we are saying so."
          count={snap.unknown.length}
          muted
        >
          {snap.unknown.map((tool) => (
            <ToolRow key={tool.id} tool={tool} />
          ))}
        </Section>
      )}
    </div>
  )
}

/** The query string that reproduces this exact result. */
function answerQuery(answers: EligibilityAnswers): string {
  const params = new URLSearchParams()
  if (answers.orgType) params.set('org', answers.orgType)
  if (answers.country) params.set('country', answers.country)
  if (answers.budgetUsd !== null) params.set('budget', String(answers.budgetUsd))
  return params.toString()
}

/**
 * Zero eligible programmes is a real answer, not an empty state — but on its
 * own it is a number with no meaning and no next step. It happens for a
 * specific, explainable reason (org type or country, almost always), and there
 * is always somewhere to go from here.
 */
function NothingEligible({
  orgLabel,
  countryLabel,
  ineligibleCount,
  openCount,
}: {
  orgLabel: string
  countryLabel: string
  ineligibleCount: number
  openCount: number
}) {
  return (
    <section className="rounded-lg border border-line bg-surface p-6 sm:p-8">
      <h3 className="text-h3 font-semibold text-fg">
        Nothing in the catalogue is open to you yet
      </h3>
      <p className="mt-2 max-w-prose text-sm text-fg-muted">
        That is not a glitch, and it is not about your organisation being too small.
        Nonprofit programmes are written around US 501(c)(3) charities: a{' '}
        {orgLabel.toLowerCase()} registered in {countryLabel} falls outside the criteria
        most vendors publish.{' '}
        {ineligibleCount > 0 && (
          <>
            All {ineligibleCount} of the gated programmes we track state a rule you do
            not meet — each one is listed below with which rule it was.
          </>
        )}
      </p>
      <p className="mt-3 max-w-prose text-sm text-fg-muted">
        Worth knowing: vendors change these rules, and several run country-specific
        programmes through local partners that are not on their main page. It is worth
        re-checking if your registration status changes.
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        {openCount > 0 && (
          <Link
            href="#free-to-anyone"
            className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-fg transition-colors duration-fast hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
          >
            See the {openCount} tool{openCount === 1 ? '' : 's'} you can still use
          </Link>
        )}
        <Link
          href="/tools"
          className="rounded-md border border-line px-5 py-2.5 text-sm font-semibold text-fg-muted transition-colors duration-fast hover:border-line-strong hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
        >
          Browse the full catalogue
        </Link>
      </div>
    </section>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-h2 font-semibold tabular-nums text-fg">{value}</p>
      <p className="mt-1 text-sm leading-snug text-fg-muted">{label}</p>
    </div>
  )
}

function Section({
  id,
  title,
  note,
  count,
  muted = false,
  children,
}: {
  id?: string
  title: string
  note: string
  count: number
  muted?: boolean
  children: React.ReactNode
}) {
  if (count === 0) return null
  return (
    <section id={id}>
      {/* h3: the results heading is the h2 these all hang off. */}
      <h3 className="text-h3 font-semibold text-fg">
        {title}{' '}
        <span className="font-normal tabular-nums text-fg-subtle">({count})</span>
      </h3>
      <p className="mb-4 mt-1 max-w-prose text-sm text-fg-muted">{note}</p>
      <div className={muted ? 'space-y-2' : 'grid gap-3 sm:grid-cols-2'}>{children}</div>
    </section>
  )
}

function ToolRow({ tool, showValue = false }: { tool: Row; showValue?: boolean }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex gap-3 rounded-md border border-line bg-surface p-4 transition-colors duration-fast hover:border-accent-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
    >
      {tool.logo_url ? (
        <ToolLogo
          src={tool.logo_url}
          alt={tool.name}
          className="h-9 w-9 shrink-0 rounded-md border border-line bg-surface object-contain p-1"
        />
      ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-subtle text-sm font-bold text-accent">
          {tool.name[0]}
        </div>
      )}
      <div className="min-w-0">
        <p className="font-medium text-fg group-hover:text-accent">{tool.name}</p>
        {showValue && tool.annual_value_usd ? (
          <p className="text-sm font-medium tabular-nums text-accent">
            {formatUsd(tool.annual_value_usd)}/year
          </p>
        ) : null}
        {tool.nonprofit_deal && (
          <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-fg-muted">
            {tool.nonprofit_deal}
          </p>
        )}
      </div>
    </Link>
  )
}

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { ORG_TYPES, COUNTRIES, BUDGET_BANDS } from '@/lib/eligibility'
import type { OrgType, CountryCode } from '@/lib/eligibility'
import { cn } from '@/lib/cn'

/**
 * Answers live in the URL, not in component state. Three reasons: the result is
 * shareable, the server does the matching, and a refresh does not wipe the
 * answers. State here is only ever "what has the user picked so far".
 *
 * `compact` is the homepage hero presentation: same three questions, same
 * options, same destination — but the explanatory notes and per-option hints
 * are dropped and the spacing tightens, so the whole thing fits beside a
 * headline without becoming a wall. The questions are defined once, here; the
 * hero does not get its own copy of them.
 */
export default function EligibilityForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter()
  const params = useSearchParams()

  const [orgType, setOrgType] = useState<OrgType | null>(
    (params.get('org') as OrgType) ?? null
  )
  const [country, setCountry] = useState<CountryCode | null>(
    (params.get('country') as CountryCode) ?? null
  )
  const [budget, setBudget] = useState<number | null>(() => {
    const raw = params.get('budget')
    return raw ? Number(raw) : null
  })

  const complete = orgType !== null && country !== null && budget !== null

  const submit = useCallback(() => {
    if (!complete) return
    const next = new URLSearchParams()
    next.set('org', orgType)
    next.set('country', country)
    next.set('budget', String(budget))
    router.push(`/eligibility?${next.toString()}`, { scroll: true })
  }, [complete, orgType, country, budget, router])

  const missing = [
    orgType === null && 'organisation type',
    country === null && 'country',
    budget === null && 'budget',
  ].filter(Boolean) as string[]

  return (
    <div className={cn(compact ? 'space-y-4' : 'space-y-8')}>
      <Question
        compact={compact}
        step={1}
        label="What kind of organisation are you?"
        note="Vendors differ sharply on this. Churches and schools are excluded more often than most people expect."
      >
        <div className={cn('grid sm:grid-cols-2', compact ? 'gap-1.5' : 'gap-2')}>
          {ORG_TYPES.map((opt) => (
            <Choice
              key={opt.value}
              compact={compact}
              selected={orgType === opt.value}
              onClick={() => setOrgType(opt.value)}
              label={opt.label}
              hint={opt.hint}
            />
          ))}
        </div>
      </Question>

      <Question
        compact={compact}
        step={2}
        label="Where are you registered?"
        note="Several of the largest programmes are US-only, and a few explicitly are not."
      >
        <div className={cn('flex flex-wrap', compact ? 'gap-1.5' : 'gap-2')}>
          {COUNTRIES.map((opt) => (
            <Choice
              key={opt.value}
              compact={compact}
              selected={country === opt.value}
              onClick={() => setCountry(opt.value)}
              label={opt.label}
              pill
            />
          ))}
        </div>
      </Question>

      <Question
        compact={compact}
        step={3}
        label={compact ? 'Annual operating budget?' : 'Roughly what is your annual operating budget?'}
        note="Only used to catch stated ceilings — Zoom and QuickBooks both cut off at $10M."
      >
        <div className={cn('flex flex-wrap', compact ? 'gap-1.5' : 'gap-2')}>
          {BUDGET_BANDS.map((opt) => (
            <Choice
              key={opt.value}
              compact={compact}
              selected={budget === opt.value}
              onClick={() => setBudget(opt.value)}
              label={opt.label}
              pill
            />
          ))}
        </div>
      </Question>

      <div
        className={cn(
          'flex flex-wrap items-center gap-3',
          compact ? 'pt-1' : 'pt-2'
        )}
      >
        <button
          type="button"
          onClick={submit}
          disabled={!complete}
          className={cn(
            'rounded-md text-sm font-semibold transition-colors duration-fast',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2',
            compact ? 'w-full px-5 py-3 sm:w-auto' : 'px-5 py-2.5',
            complete
              ? 'bg-accent text-accent-fg hover:bg-accent-hover'
              : 'bg-surface-inset text-fg-subtle cursor-not-allowed'
          )}
        >
          Show what I qualify for
        </button>
        {!complete && (
          <p className={cn('text-fg-subtle', compact ? 'text-xs' : 'text-sm')}>
            {compact
              ? `${3 - missing.length} of 3 answered`
              : `${missing.join(', ')} still needed`}
          </p>
        )}
      </div>
    </div>
  )
}

function Question({
  step,
  label,
  note,
  compact = false,
  children,
}: {
  step: number
  label: string
  note?: string
  compact?: boolean
  children: React.ReactNode
}) {
  return (
    <fieldset>
      <legend className={cn('flex items-baseline gap-2', compact ? 'mb-1.5' : 'mb-1')}>
        <span className="text-micro font-semibold tabular-nums text-fg-subtle">
          {String(step).padStart(2, '0')}
        </span>
        <span className={cn('font-semibold text-fg', compact ? 'text-sm' : 'text-lg')}>
          {label}
        </span>
      </legend>
      {/* The notes earn their place on /eligibility, where the page is the task.
          In the hero they would double the height of the form. */}
      {note && !compact && <p className="mb-3 max-w-prose text-sm text-fg-muted">{note}</p>}
      {children}
    </fieldset>
  )
}

function Choice({
  selected,
  onClick,
  label,
  hint,
  pill = false,
  compact = false,
}: {
  selected: boolean
  onClick: () => void
  label: string
  hint?: string
  pill?: boolean
  compact?: boolean
}) {
  const dense = pill || compact
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'rounded-md border text-left transition-colors duration-fast',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2',
        compact ? 'px-3 py-1.5 text-xs' : dense ? 'px-3.5 py-2 text-sm' : 'px-4 py-3',
        selected
          ? 'border-accent-line bg-accent-subtle text-fg'
          : 'border-line bg-surface text-fg-muted hover:border-line-strong hover:text-fg'
      )}
    >
      <span className={cn('block font-medium', selected && 'text-fg')}>{label}</span>
      {hint && !compact && (
        <span className="mt-0.5 block text-xs text-fg-subtle">{hint}</span>
      )}
    </button>
  )
}

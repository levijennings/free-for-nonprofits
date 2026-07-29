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

  return (
    <div className={cn('space-y-8', compact && 'space-y-6')}>
      <Question
        step={1}
        label="What kind of organisation are you?"
        note="Vendors differ sharply on this. Churches and schools are excluded more often than most people expect."
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {ORG_TYPES.map((opt) => (
            <Choice
              key={opt.value}
              selected={orgType === opt.value}
              onClick={() => setOrgType(opt.value)}
              label={opt.label}
              hint={opt.hint}
            />
          ))}
        </div>
      </Question>

      <Question
        step={2}
        label="Where are you registered?"
        note="Several of the largest programmes are US-only, and a few explicitly are not."
      >
        <div className="flex flex-wrap gap-2">
          {COUNTRIES.map((opt) => (
            <Choice
              key={opt.value}
              selected={country === opt.value}
              onClick={() => setCountry(opt.value)}
              label={opt.label}
              pill
            />
          ))}
        </div>
      </Question>

      <Question
        step={3}
        label="Roughly what is your annual operating budget?"
        note="Only used to catch stated ceilings — Zoom and QuickBooks both cut off at $10M."
      >
        <div className="flex flex-wrap gap-2">
          {BUDGET_BANDS.map((opt) => (
            <Choice
              key={opt.value}
              selected={budget === opt.value}
              onClick={() => setBudget(opt.value)}
              label={opt.label}
              pill
            />
          ))}
        </div>
      </Question>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="button"
          onClick={submit}
          disabled={!complete}
          className={cn(
            'rounded-md px-5 py-2.5 text-sm font-semibold transition-colors duration-fast',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2',
            complete
              ? 'bg-accent text-accent-fg hover:bg-accent-hover'
              : 'bg-surface-inset text-fg-subtle cursor-not-allowed'
          )}
        >
          Show what I qualify for
        </button>
        {!complete && (
          <p className="text-sm text-fg-subtle">
            {[
              orgType === null && 'organisation type',
              country === null && 'country',
              budget === null && 'budget',
            ]
              .filter(Boolean)
              .join(', ')}{' '}
            still needed
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
  children,
}: {
  step: number
  label: string
  note?: string
  children: React.ReactNode
}) {
  return (
    <fieldset>
      <legend className="mb-1 flex items-baseline gap-2">
        <span className="text-micro font-semibold tabular-nums text-fg-subtle">
          {String(step).padStart(2, '0')}
        </span>
        <span className="text-lg font-semibold text-fg">{label}</span>
      </legend>
      {note && <p className="mb-3 max-w-prose text-sm text-fg-muted">{note}</p>}
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
}: {
  selected: boolean
  onClick: () => void
  label: string
  hint?: string
  pill?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'text-left transition-colors duration-fast',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2',
        pill
          ? 'rounded-md border px-3.5 py-2 text-sm'
          : 'rounded-md border px-4 py-3',
        selected
          ? 'border-accent-line bg-accent-subtle text-fg'
          : 'border-line bg-surface text-fg-muted hover:border-line-strong hover:text-fg'
      )}
    >
      <span className={cn('block font-medium', selected && 'text-fg')}>{label}</span>
      {hint && <span className="mt-0.5 block text-xs text-fg-subtle">{hint}</span>}
    </button>
  )
}

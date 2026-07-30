'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useId, useRef, useState } from 'react'
import { ORG_TYPES, COUNTRIES, BUDGET_BANDS } from '@/lib/eligibility'
import type { OrgType, CountryCode } from '@/lib/eligibility'
import { cn } from '@/lib/cn'
import { requestResultsFocus } from './resultsFocus'

/**
 * Answers live in the URL, not in component state. Three reasons: the result is
 * shareable, the server does the matching, and a refresh does not wipe the
 * answers. State here is only ever "what has the user picked so far".
 *
 * Because the URL is the input, it is also untrusted input. `?org=charity` or
 * `?budget=abc` must read back as "not answered", not as a value the form then
 * believes in — otherwise the form thinks it is complete, pushes the same bad
 * URL, the server rejects it, and the button does nothing forever.
 *
 * `compact` is the homepage hero presentation: same three questions, same
 * options, same destination — but the explanatory notes and per-option hints
 * are dropped and the spacing tightens, so the whole thing fits beside a
 * headline without becoming a wall. The questions are defined once, here; the
 * hero does not get its own copy of them.
 */

type Params = Pick<URLSearchParams, 'get'>

function readOrgType(params: Params): OrgType | null {
  const raw = params.get('org')
  return ORG_TYPES.find((o) => o.value === raw)?.value ?? null
}

function readCountry(params: Params): CountryCode | null {
  const raw = params.get('country')
  return COUNTRIES.find((c) => c.value === raw)?.value ?? null
}

function readBudget(params: Params): number | null {
  const raw = params.get('budget')
  if (raw === null || raw.trim() === '') return null
  const parsed = Number(raw)
  return BUDGET_BANDS.some((b) => b.value === parsed) ? parsed : null
}

export default function EligibilityForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter()
  const params = useSearchParams()

  const [orgType, setOrgType] = useState<OrgType | null>(() => readOrgType(params))
  const [country, setCountry] = useState<CountryCode | null>(() => readCountry(params))
  const [budget, setBudget] = useState<number | null>(() => readBudget(params))

  const orgRef = useRef<HTMLDivElement>(null)
  const countryRef = useRef<HTMLDivElement>(null)
  const budgetRef = useRef<HTMLDivElement>(null)

  const hintId = useId()

  const complete = orgType !== null && country !== null && budget !== null

  const missing = [
    orgType === null && 'organisation type',
    country === null && 'country',
    budget === null && 'budget',
  ].filter(Boolean) as string[]

  /**
   * The button stays enabled when the form is incomplete. A disabled button is
   * out of the tab order, so a keyboard user never reaches it and never finds
   * out what is missing. Activating it instead reports the problem by moving
   * focus into the first unanswered question — which announces the group name,
   * the options and the position, i.e. exactly what is still needed.
   */
  const submit = useCallback(() => {
    if (!complete) {
      const group =
        orgType === null ? orgRef : country === null ? countryRef : budgetRef
      group.current?.querySelector<HTMLButtonElement>('[role="radio"]')?.focus()
      return
    }
    const next = new URLSearchParams()
    next.set('org', orgType)
    next.set('country', country)
    next.set('budget', String(budget))
    requestResultsFocus()
    router.push(`/eligibility?${next.toString()}`, { scroll: true })
  }, [complete, orgType, country, budget, router])

  return (
    <div className={cn(compact ? 'space-y-4' : 'space-y-8')}>
      <ChoiceGroup
        groupRef={orgRef}
        compact={compact}
        step={1}
        label="What kind of organisation are you?"
        note="Vendors differ sharply on this. Churches and schools are excluded more often than most people expect."
        options={ORG_TYPES}
        value={orgType}
        onChange={setOrgType}
        layout="grid"
      />

      <ChoiceGroup
        groupRef={countryRef}
        compact={compact}
        step={2}
        label="Where are you registered?"
        note="Several of the largest programmes are US-only, and a few explicitly are not."
        options={COUNTRIES}
        value={country}
        onChange={setCountry}
        layout="wrap"
        pill
      />

      <ChoiceGroup
        groupRef={budgetRef}
        compact={compact}
        step={3}
        label={compact ? 'Annual operating budget?' : 'Roughly what is your annual operating budget?'}
        note="Only used to catch stated ceilings — Zoom and QuickBooks both cut off at $10M."
        options={BUDGET_BANDS}
        value={budget}
        onChange={setBudget}
        layout="wrap"
        pill
      />

      <div
        className={cn(
          'flex flex-wrap items-center gap-3',
          compact ? 'pt-1' : 'pt-2'
        )}
      >
        <button
          type="button"
          onClick={submit}
          aria-describedby={hintId}
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
        {/* Always rendered, so it is an established live region by the time its
            content changes — a region added at the same moment as its text is
            unreliably announced. */}
        <p
          id={hintId}
          aria-live="polite"
          className={cn('text-fg-subtle', compact ? 'text-xs' : 'text-sm')}
        >
          {complete
            ? ''
            : compact
              ? `${3 - missing.length} of 3 answered`
              : `${missing.join(', ')} still needed`}
        </p>
      </div>
    </div>
  )
}

interface Option<T> {
  value: T
  label: string
  hint?: string
}

/**
 * One question, as a real radio group.
 *
 * `aria-pressed` was wrong here: it describes independent toggles, so a screen
 * reader announced five unrelated buttons with no group name and no "3 of 5".
 * This is the APG radio-group pattern — roving tabindex (the group is one tab
 * stop), arrows move focus and selection, Home/End jump to the ends.
 * Selection is local state only, so selection-follows-focus costs nothing.
 */
const ChoiceGroup = function ChoiceGroup<T extends string | number>({
  groupRef,
  step,
  label,
  note,
  compact = false,
  options,
  value,
  onChange,
  layout,
  pill = false,
}: {
  groupRef: React.RefObject<HTMLDivElement>
  step: number
  label: string
  note?: string
  compact?: boolean
  options: readonly Option<T>[]
  value: T | null
  onChange: (value: T) => void
  layout: 'grid' | 'wrap'
  pill?: boolean
}) {
  const labelId = useId()
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])

  const selectedIndex = options.findIndex((o) => o.value === value)
  // Exactly one radio is tabbable: the checked one, or the first when the
  // question is unanswered.
  const tabbableIndex = selectedIndex >= 0 ? selectedIndex : 0

  const select = (index: number) => {
    onChange(options[index].value)
    itemRefs.current[index]?.focus()
  }

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    const last = options.length - 1
    let next: number
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = index === last ? 0 : index + 1
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        next = index === 0 ? last : index - 1
        break
      case 'Home':
        next = 0
        break
      case 'End':
        next = last
        break
      default:
        return
    }
    event.preventDefault()
    select(next)
  }

  const dense = pill || compact

  return (
    <div>
      <p
        id={labelId}
        className={cn('flex items-baseline gap-2', compact ? 'mb-1.5' : 'mb-1')}
      >
        <span className="text-micro font-semibold tabular-nums text-fg-subtle">
          {String(step).padStart(2, '0')}
        </span>
        <span className={cn('font-semibold text-fg', compact ? 'text-sm' : 'text-lg')}>
          {label}
        </span>
      </p>
      {/* The notes earn their place on /eligibility, where the page is the task.
          In the hero they would double the height of the form. */}
      {note && !compact && <p className="mb-3 max-w-prose text-sm text-fg-muted">{note}</p>}

      <div
        ref={groupRef}
        role="radiogroup"
        aria-labelledby={labelId}
        className={cn(
          layout === 'grid' ? 'grid sm:grid-cols-2' : 'flex flex-wrap',
          compact ? 'gap-1.5' : 'gap-2'
        )}
      >
        {options.map((opt, index) => {
          const selected = opt.value === value
          return (
            <button
              key={String(opt.value)}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={index === tabbableIndex ? 0 : -1}
              ref={(el) => {
                itemRefs.current[index] = el
              }}
              onClick={() => select(index)}
              onKeyDown={(e) => onKeyDown(e, index)}
              className={cn(
                'rounded-md border text-left transition-colors duration-fast',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2',
                compact ? 'px-3 py-1.5 text-xs' : dense ? 'px-3.5 py-2 text-sm' : 'px-4 py-3',
                selected
                  ? 'border-accent-line bg-accent-subtle text-fg'
                  : 'border-line bg-surface text-fg-muted hover:border-line-strong hover:text-fg'
              )}
            >
              <span className={cn('block font-medium', selected && 'text-fg')}>
                {opt.label}
              </span>
              {opt.hint && !compact && (
                <span className="mt-0.5 block text-xs text-fg-subtle">{opt.hint}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

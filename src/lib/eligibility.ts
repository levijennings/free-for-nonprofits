/**
 * Eligibility model.
 *
 * The directory holds two different kinds of row, and the whole value of the
 * snapshot depends on not confusing them:
 *
 *   GATED    (requires_nonprofit_status = true)
 *            A programme you apply for and can be refused. Slack for
 *            Nonprofits, Google Ad Grants, TechSoup. Eligibility is real.
 *
 *   OPEN     (requires_nonprofit_status = false)
 *            Free or cheap to anyone. GIMP, WordPress, Grants.gov. Being a
 *            nonprofit changes nothing. These are still worth listing, but
 *            counting them as "programmes you qualify for" is a lie.
 *
 *   UNKNOWN  (null) — not yet classified, or genuinely unresolvable.
 *
 * Constraint columns follow SQL semantics: NULL means "no constraint stated by
 * the vendor", which matches everyone. That is deliberate — an unstated rule
 * must not silently exclude an organisation.
 */

export const ORG_TYPES = [
  {
    value: 'nonprofit_501c3',
    label: '501(c)(3) public charity',
    hint: 'The most common US nonprofit',
    /** Plural form, used when stating an exclusion reason. */
    plural: '501(c)(3) charities',
  },
  {
    value: 'nonprofit_501c6',
    label: '501(c)(6) trade or professional association',
    hint: 'Chambers, leagues, boards',
    plural: '501(c)(6) associations',
  },
  {
    value: 'religious',
    label: 'Church or religious organisation',
    hint: 'Excluded more often than you would expect',
    plural: 'churches and religious organisations',
  },
  {
    value: 'school',
    label: 'School, college or university',
    hint: 'Many vendors route these elsewhere',
    plural: 'schools and universities',
  },
  {
    value: 'charity_non_us',
    label: 'Registered charity outside the US',
    hint: 'Equivalent status in your own country',
    plural: 'charities outside the US',
  },
] as const

export type OrgType = (typeof ORG_TYPES)[number]['value']

export const COUNTRIES = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'NZ', label: 'New Zealand' },
  { value: 'IN', label: 'India' },
  { value: 'OTHER', label: 'Somewhere else' },
] as const

export type CountryCode = (typeof COUNTRIES)[number]['value']

export const BUDGET_BANDS = [
  { value: 250_000, label: 'Under $250k' },
  { value: 1_000_000, label: '$250k – $1M' },
  { value: 5_000_000, label: '$1M – $5M' },
  { value: 20_000_000, label: 'Over $5M' },
] as const

export interface EligibilityAnswers {
  orgType: OrgType | null
  country: CountryCode | null
  budgetUsd: number | null
}

/** Every column the eligibility surfaces need. Keep in sync with the selects. */
export const ELIGIBILITY_COLUMNS = `
  id, name, slug, description, website_url, logo_url,
  pricing_model, nonprofit_deal, rating_avg, review_count, is_featured,
  save_count, favorite_count, using_count,
  requires_nonprofit_status, eligible_org_types, eligible_countries,
  min_budget_usd, max_budget_usd, annual_value_usd,
  steps_count, time_to_claim_days, difficulty, renewal,
  nonprofit_url, last_verified_at,
  category:categories(name, slug, icon)
` as const

export interface EligibilityFields {
  requires_nonprofit_status: boolean | null
  eligible_org_types: string[] | null
  eligible_countries: string[] | null
  min_budget_usd: number | null
  max_budget_usd: number | null
  annual_value_usd: number | null
  steps_count: number | null
  time_to_claim_days: number | null
  difficulty: string | null
  renewal: string | null
  nonprofit_url: string | null
  last_verified_at: string | null
}

export type MatchVerdict =
  | { kind: 'open' }
  | { kind: 'eligible' }
  | { kind: 'ineligible'; reasons: string[] }
  | { kind: 'unknown' }

/**
 * Decide whether one row applies to one organisation.
 *
 * Returns `ineligible` ONLY when the vendor states a rule the organisation
 * fails. An unstated rule is never grounds for exclusion — that distinction is
 * the difference between a useful filter and a filter that hides real money.
 */
export function matchTool(
  tool: EligibilityFields,
  answers: EligibilityAnswers
): MatchVerdict {
  if (tool.requires_nonprofit_status === false) return { kind: 'open' }
  if (tool.requires_nonprofit_status === null) return { kind: 'unknown' }

  const reasons: string[] = []

  if (answers.orgType && tool.eligible_org_types?.length) {
    if (!tool.eligible_org_types.includes(answers.orgType)) {
      const plural = ORG_TYPES.find((o) => o.value === answers.orgType)?.plural
      reasons.push(plural ? `Excludes ${plural}` : 'Your organisation type is excluded')
    }
  }

  if (answers.country && tool.eligible_countries?.length) {
    // OTHER can never satisfy an explicit country list.
    const ok = answers.country !== 'OTHER' && tool.eligible_countries.includes(answers.country)
    if (!ok) {
      reasons.push(`Limited to ${formatCountries(tool.eligible_countries)}`)
    }
  }

  if (answers.budgetUsd !== null) {
    if (tool.max_budget_usd !== null && answers.budgetUsd > tool.max_budget_usd) {
      reasons.push(`Budget ceiling of ${formatUsd(tool.max_budget_usd)}`)
    }
    if (tool.min_budget_usd !== null && answers.budgetUsd < tool.min_budget_usd) {
      reasons.push(`Aimed at organisations above ${formatUsd(tool.min_budget_usd)}`)
    }
  }

  return reasons.length ? { kind: 'ineligible', reasons } : { kind: 'eligible' }
}

export interface Snapshot<T> {
  eligible: T[]
  open: T[]
  unknown: T[]
  ineligible: Array<T & { reasons: string[] }>
  /** Programmes with a vendor-stated dollar value. Deliberately small. */
  knownValueUsd: number
  valuedCount: number
  unvaluedCount: number
}

export function buildSnapshot<T extends EligibilityFields>(
  tools: T[],
  answers: EligibilityAnswers
): Snapshot<T> {
  const snap: Snapshot<T> = {
    eligible: [],
    open: [],
    unknown: [],
    ineligible: [],
    knownValueUsd: 0,
    valuedCount: 0,
    unvaluedCount: 0,
  }

  for (const tool of tools) {
    const verdict = matchTool(tool, answers)
    switch (verdict.kind) {
      case 'open':
        snap.open.push(tool)
        break
      case 'unknown':
        snap.unknown.push(tool)
        break
      case 'ineligible':
        snap.ineligible.push({ ...tool, reasons: verdict.reasons })
        break
      case 'eligible':
        snap.eligible.push(tool)
        if (tool.annual_value_usd && tool.annual_value_usd > 0) {
          snap.knownValueUsd += tool.annual_value_usd
          snap.valuedCount += 1
        } else {
          snap.unvaluedCount += 1
        }
        break
    }
  }

  return snap
}

const COUNTRY_LABELS: Record<string, string> = {
  US: 'the US',
  CA: 'Canada',
  GB: 'the UK',
  AU: 'Australia',
  NZ: 'New Zealand',
  IN: 'India',
}

export function formatCountries(codes: string[]): string {
  const names = codes.map((c) => COUNTRY_LABELS[c] ?? c)
  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} and ${names[1]}`
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

export function formatUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`
  return `$${n}`
}

/** Rough freshness signal. The catalogue is only as good as its last check. */
export function verificationAge(iso: string | null): {
  label: string
  stale: boolean
} | null {
  if (!iso) return null
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (days <= 0) return { label: 'Verified today', stale: false }
  if (days === 1) return { label: 'Verified yesterday', stale: false }
  if (days < 30) return { label: `Verified ${days} days ago`, stale: false }
  if (days < 365) {
    const months = Math.round(days / 30)
    return { label: `Verified ${months} month${months === 1 ? '' : 's'} ago`, stale: days > 180 }
  }
  return { label: 'Verified over a year ago', stale: true }
}

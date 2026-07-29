import type { ClaimStatus as PillStatus } from '@/components/ui/StatusPill'

/**
 * Claim state.
 *
 * Saving a tool is bookkeeping — the user could have used a browser bookmark.
 * A claim is different: it is the user's position in an EXTERNAL process that
 * runs for weeks (TechSoup validation, a Google Ad Grants review) and that
 * nothing on this site can observe. Only the user knows where they are, so the
 * account is the only place that knowledge can live. That is the whole reason
 * to sign in.
 */

/** Matches the `claim_status` Postgres enum, in progression order. */
export const CLAIM_STATUSES = [
  'not_started',
  'gathering_docs',
  'applied',
  'approved',
] as const

export type ClaimStatusValue = (typeof CLAIM_STATUSES)[number]

export interface ToolClaim {
  tool_id: string
  status: ClaimStatusValue
  note: string | null
  applied_at: string | null
  created_at: string
  updated_at: string
}

/**
 * The design system's StatusPill uses shorter names than the database enum.
 * One mapping, in one place, so the two vocabularies never drift.
 */
const PILL_STATUS: Record<ClaimStatusValue, PillStatus> = {
  not_started: 'none',
  gathering_docs: 'gathering',
  applied: 'applied',
  approved: 'approved',
}

export function toPillStatus(status: ClaimStatusValue): PillStatus {
  return PILL_STATUS[status]
}

export function isClaimStatus(value: unknown): value is ClaimStatusValue {
  return (
    typeof value === 'string' &&
    (CLAIM_STATUSES as readonly string[]).includes(value)
  )
}

interface StatusCopy {
  /** Button label — what the user is telling us they have done. */
  action: string
  /** What this state means, written for someone mid-process. */
  meaning: string
}

export const CLAIM_STATUS_COPY: Record<ClaimStatusValue, StatusCopy> = {
  not_started: {
    action: 'Not started',
    meaning: 'You have not begun this application.',
  },
  gathering_docs: {
    action: 'Gathering documents',
    meaning:
      'You are collecting what the vendor asks for — determination letter, registration number, proof of address.',
  },
  applied: {
    action: 'Applied',
    meaning:
      'Submitted and waiting on them. Most of these reviews take weeks, not days.',
  },
  approved: {
    action: 'Approved',
    meaning: 'You are in. Note the renewal date somewhere you will see it.',
  },
}

/** Whole days since the application was submitted, or null if not applicable. */
export function daysSinceApplied(appliedAt: string | null): number | null {
  if (!appliedAt) return null
  const then = new Date(appliedAt).getTime()
  if (Number.isNaN(then)) return null
  return Math.max(0, Math.floor((Date.now() - then) / 86_400_000))
}

/**
 * "Waiting 23 days" is the sentence a user cannot write for themselves without
 * an account, so it is worth writing well.
 */
export function waitingLabel(claim: {
  status: ClaimStatusValue
  applied_at: string | null
}): string | null {
  if (claim.status !== 'applied') return null
  const days = daysSinceApplied(claim.applied_at)
  if (days === null) return 'Waiting on their decision'
  if (days === 0) return 'Submitted today — waiting on their decision'
  if (days === 1) return 'Waiting 1 day so far'
  if (days < 14) return `Waiting ${days} days so far`
  return `Waiting ${Math.floor(days / 7)} weeks so far`
}

/**
 * `applied_at` is derived, never sent by the client: it is the timestamp the
 * user first told us they had submitted. Moving forward from `applied` keeps
 * it (the wait already happened); resetting to `not_started` clears it,
 * because a restarted application is a new wait.
 */
export function resolveAppliedAt(
  nextStatus: ClaimStatusValue,
  existingAppliedAt: string | null
): string | null {
  if (nextStatus === 'not_started') return null
  if (nextStatus === 'applied' || nextStatus === 'approved') {
    return existingAppliedAt ?? new Date().toISOString()
  }
  return existingAppliedAt
}

/** Claims worth surfacing on the dashboard: started, not yet finished. */
export function isInProgress(status: ClaimStatusValue): boolean {
  return status === 'gathering_docs' || status === 'applied'
}

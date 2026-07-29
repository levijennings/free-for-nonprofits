'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { StatusPill } from '@/components/ui/StatusPill'
import {
  CLAIM_STATUSES,
  CLAIM_STATUS_COPY,
  toPillStatus,
  waitingLabel,
  type ClaimStatusValue,
  type ToolClaim,
} from '@/lib/claims'

interface Props {
  toolId: string
  toolName: string
  /** Server-rendered so the user's own state is never a flash of "not started". */
  initialClaim: Pick<ToolClaim, 'status' | 'note' | 'applied_at'> | null
}

/**
 * The claim tracker.
 *
 * Optimistic on purpose: the user is telling us something they already know to
 * be true about the outside world, so the UI has no business making them wait
 * on a round trip to believe it. If the write fails we roll back and say so.
 */
export default function ClaimTracker({ toolId, toolName, initialClaim }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const [status, setStatus] = useState<ClaimStatusValue>(
    initialClaim?.status ?? 'not_started'
  )
  const [appliedAt, setAppliedAt] = useState<string | null>(
    initialClaim?.applied_at ?? null
  )
  const [note, setNote] = useState(initialClaim?.note ?? '')
  const [savedNote, setSavedNote] = useState(initialClaim?.note ?? '')
  const [pending, setPending] = useState<ClaimStatusValue | 'note' | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function save(nextStatus: ClaimStatusValue, nextNote: string) {
    const previous = { status, note: savedNote, appliedAt }
    setPending(nextStatus === status ? 'note' : nextStatus)
    setError(null)
    setStatus(nextStatus)

    const res = await fetch('/api/claims', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tool_id: toolId,
        status: nextStatus,
        note: nextNote.trim() || null,
      }),
    })

    if (!res.ok) {
      setStatus(previous.status)
      setNote(previous.note)
      setAppliedAt(previous.appliedAt)
      setPending(null)
      setError(
        res.status === 401
          ? 'Your session expired. Sign in again to save this.'
          : 'Could not save that. Try again in a moment.'
      )
      return
    }

    const body = await res.json().catch(() => null)
    const saved = body?.data as ToolClaim | undefined
    if (saved) {
      setStatus(saved.status)
      setAppliedAt(saved.applied_at)
      setNote(saved.note ?? '')
      setSavedNote(saved.note ?? '')
    } else {
      setSavedNote(nextNote.trim())
    }
    setPending(null)
    // Keeps the dashboard's claims section honest without a full reload.
    startTransition(() => router.refresh())
  }

  const waiting = waitingLabel({ status, applied_at: appliedAt })
  const noteDirty = note.trim() !== savedNote.trim()

  return (
    <div className="mt-6 rounded-md border border-accent-line bg-accent-subtle p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-fg">Your progress</h3>
          <p className="mt-0.5 text-xs text-fg-muted">
            {waiting ?? CLAIM_STATUS_COPY[status].meaning}
          </p>
        </div>
        <StatusPill status={toPillStatus(status)} />
      </div>

      <fieldset className="mt-4" disabled={pending !== null}>
        <legend className="text-micro uppercase tracking-wide text-fg-subtle">
          Where are you with {toolName}?
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {CLAIM_STATUSES.map((value) => {
            const active = value === status
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => save(value, note)}
                className={[
                  'rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors duration-fast',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
                  'disabled:cursor-not-allowed disabled:opacity-70',
                  active
                    ? 'border-accent bg-accent text-accent-fg'
                    : 'border-line bg-surface text-fg-muted hover:border-line-strong hover:text-fg',
                ].join(' ')}
              >
                {pending === value ? 'Saving…' : CLAIM_STATUS_COPY[value].action}
              </button>
            )
          })}
        </div>
      </fieldset>

      {status !== 'not_started' && (
        <div className="mt-4">
          <label
            htmlFor={`claim-note-${toolId}`}
            className="text-micro uppercase tracking-wide text-fg-subtle"
          >
            Private note
          </label>
          <textarea
            id={`claim-note-${toolId}`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            maxLength={1000}
            placeholder="Reference number, who you emailed, what they still need from you."
            className="mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-fg placeholder:text-fg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          />
          <div className="mt-2 flex items-center gap-3">
            <Button
              size="sm"
              variant="secondary"
              disabled={!noteDirty || pending !== null}
              loading={pending === 'note'}
              loadingText="Saving…"
              onClick={() => save(status, note)}
            >
              Save note
            </Button>
            <span className="text-xs text-fg-subtle">
              Only you can see this.
            </span>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 text-xs text-status-warn">
          {error}
        </p>
      )}
    </div>
  )
}

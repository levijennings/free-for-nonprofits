'use client'

import { useId, useRef, useState, useTransition } from 'react'
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

type Pending = ClaimStatusValue | 'note' | 'remove' | null

/**
 * The claim tracker.
 *
 * Optimistic on purpose: the user is telling us something they already know to
 * be true about the outside world, so the UI has no business making them wait
 * on a round trip to believe it. If the write fails we roll back and say so.
 *
 * Rollback restores status and applied_at — facts the server owns — but never
 * the note. The note is the user's unsaved draft; wiping it and then saying
 * "try again" leaves them nothing to retry with.
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
  const [pending, setPending] = useState<Pending>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmRemove, setConfirmRemove] = useState(false)

  const legendId = useId()
  const groupRef = useRef<HTMLDivElement>(null)
  const selectedIndex = CLAIM_STATUSES.indexOf(status)
  /**
   * Roving tabindex: the group is a single tab stop. Tracked separately from
   * the selection because arrow keys here move focus WITHOUT selecting —
   * selecting writes to the server, and arrowing past three options should not
   * fire three saves. Space or Enter commits, as the ARIA radio pattern allows
   * when selection has a side effect.
   */
  const [focusIndex, setFocusIndex] = useState<number | null>(null)
  const tabbableIndex = focusIndex ?? (selectedIndex >= 0 ? selectedIndex : 0)

  async function save(nextStatus: ClaimStatusValue, nextNote: string) {
    if (pending !== null) return
    const previous = { status, appliedAt }
    setPending(nextStatus === status ? 'note' : nextStatus)
    setError(null)
    setStatus(nextStatus)

    try {
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
        // Note deliberately untouched — see the component comment.
        setStatus(previous.status)
        setAppliedAt(previous.appliedAt)
        setError(
          res.status === 401
            ? 'Your session expired. Sign in again to save this. Your note is still here.'
            : 'Could not save that. Your note is still here — try again in a moment.'
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
      // Keeps the dashboard's claims section honest without a full reload.
      startTransition(() => router.refresh())
    } catch {
      // Offline, DNS failure, connection dropped mid-flight. Without this the
      // rejection escapes, `pending` never clears, and the controls stay dead
      // until the page is reloaded.
      setStatus(previous.status)
      setAppliedAt(previous.appliedAt)
      setError('Could not reach the server. Your note is still here — check your connection and try again.')
    } finally {
      // Every path, including the ones that returned early.
      setPending(null)
    }
  }

  /** Removes the claim entirely — a claim started on the wrong tool. */
  async function remove() {
    if (pending !== null) return
    setPending('remove')
    setError(null)

    try {
      const res = await fetch(`/api/claims?tool_id=${encodeURIComponent(toolId)}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        setError(
          res.status === 401
            ? 'Your session expired. Sign in again to remove this.'
            : 'Could not remove that. Try again in a moment.'
        )
        return
      }

      setStatus('not_started')
      setAppliedAt(null)
      setNote('')
      setSavedNote('')
      setConfirmRemove(false)
      startTransition(() => router.refresh())
    } catch {
      setError('Could not reach the server. Check your connection and try again.')
    } finally {
      setPending(null)
    }
  }

  function onRadioKeyDown(event: React.KeyboardEvent, index: number) {
    const last = CLAIM_STATUSES.length - 1
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
    setFocusIndex(next)
    const radios = groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]')
    radios?.[next]?.focus()
  }

  const waiting = waitingLabel({ status, applied_at: appliedAt })
  const noteDirty = note.trim() !== savedNote.trim()

  return (
    <div className="mt-6 rounded-md border border-accent-line bg-accent-subtle p-4">
      {/* The optimistic status change happens without a page change or a focus
          change, so without a live region a screen-reader user gets silence. */}
      <div
        className="flex flex-wrap items-center justify-between gap-3"
        aria-live="polite"
      >
        <div>
          <h3 className="text-sm font-semibold text-fg">Your progress</h3>
          <p className="mt-0.5 text-xs text-fg-muted">
            {waiting ?? CLAIM_STATUS_COPY[status].meaning}
          </p>
        </div>
        <StatusPill status={toPillStatus(status)} />
      </div>

      <div className="mt-4">
        <p id={legendId} className="text-micro uppercase tracking-wide text-fg-subtle">
          Where are you with {toolName}?
        </p>
        {/* Not a disabled fieldset: disabling the wrapper while a save is in
            flight also disables the button that currently has focus, which
            throws focus to <body> mid-task. Each button reports its own
            progress with aria-busy and stays focusable. */}
        <div
          ref={groupRef}
          role="radiogroup"
          aria-labelledby={legendId}
          className="mt-2 flex flex-wrap gap-2"
        >
          {CLAIM_STATUSES.map((value, index) => {
            const active = value === status
            const busy = pending === value
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={active}
                aria-busy={busy || undefined}
                tabIndex={index === tabbableIndex ? 0 : -1}
                onClick={() => {
                  setFocusIndex(index)
                  save(value, note)
                }}
                onKeyDown={(e) => onRadioKeyDown(e, index)}
                className={[
                  'rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors duration-fast',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
                  active
                    ? 'border-accent bg-accent text-accent-fg'
                    : 'border-line bg-surface text-fg-muted hover:border-line-strong hover:text-fg',
                ].join(' ')}
              >
                {busy ? 'Saving…' : CLAIM_STATUS_COPY[value].action}
              </button>
            )
          })}
        </div>
      </div>

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
              disabled={!noteDirty}
              aria-busy={pending === 'note' || undefined}
              onClick={() => save(status, note)}
            >
              {pending === 'note' ? 'Saving…' : 'Save note'}
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

      {status !== 'not_started' && (
        <div className="mt-3 border-t border-accent-line pt-3">
          {confirmRemove ? (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs text-fg-muted">
                Remove this claim? The note goes with it.
              </p>
              <Button
                size="sm"
                variant="destructive"
                aria-busy={pending === 'remove' || undefined}
                onClick={remove}
              >
                {pending === 'remove' ? 'Removing…' : 'Yes, remove'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirmRemove(false)}>
                Keep it
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmRemove(true)}
              className="text-xs font-medium text-fg-subtle underline-offset-2 hover:text-fg hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              Started this by mistake? Remove it
            </button>
          )}
        </div>
      )}
    </div>
  )
}

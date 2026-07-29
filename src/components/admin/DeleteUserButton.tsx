'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  userId: string
  /** Shown in the confirm step, e.g. an email or org name. */
  label: string
  /** Compact styling for use inline in a list row vs. a standalone detail-page button. */
  compact?: boolean
  /** Called after a successful delete, in addition to router.refresh(). */
  onDeleted?: () => void
}

export default function DeleteUserButton({ userId, label, compact = false, onDeleted }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const confirmDelete = async () => {
    setLoading(true)
    setError('')
    const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
    const data = await res.json().catch(() => ({}))
    setLoading(false)
    if (!res.ok) {
      setError(data.error || 'Failed to delete user')
      return
    }
    setOpen(false)
    onDeleted?.()
    router.refresh()
  }

  if (!open) {
    return (
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true) }}
        className={
          compact
            ? 'text-xs px-2.5 py-1 bg-status-warn-bg hover:brightness-95 text-status-warn border border-status-warn/30 rounded-lg transition-colors duration-fast font-medium shrink-0'
            : 'w-full py-2.5 text-sm font-medium text-status-warn border border-status-warn/30 rounded-xl hover:bg-status-warn-bg transition-colors duration-fast'
        }
      >
        Delete user
      </button>
    )
  }

  return (
    <div
      onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
      className={compact ? 'flex items-center gap-2 shrink-0' : 'space-y-2'}
    >
      {!compact && (
        <p className="text-xs text-fg-subtle">
          Permanently delete <strong>{label}</strong> and all of their saved tools, favorites, reviews, and
          preferences? Their public tool submissions and requests stay, with the author cleared. This can&apos;t be undone.
        </p>
      )}
      {error && <p className="text-xs text-status-warn">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={confirmDelete}
          disabled={loading}
          className={
            compact
              ? 'text-xs px-2.5 py-1 bg-status-warn hover:brightness-90 text-white rounded-lg font-medium disabled:opacity-50'
              : 'flex-1 py-2.5 bg-status-warn hover:brightness-90 text-white text-sm font-semibold rounded-xl transition-colors duration-fast disabled:opacity-50'
          }
        >
          {loading ? '…' : compact ? `Confirm delete` : 'Confirm delete'}
        </button>
        <button
          onClick={() => setOpen(false)}
          className={
            compact
              ? 'text-xs px-2.5 py-1 border border-line rounded-lg text-fg-subtle hover:bg-surface-subtle'
              : 'px-4 py-2.5 border border-line text-sm text-fg-subtle rounded-xl hover:bg-surface-subtle transition-colors duration-fast'
          }
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

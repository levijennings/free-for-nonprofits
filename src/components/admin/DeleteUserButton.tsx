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
            ? 'text-xs px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg transition-colors font-medium shrink-0'
            : 'w-full py-2.5 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors'
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
        <p className="text-xs text-gray-500">
          Permanently delete <strong>{label}</strong> and all of their saved tools, favorites, reviews, and
          preferences? Their public tool submissions and requests stay, with the author cleared. This can&apos;t be undone.
        </p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={confirmDelete}
          disabled={loading}
          className={
            compact
              ? 'text-xs px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium disabled:opacity-50'
              : 'flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50'
          }
        >
          {loading ? '…' : compact ? `Confirm delete` : 'Confirm delete'}
        </button>
        <button
          onClick={() => setOpen(false)}
          className={
            compact
              ? 'text-xs px-2.5 py-1 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50'
              : 'px-4 py-2.5 border border-gray-200 text-sm text-gray-500 rounded-xl hover:bg-gray-50 transition-colors'
          }
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

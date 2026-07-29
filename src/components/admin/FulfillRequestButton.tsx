'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  requestId: string
  requestName: string
}

export default function FulfillRequestButton({ requestId, requestName }: Props) {
  const [open, setOpen] = useState(false)
  const [toolSlug, setToolSlug] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const fulfill = async () => {
    if (!toolSlug.trim()) { setError('Enter the tool slug'); return }
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/fulfill-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request_id: requestId, tool_slug: toolSlug.trim() }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || 'Failed'); return }
    setOpen(false)
    router.refresh()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs px-2.5 py-1 bg-status-done-bg hover:bg-accent-subtle text-status-done border border-accent-line rounded-lg transition-colors duration-fast font-medium"
      >
        Mark fulfilled
      </button>
    )
  }

  return (
    <div className="mt-2 space-y-2">
      <input
        value={toolSlug}
        onChange={e => setToolSlug(e.target.value)}
        placeholder={`Tool slug for "${requestName}"…`}
        className="w-full text-xs border border-line rounded-lg px-2.5 py-1.5 bg-surface text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-1 focus:ring-focus"
      />
      {error && <p className="text-[10px] text-status-warn">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={fulfill}
          disabled={loading}
          className="flex-1 text-xs py-1.5 bg-accent hover:bg-accent-hover text-accent-fg rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? '…' : 'Confirm'}
        </button>
        <button onClick={() => setOpen(false)} className="text-xs px-3 py-1.5 border border-line rounded-lg text-fg-subtle hover:bg-surface-subtle">
          Cancel
        </button>
      </div>
    </div>
  )
}

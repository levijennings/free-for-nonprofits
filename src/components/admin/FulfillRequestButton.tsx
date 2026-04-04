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
        className="text-xs px-2.5 py-1 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg transition-colors font-medium"
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
        className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-300"
      />
      {error && <p className="text-[10px] text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={fulfill}
          disabled={loading}
          className="flex-1 text-xs py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? '…' : 'Confirm'}
        </button>
        <button onClick={() => setOpen(false)} className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </div>
  )
}

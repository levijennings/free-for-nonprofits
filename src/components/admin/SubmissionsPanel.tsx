'use client'

import { useState } from 'react'

interface Submission {
  id: string
  name: string
  website_url: string
  category_slug: string | null
  pricing_model: string | null
  description: string
  nonprofit_deal: string | null
  status: string
  created_at: string
  submitter_email: string | null
}

export default function SubmissionsPanel({ initial }: { initial: Submission[] }) {
  const [submissions, setSubmissions] = useState(initial)
  const [loading, setLoading] = useState<string | null>(null)

  const act = async (id: string, action: 'approve' | 'reject') => {
    setLoading(id + action)
    const endpoint = action === 'approve' ? '/api/admin/approve-submission' : '/api/admin/reject-submission'
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submission_id: id }),
    })
    if (res.ok) {
      setSubmissions(prev =>
        prev.map(s => s.id === id ? { ...s, status: action === 'approve' ? 'approved' : 'rejected' } : s)
      )
    }
    setLoading(null)
  }

  const pricingLabel: Record<string, string> = {
    free: 'Free',
    freemium: 'Freemium',
    nonprofit_discount: 'Nonprofit Discount',
  }

  const pending = submissions.filter(s => s.status === 'pending')
  const resolved = submissions.filter(s => s.status !== 'pending')

  return (
    <div className="space-y-6">
      {pending.length === 0 && (
        <div className="text-center py-14 text-fg-subtle">
          <div className="text-4xl mb-3">🎉</div>
          <p className="font-medium">All caught up — no pending submissions.</p>
        </div>
      )}

      {pending.map(sub => (
        <div key={sub.id} className="bg-surface border border-line rounded-2xl p-5 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-bold text-fg text-lg">{sub.name}</h3>
              <a href={sub.website_url} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline break-all">
                {sub.website_url}
              </a>
            </div>
            <div className="shrink-0 flex gap-2">
              <button
                onClick={() => act(sub.id, 'approve')}
                disabled={loading !== null}
                className="px-4 py-2 text-sm font-semibold bg-accent hover:bg-accent-hover text-accent-fg rounded-xl transition-colors duration-fast disabled:opacity-50"
              >
                {loading === sub.id + 'approve' ? '…' : '✓ Approve'}
              </button>
              <button
                onClick={() => act(sub.id, 'reject')}
                disabled={loading !== null}
                className="px-4 py-2 text-sm font-semibold bg-status-warn-bg hover:brightness-95 text-status-warn rounded-xl transition-colors duration-fast disabled:opacity-50"
              >
                {loading === sub.id + 'reject' ? '…' : '✕ Reject'}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {sub.category_slug && (
              <span className="px-2 py-1 bg-surface-inset text-fg-muted rounded-full">{sub.category_slug}</span>
            )}
            {sub.pricing_model && (
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">{pricingLabel[sub.pricing_model] ?? sub.pricing_model}</span>
            )}
            <span className="px-2 py-1 bg-surface-inset text-fg-subtle rounded-full">
              {new Date(sub.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            {sub.submitter_email && (
              <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full">{sub.submitter_email}</span>
            )}
          </div>

          <p className="text-sm text-fg-muted leading-relaxed">{sub.description}</p>

          {sub.nonprofit_deal && (
            <p className="text-sm text-status-done bg-status-done-bg rounded-lg px-3 py-2">
              🎁 {sub.nonprofit_deal}
            </p>
          )}
        </div>
      ))}

      {resolved.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium text-fg-subtle hover:text-fg">
            {resolved.length} resolved submission{resolved.length !== 1 ? 's' : ''}
          </summary>
          <div className="mt-3 space-y-2">
            {resolved.map(sub => (
              <div key={sub.id} className="flex items-center justify-between gap-3 bg-surface-subtle rounded-xl px-4 py-3">
                <div>
                  <span className="text-sm font-medium text-fg-muted">{sub.name}</span>
                  <span className="text-xs text-fg-subtle ml-2">{sub.website_url}</span>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sub.status === 'approved' ? 'bg-status-done-bg text-status-done' : 'bg-status-warn-bg text-status-warn'}`}>
                  {sub.status}
                </span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}

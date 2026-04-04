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
        <div className="text-center py-14 text-gray-400">
          <div className="text-4xl mb-3">🎉</div>
          <p className="font-medium">All caught up — no pending submissions.</p>
        </div>
      )}

      {pending.map(sub => (
        <div key={sub.id} className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{sub.name}</h3>
              <a href={sub.website_url} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-500 hover:underline break-all">
                {sub.website_url}
              </a>
            </div>
            <div className="shrink-0 flex gap-2">
              <button
                onClick={() => act(sub.id, 'approve')}
                disabled={loading !== null}
                className="px-4 py-2 text-sm font-semibold bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-colors disabled:opacity-50"
              >
                {loading === sub.id + 'approve' ? '…' : '✓ Approve'}
              </button>
              <button
                onClick={() => act(sub.id, 'reject')}
                disabled={loading !== null}
                className="px-4 py-2 text-sm font-semibold bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors disabled:opacity-50"
              >
                {loading === sub.id + 'reject' ? '…' : '✕ Reject'}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {sub.category_slug && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full">{sub.category_slug}</span>
            )}
            {sub.pricing_model && (
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">{pricingLabel[sub.pricing_model] ?? sub.pricing_model}</span>
            )}
            <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full">
              {new Date(sub.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            {sub.submitter_email && (
              <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full">{sub.submitter_email}</span>
            )}
          </div>

          <p className="text-sm text-gray-600 leading-relaxed">{sub.description}</p>

          {sub.nonprofit_deal && (
            <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
              🎁 {sub.nonprofit_deal}
            </p>
          )}
        </div>
      ))}

      {resolved.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium text-gray-400 hover:text-gray-600">
            {resolved.length} resolved submission{resolved.length !== 1 ? 's' : ''}
          </summary>
          <div className="mt-3 space-y-2">
            {resolved.map(sub => (
              <div key={sub.id} className="flex items-center justify-between gap-3 bg-gray-50 rounded-xl px-4 py-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">{sub.name}</span>
                  <span className="text-xs text-gray-400 ml-2">{sub.website_url}</span>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sub.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
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

'use client'

import { useState } from 'react'
import Link from 'next/link'

const CATEGORIES = [
  { slug: 'crm-donor-management',   name: 'CRM & Donor Management' },
  { slug: 'fundraising-payments',   name: 'Fundraising & Payments' },
  { slug: 'email-marketing',        name: 'Email Marketing' },
  { slug: 'project-management',     name: 'Project Management' },
  { slug: 'accounting-finance',     name: 'Accounting & Finance' },
  { slug: 'website-cms',            name: 'Website & CMS' },
  { slug: 'communication-chat',     name: 'Communication & Chat' },
  { slug: 'design-graphics',        name: 'Design & Graphics' },
  { slug: 'grant-research-funding', name: 'Grant Research & Funding' },
  { slug: 'learning-training',      name: 'Learning & Training' },
  { slug: 'pro-bono-services',      name: 'Pro Bono Services' },
  { slug: 'advertising-media',      name: 'Advertising & Media' },
]

interface ToolRequest {
  id: string
  name: string
  url: string | null
  category_slug: string | null
  description: string | null
  status: string
  vote_count: number
  created_at: string
  voted: boolean
  is_own: boolean
}

interface Props {
  initialRequests: ToolRequest[]
  userId: string | null
}

const categoryName = (slug: string | null) =>
  CATEGORIES.find(c => c.slug === slug)?.name ?? null

const statusConfig: Record<string, { label: string; color: string }> = {
  open:      { label: 'Open',      color: 'bg-blue-100 text-blue-700'  },
  fulfilled: { label: 'Added! ✓',  color: 'bg-green-100 text-green-700' },
  declined:  { label: 'Declined',  color: 'bg-gray-100 text-gray-500'  },
}

export default function WishlistClient({ initialRequests, userId }: Props) {
  const [requests, setRequests] = useState<ToolRequest[]>(initialRequests)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<'all' | 'open' | 'fulfilled'>('open')
  const [votingId, setVotingId] = useState<string | null>(null)

  // Form state
  const [form, setForm] = useState({ name: '', url: '', category_slug: '', description: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitError, setSubmitError] = useState('')

  const filtered = requests.filter(r =>
    filter === 'all' ? true :
    filter === 'open' ? r.status === 'open' :
    r.status === 'fulfilled'
  )

  const toggleVote = async (req: ToolRequest) => {
    if (!userId) return
    setVotingId(req.id)

    const res = await fetch(`/api/tool-requests/${req.id}/vote`, { method: 'POST' })
    if (res.ok) {
      const { voted } = await res.json()
      setRequests(prev => prev
        .map(r => r.id === req.id
          ? { ...r, voted, vote_count: r.vote_count + (voted ? 1 : -1) }
          : r
        )
        .sort((a, b) => b.vote_count - a.vote_count)
      )
    }
    setVotingId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSubmitting(true)
    setSubmitError('')

    const res = await fetch('/api/tool-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()

    if (!res.ok) {
      setSubmitting(false)
      setSubmitError(data.error || 'Something went wrong')
      return
    }

    // Add the new request to the top of the list
    const newReq: ToolRequest = {
      id: data.id,
      name: form.name.trim(),
      url: form.url.trim() || null,
      category_slug: form.category_slug || null,
      description: form.description.trim() || null,
      status: 'open',
      vote_count: 1,
      created_at: new Date().toISOString(),
      voted: true,
      is_own: true,
    }
    setRequests(prev => [newReq, ...prev])
    setForm({ name: '', url: '', category_slug: '', description: '' })
    setSubmitting(false)
    setSubmitStatus('success')
    setShowForm(false)
    setTimeout(() => setSubmitStatus('idle'), 4000)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

      {/* ── Left: request list ── */}
      <div className="lg:col-span-2">

        {/* Filter tabs + count */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {(['open', 'all', 'fulfilled'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                  filter === f
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {f === 'fulfilled' ? 'Added' : f === 'all' ? 'All' : 'Open'}
              </button>
            ))}
          </div>
          <span className="text-sm text-gray-400">{filtered.length} requests</span>
        </div>

        {submitStatus === 'success' && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 font-medium">
            ✓ Your request was submitted. We'll get to it!
          </div>
        )}

        {/* Request cards */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="text-4xl mb-3">🙌</div>
            <p className="text-gray-500 text-sm">
              {filter === 'fulfilled'
                ? 'No fulfilled requests yet — stay tuned!'
                : 'No open requests yet. Be the first!'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((req, i) => {
              const cat = categoryName(req.category_slug)
              const status = statusConfig[req.status] ?? statusConfig.open
              return (
                <div key={req.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4">

                  {/* Vote button */}
                  <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                    <button
                      onClick={() => toggleVote(req)}
                      disabled={!userId || !!votingId || req.status !== 'open'}
                      title={!userId ? 'Sign in to vote' : req.voted ? 'Remove vote' : 'Upvote'}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                        req.voted
                          ? 'bg-brand-50 border-brand-300 text-brand-600'
                          : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-brand-300 hover:text-brand-500 hover:bg-brand-50'
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      {votingId === req.id
                        ? <span className="text-xs animate-pulse">…</span>
                        : <svg className="w-4 h-4" fill={req.voted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                          </svg>
                      }
                    </button>
                    <span className={`text-sm font-bold tabular-nums ${req.voted ? 'text-brand-600' : 'text-gray-500'}`}>
                      {req.vote_count}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {i < 3 && req.status === 'open' && (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                          #{i + 1} most wanted
                        </span>
                      )}
                      <h3 className="text-base font-bold text-gray-900">{req.name}</h3>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${status.color}`}>
                        {status.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {cat && <span className="text-xs text-gray-400">{cat}</span>}
                      {req.url && (
                        <a href={req.url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-500 hover:underline truncate max-w-[200px]">
                          {req.url.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                    </div>

                    {req.description && (
                      <p className="mt-2 text-sm text-gray-500 leading-relaxed">{req.description}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Right: submit form ── */}
      <div className="space-y-5">

        {!userId ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
            <div className="text-3xl mb-3">🗳️</div>
            <h3 className="font-bold text-gray-900 mb-2">Request or upvote tools</h3>
            <p className="text-sm text-gray-500 mb-5">Sign in to submit requests and vote on what others have asked for.</p>
            <Link href="/signup" className="block w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-colors text-center">
              Create free account
            </Link>
            <Link href="/login" className="block w-full mt-2 py-2.5 border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition-colors text-center">
              Sign in
            </Link>
          </div>
        ) : !showForm ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-1">Don't see what you need?</h3>
            <p className="text-sm text-gray-500 mb-5">Submit a tool request and we'll track it down.</p>
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              + Request a tool
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900">Request a tool</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Tool name <span className="text-red-400">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Canva, Mailchimp, Asana…"
                  required
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-300"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Category</label>
                <select
                  value={form.category_slug}
                  onChange={e => setForm(p => ({ ...p, category_slug: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-300"
                >
                  <option value="">Any category</option>
                  {CATEGORIES.map(c => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Website URL <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  value={form.url}
                  onChange={e => setForm(p => ({ ...p, url: e.target.value }))}
                  placeholder="https://…"
                  type="url"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-300"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Why does your org need it? <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={3}
                  placeholder="What would you use it for? Any known nonprofit pricing?"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-300"
                />
              </div>

              {submitError && (
                <p className="text-xs text-red-500">{submitError}</p>
              )}

              <button
                type="submit"
                disabled={submitting || !form.name.trim()}
                className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {submitting ? 'Submitting…' : 'Submit request'}
              </button>
            </form>
          </div>
        )}

        {/* How it works card */}
        <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5">
          <h3 className="font-bold text-gray-900 mb-3">How it works</h3>
          <ol className="space-y-2.5 text-sm text-gray-600">
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
              Submit a tool you want nonprofits to have access to
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
              Others upvote what they also want — top requests get priority
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
              We reach out to the tool and negotiate nonprofit pricing
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">4</span>
              You get an email as soon as it's added ✓
            </li>
          </ol>
        </div>

        {/* Set preferences CTA */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <h3 className="font-semibold text-gray-900 mb-1">Also set your preferences</h3>
          <p className="text-sm text-gray-500 mb-4">
            Tell us which categories and pricing models you care about — we'll email you whenever a matching tool is added.
          </p>
          <Link
            href={userId ? '/dashboard/preferences' : '/login'}
            className="block w-full text-center py-2.5 border border-brand-200 text-brand-600 hover:bg-brand-50 text-sm font-semibold rounded-xl transition-colors"
          >
            Set preferences →
          </Link>
        </div>

      </div>
    </div>
  )
}

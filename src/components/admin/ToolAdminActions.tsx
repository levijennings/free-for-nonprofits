'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Props {
  slug: string
  isVerified: boolean
  name: string
  description: string
  nonprofitDeal: string | null
  pricingModel: string
  websiteUrl: string
}

const pricingOptions = [
  { value: 'free',               label: 'Free' },
  { value: 'freemium',           label: 'Freemium' },
  { value: 'nonprofit_discount', label: 'Nonprofit Discount' },
  { value: 'paid',               label: 'Paid' },
]

export default function ToolAdminActions({
  slug, isVerified, name, description, nonprofitDeal, pricingModel, websiteUrl,
}: Props) {
  const router = useRouter()

  // Verified toggle state
  const [verified, setVerified]       = useState(isVerified)
  const [togglingVerified, setToggling] = useState(false)

  // Edit form state
  const [editing, setEditing]         = useState(false)
  const [editName, setEditName]       = useState(name)
  const [editDesc, setEditDesc]       = useState(description)
  const [editDeal, setEditDeal]       = useState(nonprofitDeal ?? '')
  const [editPricing, setEditPricing] = useState(pricingModel)
  const [editUrl, setEditUrl]         = useState(websiteUrl)
  const [saving, setSaving]           = useState(false)
  const [saveStatus, setSaveStatus]   = useState<'idle' | 'saved' | 'error'>('idle')

  const patch = async (body: object) => {
    const res = await fetch(`/api/admin/tools/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return res.ok
  }

  const toggleVerified = async () => {
    setToggling(true)
    const newVal = !verified
    const ok = await patch({ is_verified: newVal })
    if (ok) {
      setVerified(newVal)
      router.refresh()
    }
    setToggling(false)
  }

  const saveEdits = async () => {
    setSaving(true)
    const ok = await patch({
      name: editName.trim(),
      description: editDesc.trim(),
      nonprofit_deal: editDeal.trim() || null,
      pricing_model: editPricing,
      website_url: editUrl.trim(),
    })
    setSaving(false)
    if (ok) {
      setSaveStatus('saved')
      setEditing(false)
      router.refresh()
      setTimeout(() => setSaveStatus('idle'), 3000)
    } else {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  return (
    <div className="bg-surface rounded-2xl border border-line p-5 space-y-5">
      <h3 className="font-bold text-fg">Admin controls</h3>

      {/* ── Verified toggle ── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-fg">Verified listing</p>
          <p className="text-xs text-fg-subtle mt-0.5">Shows in public directory</p>
        </div>
        <button
          onClick={toggleVerified}
          disabled={togglingVerified}
          aria-label={verified ? 'Unverify tool' : 'Verify tool'}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-focus disabled:opacity-50 ${
            verified ? 'bg-accent' : 'bg-line-strong'
          }`}
        >
          <span className={`inline-block h-4 w-4 rounded-full bg-surface shadow transform transition-transform ${
            verified ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      </div>

      {/* ── Quick links ── */}
      <div className="flex flex-col gap-2 pt-1">
        <a
          href={websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-fg-muted hover:text-accent transition-colors duration-fast"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Visit website ↗
        </a>
        <Link
          href={`/tools/${slug}`}
          target="_blank"
          className="flex items-center gap-2 text-sm text-fg-muted hover:text-accent transition-colors duration-fast"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View public page ↗
        </Link>
      </div>

      {/* ── Edit details ── */}
      <div className="border-t border-line pt-4">
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="w-full py-2.5 text-sm font-medium text-fg-muted border border-line rounded-xl hover:border-accent-line hover:text-accent transition-colors duration-fast"
          >
            Edit details
          </button>
        ) : (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-fg-subtle uppercase tracking-wide">Editing</h4>

            <div>
              <label className="text-xs text-fg-subtle mb-1 block">Name</label>
              <input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full border border-line rounded-lg px-3 py-2 text-sm bg-surface text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-focus focus:border-focus"
              />
            </div>

            <div>
              <label className="text-xs text-fg-subtle mb-1 block">Pricing model</label>
              <select
                value={editPricing}
                onChange={e => setEditPricing(e.target.value)}
                className="w-full border border-line rounded-lg px-3 py-2 text-sm bg-surface text-fg focus:outline-none focus:ring-2 focus:ring-focus"
              >
                {pricingOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-fg-subtle mb-1 block">Description</label>
              <textarea
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                rows={4}
                className="w-full border border-line rounded-lg px-3 py-2 text-sm bg-surface text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-focus focus:border-focus resize-none"
              />
            </div>

            <div>
              <label className="text-xs text-fg-subtle mb-1 block">Nonprofit deal</label>
              <input
                value={editDeal}
                onChange={e => setEditDeal(e.target.value)}
                placeholder="e.g. Free for verified nonprofits"
                className="w-full border border-line rounded-lg px-3 py-2 text-sm bg-surface text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-focus focus:border-focus"
              />
            </div>

            <div>
              <label className="text-xs text-fg-subtle mb-1 block">Website URL</label>
              <input
                value={editUrl}
                onChange={e => setEditUrl(e.target.value)}
                type="url"
                className="w-full border border-line rounded-lg px-3 py-2 text-sm bg-surface text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-focus focus:border-focus"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={saveEdits}
                disabled={saving}
                className="flex-1 py-2.5 bg-accent hover:bg-accent-hover text-accent-fg text-sm font-semibold rounded-xl transition-colors duration-fast disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2.5 border border-line text-sm text-fg-subtle rounded-xl hover:bg-surface-subtle transition-colors duration-fast"
              >
                Cancel
              </button>
            </div>

            {saveStatus === 'saved' && (
              <p className="text-xs text-center text-status-done">✓ Changes saved</p>
            )}
            {saveStatus === 'error' && (
              <p className="text-xs text-center text-status-warn">Error saving. Please try again.</p>
            )}
          </div>
        )}

        {saveStatus === 'saved' && !editing && (
          <p className="text-xs text-center text-status-done mt-2">✓ Changes saved</p>
        )}
      </div>
    </div>
  )
}

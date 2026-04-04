'use client'

import { useState } from 'react'

const CATEGORIES = [
  { slug: 'crm-donor-management',   name: 'CRM & Donor Management', icon: '🤝' },
  { slug: 'fundraising-payments',   name: 'Fundraising & Payments',  icon: '💳' },
  { slug: 'email-marketing',        name: 'Email Marketing',          icon: '📧' },
  { slug: 'project-management',     name: 'Project Management',       icon: '📋' },
  { slug: 'accounting-finance',     name: 'Accounting & Finance',     icon: '📊' },
  { slug: 'website-cms',            name: 'Website & CMS',            icon: '🌐' },
  { slug: 'communication-chat',     name: 'Communication & Chat',     icon: '💬' },
  { slug: 'design-graphics',        name: 'Design & Graphics',        icon: '🎨' },
  { slug: 'grant-research-funding', name: 'Grant Research & Funding', icon: '🔍' },
  { slug: 'learning-training',      name: 'Learning & Training',      icon: '📚' },
  { slug: 'pro-bono-services',      name: 'Pro Bono Services',        icon: '⚖️' },
  { slug: 'advertising-media',      name: 'Advertising & Media',      icon: '📣' },
]

const PRICING = [
  { value: 'free',               label: 'Free',               desc: 'Completely free for nonprofits',         color: 'bg-green-50 border-green-200 text-green-800' },
  { value: 'freemium',           label: 'Freemium',           desc: 'Free tier available for most needs',     color: 'bg-blue-50 border-blue-200 text-blue-800'  },
  { value: 'nonprofit_discount', label: 'Nonprofit Discount', desc: 'Special pricing for verified nonprofits', color: 'bg-purple-50 border-purple-200 text-purple-800' },
]

interface Props {
  initial: {
    category_slugs: string[]
    pricing_models: string[]
    notify_new_tools: boolean
  }
}

export default function PreferencesForm({ initial }: Props) {
  const [categories, setCategories] = useState<string[]>(initial.category_slugs)
  const [pricing, setPricing]       = useState<string[]>(initial.pricing_models)
  const [notify, setNotify]         = useState(initial.notify_new_tools)
  const [status, setStatus]         = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const toggleCat = (slug: string) =>
    setCategories(prev =>
      prev.includes(slug) ? prev.filter(c => c !== slug) : [...prev, slug]
    )

  const togglePricing = (val: string) =>
    setPricing(prev =>
      prev.includes(val) ? prev.filter(p => p !== val) : [...prev, val]
    )

  const save = async () => {
    setStatus('saving')
    const res = await fetch('/api/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category_slugs: categories,
        pricing_models: pricing,
        notify_new_tools: notify,
      }),
    })
    if (res.ok) {
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 3000)
    } else {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  const hasChanges =
    JSON.stringify(categories.sort()) !== JSON.stringify([...initial.category_slugs].sort()) ||
    JSON.stringify(pricing.sort()) !== JSON.stringify([...initial.pricing_models].sort()) ||
    notify !== initial.notify_new_tools

  return (
    <div className="space-y-8">

      {/* ── Categories ── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-bold text-gray-900">Tool categories</h2>
          {categories.length > 0 && (
            <button onClick={() => setCategories([])} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              Clear all
            </button>
          )}
        </div>
        <p className="text-sm text-gray-400 mb-5">Which types of tools are most relevant to your work?</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {CATEGORIES.map(cat => {
            const selected = categories.includes(cat.slug)
            return (
              <button
                key={cat.slug}
                onClick={() => toggleCat(cat.slug)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                  selected
                    ? 'bg-brand-50 border-brand-300 text-brand-800'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="text-base">{cat.icon}</span>
                <span className="text-sm font-medium flex-1">{cat.name}</span>
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                  selected ? 'bg-brand-500 border-brand-500' : 'border-gray-300'
                }`}>
                  {selected && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* ── Pricing models ── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 mb-1">Pricing models</h2>
        <p className="text-sm text-gray-400 mb-5">Which types of deals matter to you?</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PRICING.map(p => {
            const selected = pricing.includes(p.value)
            return (
              <button
                key={p.value}
                onClick={() => togglePricing(p.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selected ? p.color + ' border-current' : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold">{p.label}</span>
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                    selected ? 'bg-current border-current' : 'border-gray-300'
                  }`}>
                    {selected && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <p className="text-xs opacity-70">{p.desc}</p>
              </button>
            )
          })}
        </div>
      </section>

      {/* ── Notification toggle ── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900">Email notifications</h2>
            <p className="text-sm text-gray-400 mt-0.5">Get emailed when a tool matching your preferences is added</p>
          </div>
          <button
            onClick={() => setNotify(n => !n)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-400 ${
              notify ? 'bg-brand-500' : 'bg-gray-200'
            }`}
          >
            <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${
              notify ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
        {!notify && (
          <p className="mt-3 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
            Notifications are off — you won't be alerted when matching tools are added.
          </p>
        )}
      </section>

      {/* ── Save button ── */}
      <div className="flex items-center gap-4">
        <button
          onClick={save}
          disabled={status === 'saving'}
          className="px-8 py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors text-sm"
        >
          {status === 'saving' ? 'Saving…' : 'Save preferences'}
        </button>

        {status === 'saved' && (
          <span className="text-sm text-green-600 font-medium">✓ Saved!</span>
        )}
        {status === 'error' && (
          <span className="text-sm text-red-500">Error saving. Please try again.</span>
        )}
        {status === 'idle' && hasChanges && (
          <span className="text-xs text-gray-400">You have unsaved changes</span>
        )}
      </div>
    </div>
  )
}

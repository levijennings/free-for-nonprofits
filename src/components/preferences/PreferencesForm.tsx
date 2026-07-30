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
      <section className="bg-surface rounded-2xl border border-line p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-bold text-fg">Tool categories</h2>
          {categories.length > 0 && (
            <button onClick={() => setCategories([])} className="text-xs text-fg-subtle hover:text-fg transition-colors duration-fast">
              Clear all
            </button>
          )}
        </div>
        <p className="text-sm text-fg-subtle mb-5">Which types of tools are most relevant to your work?</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {CATEGORIES.map(cat => {
            const selected = categories.includes(cat.slug)
            return (
              <button
                key={cat.slug}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleCat(cat.slug)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                  selected
                    ? 'bg-accent-subtle border-accent-line text-accent'
                    : 'bg-surface border-line text-fg-muted hover:border-line-strong hover:bg-surface-subtle'
                }`}
              >
                <span className="text-base">{cat.icon}</span>
                <span className="text-sm font-medium flex-1">{cat.name}</span>
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                  selected ? 'bg-accent border-accent' : 'border-line-strong'
                }`}>
                  {selected && (
                    <svg className="w-2.5 h-2.5 text-accent-fg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <section className="bg-surface rounded-2xl border border-line p-6">
        <h2 className="font-bold text-fg mb-1">Pricing models</h2>
        <p className="text-sm text-fg-subtle mb-5">Which types of deals matter to you?</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PRICING.map(p => {
            const selected = pricing.includes(p.value)
            return (
              <button
                key={p.value}
                type="button"
                aria-pressed={selected}
                onClick={() => togglePricing(p.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selected ? p.color + ' border-current' : 'bg-surface border-line hover:border-line-strong'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold">{p.label}</span>
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                    selected ? 'bg-current border-current' : 'border-line-strong'
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
      <section className="bg-surface rounded-2xl border border-line p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-fg" id="notify-label">Email notifications</h2>
            <p className="text-sm text-fg-subtle mt-0.5" id="notify-desc">
              Get emailed when a tool matching your preferences is added
            </p>
          </div>
          {/*
            role="switch" + aria-checked is what turns "button" into
            "Email notifications, switch, on". Without them the only cue that
            this control even had two states was the knob sliding across —
            information available to exactly the people who least need it.
          */}
          <button
            type="button"
            role="switch"
            aria-checked={notify}
            aria-labelledby="notify-label"
            aria-describedby="notify-desc"
            onClick={() => setNotify(n => !n)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${
              notify ? 'bg-accent' : 'bg-line-strong'
            }`}
          >
            <span
              aria-hidden="true"
              className={`inline-block h-4 w-4 rounded-full bg-surface shadow transform transition-transform ${
                notify ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        {!notify && (
          <p className="mt-3 text-xs text-fg-muted bg-status-progress-bg rounded-lg px-3 py-2">
            Notifications are off — you won't be alerted when matching tools are added.
          </p>
        )}
      </section>

      {/* ── Save button ── */}
      <div className="flex items-center gap-4">
        <button
          onClick={save}
          disabled={status === 'saving'}
          className="px-8 py-3 bg-accent hover:bg-accent-hover disabled:opacity-50 text-accent-fg font-semibold rounded-xl transition-colors duration-fast text-sm"
        >
          {status === 'saving' ? 'Saving…' : 'Save preferences'}
        </button>

        {/* Both outcomes are async and land nowhere near where focus sits, so
            they are announced rather than merely rendered. */}
        {status === 'saved' && (
          <span role="status" className="text-sm text-status-done font-medium">✓ Saved!</span>
        )}
        {status === 'error' && (
          <span role="alert" className="text-sm text-status-warn">Error saving. Please try again.</span>
        )}
        {status === 'idle' && hasChanges && (
          <span className="text-xs text-fg-subtle">You have unsaved changes</span>
        )}
      </div>
    </div>
  )
}

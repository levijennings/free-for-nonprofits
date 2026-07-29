'use client'

import { useState } from 'react'
import Link from 'next/link'
import Turnstile from '@/components/Turnstile'

const CAPTCHA_ENABLED = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

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

export default function SubmitToolPage() {
  const [form, setForm] = useState({
    name: '', website_url: '', category_slug: '', pricing_model: '', description: '', nonprofit_deal: '',
  })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (CAPTCHA_ENABLED && !captchaToken) {
      setStatus('error')
      setErrorMsg('Please complete the captcha to continue.')
      return
    }

    setStatus('submitting')
    setErrorMsg('')

    const res = await fetch('/api/submit-tool', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, captchaToken }),
    })
    const data = await res.json()

    if (!res.ok) {
      setStatus('error')
      setErrorMsg(data.error || 'Something went wrong — please try again.')
      return
    }
    setStatus('success')
  }

  if (status === 'success') {
    return (
      <main className="min-h-screen bg-surface-subtle flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-surface rounded-2xl border border-line p-10 text-center">
          <div className="w-14 h-14 bg-accent-subtle rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-fg mb-2">Thank you!</h1>
          <p className="text-fg-muted mb-6">We received your submission and will review it shortly. If approved, it will appear in the directory.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/tools" className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-accent-fg font-semibold rounded-xl text-sm transition-colors">
              Browse tools
            </Link>
            <button onClick={() => { setForm({ name:'',website_url:'',category_slug:'',pricing_model:'',description:'',nonprofit_deal:'' }); setStatus('idle') }} className="px-5 py-2.5 bg-surface border border-line text-fg font-semibold rounded-xl text-sm hover:bg-surface-subtle transition-colors">
              Submit another
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-surface-subtle">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/tools" className="text-sm text-fg-subtle hover:text-fg-muted transition-colors">← Back to tools</Link>
          <h1 className="text-3xl font-bold text-fg mt-4">Submit a resource</h1>
          <p className="text-fg-muted mt-2">
            Know a free or discounted tool for nonprofits we don't have listed? Submit it and we'll review it within a few days.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface rounded-2xl border border-line p-8 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-fg mb-1.5">Tool / resource name <span className="text-red-400">*</span></label>
            <input
              type="text" value={form.name} onChange={set('name')} required
              placeholder="e.g. Canva for Nonprofits"
              className="w-full px-3.5 py-2.5 text-sm border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent"
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-semibold text-fg mb-1.5">Website URL <span className="text-red-400">*</span></label>
            <input
              type="url" value={form.website_url} onChange={set('website_url')} required
              placeholder="https://example.com"
              className="w-full px-3.5 py-2.5 text-sm border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent"
            />
          </div>

          {/* Category + Pricing side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-fg mb-1.5">Category</label>
              <select value={form.category_slug} onChange={set('category_slug')}
                className="w-full px-3.5 py-2.5 text-sm border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent bg-surface"
              >
                <option value="">Select a category…</option>
                {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-fg mb-1.5">Pricing model</label>
              <select value={form.pricing_model} onChange={set('pricing_model')}
                className="w-full px-3.5 py-2.5 text-sm border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent bg-surface"
              >
                <option value="">Select…</option>
                <option value="free">Free</option>
                <option value="freemium">Freemium</option>
                <option value="nonprofit_discount">Nonprofit Discount</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-fg mb-1.5">Description <span className="text-red-400">*</span></label>
            <textarea
              value={form.description} onChange={set('description')} required
              rows={4} maxLength={500}
              placeholder="What does this tool do and why is it useful for nonprofits?"
              className="w-full px-3.5 py-2.5 text-sm border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent resize-none"
            />
            <p className="text-xs text-fg-subtle mt-1">{form.description.length}/500</p>
          </div>

          {/* Nonprofit deal */}
          <div>
            <label className="block text-sm font-semibold text-fg mb-1.5">
              Nonprofit deal <span className="font-normal text-fg-subtle">(optional)</span>
            </label>
            <input
              type="text" value={form.nonprofit_deal} onChange={set('nonprofit_deal')}
              placeholder="e.g. Free for nonprofits with 501(c)(3) status"
              className="w-full px-3.5 py-2.5 text-sm border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent"
            />
          </div>

          {errorMsg && (
            <p className="text-sm text-status-warn font-medium">{errorMsg}</p>
          )}

          <Turnstile onVerify={setCaptchaToken} onExpire={() => setCaptchaToken('')} />

          <button
            type="submit"
            disabled={status === 'submitting' || (CAPTCHA_ENABLED && !captchaToken)}
            className="w-full py-3 bg-accent hover:bg-accent-hover disabled:opacity-50 text-accent-fg font-bold rounded-xl transition-colors text-sm"
          >
            {status === 'submitting' ? 'Submitting…' : 'Submit for review'}
          </button>
          <p className="text-xs text-center text-fg-subtle">
            All submissions are reviewed before being published. We typically review within 2–3 business days.
          </p>
        </form>
      </div>
    </main>
  )
}

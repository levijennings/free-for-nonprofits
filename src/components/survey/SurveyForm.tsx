'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Field } from '@/components/ui/Field'

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

const MISSION_AREAS = ['Education', 'Health & Human Services', 'Environment', 'Arts & Culture', 'Faith-based', 'Animal Welfare', 'International / Relief', 'Civil Rights & Advocacy', 'Other']
const TEAM_SIZES = ['Just me', '2–5', '6–20', '21–50', '50+']
const ROLES = ['Executive / ED', 'Operations', 'Development / Fundraising', 'Marketing / Comms', 'Programs', 'IT / Technology', 'Volunteer', 'Other']
const BUDGETS = ['Free tools only', 'Under $50/mo', '$50–200/mo', 'Flexible if it helps']

export interface SurveyData {
  mission_area: string
  team_size: string
  need_areas: string[]
  current_tools: string
  pain_points: string
  role: string
  budget: string
}

const SELECT_CLASS = 'w-full px-3.5 py-2.5 text-sm border border-line rounded-xl bg-surface text-fg focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent'
const TEXT_CLASS = 'w-full px-3.5 py-2.5 text-sm border border-line rounded-xl bg-surface text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent'

export default function SurveyForm({ initial }: { initial: SurveyData }) {
  const router = useRouter()
  const [form, setForm] = useState<SurveyData>(initial)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const set = <K extends keyof SurveyData>(key: K, value: SurveyData[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const toggleNeed = (slug: string) =>
    setForm(prev => ({
      ...prev,
      need_areas: prev.need_areas.includes(slug)
        ? prev.need_areas.filter(s => s !== slug)
        : [...prev.need_areas, slug],
    }))

  const save = async () => {
    setStatus('saving')
    const res = await fetch('/api/survey', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setStatus('saved')
      router.refresh()
    } else {
      setStatus('error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-surface rounded-2xl border border-line p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="What&apos;s your mission area?">
            {(field) => (
              <select {...field} value={form.mission_area} onChange={e => set('mission_area', e.target.value)} className={SELECT_CLASS}>
                <option value="">Select…</option>
                {MISSION_AREAS.map(x => <option key={x} value={x}>{x}</option>)}
              </select>
            )}
          </Field>
          <Field label="Team size">
            {(field) => (
              <select {...field} value={form.team_size} onChange={e => set('team_size', e.target.value)} className={SELECT_CLASS}>
                <option value="">Select…</option>
                {TEAM_SIZES.map(x => <option key={x} value={x}>{x}</option>)}
              </select>
            )}
          </Field>
          <Field label="Your role">
            {(field) => (
              <select {...field} value={form.role} onChange={e => set('role', e.target.value)} className={SELECT_CLASS}>
                <option value="">Select…</option>
                {ROLES.map(x => <option key={x} value={x}>{x}</option>)}
              </select>
            )}
          </Field>
          <Field label="Monthly software budget">
            {(field) => (
              <select {...field} value={form.budget} onChange={e => set('budget', e.target.value)} className={SELECT_CLASS}>
                <option value="">Select…</option>
                {BUDGETS.map(x => <option key={x} value={x}>{x}</option>)}
              </select>
            )}
          </Field>
        </div>

        {/* A <label> names a single control; this is a set of twelve toggles.
            fieldset/legend is the element that names a group, so each button
            is now announced inside "Which areas do you most need tools for?"
            instead of on its own. */}
        <fieldset>
          <legend className="block text-sm font-semibold text-fg-muted mb-2">Which areas do you most need tools for?</legend>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => {
              const on = form.need_areas.includes(c.slug)
              return (
                <button
                  key={c.slug}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleNeed(c.slug)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${on ? 'bg-accent border-accent text-accent-fg' : 'bg-surface border-line text-fg-muted hover:border-accent-line'}`}
                >
                  <span aria-hidden="true">{c.icon}</span> {c.name}
                </button>
              )
            })}
          </div>
        </fieldset>

        <Field label="What tools does your team use today?" hint="Optional.">
          {(field) => (
            <input {...field} type="text" value={form.current_tools} onChange={e => set('current_tools', e.target.value)} placeholder="e.g. Mailchimp, QuickBooks, Canva" className={TEXT_CLASS} />
          )}
        </Field>

        <Field label="Biggest tech or tooling pain point?" hint="Optional.">
          {(field) => (
            <textarea {...field} value={form.pain_points} onChange={e => set('pain_points', e.target.value)} rows={3} maxLength={500} placeholder="What&apos;s hardest right now?" className={`${TEXT_CLASS} resize-none`} />
          )}
        </Field>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={save}
          disabled={status === 'saving'}
          className="px-6 py-3 bg-accent hover:bg-accent-hover disabled:opacity-50 text-accent-fg font-semibold rounded-xl text-sm transition-colors duration-fast"
        >
          {status === 'saving' ? 'Saving…' : 'Save & personalize'}
        </button>
        {status === 'saved' && <span role="status" className="text-sm text-status-done font-medium">Saved — your recommendations are now tailored.</span>}
        {status === 'error' && <span role="alert" className="text-sm text-status-warn font-medium">Something went wrong. Please try again.</span>}
      </div>
    </div>
  )
}

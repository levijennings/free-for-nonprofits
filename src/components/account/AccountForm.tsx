'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const ORG_SIZES = [
  { value: 'small', label: '1–10 people' },
  { value: 'medium', label: '11–50 people' },
  { value: 'large', label: '50+ people' },
]

interface Props {
  initial: {
    display_name: string
    org_name: string
    org_size: string
  }
}

export default function AccountForm({ initial }: Props) {
  const [displayName, setDisplayName] = useState(initial.display_name)
  const [orgName, setOrgName] = useState(initial.org_name)
  const [orgSize, setOrgSize] = useState(initial.org_size)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [error, setError] = useState('')
  const router = useRouter()

  const save = async () => {
    setStatus('saving')
    setError('')

    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        display_name: displayName,
        org_name: orgName,
        org_size: orgSize,
      }),
    })
    const data = await res.json().catch(() => ({}))

    if (res.ok) {
      setStatus('saved')
      router.refresh()
      setTimeout(() => setStatus('idle'), 3000)
    } else {
      setStatus('error')
      setError(data.error || 'Failed to save changes')
      setTimeout(() => setStatus('idle'), 4000)
    }
  }

  return (
    <div className="space-y-6">
      <section className="bg-surface rounded-2xl border border-line p-6">
        <h2 className="font-bold text-fg mb-1">Organization</h2>
        <p className="text-sm text-fg-subtle mb-5">
          Shown to other nonprofits on your reviews and activity in the community feed.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-fg-muted mb-1.5">Organization name</label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Habitat for Humanity Chicago"
              className="w-full px-4 py-2.5 border border-line rounded-lg text-sm bg-surface text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-fg-muted mb-1.5">Your name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full px-4 py-2.5 border border-line rounded-lg text-sm bg-surface text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-fg-muted mb-2">Organization size</label>
            <div className="grid grid-cols-3 gap-2">
              {ORG_SIZES.map((o) => {
                const selected = orgSize === o.value
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setOrgSize(o.value)}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
                      selected
                        ? 'bg-accent-subtle border-accent-line text-accent'
                        : 'bg-surface border-line text-fg-muted hover:border-line-strong hover:bg-surface-subtle'
                    }`}
                  >
                    {o.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-4">
        <button
          onClick={save}
          disabled={status === 'saving'}
          className="px-8 py-3 bg-accent hover:bg-accent-hover disabled:opacity-50 text-accent-fg font-semibold rounded-xl transition-colors duration-fast text-sm"
        >
          {status === 'saving' ? 'Saving…' : 'Save changes'}
        </button>

        {status === 'saved' && <span className="text-sm text-status-done font-medium">✓ Saved!</span>}
        {status === 'error' && <span className="text-sm text-status-warn">{error}</span>}
      </div>
    </div>
  )
}

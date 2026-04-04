'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

interface Tool { id: string; name: string; slug: string; logo_url: string | null; pricing_model: string }
interface CurrentRotw { tool: Tool; week_start: string; blurb: string | null }

export default function SetRotwForm({ current }: { current: CurrentRotw | null }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Tool[]>([])
  const [selected, setSelected] = useState<Tool | null>(current?.tool ?? null)
  const [weekStart, setWeekStart] = useState<string>(current?.week_start ?? nextMonday())
  const [blurb, setBlurb] = useState(current?.blurb ?? '')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  function nextMonday() {
    const d = new Date()
    const day = d.getDay()
    const diff = day === 0 ? 1 : 8 - day
    d.setDate(d.getDate() + diff)
    return d.toISOString().slice(0, 10)
  }

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/admin/tools-search?q=${encodeURIComponent(query)}`)
      const { data } = await res.json()
      setResults(data ?? [])
      setOpen(true)
    }, 250)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const save = async () => {
    if (!selected) return
    setStatus('saving')
    const res = await fetch('/api/admin/set-rotw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool_id: selected.id, week_start: weekStart, blurb }),
    })
    if (res.ok) { setStatus('saved'); setTimeout(() => setStatus('idle'), 2500) }
    else setStatus('error')
  }

  const pricingBadge: Record<string, string> = {
    free: 'bg-green-100 text-green-700',
    freemium: 'bg-blue-100 text-blue-700',
    nonprofit_discount: 'bg-purple-100 text-purple-700',
  }

  return (
    <div className="space-y-5">
      {/* Tool picker */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Tool</label>
        <div className="relative" ref={dropdownRef}>
          {selected ? (
            <div className="flex items-center gap-3 p-3 border border-brand-300 bg-brand-50 rounded-xl">
              {selected.logo_url && (
                <Image src={selected.logo_url} alt={selected.name} width={28} height={28} className="rounded-md object-contain" />
              )}
              <span className="font-semibold text-gray-900 flex-1">{selected.name}</span>
              <button onClick={() => { setSelected(null); setQuery('') }} className="text-xs text-gray-400 hover:text-red-500 transition-colors">✕ Change</button>
            </div>
          ) : (
            <input
              type="text"
              placeholder="Search tools…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => query && setOpen(true)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
            />
          )}
          {open && results.length > 0 && !selected && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
              {results.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setSelected(t); setOpen(false); setQuery('') }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                >
                  {t.logo_url && <Image src={t.logo_url} alt={t.name} width={22} height={22} className="rounded object-contain shrink-0" />}
                  <span className="text-sm font-medium text-gray-900 flex-1">{t.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pricingBadge[t.pricing_model] ?? 'bg-gray-100 text-gray-600'}`}>
                    {t.pricing_model.replace('_', ' ')}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Week start */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Week start (Monday)</label>
        <input
          type="date"
          value={weekStart}
          onChange={e => setWeekStart(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
        />
      </div>

      {/* Blurb */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
          Editorial blurb <span className="text-gray-300 normal-case font-normal">(also used in newsletter)</span>
        </label>
        <textarea
          rows={4}
          value={blurb}
          onChange={e => setBlurb(e.target.value)}
          placeholder="Why is this tool especially valuable for nonprofits this week?"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white resize-none leading-relaxed"
        />
        <p className="text-xs text-gray-400 mt-1">{blurb.length} chars</p>
      </div>

      <button
        onClick={save}
        disabled={!selected || status === 'saving'}
        className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-colors"
      >
        {status === 'saving' ? 'Saving…' : status === 'saved' ? '✓ Saved!' : status === 'error' ? 'Error — try again' : 'Set Resource of the Week'}
      </button>
    </div>
  )
}

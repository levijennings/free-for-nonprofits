'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  toolId: string
  toolName: string
  toolSlug: string
  initialSaveCount: number
  initialFavoriteCount: number
  initialUsingCount: number
}

export default function ToolActions({
  toolId, toolName, toolSlug,
  initialSaveCount, initialFavoriteCount, initialUsingCount,
}: Props) {
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [saved, setSaved]       = useState(false)
  const [favorited, setFavorited] = useState(false)
  const [using, setUsing]       = useState(false)
  const [busy, setBusy]         = useState<string | null>(null)
  const [counts, setCounts]     = useState({
    save: initialSaveCount,
    favorite: initialFavoriteCount,
    using: initialUsingCount,
  })

  const supabase = createClient()
  const router   = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      setUser(data.user)
      Promise.all([
        supabase.from('saved_tools')    .select('id').eq('tool_id', toolId).eq('user_id', data.user.id).maybeSingle(),
        supabase.from('tool_favorites') .select('id').eq('tool_id', toolId).eq('user_id', data.user.id).maybeSingle(),
        supabase.from('tool_usages')    .select('id').eq('tool_id', toolId).eq('user_id', data.user.id).maybeSingle(),
      ]).then(([s, f, u]) => {
        setSaved(!!s.data)
        setFavorited(!!f.data)
        setUsing(!!u.data)
      })
    })
  }, [toolId])

  const toggle = async (type: 'save' | 'favorite' | 'using') => {
    if (!user) { router.push('/signup'); return }
    setBusy(type)

    const endpoint  = { save: '/api/saved-tools', favorite: '/api/favorites', using: '/api/tool-using' }[type]
    const isOn      = { save: saved, favorite: favorited, using }[type]
    const setter    = { save: setSaved, favorite: setFavorited, using: setUsing }[type]
    const countKey  = type === 'using' ? 'using' : type

    const res = await fetch(endpoint, {
      method: isOn ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool_id: toolId }),
    })

    if (res.ok) {
      setter(!isOn)
      setCounts(prev => ({ ...prev, [countKey]: prev[countKey as keyof typeof prev] + (isOn ? -1 : 1) }))
      router.refresh()
    }
    setBusy(null)
  }

  const pageUrl = `https://free-for-nonprofits.vercel.app/tools/${toolSlug}`
  const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`

  return (
    <div className="mt-4 space-y-2">
      {/* Save */}
      <button
        onClick={() => toggle('save')}
        disabled={busy === 'save'}
        className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all flex items-center justify-between gap-2 ${
          saved
            ? 'bg-brand-50 border-brand-200 text-brand-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600'
            : 'bg-white border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-600'
        }`}
      >
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          {busy === 'save' ? '…' : saved ? 'Saved' : user ? `Save ${toolName}` : 'Sign up to save'}
        </span>
        {counts.save > 0 && <span className="text-xs text-gray-400 tabular-nums">{counts.save}</span>}
      </button>

      {/* Favorite */}
      <button
        onClick={() => toggle('favorite')}
        disabled={busy === 'favorite'}
        className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all flex items-center justify-between gap-2 ${
          favorited
            ? 'bg-rose-50 border-rose-200 text-rose-600'
            : 'bg-white border-gray-200 text-gray-600 hover:border-rose-200 hover:text-rose-500'
        }`}
      >
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill={favorited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {busy === 'favorite' ? '…' : favorited ? 'Favorited' : 'Favorite'}
        </span>
        {counts.favorite > 0 && <span className="text-xs text-gray-400 tabular-nums">{counts.favorite}</span>}
      </button>

      {/* I use this */}
      <button
        onClick={() => toggle('using')}
        disabled={busy === 'using'}
        className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all flex items-center justify-between gap-2 ${
          using
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-200 hover:text-emerald-600'
        }`}
      >
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill={using ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {busy === 'using' ? '…' : using ? 'I use this ✓' : 'I use this'}
        </span>
        {counts.using > 0 && <span className="text-xs text-gray-400 tabular-nums">{counts.using}</span>}
      </button>

      {/* Share on Facebook */}
      <a
        href={fbShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        Share on Facebook
      </a>
    </div>
  )
}

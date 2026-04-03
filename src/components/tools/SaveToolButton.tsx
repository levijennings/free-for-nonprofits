'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  toolId: string
  toolName: string
}

export default function SaveToolButton({ toolId, toolName }: Props) {
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [authed, setAuthed] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setAuthed(true)
        // Check if already saved
        supabase
          .from('saved_tools')
          .select('id')
          .eq('tool_id', toolId)
          .eq('user_id', data.user.id)
          .maybeSingle()
          .then(({ data: existing }) => {
            if (existing) setSaved(true)
          })
      }
    })
  }, [toolId])

  const handleToggle = async () => {
    if (!authed) {
      router.push('/signup')
      return
    }

    setLoading(true)
    const method = saved ? 'DELETE' : 'POST'
    await fetch('/api/saved-tools', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool_id: toolId }),
    })
    setSaved(!saved)
    setLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`w-full mt-3 py-2.5 rounded-xl text-sm font-medium border transition-all flex items-center justify-center gap-2 ${
        saved
          ? 'bg-brand-50 border-brand-200 text-brand-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600'
          : 'bg-white border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-600'
      }`}
    >
      {saved ? (
        <>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
          </svg>
          {loading ? 'Removing...' : 'Saved'}
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          {loading ? 'Saving...' : authed ? `Save ${toolName}` : 'Sign up to save'}
        </>
      )}
    </button>
  )
}

'use client'

import { useState } from 'react'

export default function ResendConfirmationForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  const resend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('sending')
    setError('')

    const res = await fetch('/api/auth/resend-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    })
    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      setStatus('error')
      setError(data.error || 'Something went wrong. Please try again.')
      return
    }

    setStatus('sent')
  }

  if (status === 'sent') {
    return (
      <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
        If that email has an account, a new confirmation link is on its way. Check your inbox (and spam folder).
      </p>
    )
  }

  return (
    <form onSubmit={resend} className="space-y-2">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@yournonprofit.org"
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          className="shrink-0 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {status === 'sending' ? 'Sending…' : 'Resend confirmation email'}
        </button>
      </div>
      {status === 'error' && <p className="text-xs text-red-500">{error}</p>}
    </form>
  )
}

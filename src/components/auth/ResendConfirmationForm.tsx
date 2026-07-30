'use client'

import { useEffect, useRef, useState } from 'react'
import { Field } from '@/components/ui/Field'

interface Props {
  /**
   * Same-origin path the replacement confirmation link should return to.
   * Validated by the caller and again server-side before it goes in an email.
   */
  next?: string
}

export default function ResendConfirmationForm({ next }: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  // Field renders the message with role="alert" and points aria-describedby at
  // it, so returning focus to the input both speaks the error and lands the
  // user on the control they need to correct.
  const emailRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (status === 'error') emailRef.current?.focus()
  }, [status, error])

  const resend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('sending')
    setError('')

    const res = await fetch('/api/auth/resend-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), next }),
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
      <p
        role="status"
        className="text-sm text-status-done bg-status-done-bg border border-accent-line rounded-lg px-4 py-3"
      >
        If that email has an account, a new confirmation link is on its way. Check your inbox (and spam folder).
      </p>
    )
  }

  return (
    <form onSubmit={resend} className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-start gap-2">
        <Field
          label="Email address to resend to"
          className="flex-1"
          error={status === 'error' ? error : undefined}
        >
          {(field) => (
            <input
              {...field}
              ref={emailRef}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@yournonprofit.org"
              className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-surface text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent"
            />
          )}
        </Field>
        <button
          type="submit"
          disabled={status === 'sending'}
          className="shrink-0 px-4 py-2 bg-accent hover:bg-accent-hover text-accent-fg text-sm font-medium rounded-lg transition-colors duration-fast disabled:opacity-50 sm:mt-7"
        >
          {status === 'sending' ? 'Sending…' : 'Resend confirmation email'}
        </button>
      </div>
    </form>
  )
}

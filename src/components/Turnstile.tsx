'use client'

import { useEffect, useRef } from 'react'

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string
  remove: (id: string) => void
  reset: (id?: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

interface Props {
  /** Called with a fresh token once the visitor passes the challenge. */
  onVerify: (token: string) => void
  /** Called when the token expires and a new challenge is required. */
  onExpire?: () => void
}

/**
 * Cloudflare Turnstile widget.
 *
 * Renders nothing (and requires no token) unless NEXT_PUBLIC_TURNSTILE_SITE_KEY
 * is set, so it is safe to ship before the provider is configured. Activate by
 * setting that env var in Vercel AND enabling Captcha in Supabase Auth.
 */
export default function Turnstile({ onVerify, onExpire }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cbRef = useRef({ onVerify, onExpire })
  cbRef.current = { onVerify, onExpire }

  useEffect(() => {
    if (!SITE_KEY) return

    let widgetId: string | undefined
    let cancelled = false

    const render = () => {
      if (cancelled || widgetId || !containerRef.current || !window.turnstile) return
      widgetId = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        callback: (token: string) => cbRef.current.onVerify(token),
        'expired-callback': () => cbRef.current.onExpire?.(),
      })
    }

    const cleanup = () => {
      cancelled = true
      if (widgetId && window.turnstile) {
        try {
          window.turnstile.remove(widgetId)
        } catch {
          /* widget already gone */
        }
      }
    }

    if (window.turnstile) {
      render()
      return cleanup
    }

    if (!document.getElementById('cf-turnstile-script')) {
      const script = document.createElement('script')
      script.id = 'cf-turnstile-script'
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }

    const interval = setInterval(() => {
      if (window.turnstile) {
        clearInterval(interval)
        render()
      }
    }, 200)

    return () => {
      clearInterval(interval)
      cleanup()
    }
  }, [])

  if (!SITE_KEY) return null
  return <div ref={containerRef} className="flex justify-center my-2" />
}

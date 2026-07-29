/**
 * Analytics sink.
 *
 * This directory used to hold a large typed-event abstraction (types.ts,
 * events.ts, hooks.tsx, config.ts, a PostHogProvider component). None of it
 * had a single call site, it depended on `posthog-js` which is not a
 * dependency of this project, and it did not typecheck. It was deleted rather
 * than repaired.
 *
 * What remains is the only part anything actually imports: `trackEvent`, used
 * by src/lib/performance/*. It is a deliberate no-op unless PostHog is both
 * installed and configured, so it is safe to call from server and client code
 * alike. If PostHog is adopted properly later, this is the one seam to
 * replace.
 */

type PostHogLike = {
  init: (key: string, options: Record<string, unknown>) => void
  capture: (event: string, properties?: Record<string, unknown>) => void
}

let instance: PostHogLike | null = null
let initialized = false

function getPostHog(): PostHogLike | null {
  if (initialized) return instance
  initialized = true

  // Browser-only: posthog-js has no server build.
  if (typeof window === 'undefined') return null

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!apiKey) return null

  try {
    // Optional dependency — resolved at runtime so a missing package is a
    // no-op rather than a build failure.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('posthog-js')
    const posthog: PostHogLike = mod.posthog ?? mod.default ?? mod

    posthog.init(apiKey, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      capture_pageview: true,
      persistence: 'localStorage+cookie',
      // Never let credentials ride along on an event.
      property_blacklist: ['password', 'token', 'apikey', 'api_key', 'secret'],
    })

    instance = posthog
  } catch {
    // posthog-js not installed — analytics stays off.
    instance = null
  }

  return instance
}

/** Record an event. Silently does nothing when analytics is not configured. */
export function trackEvent(eventName: string, properties?: Record<string, unknown>): void {
  const posthog = getPostHog()
  if (!posthog) return

  try {
    posthog.capture(eventName, {
      timestamp: new Date().toISOString(),
      ...properties,
    })
  } catch (error) {
    console.error('[Analytics] Failed to track event:', error)
  }
}

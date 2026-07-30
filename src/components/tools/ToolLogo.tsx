'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

interface Props {
  src: string
  alt: string
  className?: string
  websiteUrl?: string | null // e.g. 'https://www.mailchimp.com' — used for a favicon fallback when there's no logo_url (or it fails to load)
  /**
   * Intrinsic pixel size written to `width`/`height`. The rendered size still
   * comes from `className`; these exist so the browser reserves the box before
   * the bytes arrive instead of reflowing the card. Square by design — every
   * call site renders these in a square frame with `object-contain`.
   */
  size?: number
  /**
   * Opt out of lazy loading for logos that are above the fold. `/tools` renders
   * ~104 of these; loading them all eagerly fires ~104 parallel cross-origin
   * requests on first paint and starves the ones actually on screen.
   */
  eager?: boolean
}

/** Matches the `w-10 h-10` most call sites use. */
const DEFAULT_SIZE = 40

function getInitial(alt: string) {
  return alt.trim().charAt(0).toUpperCase()
}

function faviconFromUrl(websiteUrl?: string | null): string | null {
  if (!websiteUrl) return null
  try {
    const host = new URL(websiteUrl).hostname
    return `https://www.google.com/s2/favicons?domain=${host}&sz=128`
  } catch {
    return null
  }
}

// Some ad blockers / privacy extensions silently swallow requests to
// well-known favicon/tracking-adjacent domains (Google's s2/favicons
// endpoint is a common target on those lists) without ever firing the
// <img> element's error event — the request just never resolves, so
// onError alone can leave this stuck on a blank image forever. This
// timeout backstops that: if the image hasn't loaded by then, treat it
// the same as a load error and move to the next candidate.
const LOAD_TIMEOUT_MS = 2500

export default function ToolLogo({
  src,
  alt,
  className = '',
  websiteUrl,
  size = DEFAULT_SIZE,
  eager = false,
}: Props) {
  // Ordered list of image sources to try: the stored logo first, then a
  // favicon derived from the tool's website. Missing/empty values are
  // filtered out up front — we never render a bare `<img src="">`, which
  // some browsers just leave blank forever instead of firing onError.
  const candidates = useMemo(() => {
    const favicon = faviconFromUrl(websiteUrl)
    return [src, favicon].filter((c): c is string => !!c)
  }, [src, websiteUrl])

  const candidateKey = candidates.join('|')
  const [index, setIndex] = useState(0)
  const settledRef = useRef(false)
  const imgRef = useRef<HTMLImageElement | null>(null)

  // Reset to the first candidate whenever the underlying tool's data changes.
  useEffect(() => {
    setIndex(0)
  }, [candidateKey])

  useEffect(() => {
    settledRef.current = false
    if (index >= candidates.length) return

    let timer: ReturnType<typeof setTimeout> | undefined
    const advance = () => {
      if (!settledRef.current) {
        settledRef.current = true
        setIndex(i => i + 1)
      }
    }
    const startWatchdog = () => {
      if (timer === undefined) timer = setTimeout(advance, LOAD_TIMEOUT_MS)
    }
    const stopWatchdog = () => {
      if (timer !== undefined) clearTimeout(timer)
    }

    const el = imgRef.current

    // The watchdog must not start before the browser has actually requested the
    // image. With `loading="lazy"` an off-screen logo is not fetched at all, so
    // an unconditional timer would "time out" every card below the fold and
    // collapse it to the initial-letter fallback before it was ever visible.
    if (eager || !el || typeof IntersectionObserver === 'undefined') {
      startWatchdog()
      return stopWatchdog
    }

    // Served from cache before this effect ran — nothing to watch.
    if (el.complete && el.naturalWidth > 0) {
      settledRef.current = true
      return
    }

    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        observer.disconnect()
        startWatchdog()
      }
    })
    observer.observe(el)

    return () => {
      observer.disconnect()
      stopWatchdog()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, candidateKey, eager])

  if (index >= candidates.length) {
    return (
      <div className={`${className} bg-accent-subtle flex items-center justify-center rounded-xl`}>
        <span className="text-accent font-bold text-lg">{getInitial(alt)}</span>
      </div>
    )
  }

  return (
    <img
      key={candidates[index]}
      ref={imgRef}
      src={candidates[index]}
      alt={alt}
      width={size}
      height={size}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={className}
      onLoad={() => { settledRef.current = true }}
      onError={() => {
        if (!settledRef.current) {
          settledRef.current = true
          setIndex(i => i + 1)
        }
      }}
    />
  )
}

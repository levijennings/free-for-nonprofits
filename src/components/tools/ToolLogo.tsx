'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

interface Props {
  src: string
  alt: string
  className?: string
  websiteUrl?: string | null // e.g. 'https://www.mailchimp.com' — used for a favicon fallback when there's no logo_url (or it fails to load)
}

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

export default function ToolLogo({ src, alt, className = '', websiteUrl }: Props) {
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

  // Reset to the first candidate whenever the underlying tool's data changes.
  useEffect(() => {
    setIndex(0)
  }, [candidateKey])

  useEffect(() => {
    settledRef.current = false
    if (index >= candidates.length) return

    const timer = setTimeout(() => {
      if (!settledRef.current) {
        settledRef.current = true
        setIndex(i => i + 1)
      }
    }, LOAD_TIMEOUT_MS)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, candidateKey])

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
      src={candidates[index]}
      alt={alt}
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

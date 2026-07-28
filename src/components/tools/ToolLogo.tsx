'use client'

import { useMemo, useState } from 'react'

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

export default function ToolLogo({ src, alt, className = '', websiteUrl }: Props) {
  // Ordered list of image sources to try: the stored logo first, then a
  // favicon derived from the tool's website. Missing/empty values are
  // filtered out up front — we never render a bare `<img src="">`, which
  // some browsers just leave blank forever instead of firing onError.
  const candidates = useMemo(() => {
    const favicon = faviconFromUrl(websiteUrl)
    return [src, favicon].filter((c): c is string => !!c)
  }, [src, websiteUrl])

  const [index, setIndex] = useState(0)

  if (index >= candidates.length) {
    return (
      <div className={`${className} bg-brand-50 flex items-center justify-center rounded-xl`}>
        <span className="text-brand-600 font-bold text-lg">{getInitial(alt)}</span>
      </div>
    )
  }

  return (
    <img
      key={candidates[index]}
      src={candidates[index]}
      alt={alt}
      className={className}
      onError={() => setIndex(i => i + 1)}
    />
  )
}

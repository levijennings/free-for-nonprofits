'use client'

import { useState } from 'react'

interface Props {
  src: string
  alt: string
  className?: string
}

function getInitial(alt: string) {
  return alt.trim().charAt(0).toUpperCase()
}

function getGoogleFaviconUrl(src: string) {
  try {
    const url = new URL(src)
    return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=128`
  } catch {
    return null
  }
}

export default function ToolLogo({ src, alt, className = '' }: Props) {
  const [errCount, setErrCount] = useState(0)

  if (errCount >= 2) {
    return (
      <div className={`${className} bg-brand-50 flex items-center justify-center rounded-xl`}>
        <span className="text-brand-600 font-bold text-lg">{getInitial(alt)}</span>
      </div>
    )
  }

  const imgSrc = errCount === 0 ? src : (getGoogleFaviconUrl(src) ?? src)

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => setErrCount(c => c + 1)}
    />
  )
}

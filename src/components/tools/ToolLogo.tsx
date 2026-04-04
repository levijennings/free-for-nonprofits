'use client'

import { useState } from 'react'

interface Props {
  src: string
  alt: string
  className?: string
  websiteDomain?: string // e.g. 'mailchimp.com' — used for favicon fallback
}

function getInitial(alt: string) {
  return alt.trim().charAt(0).toUpperCase()
}

export default function ToolLogo({ src, alt, className = '', websiteDomain }: Props) {
  const [errCount, setErrCount] = useState(0)

  if (errCount >= 2) {
    return (
      <div className={`${className} bg-brand-50 flex items-center justify-center rounded-xl`}>
        <span className="text-brand-600 font-bold text-lg">{getInitial(alt)}</span>
      </div>
    )
  }

  // On first error, fall back to Google Favicon using the tool's own domain
  const faviconUrl = websiteDomain
    ? `https://www.google.com/s2/favicons?domain=${websiteDomain}&sz=128`
    : null

  const imgSrc = errCount === 0 ? src : (faviconUrl ?? src)

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => setErrCount(c => c + 1)}
    />
  )
}

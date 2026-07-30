'use client'

import { useEffect, useRef } from 'react'
import { consumeResultsFocus } from './resultsFocus'

/**
 * The heading the results hang off, and the landing point after a submit.
 *
 * `signature` is the answer set: it changes on every navigation, which is what
 * re-runs the effect. The component stays mounted across those navigations, so
 * a mount-only effect would fire exactly once and never again.
 */
export default function ResultsHeading({
  signature,
  className,
  children,
}: {
  signature: string
  className?: string
  children: React.ReactNode
}) {
  const ref = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (consumeResultsFocus()) ref.current?.focus()
  }, [signature])

  return (
    <h2
      ref={ref}
      // Focusable by script only — it must not become a tab stop of its own.
      tabIndex={-1}
      className={className}
    >
      {children}
    </h2>
  )
}

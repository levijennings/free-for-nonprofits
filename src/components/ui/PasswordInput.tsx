'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

type Props = React.InputHTMLAttributes<HTMLInputElement>

/**
 * Drop-in replacement for <input type="password">. Works both as a
 * controlled input (value/onChange, e.g. signup) and as a plain named field
 * inside a server-action form (name="password", e.g. login) — it only adds a
 * show/hide toggle, nothing else about how the value is managed.
 *
 * The toggle is a real tab stop. It previously carried tabIndex={-1}, which
 * made "check what I actually typed" a mouse-only affordance — on the one
 * field whose contents nobody can see, and for the users least able to spare
 * the retry. aria-pressed carries the state; the label names the next action.
 */
export default function PasswordInput({ className = '', ...props }: Props) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        className={`${className} pr-10`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-pressed={visible}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm text-fg-subtle hover:text-fg transition-colors duration-fast focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        {visible ? (
          <EyeOff className="w-4 h-4" aria-hidden="true" />
        ) : (
          <Eye className="w-4 h-4" aria-hidden="true" />
        )}
      </button>
    </div>
  )
}

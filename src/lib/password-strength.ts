export interface PasswordStrength {
  /** 0 (empty) through 4 (strong). */
  score: number
  label: string
  barColor: string
}

const LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong']
const COLORS = ['bg-gray-100', 'bg-red-400', 'bg-amber-400', 'bg-blue-500', 'bg-green-500']

/**
 * Lightweight, dependency-free strength heuristic — purely a hint shown to
 * the user, not a gate. The 8-character minimum is still enforced separately.
 */
export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return { score: 0, label: '', barColor: COLORS[0] }

  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  const capped = Math.max(1, Math.min(score, 4))
  return { score: capped, label: LABELS[capped], barColor: COLORS[capped] }
}

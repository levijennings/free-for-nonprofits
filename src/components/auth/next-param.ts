/**
 * Post-authentication return path ("?next=...").
 *
 * The qualify -> claim journey starts on a tool page and detours through
 * signup, an email confirmation and the auth callback. Every one of those hops
 * has to carry the destination or the user lands on an empty dashboard with no
 * memory of what they were doing.
 *
 * Anything a visitor can put in a URL and that we later hand to a redirect is
 * an open-redirect hazard: `?next=https://evil.example/login` would let a
 * phisher borrow our domain for the first hop of a credential-harvesting flow.
 * So the value is never trusted — it is validated down to "a path on this
 * site" and otherwise replaced with the fallback. Validation is allow-list
 * shaped (must look like a same-origin absolute path) rather than a blocklist
 * of known-bad prefixes.
 */

export const DEFAULT_NEXT = '/dashboard'

/**
 * Returns `value` when it is a safe same-origin relative path, else `fallback`.
 *
 * Accepted:  `/dashboard`, `/tools/google-workspace?step=2#claim`
 * Rejected:  `https://evil.com`, `//evil.com`, `/\evil.com`, `\/evil.com`,
 *            `javascript:alert(1)`, `dashboard`, `/\tevil`, ``
 */
export function safeNextPath(value: unknown, fallback: string = DEFAULT_NEXT): string {
  if (typeof value !== 'string') return fallback

  const path = value.trim()

  // Must be an absolute path on this origin.
  if (!path.startsWith('/')) return fallback

  // `//host` and `/\host` are protocol-relative URLs — same-origin in shape
  // only. Browsers also normalise a backslash to a forward slash, so any
  // backslash anywhere is treated as hostile rather than reasoned about.
  if (path.startsWith('//') || path.includes('\\')) return fallback

  // Control characters (NUL, CR, LF, TAB) are stripped or interpreted
  // inconsistently by URL parsers, which is how a "path" becomes a scheme.
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(path)) return fallback

  return path
}

/** `?next=` query fragment for a URL, or '' when the target is the default. */
export function nextQuery(next: string | undefined | null, separator: '?' | '&' = '?'): string {
  if (!next || next === DEFAULT_NEXT) return ''
  return `${separator}next=${encodeURIComponent(next)}`
}

/**
 * Absolute URL to redirect to after auth, built from a validated path.
 * `new URL(path, origin)` keeps the origin authoritative even if validation
 * were ever loosened.
 */
export function nextRedirectUrl(value: unknown, origin: string, fallback: string = DEFAULT_NEXT): string {
  return new URL(safeNextPath(value, fallback), origin).toString()
}

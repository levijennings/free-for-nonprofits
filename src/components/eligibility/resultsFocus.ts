/**
 * A one-shot hand-off between the qualifier form and the results heading.
 *
 * Submitting pushes a URL; the results render further down the page (or on a
 * different page, from the homepage hero). Next's client navigation moves
 * neither focus nor screen-reader attention, so without this a keyboard or
 * screen-reader user is left where they were with no indication that anything
 * happened.
 *
 * A module flag rather than a URL param or sessionStorage: both the form and
 * the heading are client components in the same bundle, so they share this
 * module instance, and the flag must NOT survive a reload — a shared link
 * opened cold should not steal focus away from the top of the document.
 */

let requestedAt = 0

/** Navigation that should end with the results heading focused. */
export function requestResultsFocus(): void {
  requestedAt = Date.now()
}

/**
 * True at most once per request, and only if the results actually arrived
 * promptly — a request stranded by a failed navigation must not grab focus
 * minutes later when something unrelated re-renders.
 */
export function consumeResultsFocus(): boolean {
  const fresh = requestedAt > 0 && Date.now() - requestedAt < 10_000
  requestedAt = 0
  return fresh
}

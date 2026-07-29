/**
 * Safe construction of PostgREST `.or()` filter strings for text search.
 *
 * WHY THIS EXISTS (do not "simplify" it away):
 *
 * `.or()` does not take parameters — it takes a *string* in PostgREST's own
 * filter grammar, where `,` separates conditions, `.` separates
 * column/operator/value and `(` `)` group. Interpolating raw user input into
 * that string produces a *malformed filter*, not just wrong rows: PostgREST
 * rejects it and the page renders "No tools found". Searching `canva, figma`
 * or `501(c)(3)` was broken in production for exactly this reason.
 *
 * Three deliberate defences, all load-bearing:
 *
 *  1. A comma in the query is treated as "any of these" and splits the input
 *     into separate terms *before* any filter string is built, so a comma can
 *     never reach the grammar. This is also what a user typing
 *     `canva, figma` actually means.
 *  2. Every remaining character that is meaningful to the or() grammar or to
 *     SQL LIKE — `( ) . : * % _ " \` and control characters — is replaced with
 *     `%`, the LIKE "any run of characters" wildcard. Replacing rather than
 *     deleting keeps punctuation-heavy queries matching: `501(c)(3)` becomes
 *     the pattern `%501%c%3%`, which still matches the literal text
 *     "501(c)(3)" stored in the database.
 *  3. The resulting value is wrapped in double quotes, which is PostgREST's
 *     documented way to pass a literal value. Belt and braces: step 2 already
 *     removed everything that would need quoting.
 *
 * Whitespace inside a term is preserved, so a multi-word query stays a phrase
 * match (`project management` matches "project management", not "project" OR
 * "management").
 */

/** Characters that break the or() grammar or act as LIKE wildcards. */
// eslint-disable-next-line no-control-regex
const UNSAFE_CHARS = /["'\\().:*%_]|[\u0000-\u001f\u007f]/g

/** Bound the work a single request can ask the database to do. */
const MAX_TERMS = 5
const MAX_TERM_LENGTH = 60

/**
 * Split a raw query into sanitised ilike patterns.
 * Returns `[]` when there is nothing searchable left.
 */
export function parseSearchTerms(raw: string): string[] {
  return raw
    .split(',')
    .map((term) =>
      term
        .slice(0, MAX_TERM_LENGTH)
        .replace(UNSAFE_CHARS, '%')
        .replace(/\s+/g, ' ')
        .replace(/%+/g, '%')
        .trim()
    )
    // A term of nothing but wildcards/whitespace would match every row — drop
    // it. Written as "contains something other than % or space" rather than a
    // letter/digit class so that non-ASCII queries still search.
    .filter((term) => /[^%\s]/.test(term))
    .slice(0, MAX_TERMS)
}

/**
 * Build a PostgREST `.or()` argument matching any of `columns` against any of
 * the terms in `raw`. Returns `null` when the query yields no usable term, in
 * which case the caller should simply not apply a filter.
 */
export function buildSearchOrFilter(raw: string, columns: string[]): string | null {
  const terms = parseSearchTerms(raw)
  if (terms.length === 0 || columns.length === 0) return null

  const clauses: string[] = []
  for (const term of terms) {
    const pattern = `%${term}%`.replace(/%+/g, '%')
    for (const column of columns) {
      clauses.push(`${column}.ilike."${pattern}"`)
    }
  }

  return clauses.join(',')
}

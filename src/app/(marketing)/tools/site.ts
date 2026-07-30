/**
 * The one place the site's own origin is written down.
 *
 * Several pages used to hardcode `https://free-for-nonprofits.vercel.app` —
 * the old preview deployment — while `src/app/layout.tsx` set `metadataBase`
 * to `freefornonprofits.com`. Every tool page therefore self-canonicalised to
 * a host that is not the live site, which is the SEO equivalent of telling
 * Google the content belongs somewhere else.
 *
 * This reads the same env var `layout.tsx` reads, with the same fallback, so
 * the canonical URL and `metadataBase` cannot drift apart. `NEXT_PUBLIC_` is
 * required: `ToolActions` is a client component and needs the value inlined
 * at build time.
 */
export const SITE_ORIGIN = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://freefornonprofits.com'
).replace(/\/+$/, '')

/** Origin without the scheme — for prose like "link the logo to <host>". */
export const SITE_HOST = SITE_ORIGIN.replace(/^https?:\/\//, '')

/** Absolute, canonical URL of a tool detail page. */
export function toolUrl(slug: string): string {
  return `${SITE_ORIGIN}/tools/${slug}`
}

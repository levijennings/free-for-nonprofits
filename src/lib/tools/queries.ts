import { createClient } from '@supabase/supabase-js'
import { unstable_cache } from 'next/cache'
import type { EligibilityFields } from '@/lib/eligibility'

/**
 * Cached reads for the public tool pages, and the cache tags that invalidate
 * them.
 *
 * WHY THIS EXISTS — the caching situation this replaces was not what the code
 * claimed. `src/app/(marketing)/tools/[slug]/page.tsx` carried
 * `export const revalidate = 3600`, but `(marketing)/layout.tsx` calls
 * `cookies()` (via `supabase/server`'s `createClient()` to resolve the header's
 * signed-in state), which opts the whole segment tree out of static generation.
 * Verified two ways: a production build with hard-coded `generateStaticParams`
 * emits no entry at all for `/tools/[slug]` in `.next/prerender-manifest.json`,
 * and production responds to `/tools/slack` with
 * `cache-control: private, no-cache, no-store, must-revalidate` and
 * `x-vercel-cache: MISS`. So the `revalidate` was inert, nothing was cached
 * anywhere, and every request paid four Supabase round trips.
 *
 * The fix does not try to make the page static again — the header genuinely
 * needs per-request auth state. It caches the *data* instead, behind tags, so
 * TTFB stops carrying the database round trips AND a correction can be
 * published on demand rather than waiting out a TTL.
 */

/** Invalidated by any write that changes the catalogue as a whole. */
export const TOOLS_TAG = 'tools'

/** Invalidated by a write to one tool. */
export const toolTag = (slug: string) => `tool:${slug}`

/**
 * Backstop only, not the intended freshness mechanism.
 *
 * Every write that goes through the admin API invalidates by tag immediately
 * (see `src/lib/tools/revalidate.ts`), so the normal staleness window is zero.
 * This TTL exists for the case that path misses — most realistically a
 * correction applied straight to Postgres by SQL, which no application code
 * observes. One hour is the outer bound on how long such a change can stay
 * invisible; `POST /api/admin/revalidate` is the way to make it immediate.
 */
export const TOOL_CACHE_TTL_SECONDS = 3600

/**
 * Anonymous client. Everything cached here is public data read under the
 * `tools_select_public` / `reviews_select_all` / `categories_select_public`
 * RLS policies, and a cached value is shared across all visitors — so it must
 * never be fetched with a user's session attached. This client also touches no
 * cookies, which is what keeps these reads out of the dynamic-rendering bailout.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

/**
 * Columns the detail page and its children actually read.
 *
 * The previous `select('*')` pulled all 39 columns of `tools` on every render,
 * including `long_description` twice over, the `features` JSONB, and
 * `search_vector` — a tsvector that serialises to kilobytes of lexeme/position
 * JSON that nothing on the page can use.
 *
 * `ClaimGuide` takes `EligibilityFields & { id, name, website_url }`, so every
 * column in `ELIGIBILITY_COLUMNS`' eligibility half has to survive here.
 */
export const TOOL_DETAIL_COLUMNS = `
  id, name, slug, description, long_description,
  category_id, website_url, affiliate_url, logo_url,
  pricing_model, nonprofit_deal, features, tags, is_verified,
  save_count, favorite_count, using_count,
  requires_nonprofit_status, eligible_org_types, eligible_countries,
  min_budget_usd, max_budget_usd, annual_value_usd,
  steps_count, time_to_claim_days, difficulty, renewal,
  nonprofit_url, last_verified_at,
  category:categories(name, slug, icon)
`

/**
 * The shape `TOOL_DETAIL_COLUMNS` returns. The Supabase client here is untyped,
 * so an explicit type is what keeps the `ClaimGuide` contract
 * (`EligibilityFields & { id, name, website_url }`) actually checked rather
 * than silently satisfied by `any`.
 */
export type ToolDetail = EligibilityFields & {
  id: string
  name: string
  slug: string
  description: string
  long_description: string | null
  category_id: string | null
  /** NOT NULL in the schema — `AffiliateLink` relies on that. */
  website_url: string
  affiliate_url: string | null
  logo_url: string | null
  pricing_model: string
  features: unknown
  tags: unknown
  is_verified: boolean | null
  save_count: number | null
  favorite_count: number | null
  using_count: number | null
  nonprofit_deal: string | null
  category: { name: string; slug: string; icon: string } | null
}

export type RelatedTool = {
  id: string
  name: string
  slug: string
  description: string
  pricing_model: string
  logo_url: string | null
}

/**
 * The tool row behind `/tools/[slug]`. Tagged per slug so one correction
 * invalidates exactly one page.
 *
 * `unstable_cache` is deliberate rather than `fetch`-level caching: Next's Data
 * Cache refuses to cache a `fetch` that carries an `authorization` header once
 * a dynamic function has been used above it (`patch-fetch.js`'s `autoNoCache`),
 * and every supabase-js request carries one. So the built-in fetch cache can
 * never help this page — the memoisation has to sit above the client.
 */
export function getToolDetail(slug: string): Promise<ToolDetail | null> {
  return unstable_cache(
    async (s: string) => {
      const { data } = await createPublicClient()
        .from('tools')
        .select(TOOL_DETAIL_COLUMNS)
        .eq('slug', s)
        .single()
      return (data as unknown as ToolDetail) ?? null
    },
    ['tool-detail'],
    { tags: [TOOLS_TAG, toolTag(slug)], revalidate: TOOL_CACHE_TTL_SECONDS },
  )(slug)
}

/**
 * The "More <category> tools" rail. Only tagged `TOOLS_TAG`: its contents
 * depend on rows other than the one being viewed, so a per-slug tag would not
 * catch the case that matters (a sibling tool's terms being corrected).
 */
export function getRelatedTools(categoryId: string | null, excludeId: string): Promise<RelatedTool[]> {
  return unstable_cache(
    async (cat: string | null, exclude: string) => {
      if (!cat) return []
      const { data } = await createPublicClient()
        .from('tools')
        .select('id, name, slug, description, pricing_model, logo_url')
        .eq('category_id', cat)
        .eq('is_verified', true)
        .neq('id', exclude)
        .limit(3)
      return (data ?? []) as RelatedTool[]
    },
    ['tool-related'],
    { tags: [TOOLS_TAG], revalidate: TOOL_CACHE_TTL_SECONDS },
  )(categoryId, excludeId)
}

import { revalidatePath, revalidateTag } from 'next/cache'
import { TOOLS_TAG, toolTag } from './queries'

/**
 * Publish a tool correction immediately.
 *
 * Call this from every server-side path that writes to `tools`. It is cheap
 * (it marks tags dirty; it does not re-render anything inline) and it is the
 * only thing standing between a corrected row in Postgres and a visitor still
 * reading the claim it replaced — which, for a site whose entire proposition
 * is that its programme terms are accurate, is the failure that matters most.
 *
 * What each call covers:
 *  - `toolTag(slug)` — the cached row behind /tools/<slug>.
 *  - `TOOLS_TAG`     — the listing, the related-tools rails on *other* tool
 *                      pages, and anything else reading the catalogue.
 *  - `revalidatePath` — the Full Route Cache entries. Today `/tools/[slug]` is
 *                      dynamically rendered so there is nothing there to clear;
 *                      this is here so the invalidation path stays correct if
 *                      the route is ever made static again (which it can be,
 *                      once `(marketing)/layout.tsx` stops calling `cookies()`).
 *
 * REMAINING STALENESS after this runs, stated honestly:
 *  1. Next's client-side Router Cache holds an already-fetched RSC payload for
 *     ~30s on a dynamic route. A visitor who navigates in-app to a tool page
 *     within 30s of a correction can still see the old copy. A reload or a cold
 *     visit cannot. This is not configurable in Next 14.
 *  2. A write that does NOT reach this function — most realistically a
 *     correction applied directly in SQL — is bounded only by
 *     `TOOL_CACHE_TTL_SECONDS` (1 hour). `POST /api/admin/revalidate` exists so
 *     that path has a way to publish immediately; it has to be called
 *     deliberately.
 */
export function revalidateTool(slug: string) {
  revalidateTag(toolTag(slug))
  revalidateTag(TOOLS_TAG)
  revalidatePath(`/tools/${slug}`)
  revalidatePath('/tools')
}

/** Catalogue-wide changes (a tool added, removed, or unpublished). */
export function revalidateToolCatalogue() {
  revalidateTag(TOOLS_TAG)
  revalidatePath('/tools')
}

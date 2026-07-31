import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/supabase/admin'
import { revalidateTool, revalidateToolCatalogue } from '@/lib/tools/revalidate'

/**
 * Publish corrections that did not go through the admin UI.
 *
 * Writes made through `PATCH /api/admin/tools/[slug]` already invalidate their
 * own cache entries, so this endpoint is not for them. It exists for the way
 * corrections have actually been made on this project so far: bulk UPDATEs run
 * straight against Postgres. No application code observes those, so without a
 * deliberate call the site keeps serving the superseded terms until the cache
 * TTL expires — up to an hour. That is the exact failure this site exists to
 * prevent, so there has to be a way to end it in one call.
 *
 *   curl -X POST https://freefornonprofits.com/api/admin/revalidate \
 *     -H 'content-type: application/json' \
 *     -H "x-revalidate-secret: $REVALIDATE_SECRET" \
 *     -d '{"slugs":["slack","miro"]}'
 *
 * Passing no slugs invalidates the catalogue-wide tag only, which covers the
 * listing but NOT the per-slug detail entries — so a bulk correction must name
 * the rows it touched.
 */

/**
 * Two ways in, because the two callers are different: a signed-in admin using
 * the dashboard, and a script or agent that has no session. The secret is read
 * from `REVALIDATE_SECRET`, falling back to the `CRON_SECRET` already set on
 * this project so the endpoint is usable without a new env var; if neither is
 * configured, secret auth is refused rather than allowed.
 */
async function authorize(request: NextRequest): Promise<boolean> {
  const configured = process.env.REVALIDATE_SECRET || process.env.CRON_SECRET
  const presented = request.headers.get('x-revalidate-secret')
  if (configured && presented && presented === configured) return true

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return !!user && isAdminEmail(user.email)
}

export async function POST(request: NextRequest) {
  if (!(await authorize(request))) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: { slug?: unknown; slugs?: unknown } = {}
  try {
    // An empty body is a legitimate "just refresh the catalogue" call.
    const text = await request.text()
    if (text) body = JSON.parse(text)
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const raw = Array.isArray(body.slugs) ? body.slugs : body.slug ? [body.slug] : []
  const slugs = Array.from(
    new Set(raw.filter((s): s is string => typeof s === 'string' && s.trim().length > 0).map(s => s.trim())),
  )

  if (slugs.length > 0) {
    for (const slug of slugs) revalidateTool(slug)
  } else {
    revalidateToolCatalogue()
  }

  return Response.json({ revalidated: slugs, catalogue: true, at: new Date().toISOString() })
}

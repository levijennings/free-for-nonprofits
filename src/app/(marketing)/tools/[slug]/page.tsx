import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import ToolLogo from '@/components/tools/ToolLogo'
import AffiliateLink from '@/components/tools/AffiliateLink'
import ToolActions from '@/components/tools/ToolActions'
import ClaimGuide from '@/components/tools/ClaimGuide'
import ReviewForm from '@/components/reviews/ReviewForm'
import ReviewsList from '@/components/reviews/ReviewsList'
import { createPublicClient, getRelatedTools, getToolDetail } from '@/lib/tools/queries'
import { toolUrl } from '../site'

/*
 * There is deliberately no `export const revalidate` here any more.
 *
 * There used to be (`= 3600`), and it did nothing. `(marketing)/layout.tsx`
 * calls `cookies()` to resolve the header's signed-in state, which opts this
 * whole segment tree out of static generation, so the route is server-rendered
 * on every request and has no Full Route Cache entry for a `revalidate` to
 * govern. Proof, both reproducible: a production build with hard-coded
 * `generateStaticParams` writes no `/tools/[slug]` entry into
 * `.next/prerender-manifest.json` and no HTML under `.next/server/app`; and
 * production answers `/tools/slack` with
 * `cache-control: private, no-cache, no-store, must-revalidate` and
 * `x-vercel-cache: MISS`. Leaving the directive in place was worse than
 * useless — it read as a documented 1-hour staleness budget that no layer was
 * actually enforcing, and it would have silently become real the moment
 * anyone removed the cookie dependency from the layout.
 *
 * What governs freshness now is the tagged Data Cache in
 * `@/lib/tools/queries`, invalidated on write by `@/lib/tools/revalidate`.
 * The residual staleness window is documented there.
 */

interface Props {
  params: { slug: string }
}

/**
 * Retained, but honestly: it does not currently prerender anything. The build
 * table prints `● /tools/[slug]` and lists the slugs, which is misleading —
 * with the layout's `cookies()` call in the tree, the prerender attempt bails
 * and no HTML is written (checked against `.next/prerender-manifest.json`).
 * It is kept because it costs one query at build time and is exactly what has
 * to be in place for the route to become static again the day the layout stops
 * depending on the request.
 */
export async function generateStaticParams() {
  const { data } = await createPublicClient()
    .from('tools')
    .select('slug')
    .eq('is_verified', true)
  return (data ?? []).map(t => ({ slug: t.slug as string }))
}

/**
 * Google renders roughly 160 characters of a meta description. Stopping just
 * short of that keeps the last word intact in the SERP as well as in the tag.
 */
const MAX_DESCRIPTION_LENGTH = 158

/** Below this there is no room to say anything, so don't start a fragment. */
const MIN_TRUNCATED_FRAGMENT = 40

const SITE_TAGLINE = 'Free and discounted software for nonprofits.'

/**
 * Normalise a fragment into exactly one sentence: collapse whitespace, strip
 * whatever terminal punctuation the row happens to carry, then add a single
 * full stop. 92 of 104 `nonprofit_deal` values already end in '.', which is
 * how the old builder produced "…excluded.." on most of the directory.
 */
function asSentence(text: string | null | undefined): string {
  const clean = (text ?? '').replace(/\s+/g, ' ').trim().replace(/[\s.,;:!?—–-]+$/, '')
  return clean ? `${clean}.` : ''
}

/** Cut at the last word boundary that fits and mark the cut with an ellipsis. */
function truncateAtWord(text: string, max: number): string {
  if (text.length <= max) return text
  const head = text.slice(0, max - 1) // leave room for the ellipsis
  const lastSpace = head.lastIndexOf(' ')
  // If the only space is very early the "word" is longer than the budget;
  // a hard cut is then the lesser evil.
  const cut = lastSpace > max * 0.5 ? head.slice(0, lastSpace) : head
  return `${cut.replace(/[\s.,;:!?—–-]+$/, '')}…`
}

/**
 * Build an SEO meta description from real tool data.
 *
 * The old version concatenated intro + deal + description + tagline and called
 * `.slice(0, 160)`. The median deal is now 164 characters, so every one of the
 * 104 rows truncated — 76 of them mid-word — and `description` and the tagline
 * were unreachable dead code sitting past the cut.
 *
 * This composes in priority order instead: a short pricing intro (which also
 * carries the "<Tool> for nonprofits" keyword), then the deal, which is the
 * specific and genuinely useful fact. `description` and the site tagline are
 * only appended when they fit whole — a half-sentence of boilerplate helps
 * nobody, so only the deal is ever truncated.
 */
function buildDescription(tool: {
  name: string
  description: string
  pricing_model: string
  nonprofit_deal: string | null
}): string {
  // 22 of 104 names already contain "nonprofit" ("Zoom for Nonprofits"), where
  // the old wording produced "…for Nonprofits is free for nonprofits."
  const named = /nonprofit/i.test(tool.name)
  const intro =
    ({
      free: named ? `${tool.name} is free.` : `${tool.name} is free for nonprofits.`,
      freemium: named
        ? `${tool.name} has a free plan.`
        : `${tool.name} has a free plan for nonprofits.`,
      nonprofit_discount: named
        ? `${tool.name} is discounted.`
        : `${tool.name} is discounted for nonprofits.`,
    } as Record<string, string>)[tool.pricing_model] ?? `${tool.name} for nonprofits.`

  const parts = [
    asSentence(tool.nonprofit_deal),
    asSentence(tool.description),
    SITE_TAGLINE,
  ].filter(Boolean)

  let out = intro
  for (let i = 0; i < parts.length; i++) {
    const remaining = MAX_DESCRIPTION_LENGTH - out.length - 1 // -1 for the space
    if (remaining < MIN_TRUNCATED_FRAGMENT) break
    if (parts[i].length <= remaining) {
      out = `${out} ${parts[i]}`
      continue
    }
    // Only the deal — the highest-value part — is worth showing partially.
    if (i === 0) {
      out = `${out} ${truncateAtWord(parts[i], remaining)}`
      break
    }
    // Anything else that does not fit is skipped; a shorter later part may.
  }
  return out
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Same cached row the page body reads, so the metadata and the visible copy
  // can never disagree and the request costs one Supabase round trip, not two.
  const tool = await getToolDetail(params.slug)

  if (!tool) return { title: 'Tool Not Found' }

  const title       = `${tool.name} for Nonprofits — Free & Discounted | Free For NonProfits`
  const description = buildDescription(tool)
  const url         = toolUrl(tool.slug)

  return {
    title,
    description,
    keywords: [
      `${tool.name} for nonprofits`,
      `${tool.name} nonprofit discount`,
      `free ${tool.name}`,
      `${tool.name} free plan`,
      'nonprofit software',
      'free tools for nonprofits',
    ],
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Free For NonProfits',
      type: 'website',
      ...(tool.logo_url ? { images: [{ url: tool.logo_url, width: 200, height: 200, alt: tool.name }] } : {}),
    },
    twitter: {
      card: 'summary',
      title,
      description,
      ...(tool.logo_url ? { images: [tool.logo_url] } : {}),
    },
  }
}

const pricingLabels: Record<string, string> = {
  free: 'Free',
  freemium: 'Freemium',
  nonprofit_discount: 'Nonprofit Discount',
}

const pricingColors: Record<string, string> = {
  free: 'bg-emerald-100 text-emerald-800',
  freemium: 'bg-blue-100 text-blue-800',
  nonprofit_discount: 'bg-purple-100 text-purple-800',
}

const pricingDescriptions: Record<string, string> = {
  free: 'This tool is completely free to use.',
  freemium: 'This tool has a free tier with optional paid upgrades.',
  nonprofit_discount: 'Nonprofits receive a special discount on this tool.',
}

/**
 * The sidebar summary has to know whether the benefit is gated.
 *
 * "This tool is completely free to use" was rendering on programmes you have to
 * apply for and can be refused — Slack, which is free only up to 250 members and
 * excludes churches, schools, government and hospitals, read as unconditionally
 * free. The pricing_model is correct in each case; what was wrong was stating it
 * without the condition attached.
 */
function pricingSummary(model: string, gated: boolean | null): string {
  if (gated !== true) return pricingDescriptions[model] ?? ''
  switch (model) {
    case 'free':
      return 'Free for nonprofits that qualify — you have to apply, and the terms below are the ones the vendor states.'
    case 'freemium':
      return 'There is a free tier, and nonprofits that qualify get more. Applying is required.'
    case 'nonprofit_discount':
      return 'Discounted for nonprofits that qualify. You have to apply, and it can be refused.'
    default:
      return pricingDescriptions[model] ?? ''
  }
}

export default async function ToolDetailPage({ params }: Props) {
  const tool = await getToolDetail(params.slug)

  if (!tool) notFound()

  const features = Array.isArray(tool.features) ? tool.features : []
  const tags = Array.isArray(tool.tags) ? tool.tags : []

  // Related tools come from the tagged cache; reviews deliberately do not.
  // A review is user-generated and its author expects to see it immediately
  // after posting, so it stays a live read — one round trip, on a query that
  // is indexed on tool_id and capped at 50 rows.
  const [relatedTools, { data: reviews }] = await Promise.all([
    getRelatedTools(tool.category_id, tool.id),
    createPublicClient()
      .from('reviews')
      .select('id, rating, comment, created_at, user_id')
      .eq('tool_id', tool.id)
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  const reviewList = reviews ?? []
  const avgRating = reviewList.length
    ? reviewList.reduce((sum, r) => sum + r.rating, 0) / reviewList.length
    : null

  // JSON-LD structured data — helps Google show rich results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.description,
    url: tool.website_url,
    applicationCategory: tool.category?.name ?? 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: tool.pricing_model === 'free' ? '0' : undefined,
      priceCurrency: 'USD',
      description: tool.nonprofit_deal ?? pricingDescriptions[tool.pricing_model],
    },
    ...(avgRating && reviewList.length >= 3 ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: avgRating.toFixed(1),
        reviewCount: reviewList.length,
        bestRating: '5',
        worstRating: '1',
      },
    } : {}),
  }

  return (
    <main className="min-h-screen bg-surface-subtle">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Breadcrumb */}
      <div className="bg-surface border-b border-line">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
          <nav className="flex items-center gap-2 text-sm text-fg-muted">
            <Link href="/tools" className="hover:text-fg transition-colors">Tools</Link>
            <span>›</span>
            {tool.category && (
              <>
                <Link href={`/tools?category=${tool.category.slug}`} className="hover:text-fg transition-colors">
                  {tool.category.name}
                </Link>
                <span>›</span>
              </>
            )}
            <span className="text-fg font-medium">{tool.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header card */}
            <div className="bg-surface rounded-2xl border border-line p-6">
              <div className="flex items-start gap-4">
                {tool.logo_url && (
                  <ToolLogo
                    src={tool.logo_url}
                    alt={tool.name}
                    size={64}
                    eager
                    className="w-16 h-16 rounded-xl object-contain border border-line p-1 bg-surface-raised shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-fg">{tool.name}</h1>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${pricingColors[tool.pricing_model] ?? 'bg-surface-inset text-fg-muted'}`}>
                      {pricingLabels[tool.pricing_model] ?? tool.pricing_model}
                    </span>
                    {tool.is_verified && (
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-700 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>
                  {tool.category && (
                    <Link href={`/tools?category=${tool.category.slug}`} className="text-sm text-fg-muted hover:text-accent transition-colors">
                      {tool.category.icon} {tool.category.name}
                    </Link>
                  )}
                  {/* Live rating from reviews */}
                  {reviewList.length > 0 && (
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <svg key={s} className={`w-4 h-4 ${s <= Math.round(avgRating!) ? 'text-amber-400' : 'text-line-strong'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-fg-muted">
                        {avgRating!.toFixed(1)} · {reviewList.length} review{reviewList.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <p className="mt-4 text-fg-muted leading-relaxed">
                {tool.long_description || tool.description}
              </p>

              {tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {tags.map((tag: string) => (
                    <Link
                      key={tag}
                      href={`/tools?q=${tag}`}
                      className="text-xs px-2.5 py-1 bg-surface-subtle hover:bg-surface-inset text-fg-muted rounded-full transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* SEO intro — targets "[Tool] for nonprofits" keyword */}
            <div className="bg-surface rounded-2xl border border-line p-6">
              <h2 className="text-base font-semibold text-fg mb-2">
                {tool.name} for Nonprofits
              </h2>
              <p className="text-sm text-fg-muted leading-relaxed">
                {tool.pricing_model === 'free' && (
                  `${tool.name} is available completely free for nonprofit organizations. `
                )}
                {tool.pricing_model === 'freemium' && (
                  `${tool.name} offers a free plan that nonprofits can use at no cost. `
                )}
                {tool.pricing_model === 'nonprofit_discount' && (
                  `${tool.name} offers special discounted pricing for verified nonprofit organizations. `
                )}
                {tool.nonprofit_deal
                  ? tool.nonprofit_deal
                  : `Nonprofits can access ${tool.name} to ${tool.description.toLowerCase().replace(/\.$/, '')}.`}
              </p>
            </div>

            {/* What it takes to actually claim this */}
            <ClaimGuide tool={tool} />

            {/* Features */}
            {features.length > 0 && (
              <div className="bg-surface rounded-2xl border border-line p-6">
                <h2 className="text-lg font-semibold text-fg mb-4">Key Features</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {features.map((feature: string) => (
                    <div key={feature} className="flex items-start gap-2.5">
                      <svg className="w-4 h-4 text-accent mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-fg-muted">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-surface rounded-2xl border border-line p-6">
              <h2 className="text-lg font-semibold text-fg mb-1">
                Reviews
                {reviewList.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-fg-subtle">({reviewList.length})</span>
                )}
              </h2>
              {reviewList.length === 0 && (
                <p className="text-sm text-fg-subtle mb-5">No reviews yet — be the first.</p>
              )}
              {reviewList.length > 0 && (
                <div className="mb-6">
                  <ReviewsList reviews={reviewList} />
                </div>
              )}
              <div className={reviewList.length > 0 ? 'pt-5 border-t border-line' : ''}>
                <p className="text-sm font-semibold text-fg mb-4">Leave a review</p>
                <ReviewForm toolId={tool.id} toolName={tool.name} />
              </div>
            </div>

            {/* Related tools */}
            {relatedTools && relatedTools.length > 0 && (
              <div className="bg-surface rounded-2xl border border-line p-6">
                <h2 className="text-lg font-semibold text-fg mb-4">
                  More {tool.category?.name} tools
                </h2>
                <div className="space-y-3">
                  {relatedTools.map((related) => (
                    <Link
                      key={related.id}
                      href={`/tools/${related.slug}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-subtle transition-colors group"
                    >
                      {related.logo_url && (
                        <img src={related.logo_url} alt={related.name} className="w-9 h-9 rounded-lg object-contain border border-line p-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-fg group-hover:text-accent transition-colors">{related.name}</p>
                        <p className="text-xs text-fg-subtle truncate">{related.description}</p>
                      </div>
                      <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${pricingColors[related.pricing_model] ?? 'bg-surface-inset text-fg-muted'}`}>
                        {pricingLabels[related.pricing_model] ?? related.pricing_model}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* CTA card */}
            <div className="bg-surface rounded-2xl border border-line p-6 sticky top-24">
              <div className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg mb-4 ${pricingColors[tool.pricing_model] ?? 'bg-surface-inset text-fg-muted'}`}>
                {tool.pricing_model === 'free' && '🎁'}
                {tool.pricing_model === 'freemium' && '⚡'}
                {tool.pricing_model === 'nonprofit_discount' && '💜'}
                {' '}{pricingLabels[tool.pricing_model]}
              </div>

              <p className="text-sm text-fg-muted mb-4">
                {pricingSummary(tool.pricing_model, tool.requires_nonprofit_status)}
              </p>

              {/* Only call it a "Nonprofit Deal" when it actually is one.
                  For tools open to everyone this block used to contradict the
                  claim guide sitting right next to it. */}
              {tool.nonprofit_deal && (
                tool.requires_nonprofit_status === false ? (
                  <div className="bg-surface-subtle border border-line rounded-xl p-3 mb-5">
                    <p className="text-xs font-semibold text-fg mb-1">Open to anyone</p>
                    <p className="text-sm text-fg-muted leading-relaxed">{tool.nonprofit_deal}</p>
                  </div>
                ) : (
                  <div className="bg-accent-subtle border border-accent-line rounded-xl p-3 mb-5">
                    <p className="text-xs font-semibold text-accent mb-1">Nonprofit Deal</p>
                    <p className="text-sm text-fg-muted leading-relaxed">{tool.nonprofit_deal}</p>
                  </div>
                )
              )}

              <AffiliateLink
                toolId={tool.id}
                toolName={tool.name}
                websiteUrl={tool.website_url}
                affiliateUrl={tool.affiliate_url}
              />

              <ToolActions
                toolId={tool.id}
                toolName={tool.name}
                toolSlug={tool.slug}
                initialSaveCount={tool.save_count ?? 0}
                initialFavoriteCount={tool.favorite_count ?? 0}
                initialUsingCount={tool.using_count ?? 0}
              />
            </div>

            {/* Metadata */}
            <div className="bg-surface rounded-2xl border border-line p-6">
              <h3 className="text-sm font-semibold text-fg mb-3">Details</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-fg-muted">Pricing</dt>
                  <dd className="font-medium text-fg">{pricingLabels[tool.pricing_model]}</dd>
                </div>
                {tool.category && (
                  <div className="flex justify-between">
                    <dt className="text-fg-muted">Category</dt>
                    <dd className="font-medium text-fg">{tool.category.name}</dd>
                  </div>
                )}
                {reviewList.length > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-fg-muted">Rating</dt>
                    <dd className="font-medium text-fg">⭐ {avgRating!.toFixed(1)} / 5</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-fg-muted">Verified</dt>
                  <dd className="font-medium text-fg">{tool.is_verified ? '✅ Yes' : '⏳ Pending'}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

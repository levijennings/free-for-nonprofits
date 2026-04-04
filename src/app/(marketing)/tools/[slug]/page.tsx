import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import SaveToolButton from '@/components/tools/SaveToolButton'
import ToolLogo from '@/components/tools/ToolLogo'
import AffiliateLink from '@/components/tools/AffiliateLink'
import ReviewForm from '@/components/reviews/ReviewForm'
import ReviewsList from '@/components/reviews/ReviewsList'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createClient()
  const { data: tool } = await supabase
    .from('tools')
    .select('name, description')
    .eq('slug', params.slug)
    .single()

  if (!tool) return { title: 'Tool Not Found' }

  return {
    title: `${tool.name} for Nonprofits | Free For NonProfits`,
    description: tool.description,
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

export default async function ToolDetailPage({ params }: Props) {
  const supabase = await createClient()

  const { data: tool } = await supabase
    .from('tools')
    .select(`*, category:categories(name, slug, icon)`)
    .eq('slug', params.slug)
    .single()

  if (!tool) notFound()

  const features = Array.isArray(tool.features) ? tool.features : []
  const tags = Array.isArray(tool.tags) ? tool.tags : []

  // Fetch related tools and reviews in parallel
  const [{ data: relatedTools }, { data: reviews }] = await Promise.all([
    supabase
      .from('tools')
      .select('id, name, slug, description, pricing_model, logo_url')
      .eq('category_id', tool.category_id)
      .eq('is_verified', true)
      .neq('id', tool.id)
      .limit(3),
    supabase
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

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/tools" className="hover:text-gray-900 transition-colors">Tools</Link>
            <span>›</span>
            {tool.category && (
              <>
                <Link href={`/tools?category=${tool.category.slug}`} className="hover:text-gray-900 transition-colors">
                  {tool.category.name}
                </Link>
                <span>›</span>
              </>
            )}
            <span className="text-gray-900 font-medium">{tool.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-start gap-4">
                {tool.logo_url && (
                  <ToolLogo
                    src={tool.logo_url}
                    alt={tool.name}
                    className="w-16 h-16 rounded-xl object-contain border border-gray-100 p-1 bg-white shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-gray-900">{tool.name}</h1>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${pricingColors[tool.pricing_model] ?? 'bg-gray-100 text-gray-700'}`}>
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
                    <Link href={`/tools?category=${tool.category.slug}`} className="text-sm text-gray-500 hover:text-brand-600 transition-colors">
                      {tool.category.icon} {tool.category.name}
                    </Link>
                  )}
                  {/* Live rating from reviews */}
                  {reviewList.length > 0 && (
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <svg key={s} className={`w-4 h-4 ${s <= Math.round(avgRating!) ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {avgRating!.toFixed(1)} · {reviewList.length} review{reviewList.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <p className="mt-4 text-gray-700 leading-relaxed">
                {tool.long_description || tool.description}
              </p>

              {tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {tags.map((tag: string) => (
                    <Link
                      key={tag}
                      href={`/tools?q=${tag}`}
                      className="text-xs px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Features */}
            {features.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Features</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {features.map((feature: string) => (
                    <div key={feature} className="flex items-start gap-2.5">
                      <svg className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Reviews
                {reviewList.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-400">({reviewList.length})</span>
                )}
              </h2>
              {reviewList.length === 0 && (
                <p className="text-sm text-gray-400 mb-5">No reviews yet — be the first.</p>
              )}
              {reviewList.length > 0 && (
                <div className="mb-6">
                  <ReviewsList reviews={reviewList} />
                </div>
              )}
              <div className={reviewList.length > 0 ? 'pt-5 border-t border-gray-100' : ''}>
                <p className="text-sm font-semibold text-gray-700 mb-4">Leave a review</p>
                <ReviewForm toolId={tool.id} toolName={tool.name} />
              </div>
            </div>

            {/* Related tools */}
            {relatedTools && relatedTools.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  More {tool.category?.name} tools
                </h2>
                <div className="space-y-3">
                  {relatedTools.map((related) => (
                    <Link
                      key={related.id}
                      href={`/tools/${related.slug}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                    >
                      {related.logo_url && (
                        <img src={related.logo_url} alt={related.name} className="w-9 h-9 rounded-lg object-contain border border-gray-100 p-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-brand-600 transition-colors">{related.name}</p>
                        <p className="text-xs text-gray-500 truncate">{related.description}</p>
                      </div>
                      <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${pricingColors[related.pricing_model] ?? 'bg-gray-100 text-gray-700'}`}>
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
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <div className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg mb-4 ${pricingColors[tool.pricing_model] ?? 'bg-gray-100 text-gray-700'}`}>
                {tool.pricing_model === 'free' && '🎁'}
                {tool.pricing_model === 'freemium' && '⚡'}
                {tool.pricing_model === 'nonprofit_discount' && '💜'}
                {' '}{pricingLabels[tool.pricing_model]}
              </div>

              <p className="text-sm text-gray-600 mb-4">
                {pricingDescriptions[tool.pricing_model]}
              </p>

              {tool.nonprofit_deal && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 mb-5">
                  <p className="text-xs font-semibold text-emerald-800 mb-1">Nonprofit Deal</p>
                  <p className="text-sm text-emerald-700 leading-relaxed">{tool.nonprofit_deal}</p>
                </div>
              )}

              <AffiliateLink
                toolId={tool.id}
                toolName={tool.name}
                websiteUrl={tool.website_url}
                affiliateUrl={tool.affiliate_url}
              />

              <SaveToolButton toolId={tool.id} toolName={tool.name} />
            </div>

            {/* Metadata */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Details</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Pricing</dt>
                  <dd className="font-medium text-gray-900">{pricingLabels[tool.pricing_model]}</dd>
                </div>
                {tool.category && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Category</dt>
                    <dd className="font-medium text-gray-900">{tool.category.name}</dd>
                  </div>
                )}
                {reviewList.length > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Rating</dt>
                    <dd className="font-medium text-gray-900">⭐ {avgRating!.toFixed(1)} / 5</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-gray-500">Verified</dt>
                  <dd className="font-medium text-gray-900">{tool.is_verified ? '✅ Yes' : '⏳ Pending'}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

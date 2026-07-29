export const dynamic = 'force-dynamic'

import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient, isAdminEmail } from '@/lib/supabase/admin'
import Header from '@/components/nav/Header'
import ToolLogo from '@/components/tools/ToolLogo'
import ToolAdminActions from '@/components/admin/ToolAdminActions'

const pricingLabels: Record<string, string> = {
  free: 'Free',
  freemium: 'Freemium',
  nonprofit_discount: 'Nonprofit Discount',
  paid: 'Paid',
}

const pricingColors: Record<string, string> = {
  free: 'bg-green-100 text-green-700',
  freemium: 'bg-blue-100 text-blue-700',
  nonprofit_discount: 'bg-purple-100 text-purple-700',
  paid: 'bg-surface-inset text-fg-muted',
}

function StatPill({ label, value, color = 'text-fg' }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="bg-surface-subtle rounded-xl p-4 text-center">
      <p className={`text-2xl font-bold tnum ${color}`}>{value}</p>
      <p className="text-xs text-fg-subtle mt-1">{label}</p>
    </div>
  )
}

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <svg key={s} className={`w-3.5 h-3.5 ${s <= rating ? 'text-amber-400' : 'text-line'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  )
}

export default async function AdminToolDetailPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdminEmail(user.email)) redirect('/dashboard')

  const admin = createAdminClient()

  // Fetch tool first (need id for dependent queries)
  const { data: tool } = await admin
    .from('tools')
    .select('id, name, slug, description, website_url, logo_url, pricing_model, nonprofit_deal, is_verified, save_count, using_count, favorite_count, review_count, rating_avg, created_at, category:categories(id, name, slug)')
    .eq('slug', params.slug)
    .single()

  if (!tool) notFound()

  // Parallel: reviews + recent savers
  const [{ data: reviews }, { data: saverRows }] = await Promise.all([
    admin
      .from('reviews')
      .select('id, rating, title, comment, created_at, user_id')
      .eq('tool_id', tool.id)
      .order('created_at', { ascending: false })
      .limit(25),

    admin
      .from('saved_tools')
      .select('user_id, created_at')
      .eq('tool_id', tool.id)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  // Fetch reviewer + saver profiles
  const profileIds = [
    ...new Set([
      ...(reviews ?? []).map(r => r.user_id),
      ...(saverRows ?? []).map(s => s.user_id),
    ].filter(Boolean)),
  ]
  const { data: profiles } = profileIds.length > 0
    ? await admin.from('profiles').select('id, display_name, org_name').in('id', profileIds)
    : { data: [] }
  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))

  const cat = tool.category as unknown as { id: string; name: string; slug: string } | null

  // Engagement score
  const engagement = (tool.save_count ?? 0) + (tool.using_count ?? 0) * 2 + (tool.favorite_count ?? 0) + (tool.review_count ?? 0) * 3

  // Rating distribution
  const ratingDist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: (reviews ?? []).filter(r => r.rating === star).length,
  }))
  const maxRatingCount = Math.max(...ratingDist.map(d => d.count), 1)

  return (
    <>
      <Header />
      <main className="min-h-screen bg-surface-subtle">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-fg-subtle mb-6">
            <Link href="/admin" className="hover:text-fg-muted transition-colors">Admin</Link>
            <span>/</span>
            <Link href="/admin/tools" className="hover:text-fg-muted transition-colors">Tools</Link>
            <span>/</span>
            <span className="text-fg-muted font-medium truncate max-w-[200px]">{tool.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Left column ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Tool header card */}
              <div className="bg-surface rounded-2xl border border-line p-6">
                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 rounded-xl border border-line bg-surface flex items-center justify-center shrink-0 shadow-1">
                    <ToolLogo src={tool.logo_url ?? ''} websiteUrl={tool.website_url} alt={tool.name} className="w-12 h-12 object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h1 className="text-xl font-bold text-fg">{tool.name}</h1>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        tool.is_verified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {tool.is_verified ? '✓ Verified' : 'Unverified'}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pricingColors[tool.pricing_model] ?? 'bg-surface-inset text-fg-muted'}`}>
                        {pricingLabels[tool.pricing_model] ?? tool.pricing_model}
                      </span>
                    </div>
                    {cat && <p className="text-xs text-fg-subtle mb-2">{cat.name}</p>}
                    <p className="text-sm text-fg-muted leading-relaxed">{tool.description}</p>
                    {tool.nonprofit_deal && (
                      <p className="mt-2 text-xs text-accent font-medium bg-accent-subtle rounded-lg px-3 py-1.5 inline-block">
                        🎁 {tool.nonprofit_deal}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-line flex items-center gap-4 text-xs text-fg-subtle">
                  <span>Added {new Date(tool.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <a href={tool.website_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-hover transition-colors truncate">
                    {tool.website_url} ↗
                  </a>
                </div>
              </div>

              {/* Analytics grid */}
              <div>
                <h2 className="text-sm font-semibold text-fg-subtle uppercase tracking-wide mb-3">Analytics</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatPill label="Saved" value={tool.save_count ?? 0} color="text-blue-600" />
                  <StatPill label="Using" value={tool.using_count ?? 0} color="text-teal-600" />
                  <StatPill label="Favorites" value={tool.favorite_count ?? 0} color="text-rose-500" />
                  <StatPill label="Reviews" value={tool.review_count ?? 0} color="text-amber-500" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                  <StatPill
                    label="Avg rating"
                    value={(tool.review_count ?? 0) > 0 ? `★ ${Number(tool.rating_avg).toFixed(1)}` : '—'}
                    color="text-amber-500"
                  />
                  <StatPill label="Engagement score" value={engagement} color="text-fg-muted" />
                  <div className="bg-surface-subtle rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-accent tnum">
                      {(tool.review_count ?? 0) > 0
                        ? `${Math.round(((tool.review_count ?? 0) / Math.max(tool.save_count ?? 1, 1)) * 100)}%`
                        : '—'}
                    </p>
                    <p className="text-xs text-fg-subtle mt-1">Review rate</p>
                  </div>
                </div>
              </div>

              {/* Rating distribution */}
              {(reviews ?? []).length > 0 && (
                <div className="bg-surface rounded-2xl border border-line p-5">
                  <h2 className="font-bold text-fg mb-4">Rating breakdown</h2>
                  <div className="space-y-2">
                    {ratingDist.map(({ star, count }) => (
                      <div key={star} className="flex items-center gap-3">
                        <span className="text-xs text-fg-subtle w-5 text-right shrink-0 tnum">{star}★</span>
                        <div className="flex-1 bg-surface-inset rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all"
                            style={{ width: `${(count / maxRatingCount) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-fg-subtle w-4 shrink-0 tnum">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div className="bg-surface rounded-2xl border border-line p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-fg">Reviews ({reviews?.length ?? 0})</h2>
                  {(tool.review_count ?? 0) > 25 && (
                    <span className="text-xs text-fg-subtle">Showing latest 25</span>
                  )}
                </div>

                {(reviews ?? []).length === 0 ? (
                  <p className="text-sm text-fg-subtle text-center py-6">No reviews yet.</p>
                ) : (
                  <div className="divide-y divide-line">
                    {(reviews ?? []).map(review => {
                      const profile = profileMap[review.user_id]
                      const label = profile?.org_name || profile?.display_name || 'Anonymous'
                      const initials = label.slice(0, 2).toUpperCase()
                      return (
                        <div key={review.id} className="py-4 first:pt-0 last:pb-0">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-accent-subtle text-accent flex items-center justify-center text-xs font-bold shrink-0">
                              {initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Link
                                  href={`/admin/users/${review.user_id}`}
                                  className="text-sm font-semibold text-fg hover:text-accent transition-colors"
                                >
                                  {label}
                                </Link>
                                <StarRow rating={review.rating} />
                                <span className="text-xs text-fg-subtle ml-auto">
                                  {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              </div>
                              {review.title && (
                                <p className="text-sm font-medium text-fg mt-1">{review.title}</p>
                              )}
                              {review.comment && (
                                <p className="text-sm text-fg-subtle mt-0.5 leading-relaxed">{review.comment}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Recent savers */}
              {(saverRows ?? []).length > 0 && (
                <div className="bg-surface rounded-2xl border border-line p-5">
                  <h2 className="font-bold text-fg mb-4">Recently saved by</h2>
                  <div className="flex flex-wrap gap-2">
                    {(saverRows ?? []).map(row => {
                      const profile = profileMap[row.user_id]
                      const label = profile?.org_name || profile?.display_name || 'Anonymous'
                      return (
                        <Link
                          key={row.user_id}
                          href={`/admin/users/${row.user_id}`}
                          className="inline-flex items-center gap-1.5 text-xs bg-surface-inset hover:bg-accent-subtle hover:text-accent text-fg-muted px-2.5 py-1.5 rounded-full transition-colors font-medium"
                        >
                          {label}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* ── Right column: admin controls ── */}
            <div className="space-y-4">
              <ToolAdminActions
                slug={tool.slug}
                isVerified={tool.is_verified ?? false}
                name={tool.name}
                description={tool.description ?? ''}
                nonprofitDeal={tool.nonprofit_deal}
                pricingModel={tool.pricing_model}
                websiteUrl={tool.website_url}
              />

              {/* Insight card */}
              <div className="bg-surface rounded-2xl border border-line p-5">
                <h3 className="font-bold text-fg mb-3">Insights</h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-fg-subtle">Save-to-using ratio</span>
                    <span className="font-medium text-fg tnum">
                      {(tool.save_count ?? 0) > 0
                        ? `${Math.round(((tool.using_count ?? 0) / (tool.save_count ?? 1)) * 100)}%`
                        : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-fg-subtle">Favorite rate</span>
                    <span className="font-medium text-fg tnum">
                      {(tool.save_count ?? 0) > 0
                        ? `${Math.round(((tool.favorite_count ?? 0) / (tool.save_count ?? 1)) * 100)}%`
                        : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-fg-subtle">Engagement score</span>
                    <span className="font-medium text-fg tnum">{engagement}</span>
                  </div>
                  {(tool.review_count ?? 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-fg-subtle">Avg rating</span>
                      <span className="font-medium text-amber-600 tnum">★ {Number(tool.rating_avg).toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </>
  )
}

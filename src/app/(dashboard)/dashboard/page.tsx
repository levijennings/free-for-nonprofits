export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/nav/Header'
import ToolLogo from '@/components/tools/ToolLogo'

const pricingLabels: Record<string, string> = {
  free: 'Free',
  freemium: 'Freemium',
  nonprofit_discount: 'Nonprofit Discount',
}

const pricingColors: Record<string, string> = {
  free: 'bg-green-100 text-green-800',
  freemium: 'bg-blue-100 text-blue-800',
  nonprofit_discount: 'bg-purple-100 text-purple-800',
}

function avatarColor(userId: string) {
  const colors = [
    'bg-brand-100 text-brand-700',
    'bg-purple-100 text-purple-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-teal-100 text-teal-700',
    'bg-blue-100 text-blue-700',
  ]
  const idx = userId.charCodeAt(0) % colors.length
  return colors[idx]
}

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-3.5 h-3.5 ${s <= rating ? 'text-amber-400' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch all dashboard data in parallel
  const [
    { data: profile },
    { data: savedTools },
    { count: toolCount },
    { count: categoryCount },
    { count: userCount },
    { data: trendingTools },
    { data: recentReviews },
    { data: userReviews },
    { data: userSubmissions },
    { data: resourceOfWeek },
    { data: newTools },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),

    supabase
      .from('saved_tools')
      .select('id, created_at, tool:tools(id, name, slug, description, logo_url, pricing_model, nonprofit_deal, website_url)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),

    supabase.from('tools').select('*', { count: 'exact', head: true }).eq('is_verified', true),

    supabase.from('categories').select('*', { count: 'exact', head: true }),

    supabase.from('profiles').select('*', { count: 'exact', head: true }),

    supabase
      .from('tools')
      .select('id, name, slug, description, logo_url, pricing_model, save_count, favorite_count, using_count')
      .eq('is_verified', true)
      .order('using_count', { ascending: false })
      .limit(4),

    supabase
      .from('reviews')
      .select('id, rating, comment, created_at, tool_id, user_id, tools(name, slug)')
      .order('created_at', { ascending: false })
      .limit(6),

    supabase.from('reviews').select('id').eq('user_id', user.id).limit(1),

    supabase.from('tool_submissions').select('id').eq('submitted_by', user.id).limit(1),

    // Resource of the week — most recent weekly_features row where week_start <= today
    supabase
      .from('weekly_features')
      .select('id, blurb, week_start, tool:tools(id, name, slug, description, logo_url, pricing_model, nonprofit_deal, website_url, using_count, save_count)')
      .lte('week_start', new Date().toISOString().slice(0, 10))
      .order('week_start', { ascending: false })
      .limit(1)
      .maybeSingle(),

    // New resources — tools approved in the last 45 days
    supabase
      .from('tools')
      .select('id, name, slug, description, logo_url, pricing_model, created_at')
      .eq('is_verified', true)
      .gte('created_at', new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  // Fetch profiles for recent reviewers (separate query because reviews.user_id → auth.users, not profiles)
  const reviewerIds = [...new Set((recentReviews ?? []).map((r) => r.user_id))]
  const { data: reviewerProfiles } = reviewerIds.length > 0
    ? await supabase.from('profiles').select('id, display_name, org_name').in('id', reviewerIds)
    : { data: [] }
  const profileMap = Object.fromEntries((reviewerProfiles ?? []).map((p) => [p.id, p]))

  const displayName = profile?.display_name || user.email?.split('@')[0] || 'there'
  const orgName = profile?.org_name

  // Onboarding checklist
  const hasSaved = (savedTools?.length ?? 0) > 0
  const hasReviewed = (userReviews?.length ?? 0) > 0
  const hasSubmitted = (userSubmissions?.length ?? 0) > 0
  const checklistDone = [hasSaved, hasReviewed, hasSubmitted].filter(Boolean).length

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Welcome header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {displayName} 👋
            </h1>
            {orgName && (
              <p className="mt-1 text-gray-500">{orgName}</p>
            )}
          </div>

          {/* Live community stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-3xl font-bold text-brand-600">{savedTools?.length ?? 0}</p>
              <p className="text-sm text-gray-500 mt-1">Your saved tools</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-3xl font-bold text-green-600">{toolCount ?? 0}</p>
              <p className="text-sm text-gray-500 mt-1">Tools available</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-3xl font-bold text-purple-600">{categoryCount ?? 0}</p>
              <p className="text-sm text-gray-500 mt-1">Categories</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-3xl font-bold text-amber-500">{userCount ?? 0}</p>
              <p className="text-sm text-gray-500 mt-1">Nonprofits using</p>
            </div>
          </div>

          {/* Resource of the week */}
          {resourceOfWeek && (() => {
            const rotw = resourceOfWeek.tool as unknown as {
              id: string; name: string; slug: string; description: string;
              logo_url: string; pricing_model: string; nonprofit_deal: string;
              website_url: string; using_count: number; save_count: number;
            }
            if (!rotw) return null
            return (
              <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-teal-800 p-6 text-white shadow-lg">
                {/* Background texture */}
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                  backgroundSize: '24px 24px'
                }} />

                <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  {/* Label */}
                  <div className="shrink-0">
                    <div className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase mb-3">
                      <span>⭐</span> Resource of the week
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 shadow">
                        <ToolLogo src={rotw.logo_url || ''} alt={rotw.name} className="w-9 h-9 object-contain" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{rotw.name}</h3>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          rotw.pricing_model === 'free' ? 'bg-green-400/30 text-green-100' :
                          rotw.pricing_model === 'freemium' ? 'bg-blue-400/30 text-blue-100' :
                          'bg-purple-400/30 text-purple-100'
                        }`}>
                          {pricingLabels[rotw.pricing_model] ?? rotw.pricing_model}
                        </span>
                      </div>
                    </div>
                    <p className="text-white/85 text-sm leading-relaxed max-w-xl">
                      {resourceOfWeek.blurb || rotw.description}
                    </p>
                    {rotw.nonprofit_deal && (
                      <p className="mt-2 text-xs text-green-200 font-medium">🎁 {rotw.nonprofit_deal}</p>
                    )}
                    <div className="flex items-center gap-4 mt-4">
                      <Link
                        href={`/tools/${rotw.slug}`}
                        className="inline-flex items-center gap-1.5 bg-white text-brand-700 hover:bg-brand-50 font-semibold text-sm px-4 py-2 rounded-xl transition-colors shadow"
                      >
                        Learn more →
                      </Link>
                      <a
                        href={rotw.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors"
                      >
                        Visit site ↗
                      </a>
                      {(rotw.using_count > 0 || rotw.save_count > 0) && (
                        <span className="text-white/60 text-xs ml-auto">
                          {rotw.using_count > 0 ? `${rotw.using_count} nonprofits using` : `${rotw.save_count} saved`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column: saved tools + activity feed */}
            <div className="lg:col-span-2 space-y-8">

              {/* Saved tools */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Your saved tools</h2>
                  <Link href="/tools" className="text-sm text-brand-500 hover:text-brand-700 font-medium transition-colors">
                    Browse more →
                  </Link>
                </div>

                {!savedTools || savedTools.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                    <div className="text-4xl mb-3">🔖</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved tools yet</h3>
                    <p className="text-gray-500 text-sm mb-5">
                      Browse our directory and save tools you want to explore for your organization.
                    </p>
                    <Link
                      href="/tools"
                      className="inline-block px-5 py-2.5 bg-brand-500 hover:bg-brand-700 text-white font-medium rounded-xl transition-colors text-sm"
                    >
                      Browse all tools
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedTools.map((saved) => {
                      const tool = saved.tool as unknown as {
                        id: string; name: string; slug: string; description: string;
                        logo_url: string; pricing_model: string; nonprofit_deal: string; website_url: string;
                      }
                      if (!tool) return null
                      return (
                        <div key={saved.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-start gap-4">
                          <ToolLogo src={tool.logo_url || ''} alt={tool.name} className="w-11 h-11 rounded-xl object-contain border border-gray-100 p-1 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link href={`/tools/${tool.slug}`} className="font-semibold text-gray-900 hover:text-brand-600 transition-colors">
                                {tool.name}
                              </Link>
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${pricingColors[tool.pricing_model] ?? 'bg-gray-100 text-gray-700'}`}>
                                {pricingLabels[tool.pricing_model] ?? tool.pricing_model}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{tool.description}</p>
                            {tool.nonprofit_deal && (
                              <p className="text-xs text-green-700 mt-1">🎁 {tool.nonprofit_deal}</p>
                            )}
                          </div>
                          <a
                            href={tool.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 px-3 py-1.5 text-xs font-medium text-brand-600 hover:text-brand-800 border border-brand-200 hover:border-brand-400 rounded-lg transition-colors"
                          >
                            Visit →
                          </a>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Community activity feed */}
              {recentReviews && recentReviews.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Community activity</h2>
                  <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
                    {recentReviews.map((review) => {
                      const tool = review.tools as unknown as { name: string; slug: string } | null
                      const reviewer = profileMap[review.user_id] ?? null
                      const label = reviewer?.org_name || reviewer?.display_name || null
                      const initials = (label || 'AN').slice(0, 2).toUpperCase()
                      const isOwn = review.user_id === user.id
                      return (
                        <div key={review.id} className="flex items-start gap-3 px-5 py-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor(review.user_id)}`}>
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-gray-900">
                                {isOwn ? 'You' : label || 'A nonprofit'}
                              </span>
                              <span className="text-xs text-gray-400">reviewed</span>
                              {tool && (
                                <Link href={`/tools/${tool.slug}`} className="text-sm font-medium text-brand-600 hover:text-brand-800 transition-colors">
                                  {tool.name}
                                </Link>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <StarRow rating={review.rating} />
                              {review.comment && (
                                <span className="text-xs text-gray-500 truncate">{review.comment}</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* Right sidebar */}
            <div className="space-y-6">

              {/* Onboarding checklist */}
              {checklistDone < 3 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900">Get started</h3>
                    <span className="text-xs text-gray-400 font-medium">{checklistDone}/3</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
                    <div
                      className="bg-brand-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${(checklistDone / 3) * 100}%` }}
                    />
                  </div>
                  <div className="space-y-3">
                    <ChecklistItem done={hasSaved} href="/tools" label="Save your first tool" />
                    <ChecklistItem done={hasReviewed} href="/tools" label="Leave a review" />
                    <ChecklistItem done={hasSubmitted} href="/submit" label="Submit a tool" />
                  </div>
                </div>
              )}

              {/* Trending tools */}
              {trendingTools && trendingTools.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <h3 className="font-semibold text-gray-900 mb-4">🔥 Most used right now</h3>
                  <div className="space-y-3">
                    {trendingTools.map((tool) => {
                      const total = (tool.save_count ?? 0) + (tool.using_count ?? 0) + (tool.favorite_count ?? 0)
                      return (
                        <Link
                          key={tool.id}
                          href={`/tools/${tool.slug}`}
                          className="flex items-center gap-3 group"
                        >
                          <ToolLogo src={tool.logo_url || ''} alt={tool.name} className="w-9 h-9 rounded-lg object-contain border border-gray-100 p-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 group-hover:text-brand-600 transition-colors truncate">{tool.name}</p>
                            <p className="text-xs text-gray-400">
                              {tool.using_count > 0 ? `${tool.using_count} using` : pricingLabels[tool.pricing_model]}
                              {tool.save_count > 0 ? ` · ${tool.save_count} saved` : ''}
                            </p>
                          </div>
                          <span className="text-xs font-semibold text-gray-300 group-hover:text-brand-400 transition-colors shrink-0">→</span>
                        </Link>
                      )
                    })}
                  </div>
                  <Link href="/tools" className="block mt-4 text-center text-sm text-brand-500 hover:text-brand-700 font-medium transition-colors">
                    View all tools →
                  </Link>
                </div>
              )}

              {/* New resources */}
              {newTools && newTools.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">✨ New resources</h3>
                    <span className="text-xs text-gray-400">last 45 days</span>
                  </div>
                  <div className="space-y-3">
                    {newTools.map((tool) => {
                      const daysAgo = Math.floor((Date.now() - new Date(tool.created_at).getTime()) / (1000 * 60 * 60 * 24))
                      return (
                        <Link
                          key={tool.id}
                          href={`/tools/${tool.slug}`}
                          className="flex items-center gap-3 group"
                        >
                          <ToolLogo src={tool.logo_url || ''} alt={tool.name} className="w-9 h-9 rounded-lg object-contain border border-gray-100 p-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 group-hover:text-brand-600 transition-colors truncate">{tool.name}</p>
                            <p className="text-xs text-gray-400">
                              {daysAgo === 0 ? 'Added today' : daysAgo === 1 ? 'Added yesterday' : `Added ${daysAgo}d ago`}
                              {' · '}{pricingLabels[tool.pricing_model] ?? tool.pricing_model}
                            </p>
                          </div>
                          <span className="shrink-0 inline-block px-1.5 py-0.5 text-xs font-semibold bg-brand-50 text-brand-600 rounded-full">New</span>
                        </Link>
                      )
                    })}
                  </div>
                  <Link href="/tools" className="block mt-4 text-center text-sm text-brand-500 hover:text-brand-700 font-medium transition-colors">
                    See all tools →
                  </Link>
                </div>
              )}

              {/* Account info */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Your account</h3>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-xs text-gray-400 mb-0.5">Email</dt>
                    <dd className="text-gray-900 font-medium truncate">{user.email}</dd>
                  </div>
                  {orgName && (
                    <div>
                      <dt className="text-xs text-gray-400 mb-0.5">Organization</dt>
                      <dd className="text-gray-900 font-medium">{orgName}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-xs text-gray-400 mb-0.5">Member since</dt>
                    <dd className="text-gray-900 font-medium">
                      {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </dd>
                  </div>
                </dl>
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                  <Link href="/submit" className="block text-center text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-xl py-2 transition-colors">
                    Submit a tool
                  </Link>
                  <Link href="/tools" className="block text-center text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl py-2 transition-colors">
                    Browse all tools
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </>
  )
}

function ChecklistItem({ done, href, label }: { done: boolean; href: string; label: string }) {
  return (
    <Link href={done ? '#' : href} className={`flex items-center gap-3 group ${done ? 'pointer-events-none' : ''}`}>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${done ? 'bg-brand-500 border-brand-500' : 'border-gray-300 group-hover:border-brand-400'}`}>
        {done && (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className={`text-sm transition-colors ${done ? 'text-gray-400 line-through' : 'text-gray-700 group-hover:text-brand-600'}`}>
        {label}
      </span>
    </Link>
  )
}

export const dynamic = 'force-dynamic'

import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient, ADMIN_EMAIL } from '@/lib/supabase/admin'
import Header from '@/components/nav/Header'
import ToolLogo from '@/components/tools/ToolLogo'

const pricingLabels: Record<string, string> = {
  free: 'Free',
  freemium: 'Freemium',
  nonprofit_discount: 'Nonprofit Discount',
  paid: 'Paid',
}

const orgSizeLabels: Record<string, string> = {
  small:  '1–10 people',
  medium: '11–50 people',
  large:  '50+ people',
}

function avatarColor(id: string) {
  const palette = [
    'bg-brand-100 text-brand-700',
    'bg-purple-100 text-purple-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-teal-100 text-teal-700',
    'bg-blue-100 text-blue-700',
  ]
  return palette[id.charCodeAt(0) % palette.length]
}

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <svg key={s} className={`w-3 h-3 ${s <= rating ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  )
}

function StatCard({ label, value, color = 'text-gray-900' }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="bg-gray-50 rounded-xl px-3 py-3 text-center">
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{label}</p>
    </div>
  )
}

export default async function AdminUserDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user: adminUser } } = await supabase.auth.getUser()
  if (!adminUser || adminUser.email !== ADMIN_EMAIL) redirect('/dashboard')

  const admin = createAdminClient()

  // Fetch profile first
  const { data: profile } = await admin
    .from('profiles')
    .select('id, display_name, org_name, org_size, created_at')
    .eq('id', params.id)
    .single()

  if (!profile) notFound()

  // Parallel: activity data
  const [
    { data: savedTools,   count: saveCount },
    { data: favTools,     count: favCount },
    { data: usedTools,    count: usingCount },
    { data: reviews,      count: reviewCount },
    { data: submissions },
  ] = await Promise.all([
    admin
      .from('saved_tools')
      .select('id, created_at, tool:tools(id, name, slug, logo_url, pricing_model)', { count: 'exact' })
      .eq('user_id', params.id)
      .order('created_at', { ascending: false })
      .limit(20),

    admin
      .from('tool_favorites')
      .select('id, created_at, tool:tools(id, name, slug, logo_url, pricing_model)', { count: 'exact' })
      .eq('user_id', params.id)
      .order('created_at', { ascending: false })
      .limit(20),

    admin
      .from('tool_usages')
      .select('id, created_at, tool:tools(id, name, slug, logo_url, pricing_model)', { count: 'exact' })
      .eq('user_id', params.id)
      .order('created_at', { ascending: false })
      .limit(20),

    admin
      .from('reviews')
      .select('id, rating, title, comment, created_at, tool:tools(id, name, slug)', { count: 'exact' })
      .eq('user_id', params.id)
      .order('created_at', { ascending: false }),

    admin
      .from('tool_submissions')
      .select('id, name, status, created_at')
      .eq('submitted_by', params.id)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const label    = profile.org_name || profile.display_name || 'Anonymous'
  const initials = label.slice(0, 2).toUpperCase()
  const daysActive = Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))
  const engagementScore = (saveCount ?? 0) + (usingCount ?? 0) * 2 + (favCount ?? 0) + (reviewCount ?? 0) * 3

  // Determine activity level
  const activityLevel =
    engagementScore >= 15 ? { label: 'Power user', color: 'bg-green-100 text-green-700' } :
    engagementScore >= 5  ? { label: 'Active',     color: 'bg-blue-100 text-blue-700'  } :
    engagementScore >= 1  ? { label: 'Light',      color: 'bg-gray-100 text-gray-600'  } :
                            { label: 'Inactive',   color: 'bg-red-50 text-red-500'     }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link href="/admin" className="hover:text-gray-700 transition-colors">Admin</Link>
            <span>/</span>
            <Link href="/admin/users" className="hover:text-gray-700 transition-colors">Users</Link>
            <span>/</span>
            <span className="text-gray-700 font-medium truncate max-w-[200px]">{label}</span>
          </div>

          {/* Profile header */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <div className="flex items-start gap-5">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${avatarColor(profile.id)}`}>
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-xl font-bold text-gray-900">{label}</h1>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${activityLevel.color}`}>
                    {activityLevel.label}
                  </span>
                </div>
                {profile.org_name && profile.display_name && (
                  <p className="text-sm text-gray-500">{profile.display_name}</p>
                )}
                <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-gray-400 divide-x divide-gray-100">
                  {profile.org_size && (
                    <span className="pr-3">{orgSizeLabels[profile.org_size] ?? profile.org_size}</span>
                  )}
                  <span className={profile.org_size ? 'pl-3 pr-3' : 'pr-3'}>
                    Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="pl-3">
                    {daysActive === 0 ? 'Day 1' : `${daysActive}d member`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity stats */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
            <StatCard label="Saved"      value={saveCount ?? 0}              color="text-blue-600"   />
            <StatCard label="Favorites"  value={favCount ?? 0}               color="text-rose-500"   />
            <StatCard label="Using"      value={usingCount ?? 0}             color="text-teal-600"   />
            <StatCard label="Reviews"    value={reviewCount ?? 0}            color="text-amber-500"  />
            <StatCard label="Score"      value={engagementScore}             color="text-gray-700"   />
            <StatCard label="Submitted"  value={submissions?.length ?? 0}    color="text-purple-600" />
          </div>

          {/* Saved tools */}
          {(savedTools ?? []).length > 0 && (
            <section className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Saved tools</h2>
                {(saveCount ?? 0) > 20 && <span className="text-xs text-gray-400">Showing 20 of {saveCount}</span>}
              </div>
              <div className="space-y-2">
                {(savedTools ?? []).map(row => {
                  const tool = row.tool as unknown as { id: string; name: string; slug: string; logo_url: string | null; pricing_model: string } | null
                  if (!tool) return null
                  return (
                    <Link
                      key={row.id}
                      href={`/admin/tools/${tool.slug}`}
                      className="flex items-center gap-3 group hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg border border-gray-100 bg-white flex items-center justify-center shrink-0">
                        <ToolLogo src={tool.logo_url ?? ''} alt={tool.name} className="w-6 h-6 object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 group-hover:text-brand-600 transition-colors truncate">{tool.name}</p>
                        <p className="text-xs text-gray-400">{pricingLabels[tool.pricing_model] ?? tool.pricing_model}</p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-gray-200 group-hover:text-brand-400 transition-colors text-xs">→</span>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {/* Favorites */}
          {(favTools ?? []).length > 0 && (
            <section className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
              <h2 className="font-bold text-gray-900 mb-4">Favorites</h2>
              <div className="flex flex-wrap gap-2">
                {(favTools ?? []).map(row => {
                  const tool = row.tool as unknown as { id: string; name: string; slug: string; logo_url: string | null } | null
                  if (!tool) return null
                  return (
                    <Link
                      key={row.id}
                      href={`/admin/tools/${tool.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 px-2.5 py-1.5 rounded-full transition-colors font-medium"
                    >
                      ♥ {tool.name}
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {/* Using */}
          {(usedTools ?? []).length > 0 && (
            <section className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
              <h2 className="font-bold text-gray-900 mb-4">Currently using</h2>
              <div className="flex flex-wrap gap-2">
                {(usedTools ?? []).map(row => {
                  const tool = row.tool as unknown as { id: string; name: string; slug: string } | null
                  if (!tool) return null
                  return (
                    <Link
                      key={row.id}
                      href={`/admin/tools/${tool.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs bg-teal-50 hover:bg-teal-100 text-teal-700 px-2.5 py-1.5 rounded-full transition-colors font-medium"
                    >
                      ✓ {tool.name}
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {/* Reviews */}
          {(reviews ?? []).length > 0 && (
            <section className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
              <h2 className="font-bold text-gray-900 mb-4">Reviews written</h2>
              <div className="divide-y divide-gray-50">
                {(reviews ?? []).map(review => {
                  const tool = review.tool as unknown as { id: string; name: string; slug: string } | null
                  return (
                    <div key={review.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {tool && (
                              <Link href={`/admin/tools/${tool.slug}`} className="text-sm font-semibold text-brand-600 hover:text-brand-800 transition-colors">
                                {tool.name}
                              </Link>
                            )}
                            <StarRow rating={review.rating} />
                            <span className="text-xs text-gray-400 ml-auto">
                              {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                          {review.title && <p className="text-sm font-medium text-gray-800 mt-0.5">{review.title}</p>}
                          {review.comment && <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{review.comment}</p>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Submissions */}
          {(submissions ?? []).length > 0 && (
            <section className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-bold text-gray-900 mb-4">Tool submissions</h2>
              <div className="space-y-2">
                {(submissions ?? []).map(sub => (
                  <div key={sub.id} className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-800">{sub.name}</p>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        sub.status === 'approved' ? 'bg-green-100 text-green-700' :
                        sub.status === 'rejected' ? 'bg-red-100 text-red-600' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {sub.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(sub.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Empty state */}
          {(saveCount ?? 0) === 0 && (favCount ?? 0) === 0 && (usingCount ?? 0) === 0 && (reviewCount ?? 0) === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
              <p className="text-3xl mb-3">👤</p>
              <p className="text-sm">This user hasn't interacted with any tools yet.</p>
            </div>
          )}

        </div>
      </main>
    </>
  )
}

export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient, ADMIN_EMAIL } from '@/lib/supabase/admin'
import Header from '@/components/nav/Header'
import SetRotwForm from '@/components/admin/SetRotwForm'
import SubmissionsPanel from '@/components/admin/SubmissionsPanel'

// ── helpers ──────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color = 'text-gray-900' }: {
  label: string; value: string | number; sub?: string; color?: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

// ── page ─────────────────────────────────────────────────────────────────────

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) redirect('/dashboard')

  const admin = createAdminClient()

  // Fetch all data in parallel
  const [
    { count: toolCount },
    { count: userCount },
    { count: reviewCount },
    { count: pendingCount },
    { data: kpiAgg },
    { data: newUsersThisWeek },
    { data: currentRotw },
    { data: submissions },
    { data: users },
    { data: topTools },
  ] = await Promise.all([
    admin.from('tools').select('*', { count: 'exact', head: true }).eq('is_verified', true),
    admin.from('profiles').select('*', { count: 'exact', head: true }),
    admin.from('reviews').select('*', { count: 'exact', head: true }),
    admin.from('tool_submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),

    // aggregate saves + usages + favorites
    admin.from('tools').select('save_count, using_count, favorite_count').eq('is_verified', true),

    // new users this week
    admin.from('profiles')
      .select('id', { count: 'exact', head: false })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),

    // current resource of week
    admin
      .from('weekly_features')
      .select('id, blurb, week_start, tool:tools(id, name, slug, logo_url, pricing_model)')
      .lte('week_start', new Date().toISOString().slice(0, 10))
      .order('week_start', { ascending: false })
      .limit(1)
      .maybeSingle(),

    // all submissions (pending first)
    admin
      .from('tool_submissions')
      .select('id, name, website_url, category_slug, pricing_model, description, nonprofit_deal, status, created_at, submitted_by')
      .order('created_at', { ascending: false })
      .limit(50),

    // users with engagement
    admin
      .from('profiles')
      .select('id, display_name, org_name, created_at')
      .order('created_at', { ascending: false })
      .limit(100),

    // top tools by engagement
    admin
      .from('tools')
      .select('id, name, slug, save_count, using_count, favorite_count, review_count, rating_avg')
      .eq('is_verified', true)
      .order('save_count', { ascending: false })
      .limit(10),
  ])

  // Aggregate totals
  const totalSaves = kpiAgg?.reduce((s, t) => s + (t.save_count ?? 0), 0) ?? 0
  const totalUsing = kpiAgg?.reduce((s, t) => s + (t.using_count ?? 0), 0) ?? 0
  const totalFavs = kpiAgg?.reduce((s, t) => s + (t.favorite_count ?? 0), 0) ?? 0

  // Fetch submitter emails for submissions
  const submitterIds = [...new Set((submissions ?? []).map(s => s.submitted_by).filter(Boolean))]
  const { data: submitterProfiles } = submitterIds.length > 0
    ? await admin.from('profiles').select('id, display_name, org_name').in('id', submitterIds)
    : { data: [] }
  const submitterMap = Object.fromEntries((submitterProfiles ?? []).map(p => [p.id, p]))

  const enrichedSubmissions = (submissions ?? []).map(s => ({
    ...s,
    submitter_email: submitterMap[s.submitted_by]?.org_name || submitterMap[s.submitted_by]?.display_name || null,
  }))

  const rotwTool = currentRotw?.tool as unknown as { id: string; name: string; slug: string; logo_url: string | null; pricing_model: string } | null

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full mb-2 uppercase tracking-widest">
                🔒 Admin
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              ← Back to user view
            </Link>
          </div>

          {/* KPI grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 mb-10">
            <StatCard label="Verified tools" value={toolCount ?? 0} color="text-brand-600" />
            <StatCard label="Total users" value={userCount ?? 0} sub={`+${newUsersThisWeek?.length ?? 0} this week`} color="text-purple-600" />
            <StatCard label="Reviews written" value={reviewCount ?? 0} color="text-amber-500" />
            <StatCard label="Pending submissions" value={pendingCount ?? 0} color={pendingCount ? 'text-red-500' : 'text-gray-400'} />
            <StatCard label="Total saves" value={totalSaves} color="text-blue-600" />
            <StatCard label="'I use this' clicks" value={totalUsing} color="text-teal-600" />
            <StatCard label="Favorites" value={totalFavs} color="text-rose-500" />
            <StatCard label="Engagement score" value={totalSaves + totalUsing * 2 + totalFavs + (reviewCount ?? 0) * 3} sub="saves + 2×using + favs + 3×reviews" color="text-gray-700" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left column */}
            <div className="lg:col-span-2 space-y-8">

              {/* Resource of the week */}
              <section className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-gray-900">⭐ Resource of the Week</h2>
                  {currentRotw && (
                    <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-3 py-1">
                      Current: week of {new Date(currentRotw.week_start + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
                {currentRotw && rotwTool && (
                  <div className="mb-6 bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0">
                      {rotwTool.logo_url
                        ? <img src={rotwTool.logo_url} alt={rotwTool.name} className="w-7 h-7 object-contain" />
                        : <span className="text-lg">🛠</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{rotwTool.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{currentRotw.blurb}</p>
                    </div>
                    <Link href={`/tools/${rotwTool.slug}`} className="text-xs text-brand-600 hover:underline shrink-0">View →</Link>
                  </div>
                )}
                <SetRotwForm
                  current={rotwTool ? { tool: rotwTool, week_start: currentRotw!.week_start, blurb: currentRotw!.blurb } : null}
                />
              </section>

              {/* Submissions */}
              <section className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="text-lg font-bold text-gray-900">Tool Submissions</h2>
                  {(pendingCount ?? 0) > 0 && (
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      {pendingCount} pending
                    </span>
                  )}
                </div>
                <SubmissionsPanel initial={enrichedSubmissions} />
              </section>
            </div>

            {/* Right sidebar */}
            <div className="space-y-6">

              {/* Top tools */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 mb-4">Top tools by saves</h3>
                <div className="space-y-2">
                  {(topTools ?? []).map((tool, i) => (
                    <div key={tool.id} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-300 w-4 shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <Link href={`/tools/${tool.slug}`} className="text-sm font-medium text-gray-800 hover:text-brand-600 transition-colors truncate block">
                          {tool.name}
                        </Link>
                        <p className="text-xs text-gray-400">
                          {tool.save_count} saved · {tool.using_count} using
                          {tool.review_count > 0 && ` · ★${Number(tool.rating_avg).toFixed(1)} (${tool.review_count})`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent users */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 mb-4">Recent users</h3>
                <div className="space-y-3">
                  {(users ?? []).slice(0, 15).map(u => {
                    const daysAgo = Math.floor((Date.now() - new Date(u.created_at).getTime()) / (1000 * 60 * 60 * 24))
                    return (
                      <div key={u.id} className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold shrink-0">
                          {(u.display_name || u.org_name || 'A').slice(0, 1).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{u.org_name || u.display_name || 'Anonymous'}</p>
                          <p className="text-xs text-gray-400">{daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {(users?.length ?? 0) > 15 && (
                  <p className="text-xs text-gray-400 mt-3 text-center">+ {(users?.length ?? 0) - 15} more</p>
                )}
              </div>

            </div>
          </div>
        </div>
      </main>
    </>
  )
}

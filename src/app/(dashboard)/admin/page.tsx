export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient, isAdminEmail } from '@/lib/supabase/admin'
import Header from '@/components/nav/Header'
import SetRotwForm from '@/components/admin/SetRotwForm'
import SubmissionsPanel from '@/components/admin/SubmissionsPanel'
import FulfillRequestButton from '@/components/admin/FulfillRequestButton'

// ── helpers ──────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color = 'text-fg', href }: {
  label: string; value: string | number; sub?: string; color?: string; href?: string
}) {
  const inner = (
    <div className={`bg-surface rounded-2xl border border-line p-5 transition-all ${href ? 'hover:border-accent-line hover:shadow-1 cursor-pointer group' : ''}`}>
      <p className={`text-3xl font-bold tnum ${color} ${href ? 'group-hover:opacity-80' : ''}`}>{value}</p>
      <p className="text-sm text-fg-subtle mt-1">{label}</p>
      {sub && <p className="text-xs text-fg-subtle mt-0.5">{sub}</p>}
      {href && <p className="text-xs text-accent mt-2 opacity-0 group-hover:opacity-100 transition-opacity">View all →</p>}
    </div>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}

// ── page ─────────────────────────────────────────────────────────────────────

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isAdminEmail(user.email)) redirect('/dashboard')

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
    { data: topRequests },
    { data: monthlyStats },
    { data: agentRuns },
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

    // top tool requests by votes
    admin
      .from('tool_requests')
      .select('id, name, category_slug, vote_count, status, created_at')
      .order('vote_count', { ascending: false })
      .limit(10),

    // monthly insights rollup (same source as the monthly email report)
    admin.rpc('monthly_report_stats'),

    // growth agent activity log
    admin
      .from('agent_runs')
      .select('id, kind, status, summary, created_at')
      .order('created_at', { ascending: false })
      .limit(8),
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
      <main className="min-h-screen bg-surface-subtle">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full mb-2 uppercase tracking-widest">
                🔒 Admin
              </div>
              <h1 className="text-3xl font-bold text-fg">Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <a href="/gtm-brief.html" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-accent hover:text-accent-hover transition-colors">📣 Go-to-Market brief →</a>
              <Link href="/dashboard" className="text-sm text-fg-subtle hover:text-fg transition-colors">
                ← Back to user view
              </Link>
            </div>
          </div>

          {/* KPI grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 mb-10">
            <StatCard label="Verified tools" value={toolCount ?? 0} color="text-accent" href="/admin/tools" />
            <StatCard label="Total users" value={userCount ?? 0} sub={`+${newUsersThisWeek?.length ?? 0} this week`} color="text-purple-600" href="/admin/users" />
            <StatCard label="Reviews written" value={reviewCount ?? 0} color="text-amber-500" href="/admin/tools?sort=reviews" />
            <StatCard label="Pending submissions" value={pendingCount ?? 0} color={pendingCount ? 'text-red-500' : 'text-fg-subtle'} />
            <StatCard label="Total saves" value={totalSaves} color="text-blue-600" href="/admin/tools?sort=saves" />
            <StatCard label="'I use this' clicks" value={totalUsing} color="text-teal-600" href="/admin/tools?sort=using" />
            <StatCard label="Favorites" value={totalFavs} color="text-rose-500" href="/admin/tools?sort=saves" />
            <StatCard label="Engagement score" value={totalSaves + totalUsing * 2 + totalFavs + (reviewCount ?? 0) * 3} sub="saves + 2×using + favs + 3×reviews" color="text-fg-muted" />
          </div>

          {/* Monthly insights (mirrors the monthly email report) */}
          {monthlyStats && (() => {
            const m = monthlyStats as {
              month_label: string
              items_added: { this_month: number; prev_month: number }
              new_users: { this_month: number; prev_month: number }
              active_users_30d: number
              top_tools: { name: string; slug: string; save_count: number }[]
              top_categories: { name: string; tool_count: number }[]
            }
            const delta = (c: number, p: number) =>
              p === 0 ? (c > 0 ? '▲ new' : '—') : `${c >= p ? '▲' : '▼'} ${Math.abs(Math.round(((c - p) / p) * 100))}%`
            return (
              <section className="bg-surface rounded-2xl border border-line p-6 mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-fg">📈 Monthly Insights — {m.month_label}</h2>
                  <span className="text-xs text-fg-subtle">vs. previous month</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-surface-subtle rounded-xl p-4">
                    <p className="text-xs text-fg-subtle">Tools added</p>
                    <p className="text-2xl font-bold text-fg tnum">{m.items_added.this_month}</p>
                    <p className="text-xs text-fg-subtle tnum">prev {m.items_added.prev_month} · {delta(m.items_added.this_month, m.items_added.prev_month)}</p>
                  </div>
                  <div className="bg-surface-subtle rounded-xl p-4">
                    <p className="text-xs text-fg-subtle">New users</p>
                    <p className="text-2xl font-bold text-fg tnum">{m.new_users.this_month}</p>
                    <p className="text-xs text-fg-subtle tnum">prev {m.new_users.prev_month} · {delta(m.new_users.this_month, m.new_users.prev_month)}</p>
                  </div>
                  <div className="bg-surface-subtle rounded-xl p-4">
                    <p className="text-xs text-fg-subtle">Active users (30d)</p>
                    <p className="text-2xl font-bold text-fg tnum">{m.active_users_30d}</p>
                    <p className="text-xs text-fg-subtle">saves / favs / uses / reviews / logins</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-micro text-fg-subtle uppercase mb-2">Top tools by saves</p>
                    <ol className="space-y-1.5">
                      {m.top_tools.map((t, i) => (
                        <li key={t.slug} className="flex justify-between text-sm">
                          <span className="text-fg-muted">{i + 1}. {t.name}</span>
                          <span className="text-fg-subtle tnum">{t.save_count}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <p className="text-micro text-fg-subtle uppercase mb-2">Top categories</p>
                    <ol className="space-y-1.5">
                      {m.top_categories.map((c, i) => (
                        <li key={c.name} className="flex justify-between text-sm">
                          <span className="text-fg-muted">{i + 1}. {c.name}</span>
                          <span className="text-fg-subtle tnum">{c.tool_count}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </section>
            )
          })()}

          {/* Analytics overview (embedded) */}
          <section className="bg-surface rounded-2xl border border-line p-6 mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-fg">📊 Analytics overview</h2>
              {process.env.NEXT_PUBLIC_GA_ID
                ? <span className="text-xs font-semibold text-accent">GA4 connected</span>
                : <span className="text-xs text-fg-subtle">GA4 not configured</span>}
            </div>
            {process.env.NEXT_PUBLIC_ANALYTICS_EMBED_URL ? (
              <div className="rounded-xl overflow-hidden border border-line">
                <iframe
                  src={process.env.NEXT_PUBLIC_ANALYTICS_EMBED_URL}
                  title="Analytics dashboard"
                  width="100%"
                  height={640}
                  style={{ border: 0 }}
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="bg-surface-subtle rounded-xl p-6 text-sm text-fg-muted">
                <p className="font-semibold text-fg mb-2">Embed your live analytics dashboard here</p>
                <ol className="list-decimal ml-5 space-y-1">
                  <li>Set <code className="bg-surface-inset px-1 rounded">NEXT_PUBLIC_GA_ID</code> (your <code className="bg-surface-inset px-1 rounded">G-XXXXXXXXXX</code> Measurement ID) in Vercel to start collecting data.</li>
                  <li>In <a className="text-accent font-medium" href="https://lookerstudio.google.com" target="_blank" rel="noopener noreferrer">Looker Studio</a>, create a report from your GA4 property (or use the GA4 template).</li>
                  <li>Share → Embed report → enable embedding → copy the embed URL.</li>
                  <li>Set it as <code className="bg-surface-inset px-1 rounded">NEXT_PUBLIC_ANALYTICS_EMBED_URL</code> in Vercel and redeploy.</li>
                </ol>
              </div>
            )}
          </section>

          {/* Growth agent activity & schedule */}
          {(() => {
            const now = new Date()
            const nextSun = new Date(now)
            nextSun.setDate(now.getDate() + (((7 - now.getDay()) % 7) || 7))
            const runs = (agentRuns ?? []) as { id: string; kind: string; status: string; summary: Record<string, any> | null; created_at: string }[]
            const last = runs[0]
            const kindLabel: Record<string, string> = { weekly_digest: 'Weekly digest', monthly_report: 'Monthly report', research: 'Research' }
            const fmtSummary = (r: { summary: Record<string, any> | null }) => {
              const s = (r.summary || {}) as Record<string, any>
              const parts: string[] = []
              if (s.tools_staged != null) parts.push(`${s.tools_staged} staged`)
              if (s.sent != null) parts.push(`${s.sent} emails`)
              if (s.dealOfWeek) parts.push(`deal: ${s.dealOfWeek}`)
              else if (s.deal_of_week) parts.push(`deal: ${s.deal_of_week}`)
              return parts.join(' · ') || '—'
            }
            return (
              <section className="bg-surface rounded-2xl border border-line p-6 mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-fg">🤖 Growth Agent</h2>
                  <span className="text-xs text-fg-subtle">finds &amp; stages new tools for your approval</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="bg-surface-subtle rounded-xl p-4">
                    <p className="text-xs text-fg-subtle">Schedule</p>
                    <p className="text-sm font-bold text-fg mt-1">Sundays 7:00 AM PT</p>
                    <p className="text-xs text-fg-subtle mt-0.5">+ monthly report on the 1st</p>
                  </div>
                  <div className="bg-surface-subtle rounded-xl p-4">
                    <p className="text-xs text-fg-subtle">Next run</p>
                    <p className="text-sm font-bold text-fg mt-1">{nextSun.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                    <p className="text-xs text-fg-subtle mt-0.5">research → stage → digest</p>
                  </div>
                  <div className="bg-surface-subtle rounded-xl p-4">
                    <p className="text-xs text-fg-subtle">Total runs</p>
                    <p className="text-2xl font-bold text-fg tnum">{runs.length}</p>
                    <p className="text-xs text-fg-subtle mt-0.5">{last ? `last ${new Date(last.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'none yet'}</p>
                  </div>
                  <div className="bg-accent-subtle rounded-xl p-4">
                    <p className="text-xs text-accent">Awaiting approval</p>
                    <p className="text-2xl font-bold text-accent tnum">{pendingCount ?? 0}</p>
                    <p className="text-xs text-accent mt-0.5">staged tools to review</p>
                  </div>
                </div>
                {runs.length === 0 ? (
                  <p className="text-sm text-fg-subtle">
                    No agent runs yet — the first run is scheduled for {nextSun.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}. Tools it finds will appear in the Submissions queue below for your approval.
                  </p>
                ) : (
                  <div>
                    <p className="text-micro text-fg-subtle uppercase mb-2">Recent activity</p>
                    <table className="w-full text-sm">
                      <tbody>
                        {runs.map((r) => (
                          <tr key={r.id} className="border-b border-line">
                            <td className="py-2 pr-3 text-fg-muted">{kindLabel[r.kind] ?? r.kind}</td>
                            <td className="py-2 pr-3">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.status === 'success' ? 'bg-green-100 text-green-700' : r.status === 'error' ? 'bg-red-100 text-red-700' : 'bg-surface-inset text-fg-muted'}`}>{r.status}</span>
                            </td>
                            <td className="py-2 pr-3 text-fg-subtle">{fmtSummary(r)}</td>
                            <td className="py-2 text-right text-fg-subtle text-xs">{new Date(r.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )
          })()}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left column */}
            <div className="lg:col-span-2 space-y-8">

              {/* Resource of the week */}
              <section className="bg-surface rounded-2xl border border-line p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-fg">⭐ Resource of the Week</h2>
                  {currentRotw && (
                    <span className="text-xs text-fg-subtle bg-surface-inset rounded-full px-3 py-1">
                      Current: week of {new Date(currentRotw.week_start + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
                {currentRotw && rotwTool && (
                  <div className="mb-6 bg-accent-subtle border border-accent-line rounded-xl px-4 py-3 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-surface border border-line flex items-center justify-center shrink-0">
                      {rotwTool.logo_url
                        ? <img src={rotwTool.logo_url} alt={rotwTool.name} className="w-7 h-7 object-contain" />
                        : <span className="text-lg">🛠</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-fg">{rotwTool.name}</p>
                      <p className="text-xs text-fg-subtle mt-0.5 line-clamp-2">{currentRotw.blurb}</p>
                    </div>
                    <Link href={`/tools/${rotwTool.slug}`} className="text-xs text-accent hover:underline shrink-0">View →</Link>
                  </div>
                )}
                <SetRotwForm
                  current={rotwTool ? { tool: rotwTool, week_start: currentRotw!.week_start, blurb: currentRotw!.blurb } : null}
                />
              </section>

              {/* Submissions */}
              <section className="bg-surface rounded-2xl border border-line p-6">
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="text-lg font-bold text-fg">Tool Submissions</h2>
                  {(pendingCount ?? 0) > 0 && (
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      {pendingCount} pending
                    </span>
                  )}
                </div>
                <SubmissionsPanel initial={enrichedSubmissions} />
              </section>

              {/* Community Wishlist */}
              <section className="bg-surface rounded-2xl border border-line p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-fg">🗳️ Community Wishlist</h2>
                  <Link href="/wishlist" target="_blank" className="text-xs text-accent hover:text-accent-hover font-medium">
                    View public page →
                  </Link>
                </div>
                {(topRequests ?? []).length === 0 ? (
                  <p className="text-sm text-fg-subtle text-center py-6">No requests yet.</p>
                ) : (
                  <div className="space-y-3">
                    {(topRequests ?? []).map((req, i) => (
                      <div key={req.id} className="flex items-start gap-3">
                        <div className="flex flex-col items-center gap-0.5 shrink-0 pt-0.5">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${
                            req.status === 'fulfilled' ? 'bg-status-done-bg text-status-done' : 'bg-accent-subtle text-accent'
                          }`}>
                            {req.vote_count}
                          </div>
                          <span className="text-[9px] text-fg-subtle font-medium">votes</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {i < 3 && req.status === 'open' && (
                              <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">#{i+1}</span>
                            )}
                            <span className="text-sm font-semibold text-fg">{req.name}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                              req.status === 'fulfilled' ? 'bg-green-100 text-green-700' :
                              req.status === 'declined'  ? 'bg-surface-inset text-fg-muted' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {req.status === 'fulfilled' ? 'Added ✓' : req.status === 'declined' ? 'Declined' : 'Open'}
                            </span>
                          </div>
                          {req.category_slug && (
                            <p className="text-xs text-fg-subtle mt-0.5">{req.category_slug.replace(/-/g, ' ')}</p>
                          )}
                          {req.status === 'open' && (
                            <FulfillRequestButton requestId={req.id} requestName={req.name} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Right sidebar */}
            <div className="space-y-6">

              {/* Top tools */}
              <div className="bg-surface rounded-2xl border border-line p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-fg">Top tools by saves</h3>
                  <Link href="/admin/tools" className="text-xs text-accent hover:text-accent-hover font-medium">View all →</Link>
                </div>
                <div className="space-y-2">
                  {(topTools ?? []).map((tool, i) => (
                    <Link key={tool.id} href={`/admin/tools/${tool.slug}`} className="flex items-center gap-3 group hover:bg-surface-subtle -mx-2 px-2 py-1 rounded-lg transition-colors">
                      <span className="text-xs font-bold text-fg-subtle tnum w-4 shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-fg group-hover:text-accent transition-colors truncate">
                          {tool.name}
                        </p>
                        <p className="text-xs text-fg-subtle">
                          {tool.save_count} saved · {tool.using_count} using
                          {tool.review_count > 0 && ` · ★${Number(tool.rating_avg).toFixed(1)} (${tool.review_count})`}
                        </p>
                      </div>
                      <span className="text-line-strong group-hover:text-accent transition-colors text-xs">→</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Recent users */}
              <div className="bg-surface rounded-2xl border border-line p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-fg">Recent users</h3>
                  <Link href="/admin/users" className="text-xs text-accent hover:text-accent-hover font-medium">View all →</Link>
                </div>
                <div className="space-y-3">
                  {(users ?? []).slice(0, 15).map(u => {
                    const daysAgo = Math.floor((Date.now() - new Date(u.created_at).getTime()) / (1000 * 60 * 60 * 24))
                    return (
                      <Link key={u.id} href={`/admin/users/${u.id}`} className="flex items-start gap-2.5 group hover:bg-surface-subtle -mx-2 px-2 py-1 rounded-lg transition-colors">
                        <div className="w-7 h-7 rounded-full bg-accent-subtle text-accent flex items-center justify-center text-xs font-bold shrink-0 group-hover:bg-accent-line transition-colors">
                          {(u.display_name || u.org_name || 'A').slice(0, 1).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-fg group-hover:text-accent transition-colors truncate">{u.org_name || u.display_name || 'Anonymous'}</p>
                          <p className="text-xs text-fg-subtle">{daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`}</p>
                        </div>
                        <span className="text-line-strong group-hover:text-accent transition-colors text-xs self-center">→</span>
                      </Link>
                    )
                  })}
                </div>
                {(users?.length ?? 0) > 15 && (
                  <Link href="/admin/users" className="block text-xs text-accent hover:text-accent-hover mt-3 text-center font-medium">
                    + {(users?.length ?? 0) - 15} more users →
                  </Link>
                )}
              </div>

            </div>
          </div>
        </div>
      </main>
    </>
  )
}

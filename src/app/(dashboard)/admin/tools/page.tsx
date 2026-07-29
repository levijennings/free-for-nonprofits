export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient, isAdminEmail } from '@/lib/supabase/admin'
import Header from '@/components/nav/Header'
import ToolLogo from '@/components/tools/ToolLogo'

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

const sortOptions = [
  { value: 'saves',   label: 'Most saved' },
  { value: 'using',   label: 'Most used' },
  { value: 'rating',  label: 'Highest rated' },
  { value: 'reviews', label: 'Most reviewed' },
  { value: 'newest',  label: 'Newest first' },
  { value: 'name',    label: 'Name A–Z' },
]

const sortMap: Record<string, { col: string; asc: boolean }> = {
  saves:   { col: 'save_count',   asc: false },
  using:   { col: 'using_count',  asc: false },
  rating:  { col: 'rating_avg',   asc: false },
  reviews: { col: 'review_count', asc: false },
  newest:  { col: 'created_at',   asc: false },
  name:    { col: 'name',         asc: true  },
}

export default async function AdminToolsPage({
  searchParams,
}: {
  searchParams: { q?: string; sort?: string; filter?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdminEmail(user.email)) redirect('/dashboard')

  const admin = createAdminClient()

  const q      = searchParams.q ?? ''
  const sort   = searchParams.sort ?? 'saves'
  const filter = searchParams.filter ?? 'all'

  let query = admin
    .from('tools')
    .select('id, name, slug, logo_url, website_url, pricing_model, is_verified, save_count, using_count, favorite_count, review_count, rating_avg, created_at, category:categories(name)', { count: 'exact' })

  if (q)               query = query.ilike('name', `%${q}%`)
  if (filter === 'verified')   query = query.eq('is_verified', true)
  if (filter === 'unverified') query = query.eq('is_verified', false)

  const { col, asc } = sortMap[sort] ?? sortMap.saves
  query = query.order(col, { ascending: asc }).limit(200)

  const { data: tools, count } = await query

  return (
    <>
      <Header />
      <main className="min-h-screen bg-surface-subtle">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Breadcrumb + header */}
          <div className="flex items-center gap-3 mb-8">
            <Link href="/admin" className="text-sm text-fg-subtle hover:text-fg-muted transition-colors">← Admin</Link>
            <span className="text-line-strong">/</span>
            <h1 className="text-2xl font-bold text-fg">Tools</h1>
            <span className="text-sm text-fg-subtle bg-surface-inset px-2 py-0.5 rounded-full tnum">{count ?? 0}</span>
          </div>

          {/* Filter bar */}
          <form method="GET" className="flex flex-wrap items-center gap-3 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <input
                name="q"
                defaultValue={q}
                placeholder="Search by name…"
                className="w-full pl-9 pr-4 py-2.5 bg-surface text-fg border border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-focus focus:border-focus"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <select
              name="sort"
              defaultValue={sort}
              className="border border-line rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-focus bg-surface text-fg"
            >
              {sortOptions.map(o => (
                <option key={o.value} value={o.value}>Sort: {o.label}</option>
              ))}
            </select>

            <select
              name="filter"
              defaultValue={filter}
              className="border border-line rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-focus bg-surface text-fg"
            >
              <option value="all">All tools</option>
              <option value="verified">Verified only</option>
              <option value="unverified">Unverified only</option>
            </select>

            <button
              type="submit"
              className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-accent-fg text-sm font-semibold rounded-xl transition-colors"
            >
              Apply
            </button>

            {(q || sort !== 'saves' || filter !== 'all') && (
              <Link href="/admin/tools" className="text-sm text-fg-subtle hover:text-fg-muted transition-colors">
                Clear
              </Link>
            )}
          </form>

          {/* Tool list */}
          <div className="bg-surface rounded-2xl border border-line overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-5 py-3 border-b border-line text-micro text-fg-subtle uppercase">
              <span className="w-9" />
              <span>Tool</span>
              <span className="text-right">Saved</span>
              <span className="text-right">Using</span>
              <span className="text-right">Rating</span>
              <span className="w-4" />
            </div>

            <div className="divide-y divide-line">
              {(tools ?? []).length === 0 && (
                <div className="px-5 py-12 text-center text-fg-subtle text-sm">
                  No tools found.
                </div>
              )}
              {(tools ?? []).map((tool) => {
                const cat = tool.category as unknown as { name: string } | null
                return (
                  <Link
                    key={tool.id}
                    href={`/admin/tools/${tool.slug}`}
                    className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-surface-subtle transition-colors group"
                  >
                    {/* Logo */}
                    <div className="w-9 h-9 rounded-lg border border-line bg-surface flex items-center justify-center shrink-0">
                      <ToolLogo src={tool.logo_url ?? ''} websiteUrl={tool.website_url} alt={tool.name} className="w-7 h-7 object-contain" />
                    </div>

                    {/* Name + badges */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-fg group-hover:text-accent transition-colors truncate">
                          {tool.name}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          tool.is_verified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {tool.is_verified ? '✓ Verified' : 'Unverified'}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${pricingColors[tool.pricing_model] ?? 'bg-surface-inset text-fg-muted'}`}>
                          {pricingLabels[tool.pricing_model] ?? tool.pricing_model}
                        </span>
                        {cat && <span className="text-[10px] text-fg-subtle">{cat.name}</span>}
                      </div>
                    </div>

                    {/* Stats */}
                    <span className="text-sm text-fg-subtle tnum text-right w-14">{tool.save_count ?? 0}</span>
                    <span className="text-sm text-fg-subtle tnum text-right w-14">{tool.using_count ?? 0}</span>
                    <span className="text-sm text-fg-subtle tnum text-right w-20">
                      {(tool.review_count ?? 0) > 0
                        ? `★ ${Number(tool.rating_avg).toFixed(1)} (${tool.review_count})`
                        : '—'
                      }
                    </span>

                    {/* Arrow */}
                    <span className="text-line-strong group-hover:text-accent transition-colors text-sm">→</span>
                  </Link>
                )
              })}
            </div>
          </div>

        </div>
      </main>
    </>
  )
}

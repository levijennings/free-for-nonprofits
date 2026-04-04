export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
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

const pricingColors: Record<string, string> = {
  free: 'bg-green-100 text-green-700',
  freemium: 'bg-blue-100 text-blue-700',
  nonprofit_discount: 'bg-purple-100 text-purple-700',
  paid: 'bg-gray-100 text-gray-600',
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
  if (!user || user.email !== ADMIN_EMAIL) redirect('/dashboard')

  const admin = createAdminClient()

  const q      = searchParams.q ?? ''
  const sort   = searchParams.sort ?? 'saves'
  const filter = searchParams.filter ?? 'all'

  let query = admin
    .from('tools')
    .select('id, name, slug, logo_url, pricing_model, is_verified, save_count, using_count, favorite_count, review_count, rating_avg, created_at, category:categories(name)', { count: 'exact' })

  if (q)               query = query.ilike('name', `%${q}%`)
  if (filter === 'verified')   query = query.eq('is_verified', true)
  if (filter === 'unverified') query = query.eq('is_verified', false)

  const { col, asc } = sortMap[sort] ?? sortMap.saves
  query = query.order(col, { ascending: asc }).limit(200)

  const { data: tools, count } = await query

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Breadcrumb + header */}
          <div className="flex items-center gap-3 mb-8">
            <Link href="/admin" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">← Admin</Link>
            <span className="text-gray-200">/</span>
            <h1 className="text-2xl font-bold text-gray-900">Tools</h1>
            <span className="text-sm text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{count ?? 0}</span>
          </div>

          {/* Filter bar */}
          <form method="GET" className="flex flex-wrap items-center gap-3 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <input
                name="q"
                defaultValue={q}
                placeholder="Search by name…"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-300"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <select
              name="sort"
              defaultValue={sort}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white"
            >
              {sortOptions.map(o => (
                <option key={o.value} value={o.value}>Sort: {o.label}</option>
              ))}
            </select>

            <select
              name="filter"
              defaultValue={filter}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white"
            >
              <option value="all">All tools</option>
              <option value="verified">Verified only</option>
              <option value="unverified">Unverified only</option>
            </select>

            <button
              type="submit"
              className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Apply
            </button>

            {(q || sort !== 'saves' || filter !== 'all') && (
              <Link href="/admin/tools" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
                Clear
              </Link>
            )}
          </form>

          {/* Tool list */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-5 py-3 border-b border-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <span className="w-9" />
              <span>Tool</span>
              <span className="text-right">Saved</span>
              <span className="text-right">Using</span>
              <span className="text-right">Rating</span>
              <span className="w-4" />
            </div>

            <div className="divide-y divide-gray-50">
              {(tools ?? []).length === 0 && (
                <div className="px-5 py-12 text-center text-gray-400 text-sm">
                  No tools found.
                </div>
              )}
              {(tools ?? []).map((tool) => {
                const cat = tool.category as unknown as { name: string } | null
                return (
                  <Link
                    key={tool.id}
                    href={`/admin/tools/${tool.slug}`}
                    className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-gray-50 transition-colors group"
                  >
                    {/* Logo */}
                    <div className="w-9 h-9 rounded-lg border border-gray-100 bg-white flex items-center justify-center shrink-0">
                      <ToolLogo src={tool.logo_url ?? ''} alt={tool.name} className="w-7 h-7 object-contain" />
                    </div>

                    {/* Name + badges */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900 group-hover:text-brand-600 transition-colors truncate">
                          {tool.name}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          tool.is_verified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {tool.is_verified ? '✓ Verified' : 'Unverified'}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${pricingColors[tool.pricing_model] ?? 'bg-gray-100 text-gray-600'}`}>
                          {pricingLabels[tool.pricing_model] ?? tool.pricing_model}
                        </span>
                        {cat && <span className="text-[10px] text-gray-400">{cat.name}</span>}
                      </div>
                    </div>

                    {/* Stats */}
                    <span className="text-sm text-gray-500 tabular-nums text-right w-14">{tool.save_count ?? 0}</span>
                    <span className="text-sm text-gray-500 tabular-nums text-right w-14">{tool.using_count ?? 0}</span>
                    <span className="text-sm text-gray-500 tabular-nums text-right w-20">
                      {(tool.review_count ?? 0) > 0
                        ? `★ ${Number(tool.rating_avg).toFixed(1)} (${tool.review_count})`
                        : '—'
                      }
                    </span>

                    {/* Arrow */}
                    <span className="text-gray-200 group-hover:text-brand-400 transition-colors text-sm">→</span>
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

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'
import ToolLogo from '@/components/tools/ToolLogo'
import { ELIGIBILITY_COLUMNS } from '@/lib/eligibility'

export const metadata: Metadata = {
  title: 'Browse Free Nonprofit Tools | Free For NonProfits',
  description: 'Discover 50+ free and discounted software tools for nonprofits — CRM, email, project management, design, and more.',
}

interface SearchParams {
  q?: string
  category?: string
  pricing?: string
  /** 'gated' = requires nonprofit status; 'open' = available to anyone. */
  access?: string
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

/** Preserve the other active filters when one of them changes. */
function buildHref(params: {
  q?: string
  category?: string
  pricing?: string
  access?: string
}): string {
  const sp = new URLSearchParams()
  if (params.q) sp.set('q', params.q)
  if (params.category) sp.set('category', params.category)
  if (params.pricing) sp.set('pricing', params.pricing)
  if (params.access) sp.set('access', params.access)
  const qs = sp.toString()
  return qs ? `/tools?${qs}` : '/tools'
}

export default async function ToolsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = await createClient()
  const { q, category, pricing, access } = searchParams

  // Fetch categories for filter sidebar
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, icon')
    .order('display_order')

  // Build tools query
  let query = supabase
    .from('tools')
    .select(ELIGIBILITY_COLUMNS)
    .eq('is_verified', true)

  if (access === 'gated') {
    query = query.eq('requires_nonprofit_status', true)
  } else if (access === 'open') {
    query = query.eq('requires_nonprofit_status', false)
  }

  if (category) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category)
      .single()
    if (cat) query = query.eq('category_id', cat.id)
  }

  if (pricing) {
    query = query.eq('pricing_model', pricing as 'free' | 'freemium' | 'nonprofit_discount')
  }

  if (q) {
    query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%,nonprofit_deal.ilike.%${q}%`)
  }

  const { data: tools } = await query
    .order('is_featured', { ascending: false })
    .order('rating_avg', { ascending: false })

  const activeCategory = categories?.find((c) => c.slug === category)

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {q ? `Results for "${q}"` : activeCategory ? `${activeCategory.icon} ${activeCategory.name}` : 'All Tools'}
          </h1>
          {/* "tools for nonprofits" is wrong when the filter is showing things
              that are explicitly not nonprofit-specific. */}
          <p className="mt-1 text-gray-500">
            {tools?.length ?? 0}{' '}
            {access === 'open'
              ? 'tools free to anyone'
              : access === 'gated'
                ? 'nonprofit programmes'
                : `${pricing === 'free' ? 'free ' : pricing === 'nonprofit_discount' ? 'discounted ' : ''}tools for nonprofits`}
          </p>

          {/* Access filter — the distinction that actually matters.
              A nonprofit programme you can be refused for is a different thing
              from a tool that is free to everyone, and the old UI showed them
              identically. */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Access
            </span>
            {[
              { key: undefined, label: 'Everything' },
              { key: 'gated', label: 'Nonprofit programmes' },
              { key: 'open', label: 'Free to anyone' },
            ].map((opt) => {
              const href = buildHref({ q, category, pricing, access: opt.key })
              const active = access === opt.key
              return (
                <Link
                  key={opt.label}
                  href={href}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? 'border-brand-500 bg-brand-500 text-white'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-brand-300'
                  }`}
                >
                  {opt.label}
                </Link>
              )
            })}
          </div>
          <p className="mt-2 max-w-prose text-sm text-gray-500">
            {access === 'gated'
              ? 'Programmes gated behind verified nonprofit status. There is an application, and it can be refused.'
              : access === 'open'
                ? 'Free or cheap to everyone. Being a nonprofit gets you nothing extra, and there is nothing to apply for.'
                : 'Some of these are nonprofit programmes you apply for. Others are free to anyone. Filter above to tell them apart.'}
          </p>

          {/* Quick pricing filters */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/tools"
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${!pricing && !category ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'}`}
            >
              All
            </Link>
            <Link
              href="/tools?pricing=free"
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${pricing === 'free' ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'}`}
            >
              🎁 Free
            </Link>
            <Link
              href="/tools?pricing=freemium"
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${pricing === 'freemium' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}
            >
              ⚡ Freemium
            </Link>
            <Link
              href="/tools?pricing=nonprofit_discount"
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${pricing === 'nonprofit_discount' ? 'bg-purple-500 text-white border-purple-500' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'}`}
            >
              💜 Nonprofit Discount
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Category sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Categories</p>
            <nav className="space-y-0.5">
              <Link
                href="/tools"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${!category ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <span>🗂️</span> All Categories
              </Link>
              {categories?.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/tools?category=${cat.slug}`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${category === cat.slug ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <span>{cat.icon}</span>
                  <span className="truncate">{cat.name}</span>
                </Link>
              ))}
            </nav>
          </aside>

          {/* Tools grid */}
          <div className="flex-1 min-w-0">
            {/* Mobile category chips */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
              {categories?.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/tools?category=${cat.slug}`}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${category === cat.slug ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-gray-600 border-gray-200'}`}
                >
                  {cat.icon} {cat.name}
                </Link>
              ))}
            </div>

            {!tools || tools.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No tools found</h3>
                <p className="text-gray-500 text-sm mb-4">Try a different search or category</p>
                <Link href="/tools" className="text-brand-500 font-medium hover:text-brand-700 transition-colors text-sm">
                  View all tools →
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {tools.map((tool) => (
                  <Link
                    key={tool.id}
                    href={`/tools/${tool.slug}`}
                    className="group bg-gray-50 rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:border-brand-200 hover:-translate-y-0.5 transition-all flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        {tool.logo_url ? (
                          <ToolLogo
                            src={tool.logo_url}
                            alt={tool.name}
                            className="w-10 h-10 rounded-xl object-contain border border-gray-100 p-1 bg-white shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
                            <span className="text-brand-700 font-bold text-sm">{tool.name[0]}</span>
                          </div>
                        )}
                        <h2 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors leading-tight">{tool.name}</h2>
                      </div>
                      <span className={`shrink-0 text-xs font-semibold px-2 py-1 rounded-full ${pricingColors[tool.pricing_model] ?? 'bg-gray-100 text-gray-700'}`}>
                        {pricingLabels[tool.pricing_model] ?? tool.pricing_model}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{tool.description}</p>

                    {/* Gated programmes get the emphasis. Tools that are free
                        to everyone are stated plainly instead of dressed up as
                        a nonprofit perk. */}
                    {tool.requires_nonprofit_status === false ? (
                      <div className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs leading-relaxed text-gray-600">
                        <span className="font-medium text-gray-700">Open to anyone</span>
                        {tool.nonprofit_deal ? ` — ${tool.nonprofit_deal}` : ''}
                      </div>
                    ) : tool.nonprofit_deal ? (
                      <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1.5 line-clamp-2 leading-relaxed">
                        🎁 {tool.nonprofit_deal}
                      </div>
                    ) : null}

                    <div className="flex items-center justify-between mt-auto pt-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {tool.review_count > 0 && (
                          <span className="text-xs text-gray-400">⭐ {Number(tool.rating_avg).toFixed(1)} ({tool.review_count})</span>
                        )}
                        {(tool.using_count > 0 || tool.save_count > 0) && (
                          <span className="text-xs text-gray-400">
                            {[
                              tool.using_count > 0 && `${tool.using_count} using`,
                              tool.save_count  > 0 && `${tool.save_count} saved`,
                            ].filter(Boolean).join(' · ')}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-brand-600 group-hover:translate-x-0.5 transition-transform shrink-0">
                        Learn more →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

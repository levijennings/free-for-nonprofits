import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Browse Free Nonprofit Tools | Free For NonProfits',
  description: 'Discover 50+ free and discounted software tools for nonprofits — CRM, email, project management, design, and more.',
}

interface SearchParams {
  q?: string
  category?: string
  pricing?: string
}

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

export default async function ToolsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = await createClient()
  const { q, category, pricing } = searchParams

  // Fetch categories for filter sidebar
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, icon')
    .order('display_order')

  // Build tools query
  let query = supabase
    .from('tools')
    .select(`
      id, name, slug, description, website_url, logo_url,
      pricing_model, nonprofit_deal, rating_avg, review_count, is_featured,
      category:categories(name, slug, icon)
    `)
    .eq('is_verified', true)

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
          <p className="mt-1 text-gray-500">
            {tools?.length ?? 0} {pricing === 'free' ? 'free' : pricing === 'nonprofit_discount' ? 'discounted' : ''} tools for nonprofits
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
                    className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-brand-200 transition-all flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        {tool.logo_url ? (
                          <img
                            src={tool.logo_url}
                            alt={tool.name}
                            className="w-10 h-10 rounded-xl object-contain border border-gray-100 p-1 bg-white shrink-0"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                            <span className="text-brand-500 font-bold text-sm">{tool.name[0]}</span>
                          </div>
                        )}
                        <h2 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors leading-tight">{tool.name}</h2>
                      </div>
                      <span className={`shrink-0 text-xs font-semibold px-2 py-1 rounded-full ${pricingColors[tool.pricing_model] ?? 'bg-gray-100 text-gray-700'}`}>
                        {pricingLabels[tool.pricing_model] ?? tool.pricing_model}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{tool.description}</p>

                    {tool.nonprofit_deal && (
                      <div className="text-xs text-green-700 bg-green-50 rounded-lg px-2.5 py-1.5 line-clamp-1">
                        🎁 {tool.nonprofit_deal}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-1">
                      {tool.review_count > 0 ? (
                        <span className="text-xs text-gray-400">⭐ {Number(tool.rating_avg).toFixed(1)} · {tool.review_count} reviews</span>
                      ) : (
                        <span className="text-xs text-gray-300">No reviews yet</span>
                      )}
                      <span className="text-xs font-medium text-brand-500 group-hover:translate-x-0.5 transition-transform">
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

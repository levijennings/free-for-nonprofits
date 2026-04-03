import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Browse Tools | Free For NonProfits',
  description: 'Discover free and discounted software tools for your nonprofit organization.',
}

export default async function ToolsPage() {
  const supabase = await createClient()

  const { data: tools } = await supabase
    .from('tools')
    .select(`
      id,
      name,
      slug,
      description,
      website_url,
      logo_url,
      pricing_model,
      nonprofit_deal,
      rating_avg,
      review_count,
      category:categories(name, slug)
    `)
    .eq('is_verified', true)
    .order('is_featured', { ascending: false })
    .order('rating_avg', { ascending: false })

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, icon')
    .order('display_order')

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

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900">Browse Tools</h1>
          <p className="mt-3 text-lg text-gray-600">
            {tools?.length ?? 0} free and discounted tools for nonprofits
          </p>
        </div>

        {categories && categories.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <span
                key={cat.slug}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-white border border-gray-200 text-gray-700"
              >
                {cat.icon} {cat.name}
              </span>
            ))}
          </div>
        )}

        {!tools || tools.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No tools found. Check back soon.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <a
                key={tool.id}
                href={tool.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {tool.logo_url && (
                      <img
                        src={tool.logo_url}
                        alt={tool.name}
                        className="w-10 h-10 rounded object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    )}
                    <h2 className="font-semibold text-gray-900">{tool.name}</h2>
                  </div>
                  <span className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full ${pricingColors[tool.pricing_model] ?? 'bg-gray-100 text-gray-700'}`}>
                    {pricingLabels[tool.pricing_model] ?? tool.pricing_model}
                  </span>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2">{tool.description}</p>

                {tool.nonprofit_deal && (
                  <p className="text-xs text-green-700 bg-green-50 rounded px-2 py-1">
                    🎁 {tool.nonprofit_deal}
                  </p>
                )}

                {tool.review_count > 0 && (
                  <div className="text-xs text-gray-400">
                    ⭐ {Number(tool.rating_avg).toFixed(1)} · {tool.review_count} review{tool.review_count !== 1 ? 's' : ''}
                  </div>
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ToolLogo from '@/components/tools/ToolLogo'

const pricingColors: Record<string, string> = {
  free: 'bg-green-100 text-green-800',
  freemium: 'bg-blue-100 text-blue-800',
  nonprofit_discount: 'bg-purple-100 text-purple-800',
}

const pricingLabels: Record<string, string> = {
  free: 'Free',
  freemium: 'Freemium',
  nonprofit_discount: 'Nonprofit Discount',
}

export default async function HomePage() {
  const supabase = await createClient()

  const { data: featuredTools } = await supabase
    .from('tools')
    .select('id, name, slug, description, logo_url, pricing_model, nonprofit_deal, category:categories(name, slug)')
    .eq('is_featured', true)
    .eq('is_verified', true)
    .limit(6)

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, icon')
    .order('display_order')
    .limit(8)

  const { count: toolCount } = await supabase
    .from('tools')
    .select('*', { count: 'exact', head: true })
    .eq('is_verified', true)

  return (
    <main>
      {/* Hero */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-6 border border-green-200">
            💰 Most nonprofits are leaving $50,000+/year on the table
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-gray-900 max-w-3xl mx-auto leading-tight">
            Free software your{' '}
            <span className="text-brand-500">nonprofit</span>{' '}
            already qualifies for
          </h1>
          <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Google gives nonprofits $10,000/month in free ads. Salesforce gives you 10 free licenses.
            Zendesk, Miro, Loom, and 50+ others are free or deeply discounted. Most nonprofit staff never find out.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 bg-brand-500 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors text-lg shadow-sm"
            >
              Get started free
            </Link>
            <Link
              href="/tools"
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-xl transition-colors text-lg border border-gray-200"
            >
              Browse tools →
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-400">
            Free forever · No credit card required
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-gray-50 border-b border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-green-600">$120K</p>
              <p className="text-sm text-gray-500 mt-1">Google Ad Grants/year</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600">$100K</p>
              <p className="text-sm text-gray-500 mt-1">Zendesk value, free</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{toolCount ?? '70'}+</p>
              <p className="text-sm text-gray-500 mt-1">Verified programs</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">$0</p>
              <p className="text-sm text-gray-500 mt-1">To access everything</p>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by category */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Browse by category</h2>
          <p className="text-gray-500 mb-8">Find tools for every part of your organization</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories?.map((cat) => (
              <Link
                key={cat.slug}
                href={`/tools?category=${cat.slug}`}
                className="group flex items-center gap-3 p-4 bg-gray-50 hover:bg-brand-50 border border-gray-100 hover:border-brand-200 rounded-2xl transition-all"
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-brand-700 transition-colors">{cat.name}</span>
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/tools" className="text-brand-500 font-medium hover:text-brand-700 transition-colors text-sm">
              View all 12 categories →
            </Link>
          </div>
        </div>
      </section>

      {/* Featured tools */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured tools</h2>
              <p className="text-gray-500 mt-1">Curated picks trusted by nonprofits worldwide</p>
            </div>
            <Link href="/tools" className="hidden sm:block text-brand-500 font-medium hover:text-brand-700 transition-colors text-sm">
              View all →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredTools?.map((tool) => (
              <Link
                key={tool.id}
                href={`/tools/${tool.slug}`}
                className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-brand-200 transition-all flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    {tool.logo_url ? (
                      <ToolLogo
                        src={tool.logo_url}
                        alt={tool.name}
                        className="w-10 h-10 rounded-xl object-contain border border-gray-100 p-1 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                        <span className="text-brand-500 font-bold text-sm">{tool.name[0]}</span>
                      </div>
                    )}
                    <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">{tool.name}</h3>
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

                <div className="mt-auto flex justify-end">
                  <span className="text-xs font-medium text-brand-500 group-hover:translate-x-0.5 transition-transform">
                    Learn more →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/tools"
              className="inline-block px-8 py-3 bg-brand-500 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors"
            >
              Browse all {toolCount ?? '50'}+ tools →
            </Link>
          </div>
        </div>
      </section>

      {/* Value prop / CTA */}
      <section className="py-20 bg-brand-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Your nonprofit deserves great software
          </h2>
          <p className="text-brand-100 text-xl mb-10 leading-relaxed">
            Create a free account to save tools, track what your team uses, and get notified
            when new nonprofit deals are added.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-white hover:bg-gray-50 text-brand-600 font-bold rounded-xl transition-colors text-lg shadow-sm"
            >
              Create free account
            </Link>
            <Link
              href="/tools"
              className="px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors text-lg border border-brand-400"
            >
              Browse tools first
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

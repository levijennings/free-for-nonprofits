import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ToolLogo from '@/components/tools/ToolLogo'
import EligibilityHero from '@/components/eligibility/EligibilityHero'

const pricingColors: Record<string, string> = {
  free: 'bg-emerald-100 text-emerald-800',
  freemium: 'bg-blue-100 text-blue-800',
  nonprofit_discount: 'bg-purple-100 text-purple-800',
}

const pricingLabels: Record<string, string> = {
  free: 'Free',
  freemium: 'Freemium',
  nonprofit_discount: 'Nonprofit Discount',
}

// Each category type gets a distinct color so the grid reads as varied, not uniform
const categoryIconColors: Record<string, string> = {
  'crm-donor-management':    'bg-blue-100 text-blue-600',
  'fundraising-payments':    'bg-amber-100 text-amber-600',
  'email-marketing':         'bg-orange-100 text-orange-600',
  'project-management':      'bg-teal-100 text-teal-600',
  'accounting-finance':      'bg-emerald-100 text-emerald-700',
  'website-cms':             'bg-indigo-100 text-indigo-600',
  'communication-chat':      'bg-violet-100 text-violet-600',
  'design-graphics':         'bg-pink-100 text-pink-600',
  'grant-research-funding':  'bg-yellow-100 text-yellow-700',
  'learning-training':       'bg-cyan-100 text-cyan-700',
  'pro-bono-services':       'bg-lime-100 text-lime-700',
  'advertising-media':       'bg-rose-100 text-rose-600',
  'data-analytics':          'bg-purple-100 text-purple-600',
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

  // The subset that actually gates on nonprofit status — i.e. the rows where
  // "do I qualify?" is a real question. Counted live so the hero can never
  // state a number the catalogue does not support.
  const { count: gatedCount } = await supabase
    .from('tools')
    .select('*', { count: 'exact', head: true })
    .eq('is_verified', true)
    .eq('requires_nonprofit_status', true)

  return (
    <main>
      {/* Hero — the qualifier itself, not a claim about it. Answers route to
          /eligibility, which owns the results surface. */}
      <EligibilityHero toolCount={toolCount ?? null} gatedCount={gatedCount ?? null} />

      {/* Browse by category */}
      <section className="py-12 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-fg">Find resources by type</h2>
            <p className="text-fg-muted mt-1">Software, grants, training, pro bono services, and more</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories?.map((cat) => {
              const iconColor = categoryIconColors[cat.slug] ?? 'bg-surface-inset text-fg-muted'
              return (
                <Link
                  key={cat.slug}
                  href={`/tools?category=${cat.slug}`}
                  className="group flex items-center gap-3 p-3.5 bg-surface hover:bg-surface-subtle border border-line hover:border-line-strong rounded-xl transition-all hover:shadow-1"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-lg ${iconColor}`}>
                    {cat.icon}
                  </div>
                  <span className="text-sm font-semibold text-fg-muted group-hover:text-fg transition-colors leading-tight">{cat.name}</span>
                </Link>
              )
            })}
          </div>
          <div className="mt-5">
            <Link href="/tools" className="text-accent font-semibold hover:text-accent-hover transition-colors text-sm">
              View all categories →
            </Link>
          </div>
        </div>
      </section>

      {/* Featured resources */}
      <section className="py-12 bg-surface-subtle border-t border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-fg">Featured resources</h2>
              <p className="text-fg-muted mt-1">Curated picks trusted by nonprofits worldwide</p>
            </div>
            <Link href="/tools" className="hidden sm:block text-accent font-semibold hover:text-accent-hover transition-colors text-sm shrink-0 ml-4">
              View all →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredTools?.map((tool) => (
              <Link
                key={tool.id}
                href={`/tools/${tool.slug}`}
                className="group bg-surface rounded-xl border border-line p-5 hover:shadow-2 hover:border-accent-line hover:-translate-y-0.5 transition-all flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    {tool.logo_url ? (
                      <ToolLogo
                        src={tool.logo_url}
                        alt={tool.name}
                        className="w-10 h-10 rounded-lg object-contain border border-line p-1 bg-surface shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-accent-subtle flex items-center justify-center shrink-0">
                        <span className="text-accent font-bold text-sm">{tool.name[0]}</span>
                      </div>
                    )}
                    <h3 className="font-semibold text-fg group-hover:text-accent transition-colors leading-tight">{tool.name}</h3>
                  </div>
                  <span className={`shrink-0 text-xs font-semibold px-2 py-1 rounded-full ${pricingColors[tool.pricing_model] ?? 'bg-surface-inset text-fg-muted'}`}>
                    {pricingLabels[tool.pricing_model] ?? tool.pricing_model}
                  </span>
                </div>

                <p className="text-sm text-fg-subtle line-clamp-2 leading-relaxed">{tool.description}</p>

                {tool.nonprofit_deal && (
                  <div className="text-xs text-accent bg-accent-subtle border border-accent-line rounded-lg px-2.5 py-1.5 line-clamp-2 leading-relaxed">
                    🎁 {tool.nonprofit_deal}
                  </div>
                )}

                <div className="mt-auto flex justify-end">
                  <span className="text-xs font-semibold text-accent group-hover:translate-x-0.5 transition-transform">
                    Learn more →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8">
            <Link
              href="/tools"
              className="inline-block px-7 py-3 bg-accent hover:bg-accent-hover text-accent-fg font-bold rounded-xl transition-all shadow-1 hover:shadow-2 hover:-translate-y-0.5"
            >
              Browse all {toolCount ?? '89'}+ resources →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-accent to-accent-hover">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-accent-fg mb-4">
            Your nonprofit deserves great software
          </h2>
          <p className="text-accent-fg/85 text-lg mb-10 leading-relaxed max-w-2xl mx-auto">
            Create a free account to save resources, track what your team uses, and get notified
            when new nonprofit deals are added.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-surface hover:bg-surface-subtle text-accent font-bold rounded-xl transition-all text-lg shadow-2 hover:shadow-3 hover:-translate-y-0.5"
            >
              Create free account
            </Link>
            <Link
              href="/tools"
              className="px-8 py-4 bg-accent-fg/10 hover:bg-accent-fg/20 text-accent-fg font-semibold rounded-xl transition-colors text-lg border border-accent-fg/25"
            >
              Browse resources first
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

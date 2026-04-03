import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/nav/Header'

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

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch saved tools
  const { data: savedTools } = await supabase
    .from('saved_tools')
    .select(`
      id,
      created_at,
      tool:tools(id, name, slug, description, logo_url, pricing_model, nonprofit_deal, website_url)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch featured tools to discover
  const { data: featuredTools } = await supabase
    .from('tools')
    .select('id, name, slug, description, logo_url, pricing_model, nonprofit_deal')
    .eq('is_featured', true)
    .eq('is_verified', true)
    .limit(6)

  const displayName = profile?.display_name || user.email?.split('@')[0] || 'there'
  const orgName = profile?.org_name

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Welcome header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {displayName} 👋
            </h1>
            {orgName && (
              <p className="mt-1 text-gray-500">{orgName}</p>
            )}
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-3xl font-bold text-brand-600">{savedTools?.length ?? 0}</p>
              <p className="text-sm text-gray-500 mt-1">Saved tools</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-3xl font-bold text-green-600">50+</p>
              <p className="text-sm text-gray-500 mt-1">Tools available</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 hidden sm:block">
              <p className="text-3xl font-bold text-purple-600">12</p>
              <p className="text-sm text-gray-500 mt-1">Categories</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Saved tools */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Your saved tools</h2>
                <Link href="/tools" className="text-sm text-brand-500 hover:text-brand-700 font-medium transition-colors">
                  Browse more →
                </Link>
              </div>

              {!savedTools || savedTools.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                  <div className="text-4xl mb-3">🔖</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved tools yet</h3>
                  <p className="text-gray-500 text-sm mb-5">
                    Browse our directory and save tools you want to explore for your organization.
                  </p>
                  <Link
                    href="/tools"
                    className="inline-block px-5 py-2.5 bg-brand-500 hover:bg-brand-700 text-white font-medium rounded-xl transition-colors text-sm"
                  >
                    Browse all tools
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedTools.map((saved) => {
                    const tool = saved.tool as unknown as {
                      id: string; name: string; slug: string; description: string;
                      logo_url: string; pricing_model: string; nonprofit_deal: string; website_url: string;
                    }
                    if (!tool) return null
                    return (
                      <div key={saved.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-start gap-4">
                        {tool.logo_url ? (
                          <img src={tool.logo_url} alt={tool.name} className="w-11 h-11 rounded-xl object-contain border border-gray-100 p-1 shrink-0" />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                            <span className="text-brand-500 font-bold">{tool.name[0]}</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link href={`/tools/${tool.slug}`} className="font-semibold text-gray-900 hover:text-brand-600 transition-colors">
                              {tool.name}
                            </Link>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${pricingColors[tool.pricing_model] ?? 'bg-gray-100 text-gray-700'}`}>
                              {pricingLabels[tool.pricing_model] ?? tool.pricing_model}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{tool.description}</p>
                          {tool.nonprofit_deal && (
                            <p className="text-xs text-green-700 mt-1">🎁 {tool.nonprofit_deal}</p>
                          )}
                        </div>
                        <a
                          href={tool.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 px-3 py-1.5 text-xs font-medium text-brand-600 hover:text-brand-800 border border-brand-200 hover:border-brand-400 rounded-lg transition-colors"
                        >
                          Visit →
                        </a>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Sidebar: discover + account */}
            <div className="space-y-6">
              {/* Discover featured tools */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Featured tools</h3>
                <div className="space-y-3">
                  {featuredTools?.map((tool) => (
                    <Link
                      key={tool.id}
                      href={`/tools/${tool.slug}`}
                      className="flex items-center gap-3 group"
                    >
                      {tool.logo_url ? (
                        <img src={tool.logo_url} alt={tool.name} className="w-8 h-8 rounded-lg object-contain border border-gray-100 p-0.5 shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                          <span className="text-brand-500 font-bold text-xs">{tool.name[0]}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-brand-600 transition-colors truncate">{tool.name}</p>
                        <p className="text-xs text-gray-400">{pricingLabels[tool.pricing_model]}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link href="/tools" className="block mt-4 text-center text-sm text-brand-500 hover:text-brand-700 font-medium transition-colors">
                  View all tools →
                </Link>
              </div>

              {/* Account info */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Your account</h3>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-xs text-gray-400 mb-0.5">Email</dt>
                    <dd className="text-gray-900 font-medium truncate">{user.email}</dd>
                  </div>
                  {orgName && (
                    <div>
                      <dt className="text-xs text-gray-400 mb-0.5">Organization</dt>
                      <dd className="text-gray-900 font-medium">{orgName}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-xs text-gray-400 mb-0.5">Member since</dt>
                    <dd className="text-gray-900 font-medium">
                      {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

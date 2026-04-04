export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/nav/Header'
import PreferencesForm from '@/components/preferences/PreferencesForm'

export default async function PreferencesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('category_slugs, pricing_models, notify_new_tools')
    .eq('user_id', user.id)
    .maybeSingle()

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          <div className="flex items-center gap-3 mb-8">
            <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">← Dashboard</Link>
            <span className="text-gray-200">/</span>
            <h1 className="text-2xl font-bold text-gray-900">Tool Preferences</h1>
          </div>

          <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5 mb-6">
            <p className="text-sm text-brand-800 leading-relaxed">
              <strong>How this works:</strong> Select the categories and pricing types you care about. Whenever we add a tool that matches, we'll email you. No spam — only tools that fit your interests.
            </p>
          </div>

          <PreferencesForm
            initial={{
              category_slugs: prefs?.category_slugs ?? [],
              pricing_models: prefs?.pricing_models ?? [],
              notify_new_tools: prefs?.notify_new_tools ?? true,
            }}
          />

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-3">Want something specific that isn't in the directory yet?</p>
            <Link
              href="/wishlist"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-800 transition-colors"
            >
              🗳️ Go to the Community Wishlist →
            </Link>
          </div>

        </div>
      </main>
    </>
  )
}

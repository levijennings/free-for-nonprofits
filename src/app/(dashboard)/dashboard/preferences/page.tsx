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
      <main className="min-h-screen bg-surface-subtle">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          <div className="flex items-center gap-3 mb-8">
            <Link href="/dashboard" className="text-sm text-fg-subtle hover:text-fg-muted transition-colors">← Dashboard</Link>
            <span className="text-line-strong">/</span>
            <h1 className="text-2xl font-bold text-fg">Tool Preferences</h1>
          </div>

          <div className="bg-accent-subtle border border-accent-line rounded-2xl p-5 mb-6">
            <p className="text-sm text-accent leading-relaxed">
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

          <div className="mt-8 bg-surface border border-line rounded-2xl p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-fg">Get better recommendations</p>
              <p className="text-sm text-fg-subtle">Answer a few optional questions to tailor the tools we suggest and your weekly roundup.</p>
            </div>
            <Link
              href="/dashboard/survey"
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-accent-fg text-sm font-semibold rounded-xl transition-colors"
            >
              Personalize →
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-line">
            <p className="text-sm text-fg-subtle mb-3">Want something specific that isn't in the directory yet?</p>
            <Link
              href="/wishlist"
              className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-hover transition-colors"
            >
              🗳️ Go to the Community Wishlist →
            </Link>
          </div>

        </div>
      </main>
    </>
  )
}

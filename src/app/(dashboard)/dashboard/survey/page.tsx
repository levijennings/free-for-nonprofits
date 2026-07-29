export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/nav/Header'
import SurveyForm, { type SurveyData } from '@/components/survey/SurveyForm'

export const metadata = {
  title: 'Personalize your recommendations — Free For NonProfits',
}

const EMPTY: SurveyData = {
  mission_area: '',
  team_size: '',
  need_areas: [],
  current_tools: '',
  pain_points: '',
  role: '',
  budget: '',
}

export default async function SurveyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('user_survey')
    .select('mission_area, team_size, need_areas, current_tools, pain_points, role, budget')
    .eq('user_id', user.id)
    .maybeSingle()

  const initial: SurveyData = { ...EMPTY, ...(data ?? {}) }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-surface-subtle">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/dashboard" className="text-sm text-fg-subtle hover:text-fg-muted transition-colors">← Dashboard</Link>
            <span className="text-line-strong">/</span>
            <h1 className="text-2xl font-bold text-fg">Personalize recommendations</h1>
          </div>

          <div className="bg-accent-subtle border border-accent-line rounded-2xl p-5 mb-6">
            <p className="text-sm text-accent leading-relaxed">
              A few optional questions help us recommend the right tools and tailor your weekly roundup. Everything here is optional — answer what's useful.
            </p>
          </div>

          <SurveyForm initial={initial} />
        </div>
      </main>
    </>
  )
}

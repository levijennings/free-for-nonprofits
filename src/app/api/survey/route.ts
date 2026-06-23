import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const VALID_CATEGORIES = [
  'crm-donor-management', 'fundraising-payments', 'email-marketing',
  'project-management', 'accounting-finance', 'website-cms',
  'communication-chat', 'design-graphics', 'grant-research-funding',
  'learning-training', 'pro-bono-services', 'advertising-media',
]

const EMPTY = {
  mission_area: '',
  team_size: '',
  need_areas: [] as string[],
  current_tools: '',
  pain_points: '',
  role: '',
  budget: '',
}

// GET /api/survey — current user's survey
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('user_survey')
    .select('mission_area, team_size, need_areas, current_tools, pain_points, role, budget')
    .eq('user_id', user.id)
    .maybeSingle()

  return Response.json({ survey: data ?? EMPTY })
}

// PATCH /api/survey — upsert survey + merge need areas into category preferences
export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const clip = (v: unknown, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) || null : null)
  const needAreas = Array.isArray(body.need_areas)
    ? body.need_areas.filter((c: string) => VALID_CATEGORIES.includes(c))
    : []

  const { error } = await supabase.from('user_survey').upsert({
    user_id: user.id,
    mission_area: clip(body.mission_area, 80),
    team_size: clip(body.team_size, 40),
    need_areas: needAreas,
    current_tools: clip(body.current_tools, 500),
    pain_points: clip(body.pain_points, 500),
    role: clip(body.role, 60),
    budget: clip(body.budget, 40),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Fold the survey's need areas into category preferences so the existing
  // recommendation + weekly-digest targeting picks them up immediately.
  if (needAreas.length) {
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('category_slugs, pricing_models, notify_new_tools')
      .eq('user_id', user.id)
      .maybeSingle()
    const merged = Array.from(new Set([...(prefs?.category_slugs ?? []), ...needAreas]))
    await supabase.from('user_preferences').upsert({
      user_id: user.id,
      category_slugs: merged,
      pricing_models: prefs?.pricing_models ?? [],
      notify_new_tools: prefs?.notify_new_tools ?? true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
  }

  return Response.json({ ok: true })
}

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const VALID_PRICING = ['free', 'freemium', 'nonprofit_discount', 'paid']
const VALID_CATEGORIES = [
  'crm-donor-management', 'fundraising-payments', 'email-marketing',
  'project-management', 'accounting-finance', 'website-cms',
  'communication-chat', 'design-graphics', 'grant-research-funding',
  'learning-training', 'pro-bono-services', 'advertising-media',
]

// GET /api/preferences — get current user's preferences
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('user_preferences')
    .select('category_slugs, pricing_models, notify_new_tools')
    .eq('user_id', user.id)
    .maybeSingle()

  return Response.json({
    preferences: data ?? {
      category_slugs: [],
      pricing_models: [],
      notify_new_tools: true,
    },
  })
}

// PATCH /api/preferences — upsert preferences
export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { category_slugs, pricing_models, notify_new_tools } = body

  // Validate
  const validCats = Array.isArray(category_slugs)
    ? category_slugs.filter((c: string) => VALID_CATEGORIES.includes(c))
    : []
  const validPricing = Array.isArray(pricing_models)
    ? pricing_models.filter((p: string) => VALID_PRICING.includes(p))
    : []

  const { error } = await supabase.from('user_preferences').upsert({
    user_id: user.id,
    category_slugs: validCats,
    pricing_models: validPricing,
    notify_new_tools: typeof notify_new_tools === 'boolean' ? notify_new_tools : true,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ ok: true })
}

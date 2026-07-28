import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyTurnstile, getClientIp } from '@/lib/captcha'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const body = await request.json()
  const { name, website_url, category_slug, pricing_model, description, nonprofit_deal, captchaToken } = body

  const ip = getClientIp(request)
  if (!(await verifyTurnstile(captchaToken, ip))) {
    return NextResponse.json({ error: 'Captcha verification failed. Please try again.' }, { status: 400 })
  }

  if (!name?.trim() || !website_url?.trim() || !description?.trim()) {
    return NextResponse.json({ error: 'Name, website URL, and description are required' }, { status: 400 })
  }

  // Insert with the service-role client so direct anonymous REST inserts can be
  // locked down via RLS (the captcha check above is the gate for this route).
  const admin = createAdminClient()
  const { error } = await admin.from('tool_submissions').insert({
    submitted_by: user?.id ?? null,
    name: name.trim(),
    website_url: website_url.trim(),
    category_slug: category_slug || null,
    pricing_model: pricing_model || null,
    description: description.trim(),
    nonprofit_deal: nonprofit_deal?.trim() || null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

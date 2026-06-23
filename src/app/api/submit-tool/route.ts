import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY

// Verifies a Cloudflare Turnstile token. If no secret is configured, captcha is
// not active yet, so we allow the request through (form behaves as before).
async function verifyCaptcha(token: string | undefined, ip: string | null): Promise<boolean> {
  if (!TURNSTILE_SECRET) return true
  if (!token) return false
  try {
    const form = new URLSearchParams()
    form.append('secret', TURNSTILE_SECRET)
    form.append('response', token)
    if (ip) form.append('remoteip', ip)
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form,
    })
    const data = (await res.json()) as { success: boolean }
    return data.success === true
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const body = await request.json()
  const { name, website_url, category_slug, pricing_model, description, nonprofit_deal, captchaToken } = body

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
  if (!(await verifyCaptcha(captchaToken, ip))) {
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

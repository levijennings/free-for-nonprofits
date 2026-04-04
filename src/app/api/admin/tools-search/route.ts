import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ADMIN_EMAIL } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const q = req.nextUrl.searchParams.get('q') ?? ''
  const { data } = await supabase
    .from('tools')
    .select('id, name, slug, logo_url, pricing_model')
    .eq('is_verified', true)
    .ilike('name', `%${q}%`)
    .order('name')
    .limit(10)

  return NextResponse.json({ data: data ?? [] })
}

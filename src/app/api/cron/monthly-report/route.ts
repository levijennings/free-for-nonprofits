import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, ADMIN_EMAIL } from '@/lib/supabase/admin'
import { sendMonthlyReportEmail, type MonthlyStats } from '@/lib/email'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return req.headers.get('authorization') === `Bearer ${secret}`
}

async function run(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dryRun = new URL(req.url).searchParams.get('dryRun') === '1'
  const admin = createAdminClient()

  // Idempotency: at most one report per ~month (safe for cron retries).
  if (!dryRun) {
    const twentyDaysAgo = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    const { data: recent } = await admin
      .from('agent_runs')
      .select('id')
      .eq('kind', 'monthly_report')
      .eq('status', 'success')
      .gte('created_at', twentyDaysAgo)
      .limit(1)
    if (recent && recent.length) {
      return NextResponse.json({ ok: true, alreadySent: true })
    }
  }

  const { data: stats, error } = await admin.rpc('monthly_report_stats')
  if (error || !stats) {
    return NextResponse.json({ error: error?.message ?? 'no stats' }, { status: 500 })
  }

  if (dryRun) {
    return NextResponse.json({ ok: true, dryRun: true, stats })
  }

  try {
    await sendMonthlyReportEmail({ toEmail: ADMIN_EMAIL, stats: stats as MonthlyStats })
  } catch (e) {
    await admin.from('agent_runs').insert({ kind: 'monthly_report', status: 'error', detail: String(e) })
    return NextResponse.json({ error: 'send failed' }, { status: 500 })
  }

  await admin.from('agent_runs').insert({ kind: 'monthly_report', status: 'success', summary: stats })
  return NextResponse.json({ ok: true, sentTo: ADMIN_EMAIL })
}

export const GET = run
export const POST = run

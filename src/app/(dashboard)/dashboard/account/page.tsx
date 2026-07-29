export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/nav/Header'
import AccountForm from '@/components/account/AccountForm'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, org_name, org_size')
    .eq('id', user.id)
    .maybeSingle()

  return (
    <>
      <Header />
      <main className="min-h-screen bg-surface-subtle">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          <div className="flex items-center gap-3 mb-8">
            <Link href="/dashboard" className="text-sm text-fg-subtle hover:text-fg-muted transition-colors">← Dashboard</Link>
            <span className="text-line-strong">/</span>
            <h1 className="text-2xl font-bold text-fg">Account</h1>
          </div>

          <div className="bg-surface rounded-2xl border border-line p-5 mb-6">
            <p className="text-sm text-fg-subtle">
              <strong className="text-fg-muted">Email:</strong> {user.email}
            </p>
          </div>

          <AccountForm
            initial={{
              display_name: profile?.display_name ?? '',
              org_name: profile?.org_name ?? '',
              org_size: profile?.org_size ?? '',
            }}
          />

        </div>
      </main>
    </>
  )
}

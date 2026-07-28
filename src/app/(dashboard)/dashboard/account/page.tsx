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
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          <div className="flex items-center gap-3 mb-8">
            <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">← Dashboard</Link>
            <span className="text-gray-200">/</span>
            <h1 className="text-2xl font-bold text-gray-900">Account</h1>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
            <p className="text-sm text-gray-500">
              <strong className="text-gray-700">Email:</strong> {user.email}
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

export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient, isAdminEmail } from '@/lib/supabase/admin'
import Header from '@/components/nav/Header'
import DeleteUserButton from '@/components/admin/DeleteUserButton'

const orgSizeLabels: Record<string, string> = {
  small:  '1–10',
  medium: '11–50',
  large:  '50+',
}

function avatarColor(id: string) {
  const palette = [
    'bg-brand-100 text-brand-700',
    'bg-purple-100 text-purple-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-teal-100 text-teal-700',
    'bg-blue-100 text-blue-700',
  ]
  return palette[id.charCodeAt(0) % palette.length]
}

interface MergedUser {
  id: string
  email: string
  authCreatedAt: string
  emailConfirmed: boolean
  lastSignInAt: string | null
  displayName: string | null
  orgName: string | null
  orgSize: string | null
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string; sort?: string }
}) {
  const supabase = await createClient()
  const { data: { user: adminUser } } = await supabase.auth.getUser()
  if (!adminUser || !isAdminEmail(adminUser.email)) redirect('/dashboard')

  const admin = createAdminClient()

  const q    = searchParams.q ?? ''
  const sort = searchParams.sort ?? 'newest'

  // Source of truth is auth.users — this also surfaces accounts that never
  // got a profile row (e.g. unconfirmed / bot signups), which a profiles-only
  // query would otherwise hide entirely.
  // NOTE: capped at 1000 accounts per page of the admin API; if the user base
  // grows past that, this will need real pagination against listUsers().
  const [{ data: userPage }, { data: profiles }] = await Promise.all([
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    admin.from('profiles').select('id, display_name, org_name, org_size'),
  ])

  const profileById = new Map((profiles ?? []).map(p => [p.id, p]))

  let users: MergedUser[] = (userPage?.users ?? []).map(u => {
    const profile = profileById.get(u.id)
    return {
      id: u.id,
      email: u.email ?? '',
      authCreatedAt: u.created_at,
      emailConfirmed: !!u.email_confirmed_at,
      lastSignInAt: u.last_sign_in_at ?? null,
      displayName: profile?.display_name ?? null,
      orgName: profile?.org_name ?? null,
      orgSize: profile?.org_size ?? null,
    }
  })

  if (q) {
    const needle = q.toLowerCase()
    users = users.filter(u =>
      u.email.toLowerCase().includes(needle) ||
      (u.displayName ?? '').toLowerCase().includes(needle) ||
      (u.orgName ?? '').toLowerCase().includes(needle)
    )
  }

  users = sort === 'name'
    ? users.sort((a, b) => (a.orgName || a.displayName || a.email).localeCompare(b.orgName || b.displayName || b.email))
    : users.sort((a, b) => new Date(b.authCreatedAt).getTime() - new Date(a.authCreatedAt).getTime())

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Breadcrumb + header */}
          <div className="flex items-center gap-3 mb-8">
            <Link href="/admin" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">← Admin</Link>
            <span className="text-gray-200">/</span>
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <span className="text-sm text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{users.length}</span>
          </div>

          {/* Filter bar */}
          <form method="GET" className="flex flex-wrap items-center gap-3 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <input
                name="q"
                defaultValue={q}
                placeholder="Search by name, org, or email…"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-300"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <select
              name="sort"
              defaultValue={sort}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white"
            >
              <option value="newest">Sort: Newest first</option>
              <option value="name">Sort: Name A–Z</option>
            </select>

            <button
              type="submit"
              className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Apply
            </button>

            {(q || sort !== 'newest') && (
              <Link href="/admin/users" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
                Clear
              </Link>
            )}
          </form>

          {/* User list */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-50">
              {users.length === 0 && (
                <div className="px-5 py-12 text-center text-gray-400 text-sm">
                  No users found.
                </div>
              )}
              {users.map(u => {
                const label    = u.orgName || u.displayName || u.email || 'Anonymous'
                const initials = label.slice(0, 2).toUpperCase()
                const daysAgo  = Math.floor((Date.now() - new Date(u.authCreatedAt).getTime()) / (1000 * 60 * 60 * 24))
                const joinedLabel =
                  daysAgo === 0 ? 'Today' :
                  daysAgo === 1 ? 'Yesterday' :
                  daysAgo < 30  ? `${daysAgo}d ago` :
                  new Date(u.authCreatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

                const canDelete = u.id !== adminUser.id && !isAdminEmail(u.email)

                return (
                  <div key={u.id} className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors group">
                    <Link
                      href={`/admin/users/${u.id}`}
                      className="flex items-center gap-4 flex-1 min-w-0"
                    >
                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${avatarColor(u.id)}`}>
                        {initials}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-brand-600 transition-colors truncate">
                          {label}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {u.orgName && u.displayName && (
                            <span className="text-xs text-gray-400">{u.displayName}</span>
                          )}
                          {u.orgSize && (
                            <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                              {orgSizeLabels[u.orgSize] ?? u.orgSize} people
                            </span>
                          )}
                          {!u.emailConfirmed && (
                            <span className="text-xs bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full">
                              Unconfirmed
                            </span>
                          )}
                          {!u.lastSignInAt && (
                            <span className="text-xs bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full">
                              Never signed in
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Join date */}
                      <div className="text-right shrink-0">
                        <p className="text-xs text-gray-400">{joinedLabel}</p>
                      </div>

                      {/* Arrow */}
                      <span className="text-gray-200 group-hover:text-brand-400 transition-colors">→</span>
                    </Link>

                    {canDelete && (
                      <DeleteUserButton userId={u.id} label={u.email || label} compact />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </main>
    </>
  )
}

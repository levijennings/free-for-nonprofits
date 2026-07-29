import { createClient } from '@/lib/supabase/server'
import WishlistClient from '@/components/wishlist/WishlistClient'

export const metadata = {
  title: 'Tool Wishlist — Free For NonProfits',
  description: 'Request tools you want added to the directory. Upvote what others have asked for. We add the most-wanted tools first.',
}

export const dynamic = 'force-dynamic'

export default async function WishlistPage() {
  const supabase = await createClient()

  const [
    { data: { user } },
    { data: requestsRaw },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('tool_requests')
      .select('id, name, url, category_slug, description, status, vote_count, created_at, user_id, admin_response')
      .order('vote_count', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(100),
  ])

  // Get this user's votes
  let votedIds: string[] = []
  if (user && requestsRaw && requestsRaw.length > 0) {
    const { data: votes } = await supabase
      .from('tool_request_votes')
      .select('request_id')
      .eq('user_id', user.id)
      .in('request_id', requestsRaw.map(r => r.id))
    votedIds = (votes ?? []).map(v => v.request_id)
  }

  const requests = (requestsRaw ?? []).map(r => ({
    ...r,
    voted: votedIds.includes(r.id),
    is_own: user ? r.user_id === user.id : false,
  }))

  return (
    <main className="min-h-screen bg-surface-subtle">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Page header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-accent-subtle text-accent text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-widest">
              🗳️ Community Wishlist
            </div>
            <h1 className="text-4xl font-extrabold text-fg mb-3">
              What tools do you need?
            </h1>
            <p className="text-lg text-fg-muted max-w-xl mx-auto">
              Request tools you want added to the directory. Upvote what others have asked for — we add the most-wanted tools first.
            </p>
          </div>

          <WishlistClient
            initialRequests={requests}
            userId={user?.id ?? null}
          />
        </div>
    </main>
  )
}

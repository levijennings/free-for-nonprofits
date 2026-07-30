import { createClient } from '@/lib/supabase/server'
import HeaderNav from './HeaderNav'

/**
 * Server component. It resolves auth state on the server and hands the client
 * island a single boolean, so `@supabase/supabase-js` — RealtimeClient
 * (websockets), postgrest and storage, ~59 kB gzipped — never reaches the
 * browser bundle for a page that only wanted to know whether someone is
 * signed in.
 *
 * `signedIn` is optional so the ten dashboard/admin pages that render
 * `<Header />` directly keep working unchanged; those routes are already
 * `force-dynamic`, so the extra `getUser()` costs them nothing. Layouts that
 * already resolve the user (see `(marketing)/layout.tsx`) pass it in and avoid
 * a second round trip.
 *
 * Only a boolean crosses the boundary: nothing in the header renders the
 * user's email or id, and shipping the full User object would put the JWT
 * subject and metadata into the RSC payload of every public page.
 */
export default async function Header({ signedIn }: { signedIn?: boolean }) {
  let resolved = signedIn

  if (resolved === undefined) {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    resolved = data.user !== null
  }

  return <HeaderNav signedIn={resolved} />
}

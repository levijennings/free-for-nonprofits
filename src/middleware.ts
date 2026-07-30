import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

/**
 * `api` is excluded: every route handler under /api builds its own server
 * client and calls `auth.getUser()` (or checks CRON_SECRET) before it does
 * anything, so middleware was paying a second round trip to the Supabase auth
 * server on every API request for a session the handler then re-verified.
 * Handlers refresh the session cookie themselves — a route handler can write
 * cookies, unlike a server component — so nothing depends on middleware here.
 *
 * /auth/callback is NOT under /api and still runs through middleware.
 */
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

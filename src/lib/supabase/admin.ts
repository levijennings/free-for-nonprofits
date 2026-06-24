import { createClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client — bypasses RLS.
 * Only use in server-side code (API routes, server actions).
 * Never expose to the browser.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// Primary admin (used as the monthly-report recipient).
export const ADMIN_EMAIL = 'levi.jennings@me.com'

// All emails granted admin access. Add or remove here.
export const ADMIN_EMAILS = ['levi.jennings@me.com', 'levi@dvlmnt.com']

// Case-insensitive admin check used by every email-gated admin route.
export function isAdminEmail(email?: string | null): boolean {
  return !!email && ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(email.toLowerCase())
}

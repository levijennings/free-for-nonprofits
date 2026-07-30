'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Sign-out used to run in the browser via the Supabase JS client, which is why
 * the header pulled 59 kB gzipped (realtime + postgrest + storage) into the
 * shared chunk of every public page. The session lives in cookies, so the
 * server can clear it just as well — and this is the only auth API the header
 * still needs.
 *
 * `revalidatePath('/', 'layout')` clears the client Router Cache so the
 * server-rendered header on every cached segment is re-fetched signed-out;
 * without it the redirect below could land on a cached tree still showing
 * "Dashboard / Sign out". Together they give the same no-hard-reload behaviour
 * the client `onAuthStateChange` listener used to provide.
 */
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

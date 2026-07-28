const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY

/**
 * Verifies a Cloudflare Turnstile token server-side.
 *
 * If no secret is configured, captcha protection is not active yet, so the
 * request is allowed through unchanged. This lets the Turnstile widget (see
 * components/Turnstile.tsx) ship dormant until NEXT_PUBLIC_TURNSTILE_SITE_KEY
 * and TURNSTILE_SECRET_KEY are both set.
 */
export async function verifyTurnstile(token: string | undefined, ip: string | null): Promise<boolean> {
  if (!TURNSTILE_SECRET) return true
  if (!token) return false
  try {
    const form = new URLSearchParams()
    form.append('secret', TURNSTILE_SECRET)
    form.append('response', token)
    if (ip) form.append('remoteip', ip)
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form,
    })
    const data = (await res.json()) as { success: boolean }
    return data.success === true
  } catch {
    return false
  }
}

/** Extracts the caller's IP from standard proxy headers (Vercel sets x-forwarded-for). */
export function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip')
}

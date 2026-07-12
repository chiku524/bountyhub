import type { Context } from 'hono'
import { timingSafeEqual } from './timingSafeEqual'

/**
 * Authorize cron / cleanup via shared secret.
 * Accepts Authorization: Bearer <CRON_SECRET> or X-Cron-Secret: <CRON_SECRET>.
 */
export function isAuthorizedCronRequest(
  c: Context,
  cronSecret: string | undefined
): boolean {
  if (!cronSecret) return false

  const headerSecret = (c.req.header('X-Cron-Secret') ?? '').trim()
  if (headerSecret && timingSafeEqual(headerSecret, cronSecret)) return true

  const auth = (c.req.header('Authorization') ?? '').trim()
  const m = /^Bearer\s+(\S+)/i.exec(auth)
  if (m && timingSafeEqual(m[1]!, cronSecret)) return true

  return false
}

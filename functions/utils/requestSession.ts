import { getCookie } from 'hono/cookie'
import type { Context } from 'hono'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/**
 * Session id from httpOnly cookie (browser) or Authorization: Bearer (desktop / clients
 * where cross-origin cookies are not persisted).
 */
export function getRequestSessionId(c: Context): string | undefined {
  const fromCookie = getCookie(c, 'session')
  if (fromCookie && UUID_RE.test(fromCookie)) return fromCookie

  const auth = (c.req.header('Authorization') ?? '').trim()
  const m = /^Bearer\s+(\S+)/i.exec(auth)
  if (!m) return undefined
  const token = m[1]
  return UUID_RE.test(token) ? token : undefined
}

import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { createDb } from '../../src/utils/db'
import { sessions, users } from '../../drizzle/schema'
import { expirePendingTransactions } from '../utils/expirePendingTransactions'
import { isAuthorizedCronRequest } from '../utils/cronAuth'
import { getRequestSessionId } from '../utils/requestSession'
import type { Context } from 'hono'

interface Env {
  DB: D1Database
  CRON_SECRET?: string
}

const app = new Hono<{ Bindings: Env }>()

/** Allow CRON_SECRET bearer / X-Cron-Secret, or an authenticated admin session. */
async function assertCleanupAuthorized(c: Context<{ Bindings: Env }>): Promise<Response | null> {
  if (isAuthorizedCronRequest(c, c.env.CRON_SECRET)) return null

  const sessionId = getRequestSessionId(c)
  if (!sessionId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const db = createDb(c.env.DB)
  const [session] = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1)
  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  if (session.expiresAt && new Date() > new Date(session.expiresAt)) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1)

  if (!user || user.role !== 'admin') {
    return c.json({ error: 'Forbidden' }, 403)
  }

  return null
}

app.get('/cron', async (c) => {
  // Cron HTTP path must use the shared secret (not only admin session)
  if (!isAuthorizedCronRequest(c, c.env.CRON_SECRET)) {
    if (!c.env.CRON_SECRET) {
      return c.json({ error: 'CRON_SECRET is not configured' }, 503)
    }
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const result = await expirePendingTransactions(c.env.DB)
    return c.json(result)
  } catch (error) {
    console.error('Error during cleanup:', error)
    return c.json(
      {
        success: false,
        error: 'Failed to cleanup pending transactions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    )
  }
})

app.post('/manual', async (c) => {
  const denied = await assertCleanupAuthorized(c)
  if (denied) return denied

  try {
    const result = await expirePendingTransactions(c.env.DB)
    return c.json(result)
  } catch (error) {
    console.error('Error during manual cleanup:', error)
    return c.json(
      {
        success: false,
        error: 'Failed to cleanup pending transactions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    )
  }
})

export default app

import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { getUserIdFromSession } from '../../../src/utils/auth'
import { createDb } from '../../../src/utils/db'
import { eq } from 'drizzle-orm'
import { users } from '../../../drizzle/schema'

interface Env {
  NODE_ENV: string
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

app.get('/', async (c) => {
  const sessionId = getCookie(c, 'session')
  
  if (!sessionId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const db = createDb(c.env.DB)
  
  try {
    const userId = await getUserIdFromSession(sessionId, db)
    
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1)
    
    if (userResult.length === 0) {
      return c.json({ error: 'User not found' }, 404)
    }

    const user = userResult[0]

    return c.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      githubUsername: user.githubUsername ?? undefined,
      githubId: user.githubId ?? undefined
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return c.json({ error: 'Failed to fetch user' }, 500)
  }
})

export default app 
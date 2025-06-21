import { Hono } from 'hono'
import { createDb } from '../../../src/utils/db'
import { users } from '../../../drizzle/schema'
import { eq } from 'drizzle-orm'

interface Env {
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

app.get(async (c) => {
  const db = createDb(c.env.DB)
  const username = c.req.param('username')
  if (!username) return c.json({ error: 'Missing username' }, 400)
  const userResult = await db.select().from(users).where(eq(users.username, username)).limit(1)
  if (userResult.length === 0) return c.json({ error: 'User not found' }, 404)
  const { password, ...user } = userResult[0]
  return c.json(user)
})

export default app 
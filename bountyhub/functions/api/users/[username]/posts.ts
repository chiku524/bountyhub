import { Hono } from 'hono'
import { createDb } from '../../../../src/utils/db'
import { users, posts } from '../../../../drizzle/schema'
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
  const userId = userResult[0].id
  const userPosts = await db.select().from(posts).where(eq(posts.authorId, userId))
  return c.json(userPosts)
})

export default app 
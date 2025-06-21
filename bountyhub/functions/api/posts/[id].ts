import { Hono } from 'hono'
import { createDb } from '../../../src/utils/db'
import { posts } from '../../../drizzle/schema'
import { eq } from 'drizzle-orm'

interface Env {
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

app.get(async (c) => {
  const db = createDb(c.env.DB)
  const id = c.req.param('id')
  if (!id) return c.json({ error: 'Missing post id' }, 400)
  const postResult = await db.select().from(posts).where(eq(posts.id, id)).limit(1)
  if (postResult.length === 0) return c.json({ error: 'Post not found' }, 404)
  return c.json(postResult[0])
})

export default app 
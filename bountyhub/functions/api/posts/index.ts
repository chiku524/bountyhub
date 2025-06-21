import { Hono } from 'hono'
import { createDb } from '../../../src/utils/db'
import { posts } from '../../../drizzle/schema'

interface Env {
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

app.get(async (c) => {
  const db = createDb(c.env.DB)
  const allPosts = await db.select().from(posts)
  return c.json(allPosts)
})

app.post(async (c) => {
  const db = createDb(c.env.DB)
  const { title, content } = await c.req.json()
  
  if (!title || !content) {
    return c.json({ error: 'Title and content are required' }, 400)
  }

  // TODO: Get real userId from session
  const userId = '1'
  
  const newPost = {
    id: crypto.randomUUID(),
    title,
    content,
    authorId: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'OPEN' as const
  }

  await db.insert(posts).values(newPost)
  return c.json(newPost, 201)
})

export default app 
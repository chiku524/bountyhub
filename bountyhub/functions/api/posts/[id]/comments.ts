import { Hono } from 'hono'
import { createDb } from '../../../../src/utils/db'
import { comments } from '../../../../drizzle/schema'
import { eq } from 'drizzle-orm'

interface Env {
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

// Get comments for a post
app.get(async (c) => {
  const db = createDb(c.env.DB)
  const postId = c.req.param('id')
  if (!postId) return c.json({ error: 'Missing post id' }, 400)
  
  const postComments = await db.select().from(comments).where(eq(comments.postId, postId))
  return c.json(postComments)
})

// Create a new comment
app.post(async (c) => {
  const db = createDb(c.env.DB)
  const postId = c.req.param('id')
  if (!postId) return c.json({ error: 'Missing post id' }, 400)
  
  const { content, authorId } = await c.req.json()
  if (!content || !authorId) return c.json({ error: 'Missing content or authorId' }, 400)
  
  const newComment = {
    id: crypto.randomUUID(),
    content,
    authorId,
    postId,
    createdAt: new Date(),
    updatedAt: new Date(),
    upvotes: 0,
    downvotes: 0
  }
  
  await db.insert(comments).values(newComment)
  return c.json(newComment, 201)
})

export default app 
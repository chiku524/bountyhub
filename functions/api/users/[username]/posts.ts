import { Hono } from 'hono'
import { createDb } from '../../../../src/utils/db'
import { users, posts, bounties } from '../../../../drizzle/schema'
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
  
  const userPosts = await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      authorId: posts.authorId,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      visibilityVotes: posts.visibilityVotes,
      qualityUpvotes: posts.qualityUpvotes,
      qualityDownvotes: posts.qualityDownvotes,
      hasBounty: posts.hasBounty,
      status: posts.status,
      reward: bounties.amount
    })
    .from(posts)
    .leftJoin(bounties, eq(posts.id, bounties.postId))
    .where(eq(posts.authorId, userId))
  
  return c.json(userPosts)
})

export default app 
import { Hono } from 'hono'
import { createDb } from '../../../../src/utils/db'
import { posts, votes } from '../../../../drizzle/schema'
import { eq, and } from 'drizzle-orm'

interface Env {
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

app.post(async (c) => {
  const db = createDb(c.env.DB)
  const postId = c.req.param('id')
  if (!postId) return c.json({ error: 'Missing post id' }, 400)
  
  const { userId, voteType, value } = await c.req.json()
  if (!userId || !voteType || value === undefined) {
    return c.json({ error: 'Missing userId, voteType, or value' }, 400)
  }

  try {
    // Check if user already voted
    const existingVote = await db.select().from(votes).where(
      and(
        eq(votes.userId, userId),
        eq(votes.postId, postId),
        eq(votes.voteType, voteType)
      )
    ).limit(1)

    if (existingVote.length > 0) {
      // Update existing vote
      await db.update(votes).set({ value, updatedAt: new Date() }).where(
        and(
          eq(votes.userId, userId),
          eq(votes.postId, postId),
          eq(votes.voteType, voteType)
        )
      )
    } else {
      // Create new vote
      await db.insert(votes).values({
        id: crypto.randomUUID(),
        userId,
        postId,
        value,
        voteType,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }

    // Update post vote counts
    const postVotes = await db.select().from(votes).where(
      and(
        eq(votes.postId, postId),
        eq(votes.voteType, voteType)
      )
    )

    const totalVotes = postVotes.reduce((sum, vote) => sum + vote.value, 0)
    
    if (voteType === 'quality') {
      if (value > 0) {
        await db.update(posts).set({ qualityUpvotes: totalVotes }).where(eq(posts.id, postId))
      } else {
        await db.update(posts).set({ qualityDownvotes: Math.abs(totalVotes) }).where(eq(posts.id, postId))
      }
    } else {
      await db.update(posts).set({ visibilityVotes: totalVotes }).where(eq(posts.id, postId))
    }

    return c.json({ success: true, totalVotes })
  } catch (error) {
    console.error('Vote error:', error)
    return c.json({ error: 'Failed to process vote' }, 500)
  }
})

export default app 
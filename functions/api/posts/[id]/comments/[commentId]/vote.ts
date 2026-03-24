import { Hono } from 'hono'
import { createDb } from '../../../../../../src/utils/db'
import { getUserIdFromSession } from '../../../../../../src/utils/auth'
import { comments, votes } from '../../../../../../drizzle/schema'
import { eq, and } from 'drizzle-orm'
import { updateReputation } from '../../../../../../src/utils/reputation'

interface Env {
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

app.post(async (c) => {
  const db = createDb(c.env.DB)
  const postId = c.req.param('id')
  const commentId = c.req.param('commentId')
  
  if (!postId || !commentId) {
    return c.json({ error: 'Missing post id or comment id' }, 400)
  }
  
  const sessionCookie = c.get('sessionId')
  if (!sessionCookie) {
    return c.json({ error: 'Not authenticated' }, 401)
  }
  
  const userId = await getUserIdFromSession(sessionCookie, db)
  if (!userId) {
    return c.json({ error: 'Invalid session' }, 401)
  }
  
  const { value } = await c.req.json()
  if (value === undefined || (value !== 1 && value !== -1)) {
    return c.json({ error: 'Invalid vote value. Must be 1 (upvote) or -1 (downvote)' }, 400)
  }

  try {
    // Check if user already voted on this comment
    const existingVote = await db.select().from(votes).where(
      and(
        eq(votes.userId, userId),
        eq(votes.commentId, commentId)
      )
    ).limit(1)

    if (existingVote.length > 0) {
      // Update existing vote
      await db.update(votes).set({ 
        value, 
        updatedAt: new Date() 
      }).where(
        and(
          eq(votes.userId, userId),
          eq(votes.commentId, commentId)
        )
      )
    } else {
      // Create new vote
      await db.insert(votes).values({
        id: crypto.randomUUID(),
        userId,
        commentId,
        value,
        voteType: 'comment',
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }

    // Update comment vote counts
    const commentVotes = await db.select().from(votes).where(eq(votes.commentId, commentId))
    
    const upvotes = commentVotes.filter((vote: any) => vote.value === 1).length
    const downvotes = commentVotes.filter((vote: any) => vote.value === -1).length
    
    await db.update(comments).set({ 
      upvotes,
      downvotes,
      updatedAt: new Date()
    }).where(eq(comments.id, commentId))

    // Award/deduct reputation to the comment author
    const comment = await db.select().from(comments).where(eq(comments.id, commentId)).limit(1)
    if (comment.length > 0) {
      const authorId = comment[0].authorId
      if (value === 1) {
        await updateReputation(db, authorId, 'COMMENT_UPVOTED', commentId)
      } else if (value === -1) {
        await updateReputation(db, authorId, 'COMMENT_DOWNVOTED', commentId)
      }
    }

    return c.json({ 
      success: true, 
      upvotes,
      downvotes,
      userVote: value
    })
  } catch (error) {
    console.error('Comment vote error:', error)
    return c.json({ error: 'Failed to process vote' }, 500)
  }
})

export default app 
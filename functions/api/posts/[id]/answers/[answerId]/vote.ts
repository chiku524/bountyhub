import { Hono } from 'hono'
import { createDb } from '../../../../../../src/utils/db'
import { getUserIdFromSession } from '../../../../../../src/utils/auth'
import { answers, votes } from '../../../../../../drizzle/schema'
import { eq, and } from 'drizzle-orm'
import { updateReputation } from '../../../../../../src/utils/reputation'

interface Env {
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

app.post(async (c) => {
  const db = createDb(c.env.DB)
  const postId = c.req.param('id')
  const answerId = c.req.param('answerId')
  
  if (!postId || !answerId) {
    return c.json({ error: 'Missing post id or answer id' }, 400)
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
    // Check if user already voted on this answer
    const existingVote = await db.select().from(votes).where(
      and(
        eq(votes.userId, userId),
        eq(votes.answerId, answerId)
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
          eq(votes.answerId, answerId)
        )
      )
    } else {
      // Create new vote
      await db.insert(votes).values({
        id: crypto.randomUUID(),
        userId,
        answerId,
        value,
        voteType: 'answer',
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }

    // Update answer vote counts
    const answerVotes = await db.select().from(votes).where(eq(votes.answerId, answerId))
    
    const upvotes = answerVotes.filter((vote: any) => vote.value === 1).length
    const downvotes = answerVotes.filter((vote: any) => vote.value === -1).length
    
    await db.update(answers).set({ 
      upvotes,
      downvotes,
      updatedAt: new Date()
    }).where(eq(answers.id, answerId))

    // Award/deduct reputation to the answer author
    const answer = await db.select().from(answers).where(eq(answers.id, answerId)).limit(1)
    if (answer.length > 0) {
      const authorId = answer[0].authorId
      if (value === 1) {
        await updateReputation(db, authorId, 'ANSWER_UPVOTED', answerId)
      } else if (value === -1) {
        await updateReputation(db, authorId, 'ANSWER_DOWNVOTED', answerId)
      }
    }

    return c.json({ 
      success: true, 
      upvotes,
      downvotes,
      userVote: value
    })
  } catch (error) {
    console.error('Answer vote error:', error)
    return c.json({ error: 'Failed to process vote' }, 500)
  }
})

export default app 
import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { createDb } from '../../../../../../src/utils/db'
import { getUserIdFromSession } from '../../../../../../src/utils/auth'
import { answers, posts, bounties, users } from '../../../../../../drizzle/schema'
import { eq } from 'drizzle-orm'
import { updateReputation } from '../../../../../../src/utils/reputation'
import { createBountyNotification } from '../../../../../../src/utils/notifications'
import { GovernanceService } from '../../../../../../src/utils/governance'

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
  
  const sessionCookie = getCookie(c, 'session')
  if (!sessionCookie) {
    return c.json({ error: 'Not authenticated' }, 401)
  }
  
  const userId = await getUserIdFromSession(sessionCookie, db)
  if (!userId) {
    return c.json({ error: 'Invalid session' }, 401)
  }

  try {
    // Check if user is the author of the post
    const postResult = await db.select().from(posts).where(eq(posts.id, postId)).limit(1)
    if (postResult.length === 0) {
      return c.json({ error: 'Post not found' }, 404)
    }
    
    const post = postResult[0]
    if (post.authorId !== userId) {
      return c.json({ error: 'Only the post author can accept answers' }, 403)
    }

    // Check if answer exists
    const answerResult = await db.select().from(answers).where(eq(answers.id, answerId)).limit(1)
    if (answerResult.length === 0) {
      return c.json({ error: 'Answer not found' }, 404)
    }

    // Unaccept all other answers for this post
    await db.update(answers).set({ 
      isAccepted: false,
      updatedAt: new Date()
    }).where(eq(answers.postId, postId))

    // Accept the selected answer
    await db.update(answers).set({ 
      isAccepted: true,
      updatedAt: new Date()
    }).where(eq(answers.id, answerId))

    // Award reputation to the answer author
    const answerAuthorId = answerResult[0].authorId
    await updateReputation(db, answerAuthorId, 'ANSWER_ACCEPTED', answerId)

    // Check if there's a bounty on this post and handle bounty distribution
    const bountyResult = await db.select().from(bounties).where(eq(bounties.postId, postId)).limit(1)
    if (bountyResult.length > 0 && bountyResult[0].status === 'ACTIVE') {
      const bounty = bountyResult[0]
      
      // Award additional reputation for bounty
      await updateReputation(db, answerAuthorId, 'BOUNTY_AWARDED', answerId)
      
      // Distribute bounty through governance system
      const bountyDistribution = await GovernanceService.distributeBounty(
        db,
        answerAuthorId,
        bounty.amount,
        bounty.id
      )
      
      if (!bountyDistribution.success) {
        console.error('Failed to distribute bounty:', bountyDistribution.error)
        // Continue with the process even if bounty distribution fails
      }
      
      // Update bounty status to completed
      await db.update(bounties).set({
        status: 'CLAIMED',
        updatedAt: new Date()
      }).where(eq(bounties.id, bounty.id))
    }

    // Create notification for answer author
    try {
      const answerAuthorResult = await db.select({
        username: users.username
      })
      .from(users)
      .where(eq(users.id, answerAuthorId))
      .limit(1)

      if (answerAuthorResult.length > 0) {
        const bountyAmount = bountyResult.length > 0 ? bountyResult[0].amount : 0
        await createBountyNotification(
          db,
          answerAuthorId,
          post.title,
          postId,
          bountyAmount
        )
      }
    } catch (notificationError) {
      console.error('Error creating bounty notification:', notificationError)
      // Don't fail the answer acceptance if notification fails
    }

    return c.json({ 
      success: true, 
      message: 'Answer accepted successfully'
    })
  } catch (error) {
    console.error('Accept answer error:', error)
    return c.json({ error: 'Failed to accept answer' }, 500)
  }
})

export default app 
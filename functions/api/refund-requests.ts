import { Hono } from 'hono'
import { createDb } from '../../src/utils/db'
import { getUserIdFromSession } from '../../src/utils/auth'
import { refundRequests, refundRequestVotes, bounties, posts, users } from '../../drizzle/schema'
import { eq, desc, and, count } from 'drizzle-orm'

interface Env {
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

// Get all refund requests
app.get(async (c) => {
  const sessionId = c.get('sessionId')
  
  if (!sessionId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const db = createDb(c.env.DB)
  
  try {
    const userId = await getUserIdFromSession(sessionId, db)
    
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    // Get all refund requests with related data
    const allRefundRequests = await db.select({
      id: refundRequests.id,
      bountyId: refundRequests.bountyId,
      requesterId: refundRequests.requesterId,
      reason: refundRequests.reason,
      status: refundRequests.status,
      communityVotes: refundRequests.communityVotes,
      requiredVotes: refundRequests.requiredVotes,
      createdAt: refundRequests.createdAt,
      expiresAt: refundRequests.expiresAt,
      // Related data
      bountyAmount: bounties.amount,
      postTitle: posts.title,
      requesterUsername: users.username,
    })
    .from(refundRequests)
    .leftJoin(bounties, eq(refundRequests.bountyId, bounties.id))
    .leftJoin(posts, eq(bounties.postId, posts.id))
    .leftJoin(users, eq(refundRequests.requesterId, users.id))
    .orderBy(desc(refundRequests.createdAt))

    return c.json(allRefundRequests)
  } catch (error) {
    console.error('Error fetching refund requests:', error)
    return c.json({ error: 'Failed to fetch refund requests' }, 500)
  }
})

// Vote on a refund request
app.post('/:id/vote', async (c) => {
  const sessionId = c.get('sessionId')
  
  if (!sessionId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const db = createDb(c.env.DB)
  
  try {
    const userId = await getUserIdFromSession(sessionId, db)
    
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const refundRequestId = c.req.param('id')
    const { vote, reason } = await c.req.json()

    // Check if user already voted
    const existingVote = await db.select()
      .from(refundRequestVotes)
      .where(and(
        eq(refundRequestVotes.refundRequestId, refundRequestId),
        eq(refundRequestVotes.voterId, userId)
      ))
      .limit(1)

    if (existingVote.length > 0) {
      return c.json({ error: 'You have already voted on this refund request' }, 400)
    }

    // Get the refund request to check if it's still active
    const refundRequest = await db.select()
      .from(refundRequests)
      .where(eq(refundRequests.id, refundRequestId))
      .limit(1)

    if (refundRequest.length === 0) {
      return c.json({ error: 'Refund request not found' }, 404)
    }

    if (refundRequest[0].status !== 'PENDING') {
      return c.json({ error: 'Refund request is no longer active' }, 400)
    }

    if (new Date() > new Date(refundRequest[0].expiresAt)) {
      return c.json({ error: 'Refund request has expired' }, 400)
    }

    // Add the vote
    await db.insert(refundRequestVotes).values({
      id: crypto.randomUUID(),
      refundRequestId,
      voterId: userId,
      vote: vote === 'approve' ? true : false,
      reason: reason || null,
      rewardAmount: 0, // Could implement reward system for voting
    })

    // Update community votes count
    const voteCount = await db.select({ count: count() })
      .from(refundRequestVotes)
      .where(eq(refundRequestVotes.refundRequestId, refundRequestId))

    await db.update(refundRequests)
      .set({ communityVotes: voteCount[0].count })
      .where(eq(refundRequests.id, refundRequestId))

    // Check if enough votes to auto-approve/reject
    const approveVotes = await db.select({ count: count() })
      .from(refundRequestVotes)
      .where(and(
        eq(refundRequestVotes.refundRequestId, refundRequestId),
        eq(refundRequestVotes.vote, true)
      ))

    const rejectVotes = await db.select({ count: count() })
      .from(refundRequestVotes)
      .where(and(
        eq(refundRequestVotes.refundRequestId, refundRequestId),
        eq(refundRequestVotes.vote, false)
      ))

    const requiredVotes = refundRequest[0].requiredVotes
    const totalVotes = voteCount[0].count

    if (totalVotes >= requiredVotes) {
      let newStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED' = 'PENDING'
      if (approveVotes[0].count > rejectVotes[0].count) {
        newStatus = 'APPROVED'
      } else if (rejectVotes[0].count > approveVotes[0].count) {
        newStatus = 'REJECTED'
      }

      if (newStatus !== 'PENDING') {
        await db.update(refundRequests)
          .set({ status: newStatus })
          .where(eq(refundRequests.id, refundRequestId))
      }
    }

    return c.json({ success: true })
  } catch (error) {
    console.error('Error voting on refund request:', error)
    return c.json({ error: 'Failed to vote on refund request' }, 500)
  }
})

// Get votes for a specific refund request
app.get('/:id/votes', async (c) => {
  const sessionId = c.get('sessionId')
  
  if (!sessionId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const db = createDb(c.env.DB)
  
  try {
    const userId = await getUserIdFromSession(sessionId, db)
    
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const refundRequestId = c.req.param('id')

    // Get all votes for this refund request
    const votes = await db.select({
      id: refundRequestVotes.id,
      voterId: refundRequestVotes.voterId,
      vote: refundRequestVotes.vote,
      reason: refundRequestVotes.reason,
      rewardAmount: refundRequestVotes.rewardAmount,
      createdAt: refundRequestVotes.createdAt,
      voterUsername: users.username,
    })
    .from(refundRequestVotes)
    .leftJoin(users, eq(refundRequestVotes.voterId, users.id))
    .where(eq(refundRequestVotes.refundRequestId, refundRequestId))
    .orderBy(desc(refundRequestVotes.createdAt))

    return c.json(votes)
  } catch (error) {
    console.error('Error fetching refund request votes:', error)
    return c.json({ error: 'Failed to fetch refund request votes' }, 500)
  }
})

export default app 
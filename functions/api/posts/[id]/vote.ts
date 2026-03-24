import { Hono } from 'hono'
import { createDb } from '../../../../src/utils/db'
import { getUserIdFromSession } from '../../../../src/utils/auth'
import { posts, votes, users } from '../../../../drizzle/schema'
import { eq, and } from 'drizzle-orm'
import { updateReputation } from '../../../../src/utils/reputation'
import { createVoteNotification } from '../../../../src/utils/notifications'

interface Env {
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

app.get(async (c) => {
  const sessionId = c.get('sessionId')
  
  if (!sessionId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const db = createDb(c.env.DB)
  const postId = c.req.param('id')
  
  if (!postId) {
    return c.json({ error: 'Missing post id' }, 400)
  }
  
  // Get the user ID from the session
  const userId = await getUserIdFromSession(sessionId, db)
  
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    // Get user's vote for this post
    const userVote = await db.select().from(votes).where(
      and(
        eq(votes.userId, userId),
        eq(votes.postId, postId),
        eq(votes.voteType, 'quality')
      )
    ).limit(1)

    return c.json({ 
      userVote: userVote.length > 0 ? userVote[0].value : 0
    })
  } catch (error) {
    console.error('Error fetching user vote:', error)
    return c.json({ error: 'Failed to fetch user vote' }, 500)
  }
})

app.post(async (c) => {
  const sessionId = c.get('sessionId')
  
  if (!sessionId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const db = createDb(c.env.DB)
  const postId = c.req.param('id')
  
  if (!postId) {
    return c.json({ error: 'Missing post id' }, 400)
  }
  
  // Get the user ID from the session
  const userId = await getUserIdFromSession(sessionId, db)
  
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  const { voteType, value } = await c.req.json()
  
  if (!voteType || value === undefined) {
    return c.json({ error: 'Missing voteType or value' }, 400)
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

    // Calculate total votes for this post and vote type
    const postVotes = await db.select().from(votes).where(
      and(
        eq(votes.postId, postId),
        eq(votes.voteType, voteType)
      )
    )

    const totalVotes = postVotes.reduce((sum, vote) => sum + vote.value, 0)
    
    // Get the user's current vote state
    const userVote = postVotes.find(vote => vote.userId === userId)?.value || 0
    
    // Update post vote counts
    if (voteType === 'quality') {
      const downvotes = postVotes.filter(vote => vote.value < 0).length
      await db.update(posts).set({ 
        qualityUpvotes: totalVotes,
        qualityDownvotes: downvotes
      }).where(eq(posts.id, postId))

      // Award/deduct reputation to the post author
      const post = await db.select().from(posts).where(eq(posts.id, postId)).limit(1)
      if (post.length > 0) {
        const authorId = post[0].authorId
        if (value === 1) {
          await updateReputation(db, authorId, 'POST_UPVOTED', postId)
        } else if (value === -1) {
          await updateReputation(db, authorId, 'POST_DOWNVOTED', postId)
        }

        // Create notification for post author (if voter is not the post author)
        if (authorId !== userId) {
          try {
            const voterResult = await db.select({
              username: users.username
            })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1)

            if (voterResult.length > 0) {
              await createVoteNotification(
                db,
                authorId,
                voterResult[0].username,
                post[0].title,
                postId,
                value === 1
              )
            }
          } catch (notificationError) {
            console.error('Error creating vote notification:', notificationError)
            // Don't fail the vote if notification fails
          }
        }
      }
    } else {
      await db.update(posts).set({ visibilityVotes: totalVotes }).where(eq(posts.id, postId))
    }

    return c.json({ 
      success: true, 
      totalVotes,
      userVote: userVote
    })
  } catch (error) {
    console.error('Vote error:', error)
    return c.json({ error: 'Failed to process vote' }, 500)
  }
})

export default app 
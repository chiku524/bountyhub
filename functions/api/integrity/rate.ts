import { Hono } from 'hono'
import { createDb } from '../../../src/utils/db'
import { getUserIdFromSession } from '../../../src/utils/auth'
import { userRatings, integrityHistory, users } from '../../../drizzle/schema'
import { eq, and, isNull } from 'drizzle-orm'

interface Env {
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

app.post(async (c) => {
  const sessionId = c.get('sessionId')
  
  if (!sessionId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const db = createDb(c.env.DB)
  
  // Get the user ID from the session
  const userId = await getUserIdFromSession(sessionId, db)
  
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const { ratedUserId, rating, reason, context, referenceId, referenceType } = await c.req.json()
    
    // Validate input
    if (!ratedUserId || !rating || !reason || !context) {
      return c.json({ error: 'Missing required fields' }, 400)
    }
    
    if (rating < 1 || rating > 10) {
      return c.json({ error: 'Rating must be between 1 and 10' }, 400)
    }
    
    if (reason.length > 500) {
      return c.json({ error: 'Reason must be less than 500 characters' }, 400)
    }
    
    // Prevent self-rating
    if (userId === ratedUserId) {
      return c.json({ error: 'Cannot rate yourself' }, 400)
    }

    // Check if user already rated this user for this reference
    const existingRating = await db
      .select()
      .from(userRatings)
      .where(and(
        eq(userRatings.raterId, userId),
        eq(userRatings.ratedUserId, ratedUserId),
        referenceId ? eq(userRatings.referenceId, referenceId) : isNull(userRatings.referenceId)
      ))
      .limit(1)

    if (existingRating.length > 0) {
      return c.json({ error: 'Already rated this user for this reference' }, 400)
    }

    // Get rater username
    const rater = await db.select({ username: users.username }).from(users).where(eq(users.id, userId)).limit(1)
    const raterUsername = rater[0]?.username || 'Unknown'

    // Create new rating
    await db.insert(userRatings).values({
      id: crypto.randomUUID(),
      raterId: userId,
      ratedUserId,
      rating,
      reason,
      context,
      referenceId: referenceId || null,
      referenceType: referenceType || null,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Add to integrity history
    await db.insert(integrityHistory).values({
      id: crypto.randomUUID(),
      userId: ratedUserId,
      action: 'USER_RATED',
      points: rating,
      description: `Rated by ${raterUsername}: ${reason}`,
      referenceId: referenceId || null,
      referenceType: referenceType || null,
      createdAt: new Date()
    })

    // Update user's integrity score
    await updateUserIntegrityScore(db, ratedUserId)

    return c.json({ 
      success: true, 
      message: 'User rated successfully' 
    })

  } catch (error) {
    console.error('Error processing integrity rating:', error)
    return c.json({ error: 'Failed to process rating' }, 500)
  }
})

async function updateUserIntegrityScore(db: any, userId: string) {
  try {
    // Get all ratings for the user
    const ratings = await db
      .select({ rating: userRatings.rating })
      .from(userRatings)
      .where(eq(userRatings.ratedUserId, userId))

    if (ratings.length === 0) {
      return
    }

    // Calculate average rating
    const totalRating = ratings.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0)
    const averageRating = totalRating / ratings.length

    // Update user's integrity score
    await db.update(users)
      .set({
        integrityScore: averageRating,
        totalRatings: ratings.length,
      })
      .where(eq(users.id, userId))
  } catch (error) {
    console.error('Error updating integrity score:', error)
  }
}

export default app 
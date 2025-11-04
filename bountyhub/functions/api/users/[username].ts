import { Hono } from 'hono'
import { createDb } from '../../../src/utils/db'
import { users, profiles, posts, reputationHistory, bookmarks, bounties } from '../../../drizzle/schema'
import { eq, desc } from 'drizzle-orm'

interface Env {
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

// Get user profile by username
app.get(async (c) => {
  const db = createDb(c.env.DB)
  const username = c.req.param('username')
  
  if (!username) {
    return c.json({ error: 'Missing username' }, 400)
  }

  try {
    const userResult = await db.select({
      id: users.id,
      email: users.email,
      username: users.username,
      reputationPoints: users.reputationPoints,
      integrityScore: users.integrityScore,
      totalRatings: users.totalRatings,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    })
    .from(users)
    .where(eq(users.username, username))
    .limit(1)

    if (userResult.length === 0) {
      return c.json({ error: 'User not found' }, 404)
    }

    const user = userResult[0]

    // Get user profile information if it exists
    const profileResult = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1)
    
    // Get user's recent posts with bounty information
    const userPosts = await db.select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      createdAt: posts.createdAt,
      qualityUpvotes: posts.qualityUpvotes,
      qualityDownvotes: posts.qualityDownvotes,
      hasBounty: posts.hasBounty,
      reward: bounties.amount
    })
    .from(posts)
    .leftJoin(bounties, eq(posts.id, bounties.postId))
    .where(eq(posts.authorId, user.id))
    .orderBy(desc(posts.createdAt))
    .limit(5)

    // Get user's reputation history
    const userReputationHistory = await db.select({
      id: reputationHistory.id,
      points: reputationHistory.points,
      action: reputationHistory.action,
      createdAt: reputationHistory.createdAt
    })
    .from(reputationHistory)
    .where(eq(reputationHistory.userId, user.id))
    .orderBy(desc(reputationHistory.createdAt))
    .limit(10)

    // Get user's bookmarks with post details
    const userBookmarks = await db.select({
      id: bookmarks.id,
      postId: bookmarks.postId,
      createdAt: bookmarks.createdAt,
      post: {
        id: posts.id,
        title: posts.title,
        content: posts.content,
        createdAt: posts.createdAt,
        authorId: posts.authorId
      }
    })
    .from(bookmarks)
    .innerJoin(posts, eq(bookmarks.postId, posts.id))
    .where(eq(bookmarks.userId, user.id))
    .orderBy(desc(bookmarks.createdAt))
    .limit(10)
    
    const userWithProfile = {
      ...user,
      profilePicture: profileResult.length > 0 ? profileResult[0].profilePicture : null,
      profile: profileResult.length > 0 ? profileResult[0] : undefined,
      posts: userPosts,
      reputationHistory: userReputationHistory,
      bookmarks: userBookmarks
    }

    return c.json(userWithProfile)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return c.json({ error: 'Failed to fetch user profile' }, 500)
  }
})

export default app 
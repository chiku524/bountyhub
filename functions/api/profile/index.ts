import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { createDb } from '../../../src/utils/db'
import { getUserIdFromSession } from '../../../src/utils/auth'
import { users, profiles, posts, bookmarks, reputationHistory } from '../../../drizzle/schema'
import { eq, desc } from 'drizzle-orm'
import pictureRoutes from './picture'

interface Env {
  DB: any
  NODE_ENV: string
  CLOUDINARY_CLOUD_NAME: string
  CLOUDINARY_API_KEY: string
  CLOUDINARY_API_SECRET: string
  CLOUDINARY_UPLOAD_PRESET: string
}

const app = new Hono<{ Bindings: Env }>()

// Add picture routes
app.route('/picture', pictureRoutes)

app.get(async (c) => {
  const sessionId = getCookie(c, 'session')
  
  if (!sessionId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const db = createDb(c.env.DB)
  
  try {
    // Get the user ID from the session
    const userId = await getUserIdFromSession(sessionId, db)
    
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    // Query user and profile separately
    const userResult = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        reputationPoints: users.reputationPoints,
        integrityScore: users.integrityScore,
        totalRatings: users.totalRatings,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        githubUsername: users.githubUsername,
        githubId: users.githubId,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (userResult.length === 0) {
      return c.json({ error: 'User not found' }, 404)
    }

    const user = userResult[0]
    
    // Query profile separately
    const profileResult = await db
      .select({
        firstName: profiles.firstName,
        lastName: profiles.lastName,
        profilePicture: profiles.profilePicture,
        bio: profiles.bio,
        location: profiles.location,
        website: profiles.website,
        facebook: profiles.facebook,
        twitter: profiles.twitter,
        instagram: profiles.instagram,
        linkedin: profiles.linkedin,
        github: profiles.github,
        youtube: profiles.youtube,
        tiktok: profiles.tiktok,
        discord: profiles.discord,
        reddit: profiles.reddit,
        medium: profiles.medium,
        stackoverflow: profiles.stackoverflow,
        devto: profiles.devto,
      })
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1)

    const profile = profileResult.length > 0 ? profileResult[0] : null
    
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
    .where(eq(bookmarks.userId, userId))
    .orderBy(desc(bookmarks.createdAt))
    .limit(10)
    
    // Calculate reputation level based on points
    const getReputationLevel = (points: number) => {
      if (points >= 10000) return 'Legend'
      if (points >= 5000) return 'Expert'
      if (points >= 1000) return 'Veteran'
      if (points >= 500) return 'Regular'
      if (points >= 100) return 'Contributor'
      if (points >= 50) return 'Member'
      return 'Newbie'
    }

    // Get user's reputation history
    const userReputationHistory = await db.select({
      id: reputationHistory.id,
      points: reputationHistory.points,
      action: reputationHistory.action,
      createdAt: reputationHistory.createdAt
    })
    .from(reputationHistory)
    .where(eq(reputationHistory.userId, userId))
    .orderBy(desc(reputationHistory.createdAt))
    .limit(20)

    return c.json({
      ...user,
      profilePicture: profile?.profilePicture ?? null,
      profile,
      bookmarks: userBookmarks,
      reputation: user.reputationPoints,
      reputationLevel: getReputationLevel(user.reputationPoints),
      reputationPoints: user.reputationPoints,
      integrityScore: user.integrityScore,
      totalRatings: user.totalRatings,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      reputationHistory: userReputationHistory
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return c.json({ error: 'Failed to fetch profile' }, 500)
  }
})

app.post(async (c) => {
  const sessionId = getCookie(c, 'session')
  
  if (!sessionId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const db = createDb(c.env.DB)
  
  try {
    // Get the user ID from the session
    const userId = await getUserIdFromSession(sessionId, db)
    
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const body = await c.req.json()
    const { profile } = body

    if (!profile) {
      return c.json({ error: 'Profile data is required' }, 400)
    }

    // Check if profile exists
    const existingProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1)

    if (existingProfile.length > 0) {
      // Update existing profile
      await db
        .update(profiles)
        .set({
          firstName: profile.firstName || null,
          lastName: profile.lastName || null,
          bio: profile.bio || null,
          location: profile.location || null,
          website: profile.website || null,
          facebook: profile.facebook || null,
          twitter: profile.twitter || null,
          instagram: profile.instagram || null,
          linkedin: profile.linkedin || null,
          github: profile.github || null,
          youtube: profile.youtube || null,
          tiktok: profile.tiktok || null,
          discord: profile.discord || null,
          reddit: profile.reddit || null,
          medium: profile.medium || null,
          stackoverflow: profile.stackoverflow || null,
          devto: profile.devto || null,
          updatedAt: new Date(),
        })
        .where(eq(profiles.userId, userId))
    } else {
      // Create new profile
      await db.insert(profiles).values({
        id: crypto.randomUUID(),
        userId: userId,
        firstName: profile.firstName || null,
        lastName: profile.lastName || null,
        bio: profile.bio || null,
        location: profile.location || null,
        website: profile.website || null,
        facebook: profile.facebook || null,
        twitter: profile.twitter || null,
        instagram: profile.instagram || null,
        linkedin: profile.linkedin || null,
        github: profile.github || null,
        youtube: profile.youtube || null,
        tiktok: profile.tiktok || null,
        discord: profile.discord || null,
        reddit: profile.reddit || null,
        medium: profile.medium || null,
        stackoverflow: profile.stackoverflow || null,
        devto: profile.devto || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    return c.json({ success: true, message: 'Profile updated successfully' })
  } catch (error) {
    console.error('Error updating profile:', error)
    return c.json({ error: 'Failed to update profile' }, 500)
  }
})

export default app 
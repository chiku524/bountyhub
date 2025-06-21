import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { getCookie } from 'hono/cookie'
import { createDb } from '../../../src/utils/db'
import { getUserIdFromSession } from '../../../src/utils/auth'
import { users, profiles } from '../../../drizzle/schema'
import { eq } from 'drizzle-orm'

interface Env {
  DB: any
  NODE_ENV: string
}

const app = new Hono<{ Bindings: Env }>()

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
        profile: {
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
        },
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(users.id, userId))
      .limit(1)

    if (userResult.length === 0) {
      return c.json({ error: 'User not found' }, 404)
    }

    const user = userResult[0]
    
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

    return c.json({
      id: user.id,
      username: user.username,
      email: user.email,
      profilePicture: user.profile?.profilePicture,
      reputation: user.reputationPoints,
      reputationLevel: getReputationLevel(user.reputationPoints),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile: user.profile
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
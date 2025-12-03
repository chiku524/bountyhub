import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { getCookie } from 'hono/cookie'
import { users, sessions } from '../../drizzle/schema'

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function getAuthUser(c: any) {
  try {
    const sessionId = getCookie(c, 'session')
    if (!sessionId) return null

    const db = drizzle(c.env.DB)
    
    // Get session
    const sessionResult = await db.select().from(sessions).where(eq(sessions.id, sessionId)).get()
    if (!sessionResult) return null

    // Check if session is expired
    if (sessionResult.expiresAt && new Date() > new Date(sessionResult.expiresAt)) {
      await db.delete(sessions).where(eq(sessions.id, sessionId))
      return null
    }

    // Get user
    const userResult = await db.select().from(users).where(eq(users.id, sessionResult.userId)).get()
    if (!userResult) return null

    return {
      id: userResult.id,
      email: userResult.email,
      username: userResult.username
    }
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
} 
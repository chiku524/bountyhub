// Temporary simplified auth utility for testing
// TODO: Re-implement with proper database integration

import { eq } from 'drizzle-orm'
import { users, sessions, virtualWallets } from '../../drizzle/schema'
import type { Db } from './db'
import bcrypt from 'bcryptjs'

export interface AuthError {
  error: string
  fields?: {
    email?: string
    password?: string
    username?: string
  }
}

export async function createUserSession() {
  // Create a simple session token (in production, use a proper JWT or session store)
  const sessionToken = crypto.randomUUID()
  // TODO: Store session in D1 or KV
  return { sessionToken }
}

export async function register({ 
  email, 
  password, 
  username 
}: { 
  email: string; 
  password: string; 
  username: string 
}, db: Db): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (existingUser.length > 0) {
      return { success: false, error: 'Email already registered' }
    }

    const existingUsername = await db.select().from(users).where(eq(users.username, username)).limit(1)
    if (existingUsername.length > 0) {
      return { success: false, error: 'Username already taken' }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create new user
    const userId = crypto.randomUUID()
    const newUser = {
      id: userId,
      email,
      username,
      password: hashedPassword,
      reputationPoints: 0,
      integrityScore: 5.0,
      totalRatings: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await db.insert(users).values(newUser)

    // Create virtual wallet for the new user
    const walletId = crypto.randomUUID()
    await db.insert(virtualWallets).values({
      id: walletId,
      userId: userId,
      balance: 0,
      totalDeposited: 0,
      totalWithdrawn: 0,
      totalEarned: 0,
      totalSpent: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Safely handle date conversion
    const formatDate = (date: any) => {
      if (!date) return null
      try {
        const dateObj = new Date(date)
        return isNaN(dateObj.getTime()) ? null : dateObj.toISOString()
      } catch {
        return null
      }
    }

    return { 
      success: true, 
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        reputation: newUser.reputationPoints,
        reputationLevel: getReputationLevel(newUser.reputationPoints),
        createdAt: formatDate(newUser.createdAt),
        updatedAt: formatDate(newUser.updatedAt)
      }
    }
  } catch (error) {
    console.error('Registration error:', error)
    return { success: false, error: 'Registration failed' }
  }
}

export async function login({ 
  email, 
  password 
}: { 
  email: string; 
  password: string 
}, db: Db): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    // Find user by email
    const userResult = await db.select().from(users).where(eq(users.email, email)).limit(1)
    
    if (userResult.length === 0) {
      return { success: false, error: 'Invalid credentials' }
    }

    const user = userResult[0]
    
    // Handle both plain text and hashed passwords during transition
    let isValidPassword = false
    
    if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
      // Password is hashed, use bcrypt verification
      isValidPassword = await bcrypt.compare(password, user.password)
    } else {
      // Password is plain text (legacy), compare directly
      isValidPassword = user.password === password
      
      // If login successful, hash the password for future use
      if (isValidPassword) {
        const hashedPassword = await bcrypt.hash(password, 12)
        await db.update(users)
          .set({ password: hashedPassword, updatedAt: new Date() })
          .where(eq(users.id, user.id))
      }
    }
    
    if (!isValidPassword) {
      return { success: false, error: 'Invalid credentials' }
    }

    // Safely handle date conversion
    const formatDate = (date: any) => {
      if (!date) return null
      try {
        const dateObj = new Date(date)
        return isNaN(dateObj.getTime()) ? null : dateObj.toISOString()
      } catch {
        return null
      }
    }

    return { 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        reputation: user.reputationPoints,
        reputationLevel: getReputationLevel(user.reputationPoints),
        createdAt: formatDate(user.createdAt),
        updatedAt: formatDate(user.updatedAt)
      }
    }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: 'Login failed' }
  }
}

export async function getUserById(userId: string, db: Db) {
  try {
    const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1)
    if (userResult.length === 0) return null
    
    const user = userResult[0]
    
    // Safely handle date conversion
    const formatDate = (date: any) => {
      if (!date) return null
      try {
        const dateObj = new Date(date)
        return isNaN(dateObj.getTime()) ? null : dateObj.toISOString()
      } catch {
        return null
      }
    }
    
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      reputation: user.reputationPoints,
      reputationLevel: getReputationLevel(user.reputationPoints),
      createdAt: formatDate(user.createdAt),
      updatedAt: formatDate(user.updatedAt)
    }
  } catch (error) {
    console.error('Get user by ID error:', error)
    return null
  }
}

export async function getUserByEmail(email: string, db: Db) {
  try {
    const userResult = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (userResult.length === 0) return null
    
    const user = userResult[0]
    
    // Safely handle date conversion
    const formatDate = (date: any) => {
      if (!date) return null
      try {
        const dateObj = new Date(date)
        return isNaN(dateObj.getTime()) ? null : dateObj.toISOString()
      } catch {
        return null
      }
    }
    
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      reputation: user.reputationPoints,
      reputationLevel: getReputationLevel(user.reputationPoints),
      createdAt: formatDate(user.createdAt),
      updatedAt: formatDate(user.updatedAt)
    }
  } catch (error) {
    console.error('Get user by email error:', error)
    return null
  }
}

export async function getUserByUsername(username: string, db: Db) {
  try {
    const userResult = await db.select().from(users).where(eq(users.username, username)).limit(1)
    if (userResult.length === 0) return null
    
    const user = userResult[0]
    
    // Safely handle date conversion
    const formatDate = (date: any) => {
      if (!date) return null
      try {
        const dateObj = new Date(date)
        return isNaN(dateObj.getTime()) ? null : dateObj.toISOString()
      } catch {
        return null
      }
    }
    
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      reputation: user.reputationPoints,
      reputationLevel: getReputationLevel(user.reputationPoints),
      createdAt: formatDate(user.createdAt),
      updatedAt: formatDate(user.updatedAt)
    }
  } catch (error) {
    console.error('Get user by username error:', error)
    return null
  }
}

function getReputationLevel(points: number): string {
  if (points >= 1000) return 'Legend'
  if (points >= 500) return 'Expert'
  if (points >= 100) return 'Veteran'
  if (points >= 50) return 'Regular'
  if (points >= 10) return 'Contributor'
  return 'Newbie'
}

// Session management helpers
export async function createSession(userId: string, db: Db, expiresInHours = 24): Promise<string> {
  try {
    const sessionId = crypto.randomUUID()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000)
    
    console.log('Creating session:', { sessionId, userId, now, expiresAt })
    
    await db.insert(sessions).values({
      id: sessionId,
      userId: userId,
      createdAt: now,
      expiresAt: expiresAt
    })
    
    console.log('Session created successfully:', sessionId)
    return sessionId
  } catch (error) {
    console.error('Error creating session:', error)
    throw error
  }
}

export async function getUserIdFromSession(sessionId: string, db: Db): Promise<string | null> {
  const result = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1)
  if (result.length === 0) return null
  // Optionally, check for expiration here
  return result[0].userId
}

export async function deleteSession(sessionId: string, db: Db): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sessionId))
} 
import { Hono } from 'hono'
import { setCookie } from 'hono/cookie'
import { createDb } from '../../../src/utils/db'
import { users } from '../../../drizzle/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { createSession } from '../../../src/utils/auth'

interface Env {
  DB: any
  NODE_ENV: string
}

const app = new Hono<{ Bindings: Env }>()

app.post('/', async (c) => {
  try {
    const { email, password } = await c.req.json()
    
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400)
    }

    const db = createDb(c.env.DB)
    
    // Find user by email
    const userResult = await db.select().from(users).where(eq(users.email, email)).limit(1)
    
    if (userResult.length === 0) {
      return c.json({ error: 'Invalid email or password' }, 401)
    }

    const user = userResult[0]
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if (!isValidPassword) {
      return c.json({ error: 'Invalid email or password' }, 401)
    }

    // Create session
    const sessionId = await createSession(user.id, db)
    
    if (!sessionId) {
      return c.json({ error: 'Failed to create session' }, 500)
    }

    // Set session cookie with proper configuration
    const cookieOptions: any = {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    }
    
    if (c.env.NODE_ENV === 'production') {
      cookieOptions.domain = '.bountyhub.tech'
      cookieOptions.secure = true
      cookieOptions.sameSite = 'none'
    } else {
      cookieOptions.secure = false
      cookieOptions.sameSite = 'lax'
    }
    
    setCookie(c, 'session', sessionId, cookieOptions)

    return c.json({ 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default app 
import { Hono } from 'hono'
import { setCookie } from 'hono/cookie'
import { register, createSession } from '../../../src/utils/auth'
import { createDb } from '../../../src/utils/db'

interface Env {
  NODE_ENV: string
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

app.post(async (c) => {
  const { email, password, username } = await c.req.json()
  
  // Create database instance
  const db = createDb(c.env.DB)
  
  // Use auth function with database
  const result = await register({ email, password, username }, db)
  
  if (result.success && result.user) {
    // Create a session for the user
    const sessionId = await createSession(result.user.id, db)
    
    // Set the session cookie with proper configuration for development/production
    const cookieOptions: any = {
      httpOnly: true, 
      path: '/',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    }
    
    // Configure cookie based on environment
    if (c.env.NODE_ENV === 'production') {
      cookieOptions.domain = '.bountyhub.tech'
      cookieOptions.secure = true
      cookieOptions.sameSite = 'none'
    } else {
      // Development configuration
      cookieOptions.secure = false
      cookieOptions.sameSite = 'lax'
    }
    
    setCookie(c, 'session', sessionId, cookieOptions)
    
    return c.json({ user: result.user })
  }
  
  return c.json({ error: result.error || 'Signup failed' }, 400)
})

export default app 
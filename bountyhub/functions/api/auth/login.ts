import { Hono } from 'hono'
import { setCookie } from 'hono/cookie'
import { login, createSession } from '../../../src/utils/auth'
import { createDb } from '../../../src/utils/db'
import { sessions } from '../../../drizzle/schema'

interface Env {
  NODE_ENV: string
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

app.post(async (c) => {
  try {
    const { email, password } = await c.req.json()
    
    // Create database instance
    const db = createDb(c.env.DB)
    
    // Use auth function with database
    const result = await login({ email, password }, db)
    
    if (result.success && result.user) {
      try {
        // Test if sessions table exists by trying to query it
        try {
          await db.select().from(sessions).limit(1)
          console.log('Sessions table exists and is accessible')
        } catch (tableError) {
          console.error('Sessions table error:', tableError)
          return c.json({ error: 'Database configuration error' }, 500)
        }
        
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
      } catch (sessionError) {
        console.error('Session creation error:', sessionError)
        return c.json({ error: 'Failed to create session' }, 500)
      }
    }
    
    return c.json({ error: result.error || 'Login failed' }, 400)
  } catch (error) {
    console.error('Login endpoint error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default app 
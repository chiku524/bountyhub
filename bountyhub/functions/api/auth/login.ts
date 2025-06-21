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
        
        // Set the session cookie with proper cross-subdomain configuration
        setCookie(c, 'session', sessionId, { 
          httpOnly: true, 
          path: '/',
          domain: '.bountyhub.tech', // Allow cookie to work across subdomains
          secure: true, // Required for SameSite=None
          sameSite: 'none', // Required for cross-subdomain requests
          maxAge: 60 * 60 * 24 * 30 // 30 days
        })
        
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
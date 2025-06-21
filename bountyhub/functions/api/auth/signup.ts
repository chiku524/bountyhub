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
  }
  
  return c.json({ error: result.error || 'Signup failed' }, 400)
})

export default app 
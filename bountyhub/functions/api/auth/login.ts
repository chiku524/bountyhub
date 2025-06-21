import { Hono } from 'hono'
import { setCookie } from 'hono/cookie'
import { login } from '../../../src/utils/auth'
import { createDb } from '../../../src/utils/db'

interface Env {
  NODE_ENV: string
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

app.post(async (c) => {
  const { email, password } = await c.req.json()
  
  // Create database instance
  const db = createDb(c.env.DB)
  
  // Use auth function with database
  const result = await login({ email, password }, db)
  
  if (result.success && result.user) {
    // Set session cookie
    setCookie(c, 'session', 'mock-session-token', { 
      httpOnly: true, 
      path: '/',
      secure: c.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    })
    
    // Return user data (without password)
    const { password: _, ...userData } = result.user
    return c.json({ user: userData })
  }
  
  return c.json({ error: result.error || 'Login failed' }, 401)
})

export default app 
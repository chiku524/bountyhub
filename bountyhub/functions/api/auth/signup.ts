import { Hono } from 'hono'
import { setCookie } from 'hono/cookie'
import { register } from '../../../src/utils/auth'
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
    setCookie(c, 'session', 'mock-session-token', { 
      httpOnly: true, 
      path: '/',
      secure: c.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    })
    
    return c.json({ user: result.user })
  }
  
  return c.json({ error: result.error || 'Signup failed' }, 400)
})

export default app 
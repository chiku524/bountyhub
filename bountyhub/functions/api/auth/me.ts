import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { getUserById, getUserIdFromSession } from '../../../src/utils/auth'
import { createDb } from '../../../src/utils/db'

interface Env {
  NODE_ENV: string
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

app.get(async (c) => {
  const sessionId = getCookie(c, 'session')
  
  if (!sessionId) {
    return c.json(null, 401)
  }

  const db = createDb(c.env.DB)
  
  try {
    // Get the user ID from the session
    const userId = await getUserIdFromSession(sessionId, db)
    
    if (!userId) {
      return c.json(null, 401)
    }
    
    // Get the user data
    const user = await getUserById(userId, db)
    
    if (user) {
      return c.json(user)
    }
  } catch (error) {
    console.error('Error getting user from session:', error)
  }
  
  return c.json(null, 401)
})

export default app 
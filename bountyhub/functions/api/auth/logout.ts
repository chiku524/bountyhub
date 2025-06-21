import { Hono } from 'hono'
import { getCookie, deleteCookie } from 'hono/cookie'
import { deleteSession } from '../../../src/utils/auth'
import { createDb } from '../../../src/utils/db'

interface Env {
  NODE_ENV: string
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

app.post(async (c) => {
  const sessionId = getCookie(c, 'session')
  
  if (sessionId) {
    // Delete the session from the database
    const db = createDb(c.env.DB)
    await deleteSession(sessionId, db)
  }
  
  // Clear the session cookie
  deleteCookie(c, 'session')
  
  return c.json({ success: true })
})

export default app 
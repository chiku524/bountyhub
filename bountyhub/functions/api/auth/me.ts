import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { getUserById } from '../../../src/utils/auth'
import { createDb } from '../../../src/utils/db'

interface Env {
  NODE_ENV: string
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

app.get(async (c) => {
  const session = getCookie(c, 'session')
  
  if (session) {
    // TODO: Implement proper session management to get userId from session
    // For now, return mock user data until we implement proper session management
    const db = createDb(c.env.DB)
    
    // This is a placeholder - in a real implementation, you'd decode the session
    // to get the userId and then fetch the user from the database
    const mockUserId = '1' // This should come from session decoding
    const user = await getUserById(mockUserId, db)
    
    if (user) {
      return c.json(user)
    }
  }
  
  return c.json(null, 401)
})

export default app 
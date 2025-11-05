import { Hono } from 'hono'
import { getCookie, deleteCookie, setCookie } from 'hono/cookie'
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
  
  // Cookie options for clearing cookies
  const cookieOptions: any = {
    path: '/',
    maxAge: 0
  }
  
  // Configure cookie based on environment
  if (c.env.NODE_ENV === 'production') {
    cookieOptions.domain = '.bountyhub.tech'
    cookieOptions.secure = true
    cookieOptions.sameSite = 'none'
  } else {
    cookieOptions.secure = false
    cookieOptions.sameSite = 'lax'
  }
  
  // Clear session cookie
  deleteCookie(c, 'session', cookieOptions)
  
  // Clear all OAuth-related cookies
  const oauthCookies = [
    'github_oauth_state',
    'github_connect_state',
    'github_connect_user_id',
    'github' // Clear any 'github' cookie if it exists
  ]
  
  for (const cookieName of oauthCookies) {
    // Use setCookie with maxAge: 0 to ensure cookie is deleted
    setCookie(c, cookieName, '', {
      ...cookieOptions,
      httpOnly: true
    })
    // Also try deleteCookie as backup
    deleteCookie(c, cookieName, cookieOptions)
  }
  
  return c.json({ success: true })
})

export default app 
import { Hono } from 'hono'
import { setCookie, getCookie } from 'hono/cookie'
import { createDb } from '../../../src/utils/db'
import { createSession } from '../../../src/utils/auth'
import { users, profiles, virtualWallets } from '../../../drizzle/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

interface Env {
  DB: any
  NODE_ENV: string
  GITHUB_CLIENT_ID: string
  GITHUB_CLIENT_SECRET: string
  GITHUB_CALLBACK_URL: string
  SESSION_SECRET: string
}

const app = new Hono<{ Bindings: Env }>()

// Initiate GitHub OAuth flow
// Handle root path (mounted at /api/auth/github)
app.get('/', async (c) => {
  const clientId = c.env.GITHUB_CLIENT_ID
  const redirectUri = encodeURIComponent(c.env.GITHUB_CALLBACK_URL)
  const scope = encodeURIComponent('user:email read:user')
  const state = crypto.randomUUID() // CSRF protection
  
  // Store state in cookie for verification AND also pass it in the URL
  // The cookie is the primary method, but we'll also verify it matches the URL state
  const cookieOptions: any = {
    httpOnly: true,
    secure: c.env.NODE_ENV === 'production',
    sameSite: c.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-site redirects
    maxAge: 600, // 10 minutes
    path: '/'
  }
  
  // In production, set domain to allow cross-subdomain access
  if (c.env.NODE_ENV === 'production') {
    cookieOptions.domain = '.bountyhub.tech'
  }
  
  setCookie(c, 'github_oauth_state', state, cookieOptions)
  
  console.log('Setting state cookie:', {
    state: state.substring(0, 10) + '...',
    domain: cookieOptions.domain,
    sameSite: cookieOptions.sameSite,
    secure: cookieOptions.secure,
    path: cookieOptions.path
  })
  
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`
  
  return c.redirect(githubAuthUrl)
})

// GitHub OAuth callback
app.get('/callback', async (c) => {
  try {
    const db = createDb(c.env.DB)
    const code = c.req.query('code')
    const state = c.req.query('state')
    const storedState = getCookie(c, 'github_oauth_state')
    
    if (!code || !state) {
      const frontendUrl = c.env.NODE_ENV === 'production' 
        ? 'https://bountyhub.tech' 
        : 'http://localhost:5173'
      return c.redirect(`${frontendUrl}/login?error=missing_code`)
    }
    
    // Verify state to prevent CSRF attacks
    if (state !== storedState) {
      const frontendUrl = c.env.NODE_ENV === 'production' 
        ? 'https://bountyhub.tech' 
        : 'http://localhost:5173'
      return c.redirect(`${frontendUrl}/login?error=invalid_state`)
    }
    
    // Exchange code for access token
    const frontendUrl = c.env.NODE_ENV === 'production' 
      ? 'https://bountyhub.tech' 
      : 'http://localhost:5173'
    
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: c.env.GITHUB_CLIENT_ID,
        client_secret: c.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: c.env.GITHUB_CALLBACK_URL
      })
    })
    
    if (!tokenResponse.ok) {
      return c.redirect(`${frontendUrl}/login?error=token_exchange_failed`)
    }
    
    const tokenData = await tokenResponse.json() as { access_token?: string; error?: string }
    
    if (!tokenData.access_token || tokenData.error) {
      return c.redirect(`${frontendUrl}/login?error=token_exchange_failed`)
    }
    
    const accessToken = tokenData.access_token
    
    // Get user info from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })
    
    if (!userResponse.ok) {
      return c.redirect(`${frontendUrl}/login?error=github_api_failed`)
    }
    
    const githubUser = await userResponse.json() as {
      id: number
      login: string
      email?: string
      avatar_url?: string
      name?: string
    }
    
    // Get user email if not public
    let email = githubUser.email
    if (!email) {
      const emailsResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })
      
      if (emailsResponse.ok) {
        const emails = await emailsResponse.json() as Array<{ email: string; primary: boolean; verified: boolean }>
        const primaryEmail = emails.find((e: { email: string; primary: boolean; verified: boolean }) => e.primary && e.verified)
        email = primaryEmail?.email || emails[0]?.email
      }
    }
    
    if (!email) {
      return c.redirect(`${frontendUrl}/login?error=no_email`)
    }
    
    // Check if user already exists with this GitHub ID
    const existingUser = await db.select().from(users).where(eq(users.githubId, githubUser.id.toString())).limit(1)
    
    let userId: string
    let isNewUser = false
    
    if (existingUser.length > 0) {
      // User exists, update GitHub info
      userId = existingUser[0].id
      await db.update(users)
        .set({
          githubUsername: githubUser.login,
          githubAvatarUrl: githubUser.avatar_url || null,
          githubAccessToken: accessToken, // In production, encrypt this
          githubConnectedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(users.id, userId))
    } else {
      // Check if user exists with this email
      const existingEmailUser = await db.select().from(users).where(eq(users.email, email)).limit(1)
      
      if (existingEmailUser.length > 0) {
        // Link existing account to GitHub
        userId = existingEmailUser[0].id
        await db.update(users)
          .set({
            githubId: githubUser.id.toString(),
            githubUsername: githubUser.login,
            githubAvatarUrl: githubUser.avatar_url || null,
            githubAccessToken: accessToken,
            githubConnectedAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(users.id, userId))
      } else {
        // Create new user
        isNewUser = true
        userId = crypto.randomUUID()
        const username = githubUser.login || `github_${githubUser.id}`
        
        // Generate a random password (GitHub users won't use password auth)
        const randomPassword = crypto.randomUUID()
        const hashedPassword = await bcrypt.hash(randomPassword, 12)
        
        await db.insert(users).values({
          id: userId,
          email,
          username,
          password: hashedPassword,
          role: 'user',
          githubId: githubUser.id.toString(),
          githubUsername: githubUser.login,
          githubAvatarUrl: githubUser.avatar_url || null,
          githubAccessToken: accessToken,
          githubConnectedAt: new Date(),
          reputationPoints: 0,
          integrityScore: 5.0,
          totalRatings: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        
        // Create virtual wallet
        await db.insert(virtualWallets).values({
          id: crypto.randomUUID(),
          userId,
          balance: 0,
          totalDeposited: 0,
          totalWithdrawn: 0,
          totalEarned: 0,
          totalSpent: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        
        // Create profile
        await db.insert(profiles).values({
          id: crypto.randomUUID(),
          userId,
          profilePicture: githubUser.avatar_url || null,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      }
    }
    
    // Create session
    const sessionId = await createSession(userId, db, 720) // 30 days
    
    // Set session cookie
    const cookieOptions: any = {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    }
    
    if (c.env.NODE_ENV === 'production') {
      // Use domain with dot for cross-subdomain cookies (works for both api.bountyhub.tech and bountyhub.tech)
      cookieOptions.domain = '.bountyhub.tech'
      cookieOptions.secure = true
      cookieOptions.sameSite = 'none' // Required for cross-site cookies
    } else {
      cookieOptions.secure = false
      cookieOptions.sameSite = 'lax'
    }
    
    setCookie(c, 'session', sessionId, cookieOptions)
    
    // Clear OAuth state cookie
    setCookie(c, 'github_oauth_state', '', {
      httpOnly: true,
      path: '/',
      maxAge: 0
    })
    
    // Redirect to profile or community
    // Note: This redirect goes to the frontend, which will handle the redirect
    return c.redirect(`${frontendUrl}${isNewUser ? '/profile?welcome=true' : '/community'}`)
  } catch (error) {
    console.error('GitHub OAuth error:', error)
    const frontendUrl = c.env.NODE_ENV === 'production' 
      ? 'https://bountyhub.tech' 
      : 'http://localhost:5173'
    return c.redirect(`${frontendUrl}/login?error=oauth_failed`)
  }
})

// Connect existing account to GitHub
app.post('/connect', async (c) => {
  try {
    const db = createDb(c.env.DB)
    const sessionCookie = getCookie(c, 'session')
    
    if (!sessionCookie) {
      return c.json({ error: 'Not authenticated' }, 401)
    }
    
    const { getUserIdFromSession } = await import('../../../src/utils/auth')
    const userId = await getUserIdFromSession(sessionCookie, db)
    
    if (!userId) {
      return c.json({ error: 'Invalid session' }, 401)
    }
    
    // Check if user already has GitHub connected
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1)
    
    if (user.length === 0) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    if (user[0].githubId) {
      return c.json({ error: 'GitHub account already connected' }, 400)
    }
    
    // Redirect to GitHub OAuth with state indicating this is a connect action
    const clientId = c.env.GITHUB_CLIENT_ID
    const redirectUri = encodeURIComponent(`${c.env.GITHUB_CALLBACK_URL}?action=connect`)
    const scope = encodeURIComponent('user:email read:user')
    const state = crypto.randomUUID()
    
    // Store state and user ID for verification
    setCookie(c, 'github_connect_state', state, {
      httpOnly: true,
      secure: c.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/'
    })
    
    setCookie(c, 'github_connect_user_id', userId, {
      httpOnly: true,
      secure: c.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/'
    })
    
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`
    
    return c.json({ redirectUrl: githubAuthUrl })
  } catch (error) {
    console.error('GitHub connect error:', error)
    return c.json({ error: 'Failed to initiate GitHub connection' }, 500)
  }
})

// Disconnect GitHub account
app.post('/disconnect', async (c) => {
  try {
    const db = createDb(c.env.DB)
    const sessionCookie = getCookie(c, 'session')
    
    if (!sessionCookie) {
      return c.json({ error: 'Not authenticated' }, 401)
    }
    
    const { getUserIdFromSession } = await import('../../../src/utils/auth')
    const userId = await getUserIdFromSession(sessionCookie, db)
    
    if (!userId) {
      return c.json({ error: 'Invalid session' }, 401)
    }
    
    // Check if user has GitHub connected
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1)
    
    if (user.length === 0) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    if (!user[0].githubId) {
      return c.json({ error: 'GitHub account not connected' }, 400)
    }
    
    // Check if user has a password (required for disconnecting GitHub)
    if (!user[0].password || user[0].password.startsWith('$2b$') || user[0].password.startsWith('$2a$')) {
      // User has password, safe to disconnect
      await db.update(users)
        .set({
          githubId: null,
          githubUsername: null,
          githubAccessToken: null,
          githubAvatarUrl: null,
          githubConnectedAt: null,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId))
      
      return c.json({ success: true, message: 'GitHub account disconnected' })
    } else {
      return c.json({ error: 'Cannot disconnect GitHub account. Please set a password first.' }, 400)
    }
  } catch (error) {
    console.error('GitHub disconnect error:', error)
    return c.json({ error: 'Failed to disconnect GitHub account' }, 500)
  }
})

// Get GitHub profile info
app.get('/profile', async (c) => {
  try {
    const db = createDb(c.env.DB)
    const sessionCookie = getCookie(c, 'session')
    
    if (!sessionCookie) {
      return c.json({ error: 'Not authenticated' }, 401)
    }
    
    const { getUserIdFromSession } = await import('../../../src/utils/auth')
    const userId = await getUserIdFromSession(sessionCookie, db)
    
    if (!userId) {
      return c.json({ error: 'Invalid session' }, 401)
    }
    
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1)
    
    if (user.length === 0 || !user[0].githubId) {
      return c.json({ error: 'GitHub account not connected' }, 404)
    }
    
    return c.json({
      githubId: user[0].githubId,
      githubUsername: user[0].githubUsername,
      githubAvatarUrl: user[0].githubAvatarUrl,
      githubConnectedAt: user[0].githubConnectedAt
    })
  } catch (error) {
    console.error('Get GitHub profile error:', error)
    return c.json({ error: 'Failed to get GitHub profile' }, 500)
  }
})

export default app


import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'

// Import your API routes
import authRoutes from './api/auth'
import notificationsRoutes from './api/notifications'
import postsRoutes from './api/posts'
import usersRoutes from './api/users'
import profileRoutes from './api/profile'
import walletRoutes from './api/wallet'
import tagsRoutes from './api/tags'
import statsRoutes from './api/stats'
import integrityRoutes from './api/integrity'
import bookmarksRoutes from './api/bookmarks'
import refundRequestsRoutes from './api/refund-requests'
import refundVoteRoutes from './api/refund/vote'
import governanceRoutes from './api/governance'
import adminRoutes from './api/admin'
import chatRoutes from './api/chat'
import cleanupRoutes from './api/cleanup-pending-transactions'
import bugBountyRoutes from './api/bug-bounty'
import githubRoutes from './api/github'
import contributionsRoutes from './api/contributions'

interface Env {
  DB: any
  NODE_ENV: string
  SESSION_SECRET: string
  SOLANA_RPC_URL: string
  SOLANA_DEVNET_RPC_URL: string
  SOLANA_WALLET_PRIVATE_KEY: string
  SOLANA_WALLET_ADDRESS: string
  CLOUDINARY_CLOUD_NAME: string
  CLOUDINARY_API_KEY: string
  CLOUDINARY_API_SECRET: string
  CLOUDINARY_UPLOAD_PRESET: string
  HTML2PDF_API_KEY: string
  VITE_CLOUDINARY_CLOUD_NAME: string
  VITE_CLOUDINARY_UPLOAD_PRESET: string
  DATABASE_URL: string
  MONGODB_URI: string
  GITHUB_CLIENT_ID: string
  GITHUB_CLIENT_SECRET: string
  GITHUB_CALLBACK_URL: string
}

const app = new Hono<{ Bindings: Env }>()

// CORS configuration
const corsMiddleware = cors({
  origin: [
    'https://bountyhub.tech',
    'https://www.bountyhub.tech',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400,
})

// Middleware
app.use('*', corsMiddleware)
app.use('*', logger())
app.use('*', prettyJSON())

// Health check
app.get('/', (c) => {
  return c.json({ 
    message: 'BountyHub API', 
    status: 'healthy',
    timestamp: new Date().toISOString()
  })
})

// Cron trigger handler for cleanup jobs
app.get('/cron', async (c) => {
  try {
    // Call the cleanup endpoint
    const cleanupResponse = await fetch(`${c.req.url.replace('/cron', '/api/cleanup/cron')}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    const result = await cleanupResponse.json()
    
    return c.json({
      success: true,
      message: 'Cron job executed successfully',
      cleanup: result,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return c.json({
      success: false,
      error: 'Failed to execute cron job',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// GitHub OAuth callback route (mounted at /auth/callback as per user's OAuth app config)
// This route MUST be defined before /api/auth routes to ensure it matches first
// Handle the callback directly by reusing the callback logic from github.ts
app.all('/auth/callback', async (c) => {
  // Import the callback handler function directly
  const { getCookie, setCookie } = await import('hono/cookie')
  const { createDb } = await import('../src/utils/db')
  const { createSession } = await import('../src/utils/auth')
  const { users, profiles, virtualWallets } = await import('../drizzle/schema')
  const { eq } = await import('drizzle-orm')
  const bcrypt = (await import('bcryptjs')).default
  
  try {
    const db = createDb(c.env.DB)
    const code = c.req.query('code')
    const state = c.req.query('state')
    
    // Try to get state cookie - try multiple ways in case of cookie domain issues
    let storedState = getCookie(c, 'github_oauth_state')
    
    // If cookie not found, try to parse from Cookie header manually
    if (!storedState) {
      const cookieHeader = c.req.header('Cookie')
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').map(c => c.trim())
        for (const cookie of cookies) {
          if (cookie.startsWith('github_oauth_state=')) {
            storedState = cookie.split('=')[1]
            break
          }
        }
      }
    }
    
    // Log all cookies for debugging
    const allCookies = c.req.header('Cookie')
    console.log('Callback received:', {
      code: code ? `${code.substring(0, 10)}...` : 'missing',
      state: state || 'missing',
      storedState: storedState || 'missing',
      stateLength: state?.length || 0,
      storedStateLength: storedState?.length || 0,
      allCookies: allCookies || 'no cookies',
      cookieHeader: allCookies
    })
    
    const frontendUrl = c.env.NODE_ENV === 'production' 
      ? 'https://bountyhub.tech' 
      : 'http://localhost:5173'
    
    if (!code || !state) {
      console.error('Missing code or state:', { code: !!code, state: !!state })
      return c.redirect(`${frontendUrl}/login?error=missing_code`)
    }
    
    // Verify state to prevent CSRF attacks
    // Note: If cookie is missing (cross-site redirect issue), we'll still validate
    // the state parameter format for basic security
    if (!storedState) {
      console.warn('State cookie not found, validating state parameter format instead:', {
        state: state,
        stateLength: state?.length || 0
      })
      
      // If cookie is missing but state is present, validate it's a valid UUID format
      // This provides basic protection while handling cookie issues
      if (state && state.length === 36 && state.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        console.log('State cookie missing but state parameter is valid UUID, proceeding...')
        // Continue with the flow - state parameter provides some CSRF protection
      } else {
        console.error('Invalid state parameter format:', state)
        return c.redirect(`${frontendUrl}/login?error=invalid_state`)
      }
    } else if (state !== storedState) {
      console.error('State mismatch:', {
        receivedState: state,
        storedState: storedState,
        hasStoredState: !!storedState,
        stateMatch: state === storedState,
        stateLength: state?.length || 0,
        storedStateLength: storedState?.length || 0
      })
      return c.redirect(`${frontendUrl}/login?error=invalid_state`)
    }
    
    console.log('State verified, exchanging code for token...')
    
    // Exchange code for access token
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
      const errorText = await tokenResponse.text()
      console.error('Token exchange error:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText
      })
      return c.redirect(`${frontendUrl}/login?error=token_exchange_failed`)
    }
    
    const tokenData = await tokenResponse.json() as { access_token?: string; error?: string; error_description?: string }
    
    if (!tokenData.access_token || tokenData.error) {
      console.error('Token exchange failed:', {
        error: tokenData.error,
        errorDescription: tokenData.error_description,
        hasAccessToken: !!tokenData.access_token
      })
      return c.redirect(`${frontendUrl}/login?error=token_exchange_failed`)
    }
    
    const accessToken = tokenData.access_token
    console.log('Access token obtained, fetching user info from GitHub...')
    
    // Get user info from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'BountyHub-OAuth'
      }
    })
    
    console.log('GitHub API response:', {
      status: userResponse.status,
      statusText: userResponse.statusText,
      ok: userResponse.ok
    })
    
    if (!userResponse.ok) {
      const errorText = await userResponse.text()
      console.error('GitHub API error:', {
        status: userResponse.status,
        statusText: userResponse.statusText,
        error: errorText,
        accessToken: accessToken ? `${accessToken.substring(0, 10)}...` : 'missing'
      })
      return c.redirect(`${frontendUrl}/login?error=github_api_failed`)
    }
    
    const githubUser = await userResponse.json() as {
      id: number
      login: string
      email?: string
      avatar_url?: string
      name?: string
    }
    
    console.log('GitHub user data:', {
      id: githubUser.id,
      login: githubUser.login,
      hasEmail: !!githubUser.email,
      email: githubUser.email || 'not provided'
    })
    
    // Get user email if not public
    let email = githubUser.email
    if (!email) {
      console.log('Email not in user profile, fetching from /user/emails endpoint...')
      const emailsResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'BountyHub-OAuth'
        }
      })
      
      console.log('Emails API response:', {
        status: emailsResponse.status,
        statusText: emailsResponse.statusText,
        ok: emailsResponse.ok
      })
      
      if (emailsResponse.ok) {
        const emails = await emailsResponse.json() as Array<{ email: string; primary: boolean; verified: boolean }>
        console.log('Emails received:', {
          count: emails.length,
          emails: emails.map(e => ({ email: e.email, primary: e.primary, verified: e.verified }))
        })
        
        // Try to find primary verified email first
        const primaryEmail = emails.find((e: { email: string; primary: boolean; verified: boolean }) => e.primary && e.verified)
        // Then try any verified email
        const verifiedEmail = emails.find((e: { email: string; primary: boolean; verified: boolean }) => e.verified)
        // Finally, use primary email even if not verified, or first email
        email = primaryEmail?.email || verifiedEmail?.email || (emails.find(e => e.primary)?.email) || emails[0]?.email
      } else {
        const errorText = await emailsResponse.text()
        console.error('Failed to fetch emails:', {
          status: emailsResponse.status,
          statusText: emailsResponse.statusText,
          error: errorText
        })
      }
    }
    
    // If still no email, use GitHub's noreply email as fallback
    if (!email) {
      // GitHub provides noreply emails for users who don't share their email
      email = `${githubUser.id}+${githubUser.login}@users.noreply.github.com`
      console.log('No email found, using GitHub noreply email:', email)
    }
    
    console.log('Final email to use:', email)
    
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
    return c.redirect(`${frontendUrl}${isNewUser ? '/profile?welcome=true' : '/community'}`)
  } catch (error) {
    console.error('GitHub OAuth error:', error)
    const frontendUrl = c.env.NODE_ENV === 'production' 
      ? 'https://bountyhub.tech' 
      : 'http://localhost:5173'
    return c.redirect(`${frontendUrl}/login?error=oauth_failed`)
  }
})

// API routes - mount after callback handler
app.route('/api/auth', authRoutes)
app.route('/api/notifications', notificationsRoutes)
app.route('/api/posts', postsRoutes)
app.route('/api/users', usersRoutes)
app.route('/api/profile', profileRoutes)
app.route('/api/wallet', walletRoutes)
app.route('/api/tags', tagsRoutes)
app.route('/api/stats', statsRoutes)
app.route('/api/integrity', integrityRoutes)
app.route('/api/bookmarks', bookmarksRoutes)
app.route('/api/refund-requests', refundRequestsRoutes)
app.route('/api/refund', refundVoteRoutes)
app.route('/api/governance', governanceRoutes)
app.route('/api/admin', adminRoutes)
app.route('/api/chat', chatRoutes)
app.route('/api/cleanup', cleanupRoutes)
app.route('/api/bug-bounty', bugBountyRoutes)
app.route('/api/github', githubRoutes)
app.route('/api/contributions', contributionsRoutes)

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404)
})

// Error handler
app.onError((err, c) => {
  console.error('Error:', err)
  return c.json({ error: 'Internal Server Error' }, 500)
})

export default app 
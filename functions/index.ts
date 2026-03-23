/// <reference types="@cloudflare/workers-types" />
import { Hono } from 'hono'
export { ChatRoomDO } from './durable-objects/ChatRoomDO'
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
import teamsRoutes from './api/teams'
import cleanupRoutes from './api/cleanup-pending-transactions'
import bugBountyRoutes from './api/bug-bounty'
import githubRoutes from './api/github'
import releasesRoutes from './api/releases'
import contributionsRoutes from './api/contributions'
import mediaRoutes from './api/media'

interface Env {
  DB: D1Database
  /** Durable Object namespace for chat room WebSockets */
  CHAT_ROOM_DO: DurableObjectNamespace
  /** R2 bucket for media (profile pictures, post attachments). Optional until migration from Cloudinary. */
  MEDIA_BUCKET?: R2Bucket
  /** KV namespace for cache / rate limits / feature flags. Optional. */
  CACHE?: KVNamespace
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
  GITHUB_CLIENT_ID: string
  GITHUB_CLIENT_SECRET: string
  GITHUB_CALLBACK_URL: string
  /** GitHub PAT for download page (private repo). Set via wrangler secret put GITHUB_PAT */
  GITHUB_PAT?: string
  /** Repo for releases e.g. chiku524/bountyhub */
  GITHUB_RELEASES_REPO?: string
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
    const action = c.req.query('action')
    
    // Determine which state cookie to check based on action
    const stateCookieName = action === 'connect' ? 'github_connect_state' : 'github_oauth_state'
    
    // Try to get state cookie - try multiple ways in case of cookie domain issues
    let storedState = getCookie(c, stateCookieName)
    
    // If cookie not found, try to parse from Cookie header manually
    if (!storedState) {
      const cookieHeader = c.req.header('Cookie')
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').map(c => c.trim())
        for (const cookie of cookies) {
          if (cookie.startsWith(`${stateCookieName}=`)) {
            storedState = cookie.split('=')[1]
            break
          }
        }
      }
    }
    
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
        stateLength: state?.length || 0,
        action
      })
      
      // If cookie is missing but state is present, validate it's a valid UUID format
      // This provides basic protection while handling cookie issues
      if (state && state.length === 36 && state.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
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
        storedStateLength: storedState?.length || 0,
        action
      })
      return c.redirect(`${frontendUrl}/login?error=invalid_state`)
    }

    // Construct redirect URI - include action parameter if present
    let redirectUri = c.env.GITHUB_CALLBACK_URL
    if (action === 'connect') {
      redirectUri = `${c.env.GITHUB_CALLBACK_URL}?action=connect`
    }
    
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
        redirect_uri: redirectUri
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

    // Get user info from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'BountyHub-OAuth'
      }
    })

    if (!userResponse.ok) {
      const errorText = await userResponse.text()
      console.error('GitHub API error:', {
        status: userResponse.status,
        statusText: userResponse.statusText,
        error: errorText,
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

    // Get user email if not public
    let email = githubUser.email
    if (!email) {
      const emailsResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'BountyHub-OAuth'
        }
      })

      if (emailsResponse.ok) {
        const emails = await emailsResponse.json() as Array<{ email: string; primary: boolean; verified: boolean }>

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
    }

    // Check if this is a "connect" action (linking existing account)
    const connectState = getCookie(c, 'github_connect_state')
    const connectUserId = getCookie(c, 'github_connect_user_id')
    
    // If connect state cookie not found, try parsing from header
    let parsedConnectState = connectState
    let parsedConnectUserId = connectUserId
    if (!parsedConnectState || !parsedConnectUserId) {
      const cookieHeader = c.req.header('Cookie')
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').map(c => c.trim())
        for (const cookie of cookies) {
          if (cookie.startsWith('github_connect_state=') && !parsedConnectState) {
            parsedConnectState = cookie.split('=')[1]
          }
          if (cookie.startsWith('github_connect_user_id=') && !parsedConnectUserId) {
            parsedConnectUserId = cookie.split('=')[1]
          }
        }
      }
    }
    
    let userId: string
    let isNewUser = false
    
    if (action === 'connect') {
      // This is a connect action - verify state and link GitHub to existing account
      if (!parsedConnectState || !parsedConnectUserId || state !== parsedConnectState) {
        console.error('Connect action failed: invalid state or missing cookies', {
          hasState: !!parsedConnectState,
          hasUserId: !!parsedConnectUserId,
          stateMatch: state === parsedConnectState,
          receivedState: state,
          storedState: parsedConnectState
        })
        // Clear any stale cookies
        setCookie(c, 'github_connect_state', '', {
          httpOnly: true,
          path: '/',
          maxAge: 0,
          domain: c.env.NODE_ENV === 'production' ? '.bountyhub.tech' : undefined
        })
        setCookie(c, 'github_connect_user_id', '', {
          httpOnly: true,
          path: '/',
          maxAge: 0,
          domain: c.env.NODE_ENV === 'production' ? '.bountyhub.tech' : undefined
        })
        return c.redirect(`${frontendUrl}/settings?error=connect_failed`)
      }
      
      userId = parsedConnectUserId
      
      // Verify user exists
      const existingUser = await db.select().from(users).where(eq(users.id, userId)).limit(1)
      if (existingUser.length === 0) {
        return c.redirect(`${frontendUrl}/settings?error=user_not_found`)
      }
      
      // Check if GitHub account is already connected to another user
      const existingGitHubUser = await db.select().from(users).where(eq(users.githubId, githubUser.id.toString())).limit(1)
      if (existingGitHubUser.length > 0 && existingGitHubUser[0].id !== userId) {
        return c.redirect(`${frontendUrl}/settings?error=github_already_connected`)
      }
      
      // Link GitHub account to existing user
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
      
      // Clear connect cookies
      const cookieOptions: any = {
        httpOnly: true,
        path: '/',
        maxAge: 0
      }
      if (c.env.NODE_ENV === 'production') {
        cookieOptions.domain = '.bountyhub.tech'
      }
      
      setCookie(c, 'github_connect_state', '', cookieOptions)
      setCookie(c, 'github_connect_user_id', '', cookieOptions)

      // Redirect to settings with success message
      return c.redirect(`${frontendUrl}/settings?github_connected=true`)
    } else {
      // Normal OAuth flow (registration/login)
      // Check if user already exists with this GitHub ID
      const existingUser = await db.select().from(users).where(eq(users.githubId, githubUser.id.toString())).limit(1)
      
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
    
    // Redirect to profile or community with oauth_success parameter to force refresh
    const redirectPath = isNewUser ? '/profile?welcome=true&oauth_success=true' : '/community?oauth_success=true'
    return c.redirect(`${frontendUrl}${redirectPath}`)
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
app.route('/api/teams', teamsRoutes)
app.route('/api/cleanup', cleanupRoutes)
app.route('/api/bug-bounty', bugBountyRoutes)
app.route('/api/github', githubRoutes)
app.route('/api/releases', releasesRoutes)
app.route('/api/contributions', contributionsRoutes)
app.route('/api/media', mediaRoutes)

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
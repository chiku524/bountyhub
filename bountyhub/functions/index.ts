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
// This route forwards to the GitHub OAuth callback handler
app.all('/auth/callback', async (c) => {
  // Simply forward to the GitHub callback handler
  // The route will be handled by the auth/github route
  return c.redirect(`/api/auth/github/callback${c.req.url.split('/auth/callback')[1] || ''}`)
})

// API routes
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
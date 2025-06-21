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

// API routes
app.route('/api/auth', authRoutes)
app.route('/api/notifications', notificationsRoutes)
app.route('/api/posts', postsRoutes)
app.route('/api/users', usersRoutes)
app.route('/api/profile', profileRoutes)
app.route('/api/wallet', walletRoutes)
app.route('/api/tags', tagsRoutes)

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
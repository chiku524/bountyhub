import { Hono } from 'hono'
import userProfile from './[username]'
import userPosts from './[username]/posts'

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

// Mount user routes
app.route('/:username', userProfile)
app.route('/:username/posts', userPosts)

export default app 
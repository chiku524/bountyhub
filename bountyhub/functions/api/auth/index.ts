import { Hono } from 'hono'
import login from './login'
import logout from './logout'
import me from './me'
import signup from './signup'

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

// Mount individual route handlers
app.route('/login', login)
app.route('/logout', logout)
app.route('/me', me)
app.route('/signup', signup)

export default app 
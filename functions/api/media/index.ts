import { Hono } from 'hono'
import uploadRoutes from './upload'
import serveRoutes from './[...key]'

interface Env {
  DB: D1Database
  MEDIA_BUCKET?: R2Bucket
}

const app = new Hono<{ Bindings: Env }>()

app.route('/upload', uploadRoutes)
app.route('/', serveRoutes)

export default app

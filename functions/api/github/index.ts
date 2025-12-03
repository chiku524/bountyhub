import { Hono } from 'hono'
import repositoriesRoutes from './repositories'

interface Env {
  DB: any
  GITHUB_CLIENT_ID: string
  GITHUB_CLIENT_SECRET: string
}

const app = new Hono<{ Bindings: Env }>()

// Mount subroutes
app.route('/repositories', repositoriesRoutes)

export default app


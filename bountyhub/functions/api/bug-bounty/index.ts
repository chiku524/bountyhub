import { Hono } from 'hono'
import campaignsRoutes from './campaigns'
import submissionRoutes from './campaigns/[id]/submissions'
import submissionDetailRoute from './submissions/[id]'

interface Env {
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

// Mount subroutes
app.route('/campaigns', campaignsRoutes)
app.route('/campaigns/:id/submissions', submissionRoutes)
app.route('/submissions/:id', submissionDetailRoute)

export default app


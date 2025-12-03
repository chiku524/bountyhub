import { Hono } from 'hono'
import rateRoute from './rate'

interface Env {
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

app.route('/rate', rateRoute)

export default app 
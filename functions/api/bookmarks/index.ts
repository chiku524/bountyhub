import { Hono } from 'hono'
import toggleRoute from './toggle'
import statusRoute from './status'

interface Env {
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

app.route('/toggle', toggleRoute)
app.route('/status', statusRoute)

export default app 
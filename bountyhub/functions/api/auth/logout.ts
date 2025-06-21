import { Hono } from 'hono'
import { setCookie } from 'hono/cookie'

const app = new Hono()

app.post((c) => {
  setCookie(c, 'session', '', { httpOnly: true, path: '/', maxAge: 0 })
  return c.json({ success: true })
})

export default app 
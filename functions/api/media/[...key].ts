import { Hono } from 'hono'

interface Env {
  MEDIA_BUCKET?: R2Bucket
}

const app = new Hono<{ Bindings: Env }>()

// Serve R2 object by path: GET /api/media/profile/userId/uuid.ext -> key = profile/userId/uuid.ext
app.get('*', async (c) => {
  if (!c.env.MEDIA_BUCKET) {
    return c.json({ error: 'Media storage not configured' }, 503)
  }

  const path = c.req.path.replace(/^\/+/, '')
  const keyStr = path || ''

  if (!keyStr || keyStr.includes('..')) {
    return c.json({ error: 'Invalid key' }, 400)
  }

  try {
    const object = await c.env.MEDIA_BUCKET!.get(keyStr)
    if (!object) return c.json({ error: 'Not found' }, 404)

    const contentType = object.httpMetadata?.contentType ?? 'application/octet-stream'
    const headers = new Headers()
    headers.set('Content-Type', contentType)
    headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    if (object.etag) headers.set('ETag', object.etag)

    return new Response(object.body, { status: 200, headers })
  } catch (err) {
    console.error('R2 get error:', err)
    return c.json({ error: 'Failed to get object' }, 500)
  }
})

export default app

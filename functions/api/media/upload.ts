import { Hono } from 'hono'
import { createDb } from '../../../src/utils/db'
import { getUserIdFromSession } from '../../../src/utils/auth'

interface Env {
  DB: D1Database
  MEDIA_BUCKET?: R2Bucket
}

const app = new Hono<{ Bindings: Env }>()

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']

app.post(async (c) => {
  if (!c.env.MEDIA_BUCKET) {
    return c.json({ error: 'Media storage not configured' }, 503)
  }

  const sessionId = c.get('sessionId')
  if (!sessionId) return c.json({ error: 'Unauthorized' }, 401)

  const db = createDb(c.env.DB)
  const userId = await getUserIdFromSession(sessionId, db)
  if (!userId) return c.json({ error: 'Unauthorized' }, 401)

  const formData = await c.req.formData()
  const file = formData.get('file') as File | null
  const type = (formData.get('type') as string) || 'post' // 'profile' | 'post'

  if (!file || !(file instanceof File)) {
    return c.json({ error: 'No file provided' }, 400)
  }

  if (file.size > MAX_FILE_SIZE) {
    return c.json({ error: 'File size must be less than 10MB' }, 400)
  }

  const isAllowed = ALLOWED_TYPES.includes(file.type) || file.type.startsWith('image/') || file.type.startsWith('video/')
  if (!isAllowed) {
    return c.json({ error: 'Invalid file type. Allowed: image (jpeg, png, gif, webp), video (mp4, webm)' }, 400)
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
  const safeExt = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm'].includes(ext) ? ext : 'bin'
  const key = `${type}/${userId}/${crypto.randomUUID()}.${safeExt}`

  try {
    const arrayBuffer = await file.arrayBuffer()
    await c.env.MEDIA_BUCKET!.put(key, arrayBuffer, {
      httpMetadata: { contentType: file.type },
      customMetadata: { userId, originalName: file.name },
    })
  } catch (err) {
    console.error('R2 upload error:', err)
    return c.json({ error: 'Failed to upload file' }, 500)
  }

  const baseUrl = c.req.url.replace(/\/api\/media\/upload.*$/, '')
  const url = `${baseUrl}/api/media/${key}`

  return c.json({ success: true, url, key })
})

export default app

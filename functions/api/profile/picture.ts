import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { createDb } from '../../../src/utils/db'
import { getUserIdFromSession } from '../../../src/utils/auth'
import { profiles } from '../../../drizzle/schema'
import { eq } from 'drizzle-orm'

interface Env {
  DB: D1Database
  NODE_ENV: string
  MEDIA_BUCKET?: R2Bucket
  CLOUDINARY_CLOUD_NAME: string
  CLOUDINARY_API_KEY: string
  CLOUDINARY_API_SECRET: string
  CLOUDINARY_UPLOAD_PRESET: string
}

const app = new Hono<{ Bindings: Env }>()

// Helper function to upload to Cloudinary
async function uploadToCloudinary(file: File, cloudName: string, uploadPreset: string): Promise<{ secure_url: string; public_id: string }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', 'bountyhub/profiles')
  
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Cloudinary upload failed: ${response.status} ${response.statusText} - ${errorText}`)
  }

  const result = await response.json() as { secure_url: string; public_id: string }
  return {
    secure_url: result.secure_url,
    public_id: result.public_id
  }
}

app.post(async (c) => {
  const sessionId = getCookie(c, 'session')
  
  if (!sessionId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const db = createDb(c.env.DB)
  
  try {
    // Get the user ID from the session
    const userId = await getUserIdFromSession(sessionId, db)
    
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    // Get the form data
    const formData = await c.req.formData()
    const file = formData.get('profilePicture') as File

    if (!file) {
      return c.json({ error: 'No file provided' }, 400)
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return c.json({ error: 'File must be an image' }, 400)
    }

    // Validate file size (max 10MB for profile pictures)
    if (file.size > 10 * 1024 * 1024) {
      return c.json({ error: 'File size must be less than 10MB' }, 400)
    }

    let profilePictureUrl: string

    // Prefer R2 when MEDIA_BUCKET is bound
    if (c.env.MEDIA_BUCKET) {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const safeExt = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) ? ext : 'jpg'
      const key = `profile/${userId}/${crypto.randomUUID()}.${safeExt}`
      const arrayBuffer = await file.arrayBuffer()
      await c.env.MEDIA_BUCKET.put(key, arrayBuffer, {
        httpMetadata: { contentType: file.type },
        customMetadata: { userId },
      })
      const baseUrl = c.req.url.replace(/\/api\/profile\/picture.*$/, '')
      profilePictureUrl = `${baseUrl}/api/media/${key}`
    } else {
      const cloudName = c.env.CLOUDINARY_CLOUD_NAME
      const uploadPreset = c.env.CLOUDINARY_UPLOAD_PRESET
      if (!cloudName || !uploadPreset) {
        return c.json({ error: 'Media storage not configured' }, 500)
      }
      const uploadResult = await uploadToCloudinary(file, cloudName, uploadPreset)
      profilePictureUrl = uploadResult.secure_url
    }

    // Check if profile exists
    const existingProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1)

    if (existingProfile.length > 0) {
      await db
        .update(profiles)
        .set({
          profilePicture: profilePictureUrl,
          updatedAt: new Date(),
        })
        .where(eq(profiles.userId, userId))
    } else {
      await db.insert(profiles).values({
        id: crypto.randomUUID(),
        userId: userId,
        profilePicture: profilePictureUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    return c.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      profilePicture: profilePictureUrl,
    })
  } catch (error) {
    console.error('Error uploading profile picture:', error)
    return c.json({ error: 'Failed to upload profile picture' }, 500)
  }
})

export default app 
import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { createDb } from '../../../src/utils/db'
import { getUserIdFromSession } from '../../../src/utils/auth'
import { bookmarks } from '../../../drizzle/schema'
import { eq, and } from 'drizzle-orm'

interface Env {
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

app.post(async (c) => {
  const sessionId = getCookie(c, 'session')
  
  if (!sessionId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const db = createDb(c.env.DB)
  
  // Get the user ID from the session
  const userId = await getUserIdFromSession(sessionId, db)
  
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const { postId } = await c.req.json()
    
    if (!postId) {
      return c.json({ error: 'Missing postId' }, 400)
    }

    // Check if bookmark already exists
    const existingBookmark = await db
      .select()
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.postId, postId),
          eq(bookmarks.userId, userId)
        )
      )
      .limit(1)

    if (existingBookmark.length > 0) {
      // Remove bookmark
      await db
        .delete(bookmarks)
        .where(
          and(
            eq(bookmarks.postId, postId),
            eq(bookmarks.userId, userId)
          )
        )
      return c.json({ bookmarked: false })
    } else {
      // Add bookmark
      await db.insert(bookmarks).values({
        id: crypto.randomUUID(),
        postId,
        userId,
        createdAt: new Date()
      })
      return c.json({ bookmarked: true })
    }

  } catch (error) {
    console.error('Error toggling bookmark:', error)
    return c.json({ error: 'Failed to toggle bookmark' }, 500)
  }
})

export default app 
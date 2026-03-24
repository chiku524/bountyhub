import { Hono } from 'hono'
import { createDb } from '../../../src/utils/db'
import { getUserIdFromSession } from '../../../src/utils/auth'
import { bookmarks } from '../../../drizzle/schema'
import { eq, and, inArray } from 'drizzle-orm'

interface Env {
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

app.get(async (c) => {
  const sessionId = c.get('sessionId')
  
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
    const postIdsParam = c.req.query('postIds')
    
    if (!postIdsParam) {
      return c.json({ error: 'Missing postIds parameter' }, 400)
    }

    let postIds: string[]
    try {
      postIds = JSON.parse(decodeURIComponent(postIdsParam))
    } catch (_error) {
      return c.json({ error: 'Invalid postIds format' }, 400)
    }

    if (!Array.isArray(postIds) || postIds.length === 0) {
      return c.json({ status: {} })
    }

    // Get bookmarks for the specified posts
    const userBookmarks = await db
      .select({
        postId: bookmarks.postId
      })
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, userId),
          inArray(bookmarks.postId, postIds)
        )
      )

    // Create a map of bookmarked post IDs
    const bookmarkedStatus: { [postId: string]: boolean } = {}
    postIds.forEach(postId => {
      bookmarkedStatus[postId] = userBookmarks.some(bm => bm.postId === postId)
    })

    return c.json({ status: bookmarkedStatus })

  } catch (error) {
    console.error('Error fetching bookmark status:', error)
    return c.json({ error: 'Failed to fetch bookmark status' }, 500)
  }
})

export default app 
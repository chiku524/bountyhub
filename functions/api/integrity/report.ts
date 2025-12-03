import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { createDb } from '../../../src/utils/db'
import { getUserIdFromSession } from '../../../src/utils/auth'
import { posts, answers, comments, users } from '../../../drizzle/schema'
import { eq } from 'drizzle-orm'
import { updateReputation } from '../../../src/utils/reputation'

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
    const { contentType, contentId, reason, description } = await c.req.json()
    
    // Validate input
    if (!contentType || !contentId || !reason) {
      return c.json({ error: 'Missing required fields' }, 400)
    }
    
    if (!['post', 'answer', 'comment'].includes(contentType)) {
      return c.json({ error: 'Invalid content type' }, 400)
    }
    
    if (description && description.length > 1000) {
      return c.json({ error: 'Description must be less than 1000 characters' }, 400)
    }

    let contentAuthorId: string | null = null

    // Get the content and its author based on content type
    switch (contentType) {
      case 'post':
        const postResult = await db.select({ authorId: posts.authorId }).from(posts).where(eq(posts.id, contentId)).limit(1)
        if (postResult.length === 0) {
          return c.json({ error: 'Post not found' }, 404)
        }
        contentAuthorId = postResult[0].authorId
        break
        
      case 'answer':
        const answerResult = await db.select({ authorId: answers.authorId }).from(answers).where(eq(answers.id, contentId)).limit(1)
        if (answerResult.length === 0) {
          return c.json({ error: 'Answer not found' }, 404)
        }
        contentAuthorId = answerResult[0].authorId
        break
        
      case 'comment':
        const commentResult = await db.select({ authorId: comments.authorId }).from(comments).where(eq(comments.id, contentId)).limit(1)
        if (commentResult.length === 0) {
          return c.json({ error: 'Comment not found' }, 404)
        }
        contentAuthorId = commentResult[0].authorId
        break
    }

    // Prevent self-reporting
    if (contentAuthorId === userId) {
      return c.json({ error: 'Cannot report your own content' }, 400)
    }

    // Get reporter username
    const reporter = await db.select({ username: users.username }).from(users).where(eq(users.id, userId)).limit(1)
    const reporterUsername = reporter[0]?.username || 'Unknown'

    // Log the report (you might want to create a reports table for this)
    console.log(`Content reported by ${reporterUsername}:`, {
      contentType,
      contentId,
      reason,
      description,
      reporterId: userId,
      contentAuthorId
    })

    // Deduct reputation from the content author
    if (contentAuthorId) {
      await updateReputation(db, contentAuthorId, 'CONTENT_FLAGGED', contentId)
    }

    return c.json({ 
      success: true, 
      message: 'Content reported successfully. The content will be reviewed by moderators.' 
    })

  } catch (error) {
    console.error('Error processing content report:', error)
    return c.json({ error: 'Failed to process report' }, 500)
  }
})

export default app 
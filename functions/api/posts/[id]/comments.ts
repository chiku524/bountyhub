import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { createDb } from '../../../../src/utils/db'
import { getUserIdFromSession } from '../../../../src/utils/auth'
import { comments, users, votes, posts, profiles } from '../../../../drizzle/schema'
import { eq, and } from 'drizzle-orm'
import { updateReputation } from '../../../../src/utils/reputation'
import { createCommentNotification } from '../../../../src/utils/notifications'

interface Env {
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

// Get comments for a post with author information
app.get(async (c) => {
  const db = createDb(c.env.DB)
  const postId = c.req.param('id')
  if (!postId) return c.json({ error: 'Missing post id' }, 400)
  
  try {
    // Get comments with author information
    const postComments = await db.select({
      id: comments.id,
      content: comments.content,
      authorId: comments.authorId,
      postId: comments.postId,
      createdAt: comments.createdAt,
      updatedAt: comments.updatedAt,
      upvotes: comments.upvotes,
      downvotes: comments.downvotes,
      author: {
        id: users.id,
        username: users.username,
        email: users.email,
        profilePicture: profiles.profilePicture
      }
    })
    .from(comments)
    .leftJoin(users, eq(comments.authorId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(eq(comments.postId, postId))

    // Get current user's votes if authenticated
    const sessionCookie = getCookie(c, 'session')
    let userVotes: Record<string, number> = {}
    
    if (sessionCookie) {
      const userId = await getUserIdFromSession(sessionCookie, db)
      if (userId) {
        const commentIds = postComments.map(comment => comment.id)
        if (commentIds.length > 0) {
          const userVoteResults = await db.select({
            commentId: votes.commentId,
            value: votes.value
          })
          .from(votes)
          .where(
            and(
              eq(votes.userId, userId),
              eq(votes.voteType, 'comment')
            )
          )
          
          userVotes = userVoteResults.reduce((acc, vote) => {
            if (vote.commentId) {
              acc[vote.commentId] = vote.value
            }
            return acc
          }, {} as Record<string, number>)
        }
      }
    }

    return c.json({
      comments: postComments,
      userVotes
    })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return c.json({ error: 'Failed to fetch comments' }, 500)
  }
})

// Create a new comment
app.post(async (c) => {
  const sessionId = getCookie(c, 'session')
  
  if (!sessionId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const db = createDb(c.env.DB)
  const postId = c.req.param('id')
  if (!postId) return c.json({ error: 'Missing post id' }, 400)
  
  const { content } = await c.req.json()
  if (!content) return c.json({ error: 'Missing content' }, 400)
  
  try {
    const userId = await getUserIdFromSession(sessionId, db)
    
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    // Get user information
    const userResult = await db.select({
      id: users.id,
      username: users.username,
      email: users.email
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

    const user = userResult[0]
  
    const newComment = {
      id: crypto.randomUUID(),
      content,
      authorId: userId,
      postId,
      createdAt: new Date(),
      updatedAt: new Date(),
      upvotes: 0,
      downvotes: 0
    }
    
    await db.insert(comments).values(newComment)
    await updateReputation(db, userId, 'COMMENT_CREATED', newComment.id)
    
    // Create notification for post author (if commenter is not the post author)
    try {
      const postResult = await db.select({
        authorId: posts.authorId,
        title: posts.title
      })
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1)

      if (postResult.length > 0 && postResult[0].authorId !== userId) {
        await createCommentNotification(
          db,
          postResult[0].authorId,
          user.username,
          postResult[0].title,
          postId
        )
      }
    } catch (notificationError) {
      console.error('Error creating comment notification:', notificationError)
      // Don't fail the comment creation if notification fails
    }
    
    // Return comment with author information
    return c.json({
      ...newComment,
      author: user
    }, 201)
  } catch (error) {
    console.error('Error creating comment:', error)
    return c.json({ error: 'Failed to create comment' }, 500)
  }
})

export default app 
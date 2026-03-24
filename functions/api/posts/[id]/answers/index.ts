import { Hono } from 'hono'
import { createDb } from '../../../../../src/utils/db'
import { getUserIdFromSession } from '../../../../../src/utils/auth'
import { answers, users, votes, posts, answerCodeBlocks, profiles } from '../../../../../drizzle/schema'
import { eq, and } from 'drizzle-orm'
import { updateReputation } from '../../../../../src/utils/reputation'
import { createAnswerNotification } from '../../../../../src/utils/notifications'

interface Env {
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

// Get answers for a post with author information
app.get(async (c) => {
  const db = createDb(c.env.DB)
  const postId = c.req.param('id')
  if (!postId) return c.json({ error: 'Missing post id' }, 400)
  
  try {
    // Get answers with author information
    const postAnswers = await db.select({
      id: answers.id,
      content: answers.content,
      authorId: answers.authorId,
      postId: answers.postId,
      createdAt: answers.createdAt,
      updatedAt: answers.updatedAt,
      upvotes: answers.upvotes,
      downvotes: answers.downvotes,
      isAccepted: answers.isAccepted,
      author: {
        id: users.id,
        username: users.username,
        email: users.email,
        profilePicture: profiles.profilePicture
      }
    })
    .from(answers)
    .leftJoin(users, eq(answers.authorId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(eq(answers.postId, postId))

    // Get code blocks for each answer
    const answersWithCodeBlocks = await Promise.all(
      postAnswers.map(async (answer) => {
        const codeBlocks = await db.select({
          id: answerCodeBlocks.id,
          language: answerCodeBlocks.language,
          code: answerCodeBlocks.code,
          description: answerCodeBlocks.description,
          createdAt: answerCodeBlocks.createdAt,
          updatedAt: answerCodeBlocks.updatedAt
        })
        .from(answerCodeBlocks)
        .where(eq(answerCodeBlocks.answerId, answer.id))

        return {
          ...answer,
          codeBlocks
        }
      })
    )

    // Get current user's votes if authenticated
    const sessionCookie = c.get('sessionId')
    let userVotes: Record<string, number> = {}
    
    if (sessionCookie) {
      const userId = await getUserIdFromSession(sessionCookie, db)
      if (userId) {
        const answerIds = postAnswers.map(answer => answer.id)
        if (answerIds.length > 0) {
          const userVoteResults = await db.select({
            answerId: votes.answerId,
            value: votes.value
          })
          .from(votes)
          .where(
            and(
              eq(votes.userId, userId),
              eq(votes.voteType, 'answer')
            )
          )
          
          userVotes = userVoteResults.reduce((acc, vote) => {
            if (vote.answerId) {
              acc[vote.answerId] = vote.value
            }
            return acc
          }, {} as Record<string, number>)
        }
      }
    }

    return c.json({
      answers: answersWithCodeBlocks,
      userVotes
    })
  } catch (error) {
    console.error('Error fetching answers:', error)
    return c.json({ error: 'Failed to fetch answers' }, 500)
  }
})

// Create a new answer
app.post(async (c) => {
  const sessionCookie = c.get('sessionId')
  
  if (!sessionCookie) {
    return c.json({ error: 'Not authenticated' }, 401)
  }

  const db = createDb(c.env.DB)
  const postId = c.req.param('id')
  if (!postId) return c.json({ error: 'Missing post id' }, 400)
  
  const { content, codeBlocks = [] } = await c.req.json()
  if (!content) return c.json({ error: 'Missing content' }, 400)
  
  try {
    const userId = await getUserIdFromSession(sessionCookie, db)
    
    if (!userId) {
      return c.json({ error: 'Not authenticated' }, 401)
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
  
    const newAnswer = {
      id: crypto.randomUUID(),
      content,
      authorId: userId,
      postId,
      createdAt: new Date(),
      updatedAt: new Date(),
      upvotes: 0,
      downvotes: 0,
      isAccepted: false
    }
    
    await db.insert(answers).values(newAnswer)
    
    // Insert code blocks if provided
    if (codeBlocks && codeBlocks.length > 0) {
      const codeBlockValues = codeBlocks.map((block: any) => ({
        id: crypto.randomUUID(),
        language: block.language,
        code: block.code,
        description: block.description || null,
        answerId: newAnswer.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
      
      await db.insert(answerCodeBlocks).values(codeBlockValues)
    }
    
    // Award reputation to the author for creating an answer
    await updateReputation(db, userId, 'ANSWER_CREATED', newAnswer.id)
    
    // Create notification for post author (if answerer is not the post author)
    try {
      const postResult = await db.select({
        authorId: posts.authorId,
        title: posts.title
      })
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1)

      if (postResult.length > 0 && postResult[0].authorId !== userId) {
        await createAnswerNotification(
          db,
          postResult[0].authorId,
          user.username,
          postResult[0].title,
          postId
        )
      }
    } catch (notificationError) {
      console.error('Error creating answer notification:', notificationError)
      // Don't fail the answer creation if notification fails
    }
    
    // Get the created code blocks for the response
    const createdCodeBlocks = await db.select({
      id: answerCodeBlocks.id,
      language: answerCodeBlocks.language,
      code: answerCodeBlocks.code,
      description: answerCodeBlocks.description,
      createdAt: answerCodeBlocks.createdAt,
      updatedAt: answerCodeBlocks.updatedAt
    })
    .from(answerCodeBlocks)
    .where(eq(answerCodeBlocks.answerId, newAnswer.id))
    
    // Return answer with author information and code blocks
    return c.json({
      ...newAnswer,
      author: user,
      codeBlocks: createdCodeBlocks
    }, 201)
  } catch (error) {
    console.error('Error creating answer:', error)
    return c.json({ error: 'Failed to create answer' }, 500)
  }
})

export default app 
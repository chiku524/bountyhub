import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { createDb } from '../../../src/utils/db'
import { getUserIdFromSession } from '../../../src/utils/auth'
import { posts, postTags, bounties, media, codeBlocks, users, votes, tags, profiles, virtualWallets } from '../../../drizzle/schema'
import { eq, sql, desc } from 'drizzle-orm'
import { GovernanceService } from '../../../src/utils/governance'

// Import subroutes for comments and voting
import commentsRoute from './[id]/comments'
import voteRoute from './[id]/vote'
import commentVoteRoute from './[id]/comments/[commentId]/vote'
import answersRoute from './[id]/answers'
import answerVoteRoute from './[id]/answers/[answerId]/vote'
import answerAcceptRoute from './[id]/answers/[answerId]/accept'
import { getPostChatRoom, getPostChatMessages, postPostChatMessage } from './[id]/chat'

interface Env {
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

// GET all posts with pagination
app.get(async (c) => {
  const sessionId = getCookie(c, 'session')
  const db = createDb(c.env.DB)
  
  try {
    // Get pagination parameters from query string
    const page = parseInt(c.req.query('page') || '1', 10)
    const limit = parseInt(c.req.query('limit') || '20', 10)
    
    // Validate pagination parameters
    const validPage = Math.max(1, page)
    const validLimit = Math.min(Math.max(1, limit), 100) // Max 100 posts per page
    const validOffset = (validPage - 1) * validLimit

    // Get user ID from session if available
    let userId: string | null = null
    if (sessionId) {
      userId = await getUserIdFromSession(sessionId, db)
    }

    // Get total count of posts for pagination metadata
    const totalPostsResult = await db.select({ count: sql<number>`count(*)` }).from(posts)
    const totalPosts = Number(totalPostsResult[0]?.count || 0)

    // Get posts with author information (paginated)
    const postsWithAuthors = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        authorId: posts.authorId,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        visibilityVotes: posts.visibilityVotes,
        qualityUpvotes: posts.qualityUpvotes,
        qualityDownvotes: posts.qualityDownvotes,
        hasBounty: posts.hasBounty,
        status: posts.status,
        reward: bounties.amount,
        author: {
          id: users.id,
          username: users.username,
          email: users.email,
          profilePicture: profiles.profilePicture
        }
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .leftJoin(bounties, eq(posts.id, bounties.postId))
      .orderBy(desc(posts.createdAt))
      .limit(validLimit)
      .offset(validOffset)

    // Get tags for all posts
    const postTagsData = await db
      .select({
        postId: postTags.postId,
        tagName: tags.name
      })
      .from(postTags)
      .leftJoin(tags, eq(postTags.tagId, tags.id))

    // Group tags by post ID
    const tagsByPostId = postTagsData.reduce((acc: { [postId: string]: string[] }, item) => {
      if (item.postId && item.tagName) {
        if (!acc[item.postId]) {
          acc[item.postId] = []
        }
        acc[item.postId].push(item.tagName)
      }
      return acc
    }, {})

    // If user is authenticated, get their votes for all posts
    let userVotes: { [postId: string]: number } = {}
    if (userId) {
      const userVotesData = await db
        .select({
          postId: votes.postId,
          value: votes.value
        })
        .from(votes)
        .where(eq(votes.userId, userId))

      userVotes = userVotesData.reduce((acc: { [postId: string]: number }, vote: { postId: string | null; value: number }) => {
        if (vote.postId) {
          acc[vote.postId] = vote.value
        }
        return acc
      }, {} as { [postId: string]: number })
    }

    // Add user votes and tags to posts
    const postsWithVotes = postsWithAuthors.map(post => {
      // Safe date formatting function
      const formatDate = (dateValue: any): string => {
        if (!dateValue) return new Date().toISOString()
        
        try {
          // If it's already a valid ISO string, return it as is
          if (typeof dateValue === 'string' && dateValue.includes('T') && dateValue.includes('Z')) {
            return dateValue
          }
          
          // Handle different date formats
          let date: Date
          if (typeof dateValue === 'number') {
            // If it's a timestamp, check if it's in seconds or milliseconds
            // Unix timestamps in seconds are typically 10 digits, milliseconds are 13 digits
            if (dateValue < 10000000000) {
              // Likely in seconds, convert to milliseconds
              date = new Date(dateValue * 1000)
            } else {
              // Likely in milliseconds
              date = new Date(dateValue)
            }
          } else if (typeof dateValue === 'string') {
            // If it's a string, try to parse it
            date = new Date(dateValue)
          } else {
            // If it's already a Date object
            date = dateValue
          }
          
          // Check if the date is valid
          if (isNaN(date.getTime())) {
            return new Date().toISOString()
          }
          
          return date.toISOString()
        } catch (_error) {
          return new Date().toISOString()
        }
      }

      const formattedPost = {
        ...post,
        userVote: userVotes[post.id] || 0,
        tags: tagsByPostId[post.id] || [],
        createdAt: formatDate(post.createdAt),
        updatedAt: formatDate(post.updatedAt)
      }

      return formattedPost
    })

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalPosts / validLimit)
    const hasNextPage = validPage < totalPages
    const hasPrevPage = validPage > 1

    return c.json({
      posts: postsWithVotes,
      pagination: {
        page: validPage,
        limit: validLimit,
        total: totalPosts,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return c.json({ error: 'Failed to fetch posts' }, 500)
  }
})

// POST create new post
app.post(async (c) => {
  const db = createDb(c.env.DB)
  
  try {
    const body = await c.req.json()
    const { title, content, selectedTags, codeBlocks: codeBlocksData, media: mediaData, hasBounty, bountyAmount, bountyDuration } = body
    
    // Get user ID from session
    const sessionCookie = getCookie(c, 'session')
    if (!sessionCookie) {
      return c.json({ error: 'Not authenticated' }, 401)
    }
    
    const userId = await getUserIdFromSession(sessionCookie, db)
    if (!userId) {
      return c.json({ error: 'Invalid session' }, 401)
    }
    
    // Validate that at least one tag is selected
    if (!selectedTags || selectedTags.length === 0) {
      return c.json({ error: 'At least one tag is required' }, 400)
    }
    
    // Create the post
    const now = new Date()
    const [post] = await db.insert(posts).values({
      id: crypto.randomUUID(),
      title,
      content,
      authorId: userId,
      createdAt: now,
      updatedAt: now,
      editedAt: null,
      hasBounty: hasBounty && bountyAmount > 0
    }).returning()

    const postId = post.id

    // Add tags if provided
    if (selectedTags && selectedTags.length > 0) {
      const tagRelations = selectedTags.map((tagId: string) => ({
        id: crypto.randomUUID(),
        postId,
        tagId
      }))

      await db.insert(postTags).values(tagRelations)
    }

    // Add code blocks if provided (frontend sends .code, some clients may send .content)
    if (codeBlocksData && codeBlocksData.length > 0) {
      for (let index = 0; index < codeBlocksData.length; index++) {
        const block = codeBlocksData[index]
        const codeContent = block.code ?? block.content
        if (codeContent && block.language) {
          try {
            await db.insert(codeBlocks).values({
              id: crypto.randomUUID(),
              language: block.language,
              code: codeContent,
              description: block.description || null,
              postId,
              createdAt: new Date(),
              updatedAt: new Date()
            })
          } catch (_error) {
            // Continue without this code block if insertion fails
          }
        }
      }
    }

    // Add media if provided
    if (mediaData && mediaData.length > 0) {
      for (let index = 0; index < mediaData.length; index++) {
        const item = mediaData[index]
        
        if (item.url && item.type) {
          try {
            await db.insert(media).values({
              id: crypto.randomUUID(),
              type: item.type,
              url: item.url,
              thumbnailUrl: item.thumbnailUrl || null,
              isScreenRecording: item.isScreenRecording || false,
              cloudinaryId: item.url.split('/').pop()?.split('.')[0] || crypto.randomUUID(),
              postId,
              createdAt: new Date(),
              updatedAt: new Date()
            })
          } catch (_error) {
            // Continue without this media item if insertion fails
          }
        }
      }
    }

    // Create bounty if requested
    if (hasBounty && bountyAmount > 0) {
      const bountyId = crypto.randomUUID()
      const now = new Date()
      const expiresAt = new Date(now)
      expiresAt.setDate(expiresAt.getDate() + bountyDuration)

      // Collect governance fee using the governance service
      const governanceResult = await GovernanceService.collectGovernanceFee(
        db,
        userId,
        bountyAmount,
        bountyId
      )

      if (!governanceResult.success) {
        return c.json({ 
          error: 'Failed to collect governance fee', 
          details: governanceResult.error 
        }, 400)
      }

      await db.insert(bounties).values({
        id: bountyId,
        postId,
        amount: bountyAmount,
        status: 'ACTIVE',
        tokenDecimals: 9,
        refundLockPeriod: 24,
        refundPenalty: 0,
        communityFee: 0.05,
        expiresAt: expiresAt,
        createdAt: now,
        updatedAt: now
      })
    }

    // Fetch the full post with author and tags
    const [fullPost] = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        authorId: posts.authorId,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        visibilityVotes: posts.visibilityVotes,
        qualityUpvotes: posts.qualityUpvotes,
        qualityDownvotes: posts.qualityDownvotes,
        hasBounty: posts.hasBounty,
        status: posts.status,
        author: {
          id: users.id,
          username: users.username,
          email: users.email,
          profilePicture: profiles.profilePicture
        }
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(posts.id, postId))

    // Get tags for the post
    const postTagsData = await db
      .select({
        postId: postTags.postId,
        tagName: tags.name
      })
      .from(postTags)
      .leftJoin(tags, eq(postTags.tagId, tags.id))
      .where(eq(postTags.postId, postId))

    const tagsList = postTagsData.map(item => item.tagName).filter(Boolean)

    // Ensure createdAt is a valid ISO string
    const formatDate = (dateValue: any): string => {
      if (!dateValue) return new Date().toISOString()
      
      try {
        // If it's already a valid ISO string, return it as is
        if (typeof dateValue === 'string' && dateValue.includes('T') && dateValue.includes('Z')) {
          return dateValue
        }
        
        // Handle different date formats
        let date: Date
        if (typeof dateValue === 'number') {
          // If it's a timestamp, check if it's in seconds or milliseconds
          // Unix timestamps in seconds are typically 10 digits, milliseconds are 13 digits
          if (dateValue < 10000000000) {
            // Likely in seconds, convert to milliseconds
            date = new Date(dateValue * 1000)
          } else {
            // Likely in milliseconds
            date = new Date(dateValue)
          }
        } else if (typeof dateValue === 'string') {
          // If it's a string, try to parse it
          date = new Date(dateValue)
        } else {
          // If it's already a Date object
          date = dateValue
        }
        
        // Check if the date is valid
        if (isNaN(date.getTime())) {
          return new Date().toISOString()
        }
        
        return date.toISOString()
      } catch (_error) {
        return new Date().toISOString()
      }
    }

    const postWithValidDates = {
      ...fullPost,
      createdAt: formatDate(fullPost.createdAt),
      updatedAt: formatDate(fullPost.updatedAt),
      tags: tagsList,
      reward: bountyAmount
    }

    return c.json({ 
      success: true, 
      post: postWithValidDates,
      message: 'Post created successfully' 
    }, 201)
    
  } catch (error: any) {
    console.error('Error creating post:', error)
    return c.json({ error: 'Failed to create post', details: error.message }, 500)
  }
})

// Post chat: register explicitly so :id is always available (avoids 404 when mounted subApp loses param)
app.get('/:id/chat', async (c) => {
  const postId = c.req.param('id')
  if (!postId) return c.json({ success: false, error: 'Missing post id' }, 400)
  return getPostChatRoom(c, postId)
})
app.get('/:id/chat/messages', async (c) => {
  const postId = c.req.param('id')
  if (!postId) return c.json({ success: false, error: 'Missing post id' }, 400)
  return getPostChatMessages(c, postId)
})
app.post('/:id/chat/messages', async (c) => {
  const postId = c.req.param('id')
  if (!postId) return c.json({ success: false, error: 'Missing post id' }, 400)
  return postPostChatMessage(c, postId)
})

// GET single post by ID
app.get('/:id', async (c) => {
  const db = createDb(c.env.DB)
  const id = c.req.param('id')
  if (!id) return c.json({ error: 'Missing post id' }, 400)
  
  try {
    const postResult = await db.select().from(posts).where(eq(posts.id, id)).limit(1)
    if (postResult.length === 0) return c.json({ error: 'Post not found' }, 404)
    
    const post = postResult[0]
    
    // Fetch related data
    const [codeBlocksResult, mediaResult, authorResult, tagsResult, bountyResult] = await Promise.all([
      db.select().from(codeBlocks).where(eq(codeBlocks.postId, id)),
      db.select().from(media).where(eq(media.postId, id)),
      db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          profilePicture: profiles.profilePicture
        })
        .from(users)
        .leftJoin(profiles, eq(users.id, profiles.userId))
        .where(eq(users.id, post.authorId))
        .limit(1),
      db.select({
        tagName: tags.name
      }).from(postTags)
      .leftJoin(tags, eq(postTags.tagId, tags.id))
      .where(eq(postTags.postId, id)),
      db.select({
        amount: bounties.amount
      }).from(bounties)
      .where(eq(bounties.postId, id))
      .limit(1)
    ])
    
    // Safe date formatting function
    const formatDate = (dateValue: any): string => {
      if (!dateValue) return new Date().toISOString()
      
      try {
        // If it's already a valid ISO string, return it as is
        if (typeof dateValue === 'string' && dateValue.includes('T') && dateValue.includes('Z')) {
          return dateValue
        }
        
        // Handle different date formats
        let date: Date
        if (typeof dateValue === 'number') {
          // If it's a timestamp, check if it's in seconds or milliseconds
          // Unix timestamps in seconds are typically 10 digits, milliseconds are 13 digits
          if (dateValue < 10000000000) {
            // Likely in seconds, convert to milliseconds
            date = new Date(dateValue * 1000)
          } else {
            // Likely in milliseconds
            date = new Date(dateValue)
          }
        } else if (typeof dateValue === 'string') {
          // If it's a string, try to parse it
          date = new Date(dateValue)
        } else {
          // If it's already a Date object
          date = dateValue
        }
        
        // Check if the date is valid
        if (isNaN(date.getTime())) {
          return new Date().toISOString()
        }
        
        return date.toISOString()
      } catch (_error) {
        return new Date().toISOString()
      }
    }

    const response = {
      ...post,
      createdAt: formatDate(post.createdAt),
      updatedAt: formatDate(post.updatedAt),
      editedAt: post.editedAt ? formatDate(post.editedAt) : null,
      codeBlocks: codeBlocksResult,
      media: mediaResult,
      author: authorResult[0] || null,
      tags: tagsResult.map(t => t.tagName).filter(Boolean),
      reward: bountyResult[0]?.amount || null
    }

    return c.json(response)
  } catch (error) {
    console.error('Error fetching post:', error)
    return c.json({ error: 'Failed to fetch post' }, 500)
  }
})

// PUT edit post by ID
app.put('/:id', async (c) => {
  try {
    const db = createDb(c.env.DB)
    const id = c.req.param('id')
    if (!id) return c.json({ error: 'Missing post id' }, 400)
    const sessionCookie = getCookie(c, 'session')
    if (!sessionCookie) return c.json({ error: 'Not authenticated' }, 401)
    const userId = await getUserIdFromSession(sessionCookie, db)
    if (!userId) return c.json({ error: 'Invalid session' }, 401)

    const postResult = await db.select().from(posts).where(eq(posts.id, id)).limit(1)
    if (postResult.length === 0) return c.json({ error: 'Post not found' }, 404)
    const post = postResult[0]

    if (post.authorId !== userId) {
      return c.json({ error: 'You are not the author of this post' }, 403)
    }

    // Enforce 24-hour edit limit
    if (post.editedAt && (Date.now() - new Date(post.editedAt).getTime() < 24 * 60 * 60 * 1000)) {
      return c.json({ error: 'You can only edit your post once every 24 hours' }, 403)
    }

    const body = await c.req.json()
    const { title, content, tags, codeBlocks: codeBlocksData, media: mediaItems } = body
    if (!title || !content) return c.json({ error: 'Title and content are required' }, 400)

    const now = new Date()
    
    // Update the post
    await db.update(posts)
      .set({ title, content, editedAt: now, updatedAt: now })
      .where(eq(posts.id, id))

    // Handle tags
    if (tags !== undefined) {
      // Remove existing tags using raw SQL
      await db.run(sql`DELETE FROM post_tags WHERE post_id = ${id}`)
      
      // Add new tags
      if (tags && tags.length > 0) {
        const tagRelations = tags.map((tagId: string) => ({
          id: crypto.randomUUID(),
          postId: id,
          tagId
        }))
        await db.insert(postTags).values(tagRelations)
      }
    }

    // Handle code blocks
    if (codeBlocksData !== undefined) {
      // Remove existing code blocks using raw SQL
      await db.run(sql`DELETE FROM code_blocks WHERE post_id = ${id}`)
      
      // Add new code blocks
      if (codeBlocksData && codeBlocksData.length > 0) {
        for (const block of codeBlocksData) {
          await db.insert(codeBlocks).values({
            id: crypto.randomUUID(),
            language: block.language,
            code: block.code,
            description: block.description || null,
            postId: id,
            createdAt: now,
            updatedAt: now
          })
        }
      }
    }

    // Handle media
    if (mediaItems !== undefined) {
      // Remove existing media using raw SQL
      await db.run(sql`DELETE FROM media WHERE post_id = ${id}`)
      
      // Add new media
      if (mediaItems && mediaItems.length > 0) {
        for (const item of mediaItems) {
          await db.insert(media).values({
            id: crypto.randomUUID(),
            type: item.type.toUpperCase(),
            url: item.url,
            thumbnailUrl: item.thumbnailUrl || null,
            isScreenRecording: item.isScreenRecording || false,
            cloudinaryId: item.url.split('/').pop()?.split('.')[0] || crypto.randomUUID(),
            postId: id,
            createdAt: now,
            updatedAt: now
          })
        }
      }
    }

    // Fetch updated post data
    const updatedPostResult = await db.run(sql`SELECT * FROM posts WHERE id = ${id}`)
    const updatedPost = updatedPostResult.results?.[0] || postResult[0]

    // Fetch related data using raw SQL
    const [codeBlocksResult, mediaResult, tagsResult] = await Promise.all([
      db.run(sql`SELECT * FROM code_blocks WHERE post_id = ${id}`).then(r => r.results || []),
      db.run(sql`SELECT * FROM media WHERE post_id = ${id}`).then(r => r.results || []),
      db.run(sql`
        SELECT t.name as tagName 
        FROM post_tags pt 
        LEFT JOIN tags t ON pt.tag_id = t.id 
        WHERE pt.post_id = ${id}
      `).then(r => r.results || [])
    ])

    const response = {
      ...updatedPost,
      codeBlocks: codeBlocksResult,
      media: mediaResult,
      tags: tagsResult.map((t: any) => t.tagName).filter(Boolean)
    }

    return c.json(response)
  } catch (error: any) {
    console.error('Error updating post:', error)
    return c.json({ error: 'Failed to update post', details: error.message }, 500)
  }
})

// Mount subroutes
app.route('/:id/comments', commentsRoute)
app.route('/:id/vote', voteRoute)
app.route('/:id/comments/:commentId/vote', commentVoteRoute)
app.route('/:id/answers', answersRoute)
app.route('/:id/answers/:answerId/vote', answerVoteRoute)
app.route('/:id/answers/:answerId/accept', answerAcceptRoute)

// DELETE post by ID
app.delete('/:id', async (c) => {
  try {
    const db = createDb(c.env.DB)
    const id = c.req.param('id')
    if (!id) return c.json({ error: 'Missing post id' }, 400)
    
    const sessionCookie = getCookie(c, 'session')
    if (!sessionCookie) return c.json({ error: 'Not authenticated' }, 401)
    
    const userId = await getUserIdFromSession(sessionCookie, db)
    if (!userId) return c.json({ error: 'Invalid session' }, 401)

    // Check if post exists and user is the author
    const postResult = await db.select().from(posts).where(eq(posts.id, id)).limit(1)
    if (postResult.length === 0) return c.json({ error: 'Post not found' }, 404)
    
    const post = postResult[0]
    if (post.authorId !== userId) {
      return c.json({ error: 'You can only delete your own posts' }, 403)
    }

    // Check if post has a bounty and handle refund if necessary
    const bountyResult = await db.select().from(bounties).where(eq(bounties.postId, id)).limit(1)
    if (bountyResult.length > 0) {
      const bounty = bountyResult[0]
      if (bounty.status === 'ACTIVE') {
        // Refund the bounty amount to the user's virtual wallet
        const walletResult = await db.select().from(virtualWallets).where(eq(virtualWallets.userId, userId)).limit(1)
        if (walletResult.length > 0) {
          const wallet = walletResult[0]
          await db.update(virtualWallets)
            .set({ 
              balance: wallet.balance + bounty.amount,
              totalSpent: wallet.totalSpent - bounty.amount,
              updatedAt: new Date() 
            })
            .where(eq(virtualWallets.userId, userId))
        }
        
        // Update bounty status to REFUNDED
        await db.update(bounties)
          .set({ 
            status: 'REFUNDED',
            refundReason: 'Post deleted by author',
            updatedAt: new Date() 
          })
          .where(eq(bounties.id, bounty.id))
      }
    }

    // Delete the post (cascade will handle related data)
    await db.delete(posts).where(eq(posts.id, id))

    return c.json({ success: true, message: 'Post deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting post:', error)
    return c.json({ error: 'Failed to delete post', details: error.message }, 500)
  }
})

export default app 
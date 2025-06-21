import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { createDb } from '../../../src/utils/db'
import { getUserIdFromSession } from '../../../src/utils/auth'
import { posts, postTags, bounties, virtualWallets } from '../../../drizzle/schema'
import { eq } from 'drizzle-orm'

interface Env {
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

app.get(async (c) => {
  const db = createDb(c.env.DB)
  const allPosts = await db.select().from(posts)
  return c.json(allPosts)
})

app.post(async (c) => {
  const sessionId = getCookie(c, 'session')
  
  if (!sessionId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const db = createDb(c.env.DB)
  const { 
    title, 
    content, 
    selectedTags = [], 
    codeBlocks = [], 
    media = [], 
    hasBounty = false,
    bountyAmount = 0,
    bountyDuration = 7
  } = await c.req.json()
  
  if (!title || !content) {
    return c.json({ error: 'Title and content are required' }, 400)
  }

  if (selectedTags.length === 0) {
    return c.json({ error: 'At least one tag is required' }, 400)
  }

  try {
    const userId = await getUserIdFromSession(sessionId, db)
    
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    // Check if user has sufficient balance for bounty
    if (hasBounty && bountyAmount > 0) {
      const userWallet = await db.select().from(virtualWallets).where(eq(virtualWallets.userId, userId)).limit(1)
      if (!userWallet[0] || userWallet[0].balance < bountyAmount) {
        return c.json({ error: 'Insufficient balance to create bounty' }, 400)
      }
    }
    
    const postId = crypto.randomUUID()
    const newPost = {
      id: postId,
      title,
      content,
      authorId: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'OPEN' as const,
      hasBounty: hasBounty && bountyAmount > 0
    }

    await db.insert(posts).values(newPost)

    // Add tags
    if (selectedTags.length > 0) {
      const tagRelations = selectedTags.map((tagId: string) => ({
        id: crypto.randomUUID(),
        postId,
        tagId
      }))
      await db.insert(postTags).values(tagRelations)
    }

    // Add code blocks
    if (codeBlocks.length > 0) {
      const codeBlockData = codeBlocks.map((block: any) => ({
        id: crypto.randomUUID(),
        language: block.language,
        code: block.code,
        description: block.description || null,
        postId,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
      await db.insert(codeBlocks).values(codeBlockData)
    }

    // Add media
    if (media.length > 0) {
      const mediaData = media.map((item: any) => ({
        id: crypto.randomUUID(),
        type: item.type,
        url: item.url,
        thumbnailUrl: item.thumbnailUrl || null,
        isScreenRecording: item.isScreenRecording || false,
        cloudinaryId: item.url.split('/').pop()?.split('.')[0] || crypto.randomUUID(),
        postId,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
      await db.insert(media).values(mediaData)
    }

    // Create bounty if requested
    if (hasBounty && bountyAmount > 0) {
      const bountyId = crypto.randomUUID()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + bountyDuration)

      await db.insert(bounties).values({
        id: bountyId,
        postId,
        amount: bountyAmount,
        status: 'ACTIVE',
        tokenDecimals: 9,
        refundLockPeriod: 24,
        refundPenalty: 0,
        communityFee: 0.05,
        expiresAt,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      // Deduct amount from user's wallet
      const currentWallet = await db.select().from(virtualWallets).where(eq(virtualWallets.userId, userId)).limit(1)
      if (currentWallet[0]) {
        await db.update(virtualWallets)
          .set({ 
            balance: currentWallet[0].balance - bountyAmount,
            totalSpent: currentWallet[0].totalSpent + bountyAmount,
            updatedAt: new Date()
          })
          .where(eq(virtualWallets.userId, userId))
      }
    }

    return c.json({ 
      success: true, 
      data: { 
        ...newPost, 
        selectedTags, 
        codeBlocks, 
        media,
        hasBounty,
        bountyAmount: hasBounty ? bountyAmount : 0
      } 
    }, 201)
  } catch (error) {
    console.error('Error creating post:', error)
    return c.json({ error: 'Failed to create post' }, 500)
  }
})

export default app 
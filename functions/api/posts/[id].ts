import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { createDb } from '../../../src/utils/db'
import { posts, postTags, codeBlocks, media, tags } from '../../../drizzle/schema'
import { eq } from 'drizzle-orm'
import { getUserIdFromSession } from '../../../src/utils/auth'

interface Env {
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

app.get(async (c) => {
  const db = createDb(c.env.DB)
  const id = c.req.param('id')
  if (!id) return c.json({ error: 'Missing post id' }, 400)
  
  const postResult = await db.select().from(posts).where(eq(posts.id, id)).limit(1)
  if (postResult.length === 0) return c.json({ error: 'Post not found' }, 404)
  
  const post = postResult[0]
  
  // Fetch related data
  const [codeBlocksResult, mediaResult, tagsResult] = await Promise.all([
    db.select().from(codeBlocks).where(eq(codeBlocks.postId, id)),
    db.select().from(media).where(eq(media.postId, id)),
    db.select({
      tagName: tags.name
    }).from(postTags)
    .leftJoin(tags, eq(postTags.tagId, tags.id))
    .where(eq(postTags.postId, id))
  ])
  
  return c.json({
    ...post,
    codeBlocks: codeBlocksResult,
    media: mediaResult,
    tags: tagsResult.map(t => t.tagName).filter(Boolean)
  })
})

app.put(async (c) => {
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
  const { title, content, tags, codeBlocks, media: mediaItems } = body
  if (!title || !content) return c.json({ error: 'Title and content are required' }, 400)

  const now = new Date()
  
  // Update the post
  await db.update(posts)
    .set({ title, content, editedAt: now, updatedAt: now })
    .where(eq(posts.id, id))

  // Handle tags
  if (tags !== undefined) {
    // Remove existing tags
    await db.delete(postTags).where(eq(postTags.postId, id))
    
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
  if (codeBlocks !== undefined) {
    // Remove existing code blocks
    await db.delete(codeBlocks).where(eq(codeBlocks.postId, id))
    
    // Add new code blocks
    if (codeBlocks && codeBlocks.length > 0) {
      for (const block of codeBlocks) {
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
    // Remove existing media
    await db.delete(media).where(eq(media.postId, id))
    
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

  // Return the updated post with related data
  const updatedPostResult = await db.select().from(posts).where(eq(posts.id, id)).limit(1)
  const updatedPost = updatedPostResult[0]

  // Fetch related data
  const [codeBlocksResult, mediaResult, tagsResult] = await Promise.all([
    db.select().from(codeBlocks).where(eq(codeBlocks.postId, id)),
    db.select().from(media).where(eq(media.postId, id)),
    db.select({
      tagName: tags.name
    }).from(postTags)
    .leftJoin(tags, eq(postTags.tagId, tags.id))
    .where(eq(postTags.postId, id))
  ])

  return c.json({
    ...updatedPost,
    codeBlocks: codeBlocksResult,
    media: mediaResult,
    tags: tagsResult.map(t => t.tagName).filter(Boolean)
  })
})

export default app 
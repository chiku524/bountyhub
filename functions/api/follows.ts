import { Hono } from 'hono'
import { and, asc, eq, inArray } from 'drizzle-orm'
import { createDb } from '../../src/utils/db'
import { getUserIdFromSession } from '../../src/utils/auth'
import { postWatches, posts, tagFollows, tags } from '../../drizzle/schema'

interface Env {
  DB: any
}

/** Keeps the feed query and the follow list bounded. */
const MAX_FOLLOWED_TAGS = 50

const app = new Hono<{ Bindings: Env }>()

async function requireUser(c: any): Promise<{ db: ReturnType<typeof createDb>; userId: string } | null> {
  const sessionId = c.get('sessionId')
  if (!sessionId) return null
  const db = createDb(c.env.DB)
  const userId = await getUserIdFromSession(sessionId, db)
  return userId ? { db, userId } : null
}

// GET /api/follows/tags — tags the signed-in user follows
app.get('/tags', async (c) => {
  const auth = await requireUser(c)
  if (!auth) return c.json({ error: 'Unauthorized' }, 401)
  try {
    const rows = await auth.db
      .select({ id: tags.id, name: tags.name, color: tags.color })
      .from(tagFollows)
      .innerJoin(tags, eq(tagFollows.tagId, tags.id))
      .where(eq(tagFollows.userId, auth.userId))
      .orderBy(asc(tags.name))
    return c.json({ tags: rows })
  } catch (error) {
    console.error('Error fetching followed tags:', error)
    return c.json({ error: 'Failed to fetch followed tags' }, 500)
  }
})

// POST /api/follows/tags/toggle { tag: name } (or { tagId }) — follow or unfollow a tag
app.post('/tags/toggle', async (c) => {
  const auth = await requireUser(c)
  if (!auth) return c.json({ error: 'Unauthorized' }, 401)
  try {
    const body = (await c.req.json().catch(() => ({}))) as { tag?: unknown; tagId?: unknown }
    const tagName = typeof body.tag === 'string' ? body.tag.trim() : ''
    const tagIdInput = typeof body.tagId === 'string' ? body.tagId.trim() : ''
    if (!tagName && !tagIdInput) return c.json({ error: 'Missing tag' }, 400)

    const [tag] = await auth.db
      .select({ id: tags.id, name: tags.name, color: tags.color })
      .from(tags)
      .where(tagIdInput ? eq(tags.id, tagIdInput) : eq(tags.name, tagName))
      .limit(1)
    if (!tag) return c.json({ error: 'Tag not found' }, 404)

    const existing = await auth.db
      .select({ id: tagFollows.id })
      .from(tagFollows)
      .where(and(eq(tagFollows.userId, auth.userId), eq(tagFollows.tagId, tag.id)))
      .limit(1)

    if (existing.length > 0) {
      await auth.db.delete(tagFollows).where(eq(tagFollows.id, existing[0].id))
      return c.json({ following: false, tag })
    }

    const current = await auth.db
      .select({ id: tagFollows.id })
      .from(tagFollows)
      .where(eq(tagFollows.userId, auth.userId))
    if (current.length >= MAX_FOLLOWED_TAGS) {
      return c.json({ error: `You can follow up to ${MAX_FOLLOWED_TAGS} tags` }, 400)
    }

    await auth.db
      .insert(tagFollows)
      .values({ id: crypto.randomUUID(), userId: auth.userId, tagId: tag.id, createdAt: new Date() })
      .onConflictDoNothing()
    return c.json({ following: true, tag })
  } catch (error) {
    console.error('Error toggling tag follow:', error)
    return c.json({ error: 'Failed to update followed tags' }, 500)
  }
})

// GET /api/follows/posts/status?postIds=["id1","id2"] — which of these questions the user watches
app.get('/posts/status', async (c) => {
  const auth = await requireUser(c)
  if (!auth) return c.json({ error: 'Unauthorized' }, 401)
  try {
    let postIds: string[] = []
    try {
      const parsed = JSON.parse(c.req.query('postIds') || '[]')
      if (Array.isArray(parsed)) postIds = parsed.filter((id): id is string => typeof id === 'string').slice(0, 90)
    } catch {
      return c.json({ error: 'Invalid postIds' }, 400)
    }
    const status: Record<string, boolean> = {}
    for (const id of postIds) status[id] = false
    if (postIds.length > 0) {
      const rows = await auth.db
        .select({ postId: postWatches.postId })
        .from(postWatches)
        .where(and(eq(postWatches.userId, auth.userId), inArray(postWatches.postId, postIds)))
      for (const row of rows) status[row.postId] = true
    }
    return c.json({ status })
  } catch (error) {
    console.error('Error fetching watch status:', error)
    return c.json({ error: 'Failed to fetch watch status' }, 500)
  }
})

// POST /api/follows/posts/toggle { postId } — watch or unwatch a question
app.post('/posts/toggle', async (c) => {
  const auth = await requireUser(c)
  if (!auth) return c.json({ error: 'Unauthorized' }, 401)
  try {
    const body = (await c.req.json().catch(() => ({}))) as { postId?: unknown }
    const postId = typeof body.postId === 'string' ? body.postId : ''
    if (!postId) return c.json({ error: 'Missing postId' }, 400)

    const [post] = await auth.db.select({ id: posts.id }).from(posts).where(eq(posts.id, postId)).limit(1)
    if (!post) return c.json({ error: 'Post not found' }, 404)

    const existing = await auth.db
      .select({ id: postWatches.id })
      .from(postWatches)
      .where(and(eq(postWatches.userId, auth.userId), eq(postWatches.postId, postId)))
      .limit(1)

    if (existing.length > 0) {
      await auth.db.delete(postWatches).where(eq(postWatches.id, existing[0].id))
      return c.json({ watching: false })
    }

    await auth.db
      .insert(postWatches)
      .values({ id: crypto.randomUUID(), userId: auth.userId, postId, createdAt: new Date() })
      .onConflictDoNothing()
    return c.json({ watching: true })
  } catch (error) {
    console.error('Error toggling watch:', error)
    return c.json({ error: 'Failed to update watch' }, 500)
  }
})

export default app

import { Hono } from 'hono'
import { sql, desc, asc, eq } from 'drizzle-orm'
import { createDb } from '../../../src/utils/db'
import { getUserIdFromSession } from '../../../src/utils/auth'
import { users, profiles } from '../../../drizzle/schema'
import userProfile from './[username]'
import userPosts from './[username]/posts'

interface Env {
  DB: any
  NODE_ENV: string
  SESSION_SECRET: string
  SOLANA_RPC_URL: string
  SOLANA_DEVNET_RPC_URL: string
  SOLANA_WALLET_PRIVATE_KEY: string
  SOLANA_WALLET_ADDRESS: string
  CLOUDINARY_CLOUD_NAME: string
  CLOUDINARY_API_KEY: string
  CLOUDINARY_API_SECRET: string
  CLOUDINARY_UPLOAD_PRESET: string
  HTML2PDF_API_KEY: string
  VITE_CLOUDINARY_CLOUD_NAME: string
  VITE_CLOUDINARY_UPLOAD_PRESET: string
  DATABASE_URL: string
  MONGODB_URI: string
}

const app = new Hono<{ Bindings: Env }>()

// Username autocomplete for @mentions. Signed-in users only; prefix match, best matches first.
// Registered before `/:username` so "search" is not treated as a username.
app.get('/search', async (c) => {
  const sessionId = c.get('sessionId')
  if (!sessionId) return c.json({ error: 'Unauthorized' }, 401)
  const db = createDb(c.env.DB)
  const userId = await getUserIdFromSession(sessionId, db)
  if (!userId) return c.json({ error: 'Unauthorized' }, 401)

  const q = (c.req.query('q') || '').trim().replace(/^@/, '').toLowerCase()
  if (!/^[a-z0-9_-]{1,39}$/.test(q)) return c.json({ users: [] })
  const limit = Math.min(Math.max(parseInt(c.req.query('limit') || '8', 10) || 8, 1), 20)
  // Escape LIKE wildcards: `_` is allowed in usernames and would otherwise match any character.
  const pattern = `${q.replace(/[\\%_]/g, (ch) => `\\${ch}`)}%`

  try {
    const rows = await db
      .select({
        id: users.id,
        username: users.username,
        profilePicture: profiles.profilePicture,
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(sql`lower(${users.username}) LIKE ${pattern} ESCAPE '\\'`)
      .orderBy(
        asc(sql`CASE WHEN lower(${users.username}) = ${q} THEN 0 ELSE 1 END`),
        desc(users.reputationPoints),
        asc(users.username)
      )
      .limit(limit)
    return c.json({
      users: rows.map((r) => ({ id: r.id, username: r.username, profilePicture: r.profilePicture ?? null })),
    })
  } catch (error) {
    console.error('User search error:', error)
    return c.json({ error: 'Failed to search users' }, 500)
  }
})

// Mount user routes
app.route('/:username', userProfile)
app.route('/:username/posts', userPosts)

export default app 
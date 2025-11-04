import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { createDb } from '../../../src/utils/db'
import { getUserIdFromSession } from '../../../src/utils/auth'
import { contributions, githubRepositories, users, profiles } from '../../../drizzle/schema'
import { eq, sql, desc, and } from 'drizzle-orm'

interface Env {
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

// GET all contributions with filters
app.get(async (c) => {
  const db = createDb(c.env.DB)
  
  try {
    const page = parseInt(c.req.query('page') || '1', 10)
    const limit = Math.min(parseInt(c.req.query('limit') || '20', 10), 100)
    const offset = (page - 1) * limit
    const userId = c.req.query('userId')
    const repositoryId = c.req.query('repositoryId')
    const type = c.req.query('type')
    const status = c.req.query('status')

    // Build conditions
    const conditions = []
    if (userId) conditions.push(eq(contributions.userId, userId))
    if (repositoryId) conditions.push(eq(contributions.repositoryId, repositoryId))
    if (type && ['COMMIT', 'PULL_REQUEST', 'ISSUE', 'CODE_REVIEW', 'BUG_SUBMISSION', 'FEATURE_SUGGESTION', 'DOCUMENTATION'].includes(type)) {
      conditions.push(eq(contributions.type, type as 'COMMIT' | 'PULL_REQUEST' | 'ISSUE' | 'CODE_REVIEW' | 'BUG_SUBMISSION' | 'FEATURE_SUGGESTION' | 'DOCUMENTATION'))
    }
    if (status && ['PENDING', 'APPROVED', 'MERGED', 'CLOSED', 'REJECTED'].includes(status)) {
      conditions.push(eq(contributions.status, status as 'PENDING' | 'APPROVED' | 'MERGED' | 'CLOSED' | 'REJECTED'))
    }

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(contributions)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
    
    const total = Number(totalResult[0]?.count || 0)

    // Get contributions with user and repository info
    let query = db
      .select({
        contribution: contributions,
        user: {
          id: users.id,
          username: users.username,
          avatarUrl: profiles.profilePicture,
        },
        repository: githubRepositories,
      })
      .from(contributions)
      .leftJoin(users, eq(contributions.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .leftJoin(githubRepositories, eq(contributions.repositoryId, githubRepositories.id))

    if (conditions.length > 0) {
      query = query.where(and(...conditions))
    }

    const contributionsList = await query
      .orderBy(desc(contributions.contributionDate))
      .limit(limit)
      .offset(offset)

    return c.json({
      contributions: contributionsList.map(item => ({
        ...item.contribution,
        user: item.user,
        repository: item.repository,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error('Error fetching contributions:', error)
    return c.json({ error: 'Failed to fetch contributions' }, 500)
  }
})

// POST create new contribution
app.post(async (c) => {
  const db = createDb(c.env.DB)
  
  try {
    const sessionCookie = getCookie(c, 'session')
    if (!sessionCookie) {
      return c.json({ error: 'Not authenticated' }, 401)
    }

    const userId = await getUserIdFromSession(sessionCookie, db)
    if (!userId) {
      return c.json({ error: 'Invalid session' }, 401)
    }

    const body = await c.req.json()
    const {
      repositoryId,
      type,
      title,
      description,
      githubUrl,
      githubId,
      contributionDate,
      rewardAmount,
      points,
    } = body

    // Validate required fields
    if (!type || !title) {
      return c.json({ error: 'Type and title are required' }, 400)
    }

    if (!['COMMIT', 'PULL_REQUEST', 'ISSUE', 'CODE_REVIEW', 'BUG_SUBMISSION', 'FEATURE_SUGGESTION', 'DOCUMENTATION'].includes(type)) {
      return c.json({ error: 'Invalid contribution type' }, 400)
    }

    const now = new Date()
    const contributionId = crypto.randomUUID()

    const [contribution] = await db.insert(contributions).values({
      id: contributionId,
      userId,
      repositoryId: repositoryId || null,
      type,
      title,
      description: description || null,
      githubUrl: githubUrl || null,
      githubId: githubId || null,
      status: 'PENDING',
      contributionDate: contributionDate ? new Date(contributionDate) : now,
      rewardAmount: rewardAmount || 0,
      points: points || 0,
      createdAt: now,
      updatedAt: now,
    }).returning()

    return c.json(contribution, 201)
  } catch (error) {
    console.error('Error creating contribution:', error)
    return c.json({ error: 'Failed to create contribution' }, 500)
  }
})

export default app


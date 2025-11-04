import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { createDb } from '../../../../src/utils/db'
import { getUserIdFromSession } from '../../../../src/utils/auth'
import { bugBountyCampaigns, githubRepositories, users, profiles } from '../../../../drizzle/schema'
import { eq, sql, desc, and } from 'drizzle-orm'

interface Env {
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

// GET all campaigns with pagination and filters
app.get(async (c) => {
  const db = createDb(c.env.DB)
  
  try {
    const page = parseInt(c.req.query('page') || '1', 10)
    const limit = Math.min(parseInt(c.req.query('limit') || '20', 10), 100)
    const offset = (page - 1) * limit
    const status = c.req.query('status')
    const ownerId = c.req.query('ownerId')
    const isPublic = c.req.query('isPublic')

    // Build query conditions
    const conditions = []
    if (status && ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'].includes(status)) {
      conditions.push(eq(bugBountyCampaigns.status, status as 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'))
    }
    if (ownerId) conditions.push(eq(bugBountyCampaigns.ownerId, ownerId))
    if (isPublic !== undefined) {
      conditions.push(eq(bugBountyCampaigns.isPublic, isPublic === 'true'))
    }

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(bugBountyCampaigns)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
    
    const total = Number(totalResult[0]?.count || 0)

    // Get campaigns with owner and repository info
    const baseQuery = db
      .select({
        campaign: bugBountyCampaigns,
        owner: {
          id: users.id,
          username: users.username,
          avatarUrl: profiles.profilePicture,
        },
        repository: {
          id: githubRepositories.id,
          fullName: githubRepositories.fullName,
          name: githubRepositories.name,
          htmlUrl: githubRepositories.htmlUrl,
        }
      })
      .from(bugBountyCampaigns)
      .leftJoin(users, eq(bugBountyCampaigns.ownerId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .leftJoin(githubRepositories, eq(bugBountyCampaigns.repositoryId, githubRepositories.id))

    const campaigns = conditions.length > 0
      ? await baseQuery
          .where(and(...conditions))
          .orderBy(desc(bugBountyCampaigns.createdAt))
          .limit(limit)
          .offset(offset)
      : await baseQuery
          .orderBy(desc(bugBountyCampaigns.createdAt))
          .limit(limit)
          .offset(offset)

    // Count submissions for each campaign
    const campaignsWithStats = await Promise.all(
      campaigns.map(async (item) => {
        const submissionsResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(bugBountyCampaigns)
          .where(eq(bugBountyCampaigns.id, item.campaign.id))
        
        return {
          ...item.campaign,
          owner: item.owner,
          repository: item.repository,
          submissionsCount: Number(submissionsResult[0]?.count || 0),
        }
      })
    )

    return c.json({
      campaigns: campaignsWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return c.json({ error: 'Failed to fetch campaigns' }, 500)
  }
})

// GET single campaign by ID
app.get('/:id', async (c) => {
  const db = createDb(c.env.DB)
  const campaignId = c.req.param('id')
  
  try {
    const result = await db
      .select({
        campaign: bugBountyCampaigns,
        owner: {
          id: users.id,
          username: users.username,
          avatarUrl: profiles.profilePicture,
        },
        repository: githubRepositories,
      })
      .from(bugBountyCampaigns)
      .leftJoin(users, eq(bugBountyCampaigns.ownerId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .leftJoin(githubRepositories, eq(bugBountyCampaigns.repositoryId, githubRepositories.id))
      .where(eq(bugBountyCampaigns.id, campaignId))
      .limit(1)

    if (!result[0]) {
      return c.json({ error: 'Campaign not found' }, 404)
    }

    const item = result[0]
    
    // Get submissions count
    const submissionsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(bugBountyCampaigns)
      .where(eq(bugBountyCampaigns.id, campaignId))

    return c.json({
      ...item.campaign,
      owner: item.owner,
      repository: item.repository,
      submissionsCount: Number(submissionsResult[0]?.count || 0),
    })
  } catch (error) {
    console.error('Error fetching campaign:', error)
    return c.json({ error: 'Failed to fetch campaign' }, 500)
  }
})

// POST create new campaign
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
      title,
      description,
      repositoryId,
      totalBudget,
      minReward,
      maxReward,
      scope,
      rules,
      severityLevels,
      startDate,
      endDate,
      isPublic,
      allowTeamBounties,
    } = body

    // Validate required fields
    if (!title || !description) {
      return c.json({ error: 'Title and description are required' }, 400)
    }

    if (totalBudget < 0 || minReward < 0 || maxReward < 0) {
      return c.json({ error: 'Budget and rewards must be non-negative' }, 400)
    }

    if (minReward > maxReward) {
      return c.json({ error: 'Minimum reward cannot exceed maximum reward' }, 400)
    }

    // Validate repository if provided
    if (repositoryId) {
      const repo = await db
        .select()
        .from(githubRepositories)
        .where(eq(githubRepositories.id, repositoryId))
        .limit(1)
      
      if (!repo[0] || repo[0].ownerId !== userId) {
        return c.json({ error: 'Repository not found or access denied' }, 403)
      }
    }

    const now = new Date()
    const campaignId = crypto.randomUUID()

    const [campaign] = await db.insert(bugBountyCampaigns).values({
      id: campaignId,
      title,
      description,
      ownerId: userId,
      repositoryId: repositoryId || null,
      status: 'DRAFT' as const,
      totalBudget: totalBudget || 0,
      remainingBudget: totalBudget || 0,
      minReward: minReward || 0,
      maxReward: maxReward || 0,
      scope: scope ? JSON.stringify(scope) : null,
      rules: rules ? JSON.stringify(rules) : null,
      severityLevels: severityLevels ? JSON.stringify(severityLevels) : null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      isPublic: isPublic !== false,
      allowTeamBounties: allowTeamBounties || false,
      createdAt: now,
      updatedAt: now,
    }).returning()

    return c.json(campaign, 201)
  } catch (error) {
    console.error('Error creating campaign:', error)
    return c.json({ error: 'Failed to create campaign' }, 500)
  }
})

// PUT update campaign
app.put('/:id', async (c) => {
  const db = createDb(c.env.DB)
  const campaignId = c.req.param('id')
  
  if (!campaignId) {
    return c.json({ error: 'Campaign ID is required' }, 400)
  }
  
  try {
    const sessionCookie = getCookie(c, 'session')
    if (!sessionCookie) {
      return c.json({ error: 'Not authenticated' }, 401)
    }

    const userId = await getUserIdFromSession(sessionCookie, db)
    if (!userId) {
      return c.json({ error: 'Invalid session' }, 401)
    }

    // Check if campaign exists and user is owner
    const existing = await db
      .select()
      .from(bugBountyCampaigns)
      .where(eq(bugBountyCampaigns.id, campaignId))
      .limit(1)

    if (!existing[0]) {
      return c.json({ error: 'Campaign not found' }, 404)
    }

    if (existing[0].ownerId !== userId) {
      return c.json({ error: 'Not authorized' }, 403)
    }

    const body = await c.req.json()
    const updateData: any = {
      updatedAt: new Date(),
    }

    // Only update provided fields
    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.status !== undefined) {
      const validStatuses = ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']
      if (validStatuses.includes(body.status)) {
        updateData.status = body.status as 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
      }
    }
    if (body.totalBudget !== undefined) {
      updateData.totalBudget = body.totalBudget
      // Adjust remaining budget proportionally
      const budgetRatio = existing[0].totalBudget > 0 
        ? existing[0].remainingBudget / existing[0].totalBudget 
        : 1
      updateData.remainingBudget = body.totalBudget * budgetRatio
    }
    if (body.minReward !== undefined) updateData.minReward = body.minReward
    if (body.maxReward !== undefined) updateData.maxReward = body.maxReward
    if (body.scope !== undefined) updateData.scope = JSON.stringify(body.scope)
    if (body.rules !== undefined) updateData.rules = JSON.stringify(body.rules)
    if (body.severityLevels !== undefined) updateData.severityLevels = JSON.stringify(body.severityLevels)
    if (body.startDate !== undefined) updateData.startDate = body.startDate ? new Date(body.startDate) : null
    if (body.endDate !== undefined) updateData.endDate = body.endDate ? new Date(body.endDate) : null
    if (body.isPublic !== undefined) updateData.isPublic = body.isPublic
    if (body.allowTeamBounties !== undefined) updateData.allowTeamBounties = body.allowTeamBounties

    const [updated] = await db
      .update(bugBountyCampaigns)
      .set(updateData)
      .where(eq(bugBountyCampaigns.id, campaignId))
      .returning()

    return c.json(updated)
  } catch (error) {
    console.error('Error updating campaign:', error)
    return c.json({ error: 'Failed to update campaign' }, 500)
  }
})

// DELETE campaign
app.delete('/:id', async (c) => {
  const db = createDb(c.env.DB)
  const campaignId = c.req.param('id')
  
  if (!campaignId) {
    return c.json({ error: 'Campaign ID is required' }, 400)
  }
  
  try {
    const sessionCookie = getCookie(c, 'session')
    if (!sessionCookie) {
      return c.json({ error: 'Not authenticated' }, 401)
    }

    const userId = await getUserIdFromSession(sessionCookie, db)
    if (!userId) {
      return c.json({ error: 'Invalid session' }, 401)
    }

    // Check if campaign exists and user is owner
    const existing = await db
      .select()
      .from(bugBountyCampaigns)
      .where(eq(bugBountyCampaigns.id, campaignId))
      .limit(1)

    if (!existing[0]) {
      return c.json({ error: 'Campaign not found' }, 404)
    }

    if (existing[0].ownerId !== userId) {
      return c.json({ error: 'Not authorized' }, 403)
    }

    // Only allow deletion of DRAFT campaigns
    if (existing[0].status !== 'DRAFT') {
      return c.json({ error: 'Only draft campaigns can be deleted' }, 400)
    }

    await db
      .delete(bugBountyCampaigns)
      .where(eq(bugBountyCampaigns.id, campaignId))

    return c.json({ message: 'Campaign deleted successfully' })
  } catch (error) {
    console.error('Error deleting campaign:', error)
    return c.json({ error: 'Failed to delete campaign' }, 500)
  }
})

export default app


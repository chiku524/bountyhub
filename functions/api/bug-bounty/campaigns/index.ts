import { Hono } from 'hono'
import { createDb } from '../../../../src/utils/db'
import { getUserIdFromSession } from '../../../../src/utils/auth'
import { bugBountyCampaigns, bugSubmissions, githubRepositories, users, profiles } from '../../../../drizzle/schema'
import { eq, sql, desc, and, notInArray } from 'drizzle-orm'
import { creditRefund, debitWallet, isNonNegativeAmount, roundBbux } from '../../../utils/bugBountyEscrow'

interface Env {
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

const CLOSED_STATUSES = ['COMPLETED', 'CANCELLED'] as const
const isClosed = (status: string) => (CLOSED_STATUSES as readonly string[]).includes(status)

// GET all campaigns with pagination and filters
app.get('/', async (c) => {
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

    // Count submissions for each campaign (from bugSubmissions table)
    const campaignsWithStats = await Promise.all(
      campaigns.map(async (item) => {
        const submissionsResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(bugSubmissions)
          .where(eq(bugSubmissions.campaignId, item.campaign.id))
        
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
    
    // Get submissions count (count from bugSubmissions, not campaigns)
    const submissionsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(bugSubmissions)
      .where(eq(bugSubmissions.campaignId, campaignId))

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
app.post('/', async (c) => {
  const db = createDb(c.env.DB)
  
  try {
    const sessionCookie = c.get('sessionId')
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

    const budget = roundBbux(totalBudget ?? 0)
    const min = minReward ?? 0
    const max = maxReward ?? 0
    if (!isNonNegativeAmount(budget) || !isNonNegativeAmount(min) || !isNonNegativeAmount(max)) {
      return c.json({ error: 'Budget and rewards must be non-negative numbers' }, 400)
    }

    if (min > max) {
      return c.json({ error: 'Minimum reward cannot exceed maximum reward' }, 400)
    }

    if (max > budget) {
      return c.json({ error: 'Maximum reward cannot exceed the total budget' }, 400)
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

    // Hold the whole budget from the creator's wallet before the campaign exists.
    if (!(await debitWallet(db, userId, budget, { campaignId, reason: 'campaign_created' }))) {
      return c.json({ error: `Insufficient BBUX balance: this campaign needs ${budget} BBUX for its budget` }, 400)
    }

    let campaign
    try {
      [campaign] = await db.insert(bugBountyCampaigns).values({
      id: campaignId,
      title,
      description,
      ownerId: userId,
      repositoryId: repositoryId || null,
      status: 'DRAFT' as const,
      totalBudget: budget,
      remainingBudget: budget,
      budgetEscrowed: true,
      minReward: min,
      maxReward: max,
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
    } catch (insertError) {
      // Give the held budget back if the campaign couldn't be saved.
      await creditRefund(db, userId, budget, { campaignId, reason: 'campaign_create_failed' })
      throw insertError
    }

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
    const sessionCookie = c.get('sessionId')
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
    const current = existing[0]
    const updateData: any = {
      updatedAt: new Date(),
    }

    const validStatuses = ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']
    const nextStatus: string | undefined =
      body.status !== undefined && validStatuses.includes(body.status) && body.status !== current.status
        ? body.status
        : undefined
    const closing = nextStatus !== undefined && isClosed(nextStatus)

    // A closed campaign has already returned its budget, so its money and status are final.
    if (isClosed(current.status) && (nextStatus !== undefined || body.totalBudget !== undefined || body.minReward !== undefined || body.maxReward !== undefined)) {
      return c.json({ error: 'This campaign is closed: its status, budget and rewards can no longer change' }, 409)
    }
    if (closing && body.totalBudget !== undefined) {
      return c.json({ error: 'Change the budget and close the campaign in separate requests' }, 400)
    }

    const min = body.minReward !== undefined ? body.minReward : current.minReward
    const max = body.maxReward !== undefined ? body.maxReward : current.maxReward
    if (!isNonNegativeAmount(min) || !isNonNegativeAmount(max)) {
      return c.json({ error: 'Rewards must be non-negative numbers' }, 400)
    }
    if (min > max) {
      return c.json({ error: 'Minimum reward cannot exceed maximum reward' }, 400)
    }

    // Only update provided fields
    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (nextStatus !== undefined) {
      updateData.status = nextStatus as 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
    }

    // Budget changes move the difference between the owner's wallet and the campaign.
    let budgetDelta = 0
    if (body.totalBudget !== undefined) {
      if (!isNonNegativeAmount(body.totalBudget)) {
        return c.json({ error: 'Budget must be a non-negative number' }, 400)
      }
      const newTotal = roundBbux(body.totalBudget)
      const alreadyAwarded = roundBbux(current.totalBudget - current.remainingBudget)
      if (newTotal < alreadyAwarded) {
        return c.json({ error: `Budget cannot be lower than the ${alreadyAwarded} BBUX already awarded` }, 400)
      }
      budgetDelta = roundBbux(newTotal - current.totalBudget)
      updateData.totalBudget = newTotal
      updateData.remainingBudget = sql`${bugBountyCampaigns.remainingBudget} + ${budgetDelta}`
    }
    if (body.minReward !== undefined) updateData.minReward = min
    if (body.maxReward !== undefined) updateData.maxReward = max
    if (body.scope !== undefined) updateData.scope = JSON.stringify(body.scope)
    if (body.rules !== undefined) updateData.rules = JSON.stringify(body.rules)
    if (body.severityLevels !== undefined) updateData.severityLevels = JSON.stringify(body.severityLevels)
    if (body.startDate !== undefined) updateData.startDate = body.startDate ? new Date(body.startDate) : null
    if (body.endDate !== undefined) updateData.endDate = body.endDate ? new Date(body.endDate) : null
    if (body.isPublic !== undefined) updateData.isPublic = body.isPublic
    if (body.allowTeamBounties !== undefined) updateData.allowTeamBounties = body.allowTeamBounties

    // Closing hands back whatever is left. Matching on the remaining budget we read
    // means an award landing at the same moment makes this update miss instead of
    // refunding money that was just paid out.
    const refund = closing && current.budgetEscrowed ? roundBbux(current.remainingBudget) : 0
    if (closing) {
      updateData.remainingBudget = 0
    }

    // Raising an escrowed budget takes the extra BBUX from the owner first.
    if (current.budgetEscrowed && budgetDelta > 0) {
      if (!(await debitWallet(db, userId, budgetDelta, { campaignId, reason: 'budget_increased' }))) {
        return c.json({ error: `Insufficient BBUX balance: raising the budget needs ${budgetDelta} more BBUX` }, 400)
      }
    }

    const conditions = [eq(bugBountyCampaigns.id, campaignId), notInArray(bugBountyCampaigns.status, [...CLOSED_STATUSES])]
    if (closing) {
      conditions.push(eq(bugBountyCampaigns.remainingBudget, current.remainingBudget))
    }
    if (budgetDelta < 0) {
      // Never lower the budget below what is still unspent right now.
      conditions.push(sql`${bugBountyCampaigns.remainingBudget} + ${budgetDelta} >= 0`)
    }

    const [updated] = await db
      .update(bugBountyCampaigns)
      .set(updateData)
      .where(and(...conditions))
      .returning()

    if (!updated) {
      if (current.budgetEscrowed && budgetDelta > 0) {
        await creditRefund(db, userId, budgetDelta, { campaignId, reason: 'budget_increase_failed' })
      }
      return c.json({ error: 'The campaign changed while saving (an award may have just been paid). Reload and try again.' }, 409)
    }

    if (current.budgetEscrowed && budgetDelta < 0) {
      await creditRefund(db, current.ownerId, -budgetDelta, { campaignId, reason: 'budget_decreased' })
    }
    if (refund > 0) {
      await creditRefund(db, current.ownerId, refund, { campaignId, reason: `campaign_${nextStatus!.toLowerCase()}` })
    }

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
    const sessionCookie = c.get('sessionId')
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

    const [deleted] = await db
      .delete(bugBountyCampaigns)
      .where(and(eq(bugBountyCampaigns.id, campaignId), eq(bugBountyCampaigns.status, 'DRAFT')))
      .returning({ remainingBudget: bugBountyCampaigns.remainingBudget, budgetEscrowed: bugBountyCampaigns.budgetEscrowed })

    if (!deleted) {
      return c.json({ error: 'Only draft campaigns can be deleted' }, 409)
    }

    // Return the unspent budget held for this campaign.
    if (deleted.budgetEscrowed) {
      await creditRefund(db, userId, roundBbux(deleted.remainingBudget), { campaignId, reason: 'campaign_deleted' })
    }

    return c.json({ message: 'Campaign deleted successfully' })
  } catch (error) {
    console.error('Error deleting campaign:', error)
    return c.json({ error: 'Failed to delete campaign' }, 500)
  }
})

export default app


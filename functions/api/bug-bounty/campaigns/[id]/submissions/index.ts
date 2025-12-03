import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { createDb } from '../../../../../../src/utils/db'
import { getUserIdFromSession } from '../../../../../../src/utils/auth'
import { bugSubmissions, bugBountyCampaigns, users, profiles } from '../../../../../../drizzle/schema'
import { eq, sql, desc, and } from 'drizzle-orm'

interface Env {
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

// GET all submissions for a campaign
app.get(async (c) => {
  const db = createDb(c.env.DB)
  const campaignId = c.req.param('id')
  
  if (!campaignId) {
    return c.json({ error: 'Campaign ID is required' }, 400)
  }
  
  try {
    const page = parseInt(c.req.query('page') || '1', 10)
    const limit = Math.min(parseInt(c.req.query('limit') || '20', 10), 100)
    const offset = (page - 1) * limit
    const status = c.req.query('status')
    const severity = c.req.query('severity')

    // Verify campaign exists
    const campaign = await db
      .select()
      .from(bugBountyCampaigns)
      .where(eq(bugBountyCampaigns.id, campaignId))
      .limit(1)

    if (!campaign[0]) {
      return c.json({ error: 'Campaign not found' }, 404)
    }

    // Build conditions
    const conditions = [eq(bugSubmissions.campaignId, campaignId)]
    if (status && ['SUBMITTED', 'REVIEWING', 'VERIFIED', 'REJECTED', 'DUPLICATE', 'RESOLVED', 'AWARDED'].includes(status)) {
      conditions.push(eq(bugSubmissions.status, status as 'SUBMITTED' | 'REVIEWING' | 'VERIFIED' | 'REJECTED' | 'DUPLICATE' | 'RESOLVED' | 'AWARDED'))
    }
    if (severity && ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'].includes(severity)) {
      conditions.push(eq(bugSubmissions.severity, severity as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'))
    }

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(bugSubmissions)
      .where(and(...conditions))
    
    const total = Number(totalResult[0]?.count || 0)

    // Get submissions with submitter info
    const submissions = await db
      .select({
        submission: bugSubmissions,
        submitter: {
          id: users.id,
          username: users.username,
          avatarUrl: profiles.profilePicture,
        }
      })
      .from(bugSubmissions)
      .leftJoin(users, eq(bugSubmissions.submitterId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(and(...conditions))
      .orderBy(desc(bugSubmissions.createdAt))
      .limit(limit)
      .offset(offset)

    return c.json({
      submissions: submissions.map((item: any) => ({
        ...item.submission,
        submitter: item.submitter,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return c.json({ error: 'Failed to fetch submissions' }, 500)
  }
})

// POST create new submission
app.post(async (c) => {
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

    // Verify campaign exists and is active
    const campaign = await db
      .select()
      .from(bugBountyCampaigns)
      .where(eq(bugBountyCampaigns.id, campaignId))
      .limit(1)

    if (!campaign[0]) {
      return c.json({ error: 'Campaign not found' }, 404)
    }

    if (campaign[0].status !== 'ACTIVE') {
      return c.json({ error: 'Campaign is not active' }, 400)
    }

    const body = await c.req.json()
    const {
      title,
      description,
      severity,
      stepsToReproduce,
      impact,
      suggestedFix,
      evidence,
    } = body

    // Validate required fields
    if (!title || !description || !severity) {
      return c.json({ error: 'Title, description, and severity are required' }, 400)
    }

    if (!['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'].includes(severity)) {
      return c.json({ error: 'Invalid severity level' }, 400)
    }

    const now = new Date()
    const submissionId = crypto.randomUUID()

    const [submission] = await db.insert(bugSubmissions).values({
      id: submissionId,
      campaignId,
      submitterId: userId,
      title,
      description,
      severity: severity as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO',
      status: 'SUBMITTED' as const,
      stepsToReproduce: stepsToReproduce || null,
      impact: impact || null,
      suggestedFix: suggestedFix || null,
      evidence: evidence ? JSON.stringify(evidence) : null,
      createdAt: now,
      updatedAt: now,
    }).returning()

    return c.json(submission, 201)
  } catch (error) {
    console.error('Error creating submission:', error)
    return c.json({ error: 'Failed to create submission' }, 500)
  }
})

export default app


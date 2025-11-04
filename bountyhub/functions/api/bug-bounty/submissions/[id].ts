import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { createDb } from '../../../src/utils/db'
import { getUserIdFromSession } from '../../../src/utils/auth'
import { bugSubmissions, bugSubmissionVerifications, users } from '../../../drizzle/schema'
import { eq, desc } from 'drizzle-orm'

interface Env {
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

// GET single submission
app.get(async (c) => {
  const db = createDb(c.env.DB)
  const submissionId = c.req.param('id')
  
  try {
    const submission = await db
      .select()
      .from(bugSubmissions)
      .where(eq(bugSubmissions.id, submissionId))
      .limit(1)

    if (!submission[0]) {
      return c.json({ error: 'Submission not found' }, 404)
    }

    // Get verification history
    const verifications = await db
      .select()
      .from(bugSubmissionVerifications)
      .where(eq(bugSubmissionVerifications.submissionId, submissionId))
      .orderBy(desc(bugSubmissionVerifications.createdAt))

    return c.json({
      ...submission[0],
      verifications,
    })
  } catch (error) {
    console.error('Error fetching submission:', error)
    return c.json({ error: 'Failed to fetch submission' }, 500)
  }
})

// PUT update submission (for verification, status changes)
app.put(async (c) => {
  const db = createDb(c.env.DB)
  const submissionId = c.req.param('id')
  
  try {
    const sessionCookie = getCookie(c, 'session')
    if (!sessionCookie) {
      return c.json({ error: 'Not authenticated' }, 401)
    }

    const userId = await getUserIdFromSession(sessionCookie, db)
    if (!userId) {
      return c.json({ error: 'Invalid session' }, 401)
    }

    const submission = await db
      .select()
      .from(bugSubmissions)
      .where(eq(bugSubmissions.id, submissionId))
      .limit(1)

    if (!submission[0]) {
      return c.json({ error: 'Submission not found' }, 404)
    }

    const body = await c.req.json()
    const updateData: any = {
      updatedAt: new Date(),
    }

    // Only allow status updates and verification
    if (body.status !== undefined) {
      updateData.status = body.status
      if (body.status === 'VERIFIED') {
        updateData.verifiedBy = userId
        updateData.verifiedAt = new Date()
      }
      if (body.status === 'AWARDED') {
        updateData.awardedAt = new Date()
        if (body.rewardAmount !== undefined) {
          updateData.rewardAmount = body.rewardAmount
        }
      }
    }
    if (body.verificationNotes !== undefined) {
      updateData.verificationNotes = body.verificationNotes
    }
    if (body.githubIssueUrl !== undefined) {
      updateData.githubIssueUrl = body.githubIssueUrl
    }
    if (body.githubIssueNumber !== undefined) {
      updateData.githubIssueNumber = body.githubIssueNumber
    }

    const [updated] = await db
      .update(bugSubmissions)
      .set(updateData)
      .where(eq(bugSubmissions.id, submissionId))
      .returning()

    // Create verification record if status changed
    if (body.status && body.status !== submission[0].status) {
      await db.insert(bugSubmissionVerifications).values({
        id: crypto.randomUUID(),
        submissionId,
        verifierId: userId,
        step: 'VERIFICATION',
        status: body.status === 'VERIFIED' || body.status === 'AWARDED' ? 'APPROVED' : 'REJECTED',
        notes: body.verificationNotes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    return c.json(updated)
  } catch (error) {
    console.error('Error updating submission:', error)
    return c.json({ error: 'Failed to update submission' }, 500)
  }
})

export default app


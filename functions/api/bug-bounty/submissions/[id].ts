import { Hono } from 'hono'
import { createDb } from '../../../../src/utils/db'
import { getUserIdFromSession } from '../../../../src/utils/auth'
import { bugSubmissions, bugSubmissionVerifications, bugBountyCampaigns, users } from '../../../../drizzle/schema'
import { eq, ne, desc, and, gte, sql } from 'drizzle-orm'

interface Env {
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

// GET single submission
app.get(async (c) => {
  const db = createDb(c.env.DB)
  const submissionId = c.req.param('id')
  
  if (!submissionId) {
    return c.json({ error: 'Submission ID is required' }, 400)
  }
  
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
  
  if (!submissionId) {
    return c.json({ error: 'Submission ID is required' }, 400)
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

    const submission = await db
      .select()
      .from(bugSubmissions)
      .where(eq(bugSubmissions.id, submissionId))
      .limit(1)

    if (!submission[0]) {
      return c.json({ error: 'Submission not found' }, 404)
    }

    // Only the campaign owner or a site admin may review, verify or award a submission.
    const [campaign] = await db
      .select({
        ownerId: bugBountyCampaigns.ownerId,
        minReward: bugBountyCampaigns.minReward,
        maxReward: bugBountyCampaigns.maxReward,
        remainingBudget: bugBountyCampaigns.remainingBudget,
      })
      .from(bugBountyCampaigns)
      .where(eq(bugBountyCampaigns.id, submission[0].campaignId))
      .limit(1)

    if (campaign?.ownerId !== userId) {
      const [caller] = await db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)
      if (caller?.role !== 'admin') {
        return c.json({ error: 'Only the campaign owner can update this submission' }, 403)
      }
    }

    const body = await c.req.json()

    if (body.rewardAmount !== undefined && body.rewardAmount !== null) {
      if (typeof body.rewardAmount !== 'number' || !Number.isFinite(body.rewardAmount) || body.rewardAmount < 0) {
        return c.json({ error: 'rewardAmount must be a non-negative number' }, 400)
      }
    }

    const alreadyAwarded = submission[0].status === 'AWARDED'
    const awarding = body.status === 'AWARDED' && !alreadyAwarded

    // Once awarded, the payout is final: no changing the status or the amount.
    if (alreadyAwarded) {
      if ((body.status !== undefined && body.status !== 'AWARDED') || (body.rewardAmount !== undefined && body.rewardAmount !== submission[0].rewardAmount)) {
        return c.json({ error: 'This submission has already been awarded and its status and reward can no longer change' }, 409)
      }
    }

    let awardAmount: number | null = null
    if (awarding) {
      if (!campaign) {
        return c.json({ error: 'Campaign not found' }, 404)
      }
      awardAmount = typeof body.rewardAmount === 'number' ? body.rewardAmount : submission[0].rewardAmount
      if (typeof awardAmount !== 'number') {
        return c.json({ error: 'rewardAmount is required to award a submission' }, 400)
      }
      if (awardAmount < campaign.minReward || (campaign.maxReward > 0 && awardAmount > campaign.maxReward)) {
        return c.json({ error: `rewardAmount must be between ${campaign.minReward} and ${campaign.maxReward} for this campaign` }, 400)
      }
    }

    const updateData: any = {
      updatedAt: new Date(),
    }

    // Only allow status updates and verification
    if (body.status !== undefined) {
      const validStatuses = ['SUBMITTED', 'REVIEWING', 'VERIFIED', 'REJECTED', 'DUPLICATE', 'RESOLVED', 'AWARDED']
      if (validStatuses.includes(body.status)) {
        updateData.status = body.status as 'SUBMITTED' | 'REVIEWING' | 'VERIFIED' | 'REJECTED' | 'DUPLICATE' | 'RESOLVED' | 'AWARDED'
        if (body.status === 'VERIFIED') {
          updateData.verifiedBy = userId
          updateData.verifiedAt = new Date()
        }
        if (awarding) {
          updateData.awardedAt = new Date()
          updateData.rewardAmount = awardAmount
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

    // When awarding, only update if the submission isn't already awarded, so two
    // concurrent award requests can't both pay out.
    const [updated] = await db
      .update(bugSubmissions)
      .set(updateData)
      .where(awarding
        ? and(eq(bugSubmissions.id, submissionId), ne(bugSubmissions.status, 'AWARDED'))
        : eq(bugSubmissions.id, submissionId))
      .returning()

    if (!updated) {
      return c.json({ error: 'This submission has already been awarded' }, 409)
    }

    if (awarding && awardAmount !== null) {
      // Deduct from the campaign budget only if enough remains (checked in the same statement).
      const deducted = await db
        .update(bugBountyCampaigns)
        .set({
          remainingBudget: sql`${bugBountyCampaigns.remainingBudget} - ${awardAmount}`,
          updatedAt: new Date(),
        })
        .where(and(
          eq(bugBountyCampaigns.id, submission[0].campaignId),
          gte(bugBountyCampaigns.remainingBudget, awardAmount),
        ))
        .returning({ id: bugBountyCampaigns.id })

      if (deducted.length === 0) {
        // Undo the award so the submission and budget stay consistent.
        await db
          .update(bugSubmissions)
          .set({
            status: submission[0].status,
            rewardAmount: submission[0].rewardAmount,
            awardedAt: submission[0].awardedAt,
            verifiedBy: submission[0].verifiedBy,
            verifiedAt: submission[0].verifiedAt,
            verificationNotes: submission[0].verificationNotes,
            githubIssueUrl: submission[0].githubIssueUrl,
            githubIssueNumber: submission[0].githubIssueNumber,
            updatedAt: new Date(),
          })
          .where(eq(bugSubmissions.id, submissionId))
        return c.json({ error: `Not enough campaign budget left (remaining: ${campaign?.remainingBudget ?? 0})` }, 400)
      }
    }

    // Create verification record if status changed
    if (body.status && body.status !== submission[0].status) {
      const validStatuses = ['SUBMITTED', 'REVIEWING', 'VERIFIED', 'REJECTED', 'DUPLICATE', 'RESOLVED', 'AWARDED']
      if (validStatuses.includes(body.status)) {
        await db.insert(bugSubmissionVerifications).values({
          id: crypto.randomUUID(),
          submissionId,
          verifierId: userId,
          step: 'VERIFICATION' as const,
          status: (body.status === 'VERIFIED' || body.status === 'AWARDED' ? 'APPROVED' : 'REJECTED') as 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED',
          notes: body.verificationNotes || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }
    }

    return c.json(updated)
  } catch (error) {
    console.error('Error updating submission:', error)
    return c.json({ error: 'Failed to update submission' }, 500)
  }
})

export default app


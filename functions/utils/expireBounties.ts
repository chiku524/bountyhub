import { and, count, eq, lte } from 'drizzle-orm'
import { createDb } from '../../src/utils/db'
import { answers, bounties, posts, virtualWallets } from '../../drizzle/schema'
import { createBountyNotification, createSystemNotification } from '../../src/utils/notifications'
import { updateReputation } from '../../src/utils/reputation'
import { GovernanceService } from '../../src/utils/governance'

export type BountyExpiryResult = {
  refunded: number
  expired: number
  autoAwarded: number
  errors: number
}

/** After a bounty ends with answers, the asker has this long to accept one before it is decided for them. */
export const BOUNTY_GRACE_PERIOD_MS = 72 * 60 * 60 * 1000

type Db = ReturnType<typeof createDb>

/**
 * Picks the answer that wins an unclaimed bounty: highest net score (upvotes − downvotes), oldest
 * first on ties, never the asker's own answer. Only a net-positive answer qualifies.
 */
export function pickAutoAwardAnswer<T extends { authorId: string; upvotes: number; downvotes: number; createdAt: Date }>(
  candidates: T[],
  askerId: string
): T | null {
  const ranked = candidates
    .filter((a) => a.authorId !== askerId)
    .sort((a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes) || a.createdAt.getTime() - b.createdAt.getTime())
  const top = ranked[0]
  return top && top.upvotes - top.downvotes > 0 ? top : null
}

async function refundToAsker(db: Db, bounty: { id: string; amount: number; postId: string; authorId: string; title: string }, fromStatus: 'ACTIVE' | 'EXPIRED', reason: string, now: Date) {
  // Flip the status first so a concurrent run or an accept can't pay the same bounty twice.
  const claimed = await db
    .update(bounties)
    .set({ status: 'REFUNDED', refundReason: reason, updatedAt: now })
    .where(and(eq(bounties.id, bounty.id), eq(bounties.status, fromStatus)))
    .returning({ id: bounties.id })
  if (claimed.length === 0) return false

  const [wallet] = await db.select().from(virtualWallets).where(eq(virtualWallets.userId, bounty.authorId)).limit(1)
  if (wallet) {
    await db
      .update(virtualWallets)
      .set({ balance: wallet.balance + bounty.amount, totalSpent: wallet.totalSpent - bounty.amount, updatedAt: now })
      .where(eq(virtualWallets.userId, bounty.authorId))
  }
  await db.update(posts).set({ status: 'CLOSED', updatedAt: now }).where(eq(posts.id, bounty.postId))
  return true
}

/**
 * Acts on bounties whose `expiresAt` has passed (run hourly from the scheduled handler):
 * - No answers: the bounty is returned to the asker's wallet (status REFUNDED, post CLOSED).
 * - Has answers: status becomes EXPIRED and the asker has a 72-hour grace period to accept one;
 *   accepting an answer on an EXPIRED bounty still pays it out (see answers/[answerId]/accept.ts).
 * - Grace period over: the top-voted answer with a positive net score wins, otherwise refund.
 * The 5% fee paid when posting is never refunded.
 */
export async function expireBounties(dbBinding: D1Database, now: Date = new Date()): Promise<BountyExpiryResult> {
  const db = createDb(dbBinding)
  const result: BountyExpiryResult = { refunded: 0, expired: 0, autoAwarded: 0, errors: 0 }

  const due = await db
    .select({
      id: bounties.id,
      amount: bounties.amount,
      postId: bounties.postId,
      authorId: posts.authorId,
      title: posts.title,
    })
    .from(bounties)
    .innerJoin(posts, eq(bounties.postId, posts.id))
    .where(and(eq(bounties.status, 'ACTIVE'), lte(bounties.expiresAt, now)))
    .limit(100)

  for (const bounty of due) {
    try {
      const [{ value: answerCount }] = await db
        .select({ value: count() })
        .from(answers)
        .where(eq(answers.postId, bounty.postId))

      if (answerCount === 0) {
        if (!(await refundToAsker(db, bounty, 'ACTIVE', 'Expired with no answers', now))) continue
        await createSystemNotification(
          db,
          bounty.authorId,
          'Bounty returned',
          `Your bounty on "${bounty.title}" ended with no answers, so ${bounty.amount} BBUX was returned to your wallet.`,
          `/posts/${bounty.postId}`
        )
        result.refunded++
      } else {
        await db
          .update(bounties)
          .set({ status: 'EXPIRED', updatedAt: now })
          .where(and(eq(bounties.id, bounty.id), eq(bounties.status, 'ACTIVE')))
        await createSystemNotification(
          db,
          bounty.authorId,
          'Your bounty has ended',
          `"${bounty.title}" got ${answerCount} answer${answerCount === 1 ? '' : 's'}. Accept the one that helped within 3 days to pay out ${bounty.amount} BBUX. After that, the top-voted answer wins, or the bounty is returned if no answer has positive votes.`,
          `/posts/${bounty.postId}`
        )
        result.expired++
      }
    } catch (err) {
      console.error('[expireBounties] failed for bounty', bounty.id, err)
      result.errors++
    }
  }

  await settleExpiredBounties(db, now, result)
  return result
}

/**
 * Bounties that ended with answers and were not accepted within the grace period: the top-voted
 * answer (net score above zero) wins; otherwise the bounty is returned to the asker.
 */
async function settleExpiredBounties(db: Db, now: Date, result: BountyExpiryResult) {
  const cutoff = new Date(now.getTime() - BOUNTY_GRACE_PERIOD_MS)
  const due = await db
    .select({
      id: bounties.id,
      amount: bounties.amount,
      postId: bounties.postId,
      authorId: posts.authorId,
      title: posts.title,
    })
    .from(bounties)
    .innerJoin(posts, eq(bounties.postId, posts.id))
    // updatedAt is when the bounty was marked EXPIRED, so long-overdue bounties still get a full grace period.
    .where(and(eq(bounties.status, 'EXPIRED'), lte(bounties.updatedAt, cutoff)))
    .limit(100)

  for (const bounty of due) {
    try {
      const candidates = await db
        .select({
          id: answers.id,
          authorId: answers.authorId,
          upvotes: answers.upvotes,
          downvotes: answers.downvotes,
          createdAt: answers.createdAt,
          isAccepted: answers.isAccepted,
        })
        .from(answers)
        .where(eq(answers.postId, bounty.postId))

      if (candidates.some((a) => a.isAccepted)) continue
      const winner = pickAutoAwardAnswer(candidates, bounty.authorId)

      if (!winner) {
        if (!(await refundToAsker(db, bounty, 'EXPIRED', 'No answer accepted and none had positive votes', now))) continue
        await createSystemNotification(
          db,
          bounty.authorId,
          'Bounty returned',
          `No answer on "${bounty.title}" was accepted or voted up, so ${bounty.amount} BBUX was returned to your wallet.`,
          `/posts/${bounty.postId}`
        )
        result.refunded++
        continue
      }

      const claimed = await db
        .update(bounties)
        .set({ status: 'CLAIMED', updatedAt: now })
        .where(and(eq(bounties.id, bounty.id), eq(bounties.status, 'EXPIRED')))
        .returning({ id: bounties.id })
      if (claimed.length === 0) continue

      await db.update(answers).set({ isAccepted: true, updatedAt: now }).where(eq(answers.id, winner.id))
      await db.update(posts).set({ status: 'COMPLETED', updatedAt: now }).where(eq(posts.id, bounty.postId))
      await updateReputation(db, winner.authorId, 'ANSWER_ACCEPTED', winner.id)
      await updateReputation(db, winner.authorId, 'BOUNTY_AWARDED', winner.id)
      const payout = await GovernanceService.distributeBounty(db, winner.authorId, bounty.amount, bounty.id)
      if (!payout.success) console.error('[expireBounties] payout failed for bounty', bounty.id, payout.error)

      await createBountyNotification(db, winner.authorId, bounty.title, bounty.postId, bounty.amount)
      await createSystemNotification(
        db,
        bounty.authorId,
        'Bounty awarded',
        `No answer on "${bounty.title}" was accepted in time, so the top-voted answer received ${bounty.amount} BBUX.`,
        `/posts/${bounty.postId}`
      )
      result.autoAwarded++
    } catch (err) {
      console.error('[expireBounties] failed to settle bounty', bounty.id, err)
      result.errors++
    }
  }
}

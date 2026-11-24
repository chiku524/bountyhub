import { and, count, eq, lte } from 'drizzle-orm'
import { createDb } from '../../src/utils/db'
import { answers, bounties, posts, virtualWallets } from '../../drizzle/schema'
import { createSystemNotification } from '../../src/utils/notifications'

export type BountyExpiryResult = {
  refunded: number
  expired: number
  errors: number
}

/**
 * Acts on bounties whose `expiresAt` has passed (run hourly from the scheduled handler):
 * - No answers: the bounty is returned to the asker's wallet (status REFUNDED, post CLOSED).
 * - Has answers: status becomes EXPIRED and the asker is told to accept an answer; accepting an
 *   answer on an EXPIRED bounty still pays it out (see answers/[answerId]/accept.ts).
 */
export async function expireBounties(dbBinding: D1Database, now: Date = new Date()): Promise<BountyExpiryResult> {
  const db = createDb(dbBinding)
  const result: BountyExpiryResult = { refunded: 0, expired: 0, errors: 0 }

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
        const [wallet] = await db.select().from(virtualWallets).where(eq(virtualWallets.userId, bounty.authorId)).limit(1)
        if (wallet) {
          await db
            .update(virtualWallets)
            .set({
              balance: wallet.balance + bounty.amount,
              totalSpent: wallet.totalSpent - bounty.amount,
              updatedAt: now,
            })
            .where(eq(virtualWallets.userId, bounty.authorId))
        }
        await db
          .update(bounties)
          .set({ status: 'REFUNDED', refundReason: 'Expired with no answers', updatedAt: now })
          .where(and(eq(bounties.id, bounty.id), eq(bounties.status, 'ACTIVE')))
        await db.update(posts).set({ status: 'CLOSED', updatedAt: now }).where(eq(posts.id, bounty.postId))
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
          `"${bounty.title}" got ${answerCount} answer${answerCount === 1 ? '' : 's'}. Accept the one that helped to pay out ${bounty.amount} BBUX.`,
          `/posts/${bounty.postId}`
        )
        result.expired++
      }
    } catch (err) {
      console.error('[expireBounties] failed for bounty', bounty.id, err)
      result.errors++
    }
  }

  return result
}

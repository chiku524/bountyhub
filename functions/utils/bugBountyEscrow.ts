import { and, eq, gte, sql } from 'drizzle-orm'
import { virtualWallets, transactionLogs } from '../../drizzle/schema'
import type { Db } from '../../src/utils/db'

/**
 * BBUX movements for bug bounty campaigns.
 *
 * A campaign's budget is held from the owner's wallet when it is funded, awards
 * are paid out of that held budget, and whatever is left goes back to the owner
 * when the campaign is completed, cancelled or deleted.
 *
 * Every balance change is a single conditional UPDATE, so two concurrent
 * requests can't spend the same BBUX twice.
 */

export type EscrowLogType =
  | 'bug_bounty_escrow'   // owner funds a campaign budget
  | 'bug_bounty_payout'   // submitter receives an award
  | 'bug_bounty_refund'   // owner gets unspent budget back

export interface EscrowMeta {
  campaignId: string
  submissionId?: string
  reason?: string
}

/** Round to the 9 decimals BBUX uses, so float drift can't leave dust behind. */
export function roundBbux(amount: number): number {
  return Math.round(amount * 1e9) / 1e9
}

/** True for a finite number >= 0. */
export function isNonNegativeAmount(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

async function logMovement(db: Db, type: EscrowLogType, userId: string, amount: number, meta: EscrowMeta) {
  const id = crypto.randomUUID()
  const now = new Date()
  await db.insert(transactionLogs).values({
    id,
    type,
    userId,
    amount,
    transactionId: id,
    timestamp: now,
    status: 'completed',
    metadata: JSON.stringify(meta),
    createdAt: now,
    updatedAt: now,
  })
}

/**
 * Take `amount` BBUX from the user's wallet. Returns false (and changes nothing)
 * if the wallet is missing or the balance is too low.
 */
export async function debitWallet(db: Db, userId: string, amount: number, meta: EscrowMeta): Promise<boolean> {
  if (amount <= 0) return true
  const updated = await db
    .update(virtualWallets)
    .set({
      balance: sql`${virtualWallets.balance} - ${amount}`,
      totalSpent: sql`${virtualWallets.totalSpent} + ${amount}`,
      updatedAt: new Date(),
    })
    .where(and(eq(virtualWallets.userId, userId), gte(virtualWallets.balance, amount)))
    .returning({ id: virtualWallets.id })
  if (updated.length === 0) return false
  await logMovement(db, 'bug_bounty_escrow', userId, amount, meta)
  return true
}

async function ensureWallet(db: Db, userId: string) {
  const now = new Date()
  await db
    .insert(virtualWallets)
    .values({
      id: crypto.randomUUID(),
      userId,
      balance: 0,
      totalDeposited: 0,
      totalWithdrawn: 0,
      totalEarned: 0,
      totalSpent: 0,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing({ target: virtualWallets.userId })
}

/** Pay an award to a submitter. Counts as earnings. */
export async function creditPayout(db: Db, userId: string, amount: number, meta: EscrowMeta): Promise<void> {
  if (amount <= 0) return
  await ensureWallet(db, userId)
  await db
    .update(virtualWallets)
    .set({
      balance: sql`${virtualWallets.balance} + ${amount}`,
      totalEarned: sql`${virtualWallets.totalEarned} + ${amount}`,
      updatedAt: new Date(),
    })
    .where(eq(virtualWallets.userId, userId))
  await logMovement(db, 'bug_bounty_payout', userId, amount, meta)
}

/** Return unspent budget to the owner. Undoes the matching part of totalSpent. */
export async function creditRefund(db: Db, userId: string, amount: number, meta: EscrowMeta): Promise<void> {
  if (amount <= 0) return
  await ensureWallet(db, userId)
  await db
    .update(virtualWallets)
    .set({
      balance: sql`${virtualWallets.balance} + ${amount}`,
      totalSpent: sql`max(${virtualWallets.totalSpent} - ${amount}, 0)`,
      updatedAt: new Date(),
    })
    .where(eq(virtualWallets.userId, userId))
  await logMovement(db, 'bug_bounty_refund', userId, amount, meta)
}

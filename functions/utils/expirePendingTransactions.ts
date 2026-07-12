import { and, eq, lt } from 'drizzle-orm'
import { createDb } from '../../src/utils/db'
import { transactionLogs } from '../../drizzle/schema'

export type CleanupResult = {
  success: boolean
  message: string
  expiredCount: number
  cutoffTime: string
}

/** Expire pending transactions older than 24 hours. Shared by cron HTTP + scheduled handler. */
export async function expirePendingTransactions(dbBinding: D1Database): Promise<CleanupResult> {
  const db = createDb(dbBinding)
  const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const pendingTransactions = await db
    .select()
    .from(transactionLogs)
    .where(
      and(eq(transactionLogs.status, 'pending'), lt(transactionLogs.createdAt, cutoffTime))
    )

  if (pendingTransactions.length === 0) {
    return {
      success: true,
      message: 'No pending transactions to expire',
      expiredCount: 0,
      cutoffTime: cutoffTime.toISOString(),
    }
  }

  await db
    .update(transactionLogs)
    .set({
      status: 'expired',
      updatedAt: new Date(),
    })
    .where(
      and(eq(transactionLogs.status, 'pending'), lt(transactionLogs.createdAt, cutoffTime))
    )

  return {
    success: true,
    message: `Successfully expired ${pendingTransactions.length} pending transactions`,
    expiredCount: pendingTransactions.length,
    cutoffTime: cutoffTime.toISOString(),
  }
}

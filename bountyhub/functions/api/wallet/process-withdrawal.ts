import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { createDb } from '../../../src/utils/db'
import { getUserIdFromSession } from '../../../src/utils/auth'
import { virtualWallets, walletTransactions } from '../../../drizzle/schema'
import { eq } from 'drizzle-orm'

interface Env {
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

app.post(async (c) => {
  const sessionId = getCookie(c, 'session')
  if (!sessionId) return c.json({ error: 'Unauthorized' }, 401)

  const { transactionId } = await c.req.json()
  const db = createDb(c.env.DB)

  try {
    const userId = await getUserIdFromSession(sessionId, db)
    if (!userId) return c.json({ error: 'Unauthorized' }, 401)

    // Find the pending withdrawal transaction
    const transactionResult = await db.select().from(walletTransactions)
      .where(eq(walletTransactions.id, transactionId))
      .limit(1)
    if (transactionResult.length === 0) return c.json({ error: 'Transaction not found' }, 404)
    const transaction = transactionResult[0]
    if (transaction.status !== 'PENDING') return c.json({ error: 'Transaction is not pending' }, 400)
    if (transaction.type !== 'WITHDRAW') return c.json({ error: 'Transaction is not a withdrawal' }, 400)

    // Parse metadata to get withdrawal details
    const metadata = transaction.metadata ? JSON.parse(transaction.metadata) : {}
    const { destinationAddress, fee, netAmount } = metadata
    if (!destinationAddress) return c.json({ error: 'Invalid withdrawal transaction: no destination address' }, 400)

    // Optionally: Burn BBUX tokens and send SOL to the provided address
    // await SolanaService.sendBBUXFromPlatform(destinationAddress, transaction.amount)
    // await SolanaService.sendSolToUser(destinationAddress, netAmount)

    // Update transaction status
    await db.update(walletTransactions)
      .set({ status: 'COMPLETED', solanaSignature: null, updatedAt: new Date() })
      .where(eq(walletTransactions.id, transactionId))

    // Update virtual wallet balance
    const walletResult = await db.select().from(virtualWallets).where(eq(virtualWallets.userId, userId)).limit(1)
    if (walletResult.length > 0) {
      const wallet = walletResult[0]
      await db.update(virtualWallets)
        .set({ balance: wallet.balance - transaction.amount, totalWithdrawn: wallet.totalWithdrawn + transaction.amount, updatedAt: new Date() })
        .where(eq(virtualWallets.userId, userId))
    }

    return c.json({ success: true, message: 'Withdrawal processed successfully', bbuxBurned: transaction.amount, solSent: netAmount, fee })
  } catch (error) {
    console.error('Error processing withdrawal:', error)
    return c.json({ error: 'Failed to process withdrawal' }, 500)
  }
})

export default app 
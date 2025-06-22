import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { createDb } from '../../../src/utils/db'
import { getUserIdFromSession } from '../../../src/utils/auth'
import { virtualWallets, walletTransactions } from '../../../drizzle/schema'
import { eq } from 'drizzle-orm'
import { SolanaService } from '../../../src/utils/solana'

interface Env {
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

app.post(async (c) => {
  const sessionId = getCookie(c, 'session')
  if (!sessionId) return c.json({ error: 'Unauthorized' }, 401)

  const { transactionId, signature } = await c.req.json()
  const db = createDb(c.env.DB)

  try {
    const userId = await getUserIdFromSession(sessionId, db)
    if (!userId) return c.json({ error: 'Unauthorized' }, 401)

    // Find the pending deposit transaction
    const transactionResult = await db.select().from(walletTransactions)
      .where(eq(walletTransactions.id, transactionId))
      .limit(1)
    if (transactionResult.length === 0) return c.json({ error: 'Transaction not found' }, 404)
    const transaction = transactionResult[0]
    if (transaction.status !== 'PENDING') return c.json({ error: 'Transaction is not pending' }, 400)
    if (transaction.type !== 'DEPOSIT') return c.json({ error: 'Transaction is not a deposit' }, 400)

    // Get destination address from transaction metadata
    const metadata = transaction.metadata ? JSON.parse(transaction.metadata) : {}
    const destinationAddress = metadata.userAddress
    if (!destinationAddress) return c.json({ error: 'No destination address in transaction metadata' }, 400)

    // Verify the Solana transaction
    const verification = await SolanaService.verifyTransaction(signature)
    if (!verification.success) return c.json({ error: 'Invalid transaction signature' }, 400)

    // Send BBUX tokens to the provided address (if needed, or just credit virtual balance)
    const bbuxAmount = transaction.amount // 1:1 ratio
    // Platform may not need to send on-chain tokens, just credit virtual balance

    // Update transaction status
    await db.update(walletTransactions)
      .set({ status: 'COMPLETED', solanaSignature: signature, updatedAt: new Date() })
      .where(eq(walletTransactions.id, transactionId))

    // Update virtual wallet balance
    const walletResult = await db.select().from(virtualWallets).where(eq(virtualWallets.userId, userId)).limit(1)
    if (walletResult.length > 0) {
      const wallet = walletResult[0]
      await db.update(virtualWallets)
        .set({ balance: wallet.balance + bbuxAmount, totalDeposited: wallet.totalDeposited + transaction.amount, updatedAt: new Date() })
        .where(eq(virtualWallets.userId, userId))
    }

    return c.json({ success: true, message: 'Deposit confirmed successfully', bbuxAmount, signature })
  } catch (error) {
    console.error('Error confirming deposit:', error)
    return c.json({ error: 'Failed to confirm deposit' }, 500)
  }
})

export default app 
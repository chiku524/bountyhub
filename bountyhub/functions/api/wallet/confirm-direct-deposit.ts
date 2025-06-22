import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { createDb } from '../../../src/utils/db'
import { getUserIdFromSession } from '../../../src/utils/auth'
import { virtualWallets } from '../../../drizzle/schema'
import { eq } from 'drizzle-orm'
import { SolanaService } from '../../../src/utils/solana'

interface Env {
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

app.post(async (c) => {
  const sessionId = getCookie(c, 'session')
  if (!sessionId) return c.json({ error: 'Unauthorized' }, 401)

  const { amount, signature, destinationAddress } = await c.req.json()
  const db = createDb(c.env.DB)

  try {
    const userId = await getUserIdFromSession(sessionId, db)
    if (!userId) return c.json({ error: 'Unauthorized' }, 401)

    if (!destinationAddress) return c.json({ error: 'No destination address provided' }, 400)

    // Verify the Solana transaction
    const verification = await SolanaService.verifyTransaction(signature)
    if (!verification.success) return c.json({ error: 'Invalid transaction signature' }, 400)

    // Send BBUX tokens to the provided address (if needed, or just credit virtual balance)
    // Platform may not need to send on-chain tokens, just credit virtual balance

    // Update virtual wallet balance
    const walletResult = await db.select().from(virtualWallets).where(eq(virtualWallets.userId, userId)).limit(1)
    if (walletResult.length > 0) {
      const wallet = walletResult[0]
      await db.update(virtualWallets)
        .set({ balance: wallet.balance + amount, totalDeposited: wallet.totalDeposited + amount, updatedAt: new Date() })
        .where(eq(virtualWallets.userId, userId))
    }

    return c.json({ success: true, message: 'Direct deposit confirmed successfully', newBalance: walletResult.length > 0 ? walletResult[0].balance + amount : amount })
  } catch (error) {
    console.error('Error confirming direct deposit:', error)
    return c.json({ error: 'Failed to confirm direct deposit' }, 500)
  }
})

export default app 
import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { createDb } from '../../../src/utils/db'
import { getUserIdFromSession } from '../../../src/utils/auth'
import { transactionLogs, virtualWallets } from '../../../drizzle/schema'
import { eq, and, sql } from 'drizzle-orm'
import { SolanaService } from '../../../src/utils/solana'

interface Env {
  DB: any
  SOLANA_RPC_URL: string
  SOLANA_WALLET_PRIVATE_KEY: string
  SOLANA_WALLET_ADDRESS: string
  CUSTOM_RPC_URL?: string
}

const app = new Hono<{ Bindings: Env }>()

app.post('/', async (c) => {
  try {
    const db = createDb(c.env.DB)
    const { transactionId } = await c.req.json()
    
    if (!transactionId) {
      return c.json({ error: 'Transaction ID is required' }, 400)
    }

    // Get authenticated user
    const sessionCookie = getCookie(c, 'session')
    if (!sessionCookie) {
      return c.json({ error: 'Not authenticated' }, 401)
    }
    
    const userId = await getUserIdFromSession(sessionCookie, db)
    if (!userId) {
      return c.json({ error: 'Invalid session' }, 401)
    }

    // Get the pending withdrawal transaction
    const [transaction] = await db
      .select()
      .from(transactionLogs)
      .where(and(
        eq(transactionLogs.transactionId, transactionId),
        eq(transactionLogs.userId, userId),
        eq(transactionLogs.type, 'withdrawal'),
        eq(transactionLogs.status, 'pending')
      ))
      .limit(1)

    if (!transaction) {
      return c.json({ error: 'Pending withdrawal transaction not found' }, 404)
    }

    // Double-check that the transaction is still pending
    if (transaction.status !== 'pending') {
      return c.json({ error: 'Withdrawal has already been processed' }, 400)
    }

    // Mark transaction as processing to prevent race conditions
    await db
      .update(transactionLogs)
      .set({ 
        status: 'processing',
        updatedAt: new Date()
      })
      .where(eq(transactionLogs.id, transaction.id))

    // Parse metadata to get withdrawal details
    const metadata = transaction.metadata ? JSON.parse(transaction.metadata) : {}
    const { destinationAddress, netAmount } = metadata

    if (!destinationAddress) {
      return c.json({ error: 'Invalid withdrawal transaction: no destination address' }, 400)
    }
    
    // Test platform wallet before processing
    const walletTest = await SolanaService.testPlatformWallet(c.env)
    if (!walletTest.success) {
      // Mark transaction as failed
      await db
        .update(transactionLogs)
        .set({ 
          status: 'failed',
          updatedAt: new Date()
        })
        .where(eq(transactionLogs.id, transaction.id))

      // Refund the user's BBUX balance
      await db
        .update(virtualWallets)
        .set({ 
          balance: sql`balance + ${Math.abs(transaction.amount)}`,
          totalWithdrawn: sql`total_withdrawn - ${Math.abs(transaction.amount)}`,
          updatedAt: new Date() 
        })
        .where(eq(virtualWallets.userId, userId))
      
      return c.json({ error: 'Platform wallet test failed' }, 500)
    }

    // Calculate final amounts - use stored values or calculate fallback
    const storedNetAmount = parseFloat(netAmount) || 0
    
    // Use stored values if available, otherwise calculate fallback
    const finalNetAmount = storedNetAmount > 0 ? storedNetAmount : (Math.abs(transaction.amount) - 0.000005)

    if (finalNetAmount <= 0) {
      // Mark transaction as failed
      await db
        .update(transactionLogs)
        .set({ 
          status: 'failed',
          updatedAt: new Date()
        })
        .where(eq(transactionLogs.id, transaction.id))

      // Refund the user's BBUX balance
      await db
        .update(virtualWallets)
        .set({ 
          balance: sql`balance + ${Math.abs(transaction.amount)}`,
          totalWithdrawn: sql`total_withdrawn - ${Math.abs(transaction.amount)}`,
          updatedAt: new Date() 
        })
        .where(eq(virtualWallets.userId, userId))
      
      return c.json({ error: 'Invalid withdrawal amount after fees' }, 400)
    }

    // Send SOL to user
    const solResult = await SolanaService.sendSolToUser(destinationAddress, finalNetAmount, c.env)
    
    if (!solResult.success) {
      // Update transaction status to failed
      await db
        .update(transactionLogs)
        .set({ 
          status: 'failed',
          updatedAt: new Date()
        })
        .where(eq(transactionLogs.id, transaction.id))

      // Refund the user's BBUX balance
      await db
        .update(virtualWallets)
        .set({ 
          balance: sql`balance + ${Math.abs(transaction.amount)}`,
          totalWithdrawn: sql`total_withdrawn - ${Math.abs(transaction.amount)}`,
          updatedAt: new Date() 
        })
        .where(eq(virtualWallets.userId, userId))

      return c.json({ 
        error: 'Failed to send SOL', 
        details: solResult.error 
      }, 500)
    }

    // Update transaction status to completed
    await db
      .update(transactionLogs)
      .set({ 
        status: 'completed',
        updatedAt: new Date()
      })
      .where(eq(transactionLogs.id, transaction.id))

    return c.json({ 
      success: true, 
      message: 'Withdrawal processed successfully',
      signature: solResult.signature
    })

  } catch (error: any) {
    return c.json({ 
      error: 'Failed to process withdrawal', 
      details: error.message 
    }, 500)
  }
})

export default app 
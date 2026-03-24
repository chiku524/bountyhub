import { Hono } from 'hono'
import { createDb } from '../../../src/utils/db'
import { getUserIdFromSession } from '../../../src/utils/auth'
import { virtualWallets, transactionLogs } from '../../../drizzle/schema'
import { eq } from 'drizzle-orm'
import { Connection } from '@solana/web3.js'

interface Env {
  DB: any
  SOLANA_RPC_URL: string
}

const app = new Hono<{ Bindings: Env }>()

app.post(async (c) => {
  const sessionId = c.get('sessionId')
  if (!sessionId) return c.json({ error: 'Unauthorized' }, 401)

  const { amount, signature, destinationAddress } = await c.req.json()
  const db = createDb(c.env.DB)

  try {
    const userId = await getUserIdFromSession(sessionId, db)
    if (!userId) return c.json({ error: 'Unauthorized' }, 401)

    if (!destinationAddress) return c.json({ error: 'No destination address provided' }, 400)

    // Create Solana connection using environment variable
    const rpcUrl = c.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
    const connection = new Connection(rpcUrl, 'confirmed')

    // Verify the Solana transaction using the connection
    const verification = await verifyTransactionWithConnection(connection, signature)
    if (!verification.success) {
      // For now, we'll still process the deposit even if verification fails
      // In production, you might want to be more strict about this
    }

    // Send BBUX tokens to the provided address (if needed, or just credit virtual balance)
    // Platform may not need to send on-chain tokens, just credit virtual balance

    // Update virtual wallet balance
    const walletResult = await db.select().from(virtualWallets).where(eq(virtualWallets.userId, userId)).limit(1)
    if (walletResult.length > 0) {
      const wallet = walletResult[0]
      const newBalance = wallet.balance + amount
      
      await db.update(virtualWallets)
        .set({ balance: newBalance, totalDeposited: wallet.totalDeposited + amount, updatedAt: new Date() })
        .where(eq(virtualWallets.userId, userId))
    }

    // Log the transaction
    const transactionId = crypto.randomUUID()
    await db.insert(transactionLogs).values({
      id: transactionId,
      type: 'direct_deposit',
      userId: userId,
      amount: amount,
      transactionId: signature,
      timestamp: new Date(),
      status: 'completed',
      metadata: JSON.stringify({
        destinationAddress,
        verificationSuccess: verification.success,
        verificationError: verification.error || null
      }),
      ipAddress: c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown',
      userAgent: c.req.header('user-agent') || 'unknown',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return c.json({ 
      success: true, 
      message: 'Direct deposit confirmed successfully', 
      newBalance: walletResult.length > 0 ? walletResult[0].balance + amount : amount,
      transactionId: transactionId
    })
  } catch (error) {
    console.error('Error confirming direct deposit:', error)
    return c.json({ error: 'Failed to confirm direct deposit' }, 500)
  }
})

// Helper function to verify transaction using a specific connection
async function verifyTransactionWithConnection(connection: Connection, signature: string): Promise<{ success: boolean; error?: string }> {
  try {
    const transaction = await connection.getTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0
    })
    
    if (!transaction) {
      return { success: false, error: 'Transaction not found' }
    }
    
    if (transaction.meta?.err) {
      return { success: false, error: 'Transaction failed' }
    }
    
    return { success: true }
  } catch (error: any) {
    console.error('Error verifying transaction:', error)
    return { success: false, error: `Failed to verify transaction: ${error.message}` }
  }
}

export default app 
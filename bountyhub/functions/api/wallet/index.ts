import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { createDb } from '../../../src/utils/db'
import { getUserIdFromSession } from '../../../src/utils/auth'
import { virtualWallets, walletTransactions } from '../../../drizzle/schema'
import { eq, desc } from 'drizzle-orm'
import { SolanaService } from '../../../src/utils/solana'

// Import wallet sub-routes
import confirmDepositRoutes from './confirm-deposit'
import confirmDirectDepositRoutes from './confirm-direct-deposit'
import processWithdrawalRoutes from './process-withdrawal'

interface Env {
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

// Register sub-routes
app.route('/confirm-deposit', confirmDepositRoutes)
app.route('/confirm-direct-deposit', confirmDirectDepositRoutes)
app.route('/process-withdrawal', processWithdrawalRoutes)

app.get(async (c) => {
  const sessionId = getCookie(c, 'session')
  
  if (!sessionId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const db = createDb(c.env.DB)
  
  try {
    const userId = await getUserIdFromSession(sessionId, db)
    
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const walletResult = await db.select().from(virtualWallets).where(eq(virtualWallets.userId, userId)).limit(1)
    if (walletResult.length === 0) return c.json({ error: 'Wallet not found' }, 404)
    const wallet = walletResult[0]

    // Get platform address for deposits
    const platformAddress = SolanaService.getPlatformWalletAddress()

    return c.json({
      virtualBalance: wallet.balance,
      totalDeposited: wallet.totalDeposited,
      totalWithdrawn: wallet.totalWithdrawn,
      totalEarned: wallet.totalEarned,
      totalSpent: wallet.totalSpent,
      platformAddress,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt
    })
  } catch (error) {
    console.error('Error fetching wallet:', error)
    return c.json({ error: 'Failed to fetch wallet' }, 500)
  }
})

// Get recent transactions
app.get('/transactions', async (c) => {
  const sessionId = getCookie(c, 'session')
  
  if (!sessionId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const db = createDb(c.env.DB)
  
  try {
    const userId = await getUserIdFromSession(sessionId, db)
    
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    // Get recent transactions (last 10)
    const transactions = await db.select().from(walletTransactions)
      .where(eq(walletTransactions.userId, userId))
      .orderBy(desc(walletTransactions.createdAt))
      .limit(10)

    return c.json(transactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return c.json({ error: 'Failed to fetch transactions' }, 500)
  }
})

app.post('/action', async (c) => {
  const sessionId = getCookie(c, 'session')
  
  if (!sessionId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const { action, amount, destinationAddress } = await c.req.json()
  const db = createDb(c.env.DB)
  
  try {
    const userId = await getUserIdFromSession(sessionId, db)
    
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const walletResult = await db.select().from(virtualWallets).where(eq(virtualWallets.userId, userId)).limit(1)
    if (walletResult.length === 0) return c.json({ error: 'Wallet not found' }, 404)
    const wallet = walletResult[0]

    if (action === 'deposit') {
      // Virtual deposit - create a pending transaction, do not credit balance yet
      if (!amount || amount <= 0) {
        return c.json({ error: 'Invalid amount' }, 400)
      }

      // Create pending transaction record
      const transactionId = crypto.randomUUID()
      await db.insert(walletTransactions).values({
        id: transactionId,
        userId: userId,
        walletId: wallet.id,
        type: 'DEPOSIT',
        amount: amount,
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance, // No change yet
        description: `Virtual deposit of ${amount} BBUX tokens`,
        status: 'PENDING',
        metadata: JSON.stringify({
          depositType: 'virtual',
          ...(destinationAddress ? { userAddress: destinationAddress } : {})
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      })

      return c.json({
        success: true,
        action,
        amount,
        transactionId,
        message: 'Deposit request created. Please confirm with transaction signature.'
      })
    } else if (action === 'withdraw') {
      // Virtual withdrawal - just deduct from balance
      if (!amount || amount <= 0) {
        return c.json({ error: 'Invalid amount' }, 400)
      }
      if (!destinationAddress) {
        return c.json({ error: 'Destination address is required' }, 400)
      }
      if (wallet.balance < amount) {
        return c.json({ error: 'Insufficient balance' }, 400)
      }
      
      // Update wallet balance
      await db.update(virtualWallets)
        .set({ 
          balance: wallet.balance - amount,
          totalWithdrawn: wallet.totalWithdrawn + amount,
          updatedAt: new Date()
        })
        .where(eq(virtualWallets.userId, userId))

      // Create transaction record
      const transactionId = crypto.randomUUID()
      await db.insert(walletTransactions).values({
        id: transactionId,
        userId: userId,
        walletId: wallet.id,
        type: 'WITHDRAW',
        amount: amount,
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance - amount,
        description: `Virtual withdrawal of ${amount} BBUX tokens`,
        status: 'COMPLETED',
        metadata: JSON.stringify({ 
          withdrawalType: 'virtual',
          destinationAddress
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      })
      
      return c.json({ 
        success: true, 
        action, 
        amount, 
        transactionId,
        message: 'Virtual withdrawal completed successfully.',
        newBalance: wallet.balance - amount
      })
    } else {
      return c.json({ error: 'Invalid action' }, 400)
    }
  } catch (error) {
    console.error('Error processing wallet action:', error)
    return c.json({ error: 'Failed to process wallet action' }, 500)
  }
})

export default app 
import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { createDb } from '../../../src/utils/db'
import { virtualWallets, transactionLogs, sessions } from '../../../drizzle/schema'
import { eq, desc, and } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'

// Import wallet sub-routes
import confirmDepositRoutes from './confirm-deposit'
import confirmDirectDepositRoutes from './confirm-direct-deposit'
import processWithdrawalRoutes from './process-withdrawal'
import getBlockhashRoutes from './get-blockhash'
import sendTransactionRoutes from './send-transaction'
import solanaProxyRoutes from './solana-proxy'

interface Env {
  DB: any
  SOLANA_WALLET_ADDRESS: string
}

// Helper function to get user ID from session
async function getUserIdFromSession(sessionId: string, db: any) {
  try {
    const sessionResult = await db.select().from(sessions).where(eq(sessions.id, sessionId)).get()
    if (!sessionResult) return null

    // Check if session is expired
    if (sessionResult.expiresAt && new Date() > new Date(sessionResult.expiresAt)) {
      await db.delete(sessions).where(eq(sessions.id, sessionId))
      return null
    }

    return sessionResult.userId
  } catch (error) {
    console.error('Session error:', error)
    return null
  }
}

const app = new Hono<{ Bindings: Env }>()

// Register sub-routes
app.route('/confirm-deposit', confirmDepositRoutes)
app.route('/confirm-direct-deposit', confirmDirectDepositRoutes)
app.route('/process-withdrawal', processWithdrawalRoutes)
app.route('/get-blockhash', getBlockhashRoutes)
app.route('/send-transaction', sendTransactionRoutes)
app.route('/solana-proxy', solanaProxyRoutes)

// Get wallet info
app.get('/', async (c) => {
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
    
    if (walletResult.length === 0) {
      return c.json({ error: 'Wallet not found' }, 404)
    }

    const wallet = walletResult[0]
    const platformAddress = c.env.SOLANA_WALLET_ADDRESS || 'Platform address not configured'
    
    // Format dates properly
    const formatDate = (dateValue: any): string => {
      if (!dateValue) return new Date().toISOString()
      
      try {
        // If it's already a valid ISO string, return it as is
        if (typeof dateValue === 'string' && dateValue.includes('T') && dateValue.includes('Z')) {
          return dateValue
        }
        
        // Handle different date formats
        let date: Date
        if (typeof dateValue === 'number') {
          // If it's a timestamp, check if it's in seconds or milliseconds
          // Unix timestamps in seconds are typically 10 digits, milliseconds are 13 digits
          if (dateValue < 10000000000) {
            // Likely in seconds, convert to milliseconds
            date = new Date(dateValue * 1000)
          } else {
            // Likely in milliseconds
            date = new Date(dateValue)
          }
        } else if (typeof dateValue === 'string') {
          // If it's a string, try to parse it
          date = new Date(dateValue)
        } else {
          // If it's already a Date object
          date = dateValue
        }
        
        // Check if the date is valid
        if (isNaN(date.getTime())) {
          return new Date().toISOString()
        }
        
        return date.toISOString()
      } catch (error) {
        return new Date().toISOString()
      }
    }
    
    return c.json({
      balance: wallet.balance,
      virtualBalance: wallet.balance,
      totalDeposited: wallet.totalDeposited,
      totalWithdrawn: wallet.totalWithdrawn,
      totalEarned: wallet.totalEarned || 0,
      totalSpent: wallet.totalSpent || 0,
      platformAddress: platformAddress,
      createdAt: formatDate(wallet.createdAt),
      updatedAt: formatDate(wallet.updatedAt)
    })
  } catch (error) {
    console.error('Error fetching wallet:', error)
    return c.json({ error: 'Failed to fetch wallet' }, 500)
  }
})

// Get recent transactions (last 5 for dashboard)
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

    // Get recent transactions from new transactionLogs table
    const transactions = await db.select().from(transactionLogs)
      .where(eq(transactionLogs.userId, userId))
      .orderBy(desc(transactionLogs.createdAt))
      .limit(5)

    // Format dates properly
    const formatDate = (dateValue: any): string => {
      if (!dateValue) return new Date().toISOString()
      
      try {
        // If it's already a valid ISO string, return it as is
        if (typeof dateValue === 'string' && dateValue.includes('T') && dateValue.includes('Z')) {
          return dateValue
        }
        
        // Handle different date formats
        let date: Date
        if (typeof dateValue === 'number') {
          // If it's a timestamp, check if it's in seconds or milliseconds
          // Unix timestamps in seconds are typically 10 digits, milliseconds are 13 digits
          if (dateValue < 10000000000) {
            // Likely in seconds, convert to milliseconds
            date = new Date(dateValue * 1000)
          } else {
            // Likely in milliseconds
            date = new Date(dateValue)
          }
        } else if (typeof dateValue === 'string') {
          // If it's a string, try to parse it
          date = new Date(dateValue)
        } else {
          // If it's already a Date object
          date = dateValue
        }
        
        // Check if the date is valid
        if (isNaN(date.getTime())) {
          return new Date().toISOString()
        }
        
        return date.toISOString()
      } catch (error) {
        return new Date().toISOString()
      }
    }

    const formattedTransactions = transactions.map(transaction => ({
      ...transaction,
      createdAt: formatDate(transaction.createdAt),
      updatedAt: formatDate(transaction.updatedAt),
      timestamp: formatDate(transaction.timestamp)
    }))

    return c.json(formattedTransactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return c.json({ error: 'Failed to fetch transactions' }, 500)
  }
})

// Get all transactions with pagination
app.get('/transactions/all', async (c) => {
  const sessionId = getCookie(c, 'session')
  
  if (!sessionId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const db = createDb(c.env.DB)
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '20')
  const offset = (page - 1) * limit
  
  try {
    const userId = await getUserIdFromSession(sessionId, db)
    
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    // Get transactions from new transactionLogs table
    const transactions = await db.select().from(transactionLogs)
      .where(eq(transactionLogs.userId, userId))
      .orderBy(desc(transactionLogs.createdAt))

    // Format dates properly
    const formatDate = (dateValue: any): string => {
      if (!dateValue) return new Date().toISOString()
      
      try {
        // If it's already a valid ISO string, return it as is
        if (typeof dateValue === 'string' && dateValue.includes('T') && dateValue.includes('Z')) {
          return dateValue
        }
        
        // Handle different date formats
        let date: Date
        if (typeof dateValue === 'number') {
          // If it's a timestamp, check if it's in seconds or milliseconds
          // Unix timestamps in seconds are typically 10 digits, milliseconds are 13 digits
          if (dateValue < 10000000000) {
            // Likely in seconds, convert to milliseconds
            date = new Date(dateValue * 1000)
          } else {
            // Likely in milliseconds
            date = new Date(dateValue)
          }
        } else if (typeof dateValue === 'string') {
          // If it's a string, try to parse it
          date = new Date(dateValue)
        } else {
          // If it's already a Date object
          date = dateValue
        }
        
        // Check if the date is valid
        if (isNaN(date.getTime())) {
          return new Date().toISOString()
        }
        
        return date.toISOString()
      } catch (error) {
        return new Date().toISOString()
      }
    }

    // Apply pagination
    const total = transactions.length
    const totalPages = Math.ceil(total / limit)
    const paginatedTransactions = transactions.slice(offset, offset + limit)

    const formattedTransactions = paginatedTransactions.map(transaction => ({
      ...transaction,
      createdAt: formatDate(transaction.createdAt),
      updatedAt: formatDate(transaction.updatedAt),
      timestamp: formatDate(transaction.timestamp)
    }))

    return c.json({
      transactions: formattedTransactions,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    })
  } catch (error) {
    console.error('Error fetching all transactions:', error)
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

    if (action === 'deposit') {
      // Create pending transaction record
      const transactionId = uuidv4()
      await db.insert(transactionLogs).values({
        id: transactionId,
        type: 'manual_deposit',
        userId: userId,
        amount: amount,
        transactionId: transactionId, // Store without prefix
        timestamp: new Date(),
        status: 'pending',
        metadata: JSON.stringify({ action: 'manual_deposit' }),
        ipAddress: c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown',
        userAgent: c.req.header('user-agent') || 'unknown',
        createdAt: new Date(),
        updatedAt: new Date()
      })

      return c.json({ 
        success: true, 
        message: 'Deposit request created', 
        transactionId: transactionId 
      })
    } else if (action === 'withdraw') {
      const walletResult = await db.select().from(virtualWallets).where(eq(virtualWallets.userId, userId)).limit(1)
      
      if (walletResult.length === 0) {
        return c.json({ error: 'Wallet not found' }, 404)
      }

      const wallet = walletResult[0]
      
      if (wallet.balance < amount) {
        return c.json({ error: 'Insufficient balance' }, 400)
      }

      if (!destinationAddress) {
        return c.json({ error: 'Destination address is required for withdrawal' }, 400)
      }

      // Check for recent pending withdrawals to prevent duplicates
      const recentWithdrawals = await db.select().from(transactionLogs)
        .where(and(
          eq(transactionLogs.userId, userId),
          eq(transactionLogs.type, 'withdrawal'),
          eq(transactionLogs.status, 'pending')
        ))
        .orderBy(desc(transactionLogs.createdAt))
        .limit(1)

      if (recentWithdrawals.length > 0) {
        const lastWithdrawal = recentWithdrawals[0]
        const timeSinceLastWithdrawal = Date.now() - new Date(lastWithdrawal.createdAt).getTime()
        
        // If there's a pending withdrawal from the last 30 seconds, prevent duplicate
        if (timeSinceLastWithdrawal < 30000) {
          return c.json({ error: 'A withdrawal is already in progress. Please wait before trying again.' }, 400)
        }
      }

      // Calculate fee and net amount (3% fee)
      const fee = amount * 0.03
      const netAmount = amount - fee

      // Validate that net amount is positive
      if (netAmount <= 0) {
        return c.json({ error: 'Withdrawal amount too small after fees' }, 400)
      }

      // Create withdrawal transaction record
      const transactionId = uuidv4()
      await db.insert(transactionLogs).values({
        id: transactionId,
        type: 'withdrawal',
        userId: userId,
        amount: -amount, // Negative for withdrawals
        transactionId: transactionId, // Store without prefix
        timestamp: new Date(),
        status: 'pending',
        metadata: JSON.stringify({ 
          action: 'withdrawal', 
          destinationAddress,
          fee: fee.toFixed(6), // Store as string to avoid floating point issues
          netAmount: netAmount.toFixed(6) // Store as string to avoid floating point issues
        }),
        ipAddress: c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown',
        userAgent: c.req.header('user-agent') || 'unknown',
        createdAt: new Date(),
        updatedAt: new Date()
      })

      // Update wallet balance
      await db.update(virtualWallets)
        .set({ 
          balance: wallet.balance - amount, 
          totalWithdrawn: wallet.totalWithdrawn + amount,
          updatedAt: new Date() 
        })
        .where(eq(virtualWallets.userId, userId))

      return c.json({ 
        success: true, 
        message: 'Withdrawal processed', 
        transactionId: transactionId,
        newBalance: wallet.balance - amount,
        fee: fee.toFixed(6),
        netAmount: netAmount.toFixed(6)
      })
    }

    return c.json({ error: 'Invalid action' }, 400)
  } catch (error) {
    console.error('Error processing wallet action:', error)
    return c.json({ error: 'Failed to process wallet action' }, 500)
  }
})

export default app 
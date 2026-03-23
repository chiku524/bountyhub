import { Hono } from 'hono'
import { createDb } from '../../src/utils/db'
import { transactionLogs } from '../../drizzle/schema'
import { eq, lt, and } from 'drizzle-orm'

interface Env {
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

// Cron trigger handler - runs every hour
app.get('/cron', async (c) => {
  const db = createDb(c.env.DB)
  
  try {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000)

    // Find all pending transactions older than 24 hours
    const pendingTransactions = await db.select().from(transactionLogs)
      .where(and(
        eq(transactionLogs.status, 'pending'),
        lt(transactionLogs.createdAt, cutoffTime)
      ))

    if (pendingTransactions.length === 0) {
      return c.json({
        success: true,
        message: 'No pending transactions to expire',
        expiredCount: 0
      })
    }

    // Update all found transactions to 'expired' status
    await db.update(transactionLogs)
      .set({ 
        status: 'expired',
        updatedAt: new Date()
      })
      .where(and(
        eq(transactionLogs.status, 'pending'),
        lt(transactionLogs.createdAt, cutoffTime)
      ))

    return c.json({
      success: true,
      message: `Successfully expired ${pendingTransactions.length} pending transactions`,
      expiredCount: pendingTransactions.length,
      cutoffTime: cutoffTime.toISOString()
    })

  } catch (error) {
    console.error('Error during cleanup:', error)
    return c.json({ 
      success: false, 
      error: 'Failed to cleanup pending transactions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Manual trigger endpoint (for testing)
app.post('/manual', async (c) => {
  const sessionId = c.req.header('authorization')
  
  // Simple auth check - you might want to add proper authentication
  if (!sessionId || !sessionId.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  // Reuse the same logic as the cron trigger
  const db = createDb(c.env.DB)
  
  try {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000)

    // Find all pending transactions older than 24 hours
    const pendingTransactions = await db.select().from(transactionLogs)
      .where(and(
        eq(transactionLogs.status, 'pending'),
        lt(transactionLogs.createdAt, cutoffTime)
      ))

    if (pendingTransactions.length === 0) {
      return c.json({
        success: true,
        message: 'No pending transactions to expire',
        expiredCount: 0
      })
    }

    await db.update(transactionLogs)
      .set({
        status: 'expired',
        updatedAt: new Date()
      })
      .where(and(
        eq(transactionLogs.status, 'pending'),
        lt(transactionLogs.createdAt, cutoffTime)
      ))

    return c.json({
      success: true,
      message: `Successfully expired ${pendingTransactions.length} pending transactions`,
      expiredCount: pendingTransactions.length,
      cutoffTime: cutoffTime.toISOString()
    })

  } catch (error) {
    console.error('Error during manual cleanup:', error)
    return c.json({ 
      success: false, 
      error: 'Failed to cleanup pending transactions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

export default app 
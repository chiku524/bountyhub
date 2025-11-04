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
    console.log('Starting cleanup of pending transactions...')
    
    // Calculate the cutoff time (24 hours ago)
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000)
    console.log('Cutoff time:', cutoffTime.toISOString())
    
    // Find all pending transactions older than 24 hours
    const pendingTransactions = await db.select().from(transactionLogs)
      .where(and(
        eq(transactionLogs.status, 'pending'),
        lt(transactionLogs.createdAt, cutoffTime)
      ))
    
    console.log(`Found ${pendingTransactions.length} pending transactions to expire`)
    
    if (pendingTransactions.length === 0) {
      console.log('No pending transactions to expire')
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
    
    console.log(`Successfully expired ${pendingTransactions.length} pending transactions`)
    
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
    console.log('Manual cleanup of pending transactions...')
    
    // Calculate the cutoff time (24 hours ago)
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000)
    console.log('Cutoff time:', cutoffTime.toISOString())
    
    // Find all pending transactions older than 24 hours
    const pendingTransactions = await db.select().from(transactionLogs)
      .where(and(
        eq(transactionLogs.status, 'pending'),
        lt(transactionLogs.createdAt, cutoffTime)
      ))
    
    console.log(`Found ${pendingTransactions.length} pending transactions to expire`)
    
    if (pendingTransactions.length === 0) {
      console.log('No pending transactions to expire')
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
    
    console.log(`Successfully expired ${pendingTransactions.length} pending transactions`)
    
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
import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { createDb } from '../../../src/utils/db'
import { getUserIdFromSession } from '../../../src/utils/auth'
import { virtualWallets } from '../../../drizzle/schema'
import { eq } from 'drizzle-orm'

interface Env {
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

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
    return c.json({
      address: wallet.id,
      balance: wallet.balance,
      totalDeposited: wallet.totalDeposited,
      totalWithdrawn: wallet.totalWithdrawn,
      totalEarned: wallet.totalEarned,
      totalSpent: wallet.totalSpent,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt
    })
  } catch (error) {
    console.error('Error fetching wallet:', error)
    return c.json({ error: 'Failed to fetch wallet' }, 500)
  }
})

app.post(async (c) => {
  const sessionId = getCookie(c, 'session')
  
  if (!sessionId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const { action, amount } = await c.req.json()
  const db = createDb(c.env.DB)
  
  try {
    const userId = await getUserIdFromSession(sessionId, db)
    
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const walletResult = await db.select().from(virtualWallets).where(eq(virtualWallets.userId, userId)).limit(1)
    if (walletResult.length === 0) return c.json({ error: 'Wallet not found' }, 404)
    const wallet = walletResult[0]
    let newBalance = wallet.balance
    if (action === 'deposit') newBalance += amount
    if (action === 'withdraw') newBalance -= amount
    await db.update(virtualWallets).set({ balance: newBalance, updatedAt: new Date() }).where(eq(virtualWallets.userId, userId))
    return c.json({ success: true, action, amount, newBalance })
  } catch (error) {
    console.error('Error updating wallet:', error)
    return c.json({ error: 'Failed to update wallet' }, 500)
  }
})

export default app 
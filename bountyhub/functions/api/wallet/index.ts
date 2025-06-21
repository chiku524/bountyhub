import { Hono } from 'hono'
import { createDb } from '../../../src/utils/db'
import { virtualWallets } from '../../../drizzle/schema'
import { eq } from 'drizzle-orm'

interface Env {
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

app.get(async (c) => {
  const db = createDb(c.env.DB)
  // TODO: Replace with real userId from session
  const userId = '1'
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
})

app.post(async (c) => {
  const { action, amount } = await c.req.json()
  const db = createDb(c.env.DB)
  // TODO: Replace with real userId from session
  const userId = '1'
  const walletResult = await db.select().from(virtualWallets).where(eq(virtualWallets.userId, userId)).limit(1)
  if (walletResult.length === 0) return c.json({ error: 'Wallet not found' }, 404)
  const wallet = walletResult[0]
  let newBalance = wallet.balance
  if (action === 'deposit') newBalance += amount
  if (action === 'withdraw') newBalance -= amount
  await db.update(virtualWallets).set({ balance: newBalance, updatedAt: new Date() }).where(eq(virtualWallets.userId, userId))
  return c.json({ success: true, action, amount, newBalance })
})

export default app 
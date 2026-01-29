import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { eq } from 'drizzle-orm'
import { users } from '../../../drizzle/schema'
import { verifyPassword, hashPassword, getAuthUser } from '../../utils/auth'

interface Env {
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

app.post('/', async (c) => {
  try {
    const db = drizzle(c.env.DB)
    
    // Get authenticated user
    const authUser = await getAuthUser(c)
    if (!authUser) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { currentPassword, newPassword } = await c.req.json()

    // Validate input
    if (!currentPassword || !newPassword) {
      return c.json({ error: 'Current password and new password are required' }, 400)
    }

    if (newPassword.length < 8) {
      return c.json({ error: 'New password must be at least 8 characters long' }, 400)
    }

    // Get current user data
    const [user] = await db.select().from(users).where(eq(users.id, authUser.id)).limit(1)
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }

    // Verify current password
    const isValidPassword = await verifyPassword(currentPassword, user.password)
    
    if (!isValidPassword) {
      return c.json({ error: 'Current password is incorrect' }, 400)
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword)

    // Update password in database
    await db
      .update(users)
      .set({ password: hashedNewPassword })
      .where(eq(users.id, authUser.id))

    return c.json({ 
      success: true, 
      message: 'Password changed successfully' 
    })

  } catch (error) {
    console.error('Change password error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default app 
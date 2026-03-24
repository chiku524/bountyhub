import { Hono } from 'hono'
import { createDb } from '../../src/utils/db'
import { getUserIdFromSession } from '../../src/utils/auth'
import { notifications } from '../../drizzle/schema'
import { eq, desc, and } from 'drizzle-orm'

interface Env {
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

// Get user notifications
app.get(async (c) => {
  const sessionId = c.get('sessionId')
  
  if (!sessionId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const db = createDb(c.env.DB)
  
  try {
    const userId = await getUserIdFromSession(sessionId, db)
    
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    // Get user's notifications ordered by creation date (newest first)
    const userNotifications = await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50) // Limit to last 50 notifications

    // Transform the data to match frontend expectations
    const transformedNotifications = userNotifications.map(notification => ({
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      read: notification.read,
      createdAt: notification.createdAt,
      navigation: notification.navigationType && notification.navigationUrl ? {
        type: notification.navigationType as 'post' | 'home' | 'profile' | 'wallet',
        id: notification.navigationId || undefined,
        url: notification.navigationUrl
      } : undefined
    }))

    return c.json(transformedNotifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return c.json({ error: 'Failed to fetch notifications', details: error instanceof Error ? error.message : 'Unknown error' }, 500)
  }
})

// Get unread count only (for efficient polling)
app.get('/unread-count', async (c) => {
  const sessionId = c.get('sessionId')
  
  if (!sessionId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const db = createDb(c.env.DB)
  
  try {
    const userId = await getUserIdFromSession(sessionId, db)
    
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    // Count unread notifications
    const unreadCount = await db.select({ count: notifications.id })
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.read, false)
      ))

    return c.json({ unreadCount: unreadCount.length })
  } catch (error) {
    console.error('Error fetching unread count:', error)
    return c.json({ error: 'Failed to fetch unread count', details: error instanceof Error ? error.message : 'Unknown error' }, 500)
  }
})

// Mark notification as read
app.post('/:id/read', async (c) => {
  const sessionId = c.get('sessionId')
  
  if (!sessionId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const db = createDb(c.env.DB)
  
  try {
    const userId = await getUserIdFromSession(sessionId, db)
    
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const notificationId = c.req.param('id')

    // Update notification to mark as read
    await db.update(notifications)
      .set({ 
        read: true,
        updatedAt: new Date()
      })
      .where(and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      ))

    return c.json({ success: true })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return c.json({ error: 'Failed to mark notification as read' }, 500)
  }
})

// Mark all notifications as read
app.post('/read-all', async (c) => {
  const sessionId = c.get('sessionId')
  
  if (!sessionId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const db = createDb(c.env.DB)
  
  try {
    const userId = await getUserIdFromSession(sessionId, db)
    
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    // Mark all user's notifications as read
    await db.update(notifications)
      .set({ 
        read: true,
        updatedAt: new Date()
      })
      .where(eq(notifications.userId, userId))

    return c.json({ success: true })
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return c.json({ error: 'Failed to mark all notifications as read' }, 500)
  }
})

// Delete notification
app.delete('/:id', async (c) => {
  const sessionId = c.get('sessionId')
  
  if (!sessionId) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const db = createDb(c.env.DB)
  
  try {
    const userId = await getUserIdFromSession(sessionId, db)
    
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const notificationId = c.req.param('id')

    // Delete the notification (only if it belongs to the user)
    await db.delete(notifications)
      .where(and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      ))

    return c.json({ success: true })
  } catch (error) {
    console.error('Error deleting notification:', error)
    return c.json({ error: 'Failed to delete notification' }, 500)
  }
})

export default app 
import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { users } from '../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { getUserIdFromSession } from '../../../src/utils/auth';

interface Env {
  DB: any;
}

const app = new Hono<{ Bindings: Env }>();

// Helper function to create database connection
function createDb(d1: any) {
  return drizzle(d1);
}

// Middleware to check if user is admin
async function requireAdmin(c: any) {
  const sessionCookie = c.get('sessionId');
  if (!sessionCookie) {
    return c.json({ error: 'Not authenticated' }, 401);
  }
  
  const db = createDb(c.env.DB);
  const userId = await getUserIdFromSession(sessionCookie, db);
  if (!userId) {
    return c.json({ error: 'Invalid session' }, 401);
  }
  
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (user.length === 0 || user[0].role !== 'admin') {
    return c.json({ error: 'Admin access required' }, 403);
  }
  
  return null; // Continue to handler
}

// GET all users (admin only)
app.get('/', async (c) => {
  const authCheck = await requireAdmin(c);
  if (authCheck) return authCheck;
  
  try {
    const db = createDb(c.env.DB);
    const allUsers = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      reputationPoints: users.reputationPoints,
      integrityScore: users.integrityScore,
      totalRatings: users.totalRatings,
      createdAt: users.createdAt
    }).from(users).orderBy(users.createdAt);
    
    return c.json({ users: allUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

// PUT update user role (admin only)
app.put('/users/:userId/role', async (c) => {
  const authCheck = await requireAdmin(c);
  if (authCheck) return authCheck;
  
  try {
    const db = createDb(c.env.DB);
    const userId = c.req.param('userId');
    const { role } = await c.req.json();
    
    if (!userId) {
      return c.json({ error: 'Missing user ID' }, 400);
    }
    
    if (!['user', 'moderator', 'admin'].includes(role)) {
      return c.json({ error: 'Invalid role. Must be user, moderator, or admin' }, 400);
    }
    
    // Check if user exists
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (user.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // Update user role
    await db.update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId));
    
    return c.json({ 
      success: true, 
      message: `User role updated to ${role}`,
      user: {
        id: userId,
        username: user[0].username,
        email: user[0].email,
        role
      }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return c.json({ error: 'Failed to update user role' }, 500);
  }
});

// GET user statistics (admin only)
app.get('/stats', async (c) => {
  const authCheck = await requireAdmin(c);
  if (authCheck) return authCheck;
  
  try {
    const db = createDb(c.env.DB);
    
    const [totalUsers, userCount, moderatorCount, adminCount] = await Promise.all([
      db.select({ count: users.id }).from(users),
      db.select({ count: users.id }).from(users).where(eq(users.role, 'user')),
      db.select({ count: users.id }).from(users).where(eq(users.role, 'moderator')),
      db.select({ count: users.id }).from(users).where(eq(users.role, 'admin'))
    ]);
    
    return c.json({
      stats: {
        totalUsers: totalUsers.length,
        userCount: userCount.length,
        moderatorCount: moderatorCount.length,
        adminCount: adminCount.length
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return c.json({ error: 'Failed to fetch admin stats' }, 500);
  }
});

export default app; 
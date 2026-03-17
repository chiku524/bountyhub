import { Hono } from 'hono';
import { eq, and, desc } from 'drizzle-orm';
import {
  teams,
  teamMembers,
  teamTasks,
  chatRooms,
  chatRoomParticipants,
  users,
  profiles,
} from '../../../drizzle/schema';
import { getCookie } from 'hono/cookie';
import { createDb } from '../../../src/utils/db';
import { getUserIdFromSession } from '../../../src/utils/auth';

interface Env {
  DB: any;
}

const app = new Hono<{ Bindings: Env }>();

async function requireAuth(c: any, db: any): Promise<string | null> {
  const sessionCookie = getCookie(c, 'session');
  if (!sessionCookie) return null;
  return getUserIdFromSession(sessionCookie, db);
}

// GET /api/teams - list teams (my teams + public teams)
app.get('/', async (c) => {
  try {
    const db = createDb(c.env.DB);
    const userId = await requireAuth(c, db);

    const myTeams = userId
      ? await db
          .select({
            id: teams.id,
            name: teams.name,
            description: teams.description,
            createdBy: teams.createdBy,
            isPublic: teams.isPublic,
            createdAt: teams.createdAt,
            role: teamMembers.role,
          })
          .from(teams)
          .innerJoin(teamMembers, eq(teams.id, teamMembers.teamId))
          .where(eq(teamMembers.userId, userId))
          .orderBy(desc(teams.createdAt))
      : [];

    const publicTeams = await db
      .select({
        id: teams.id,
        name: teams.name,
        description: teams.description,
        createdBy: teams.createdBy,
        isPublic: teams.isPublic,
        createdAt: teams.createdAt,
      })
      .from(teams)
      .where(eq(teams.isPublic, true))
      .orderBy(desc(teams.createdAt))
      .limit(50);

    const myIds = new Set(myTeams.map((t) => t.id));
    const otherPublic = publicTeams.filter((t) => !myIds.has(t.id));
    const list = [...myTeams.map((t) => ({ ...t, isMember: true })), ...otherPublic.map((t) => ({ ...t, isMember: false, role: null }))];

    return c.json({ success: true, teams: list });
  } catch (e) {
    console.error('List teams error:', e);
    return c.json({ success: false, error: 'Failed to list teams' }, 500);
  }
});

// POST /api/teams - create team (and group chat room)
app.post('/', async (c) => {
  try {
    const db = createDb(c.env.DB);
    const userId = await requireAuth(c, db);
    if (!userId) return c.json({ success: false, error: 'Unauthorized' }, 401);

    const body = await c.req.json();
    const { name, description, isPublic = true } = body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return c.json({ success: false, error: 'Team name is required' }, 400);
    }

    const teamId = crypto.randomUUID();
    const roomId = crypto.randomUUID();

    await db.insert(teams).values({
      id: teamId,
      name: name.trim(),
      description: typeof description === 'string' ? description : null,
      createdBy: userId,
      isPublic: !!isPublic,
    });

    await db.insert(teamMembers).values({
      id: crypto.randomUUID(),
      teamId,
      userId,
      role: 'ADMIN',
    });

    await db.insert(chatRooms).values({
      id: roomId,
      name: `${name.trim()} Chat`,
      description: `Group chat for team ${name.trim()}`,
      type: 'GROUP',
      teamId,
      createdBy: userId,
      isActive: true,
    });

    await db.insert(chatRoomParticipants).values({
      id: crypto.randomUUID(),
      roomId,
      userId,
      role: 'ADMIN',
      isActive: true,
    });

    const team = await db.select().from(teams).where(eq(teams.id, teamId)).limit(1);
    return c.json({
      success: true,
      team: team[0],
      roomId,
    });
  } catch (e) {
    console.error('Create team error:', e);
    return c.json({ success: false, error: 'Failed to create team' }, 500);
  }
});

// GET /api/teams/:teamId - get team with members, room, tasks
app.get('/:teamId', async (c) => {
  try {
    const db = createDb(c.env.DB);
    const teamId = c.req.param('teamId');

    const teamRow = await db.select().from(teams).where(eq(teams.id, teamId)).limit(1);
    if (!teamRow.length) return c.json({ success: false, error: 'Team not found' }, 404);

    const members = await db
      .select({
        userId: teamMembers.userId,
        role: teamMembers.role,
        joinedAt: teamMembers.joinedAt,
        username: users.username,
        profilePicture: profiles.profilePicture,
      })
      .from(teamMembers)
      .innerJoin(users, eq(teamMembers.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(teamMembers.teamId, teamId));

    const room = await db
      .select()
      .from(chatRooms)
      .where(and(eq(chatRooms.teamId, teamId), eq(chatRooms.type, 'GROUP')))
      .limit(1);

    const tasksList = await db
      .select()
      .from(teamTasks)
      .where(eq(teamTasks.teamId, teamId))
      .orderBy(teamTasks.position, teamTasks.createdAt);

    return c.json({
      success: true,
      team: teamRow[0],
      members,
      room: room[0] || null,
      tasks: tasksList,
    });
  } catch (e) {
    console.error('Get team error:', e);
    return c.json({ success: false, error: 'Failed to get team' }, 500);
  }
});

// POST /api/teams/:teamId/join
app.post('/:teamId/join', async (c) => {
  try {
    const db = createDb(c.env.DB);
    const userId = await requireAuth(c, db);
    if (!userId) return c.json({ success: false, error: 'Unauthorized' }, 401);

    const teamId = c.req.param('teamId');
    const teamRow = await db.select().from(teams).where(eq(teams.id, teamId)).limit(1);
    if (!teamRow.length) return c.json({ success: false, error: 'Team not found' }, 404);
    if (!teamRow[0].isPublic) return c.json({ success: false, error: 'Team is not open to join' }, 403);

    const existing = await db
      .select()
      .from(teamMembers)
      .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)))
      .limit(1);
    if (existing.length) return c.json({ success: true, message: 'Already a member' });

    await db.insert(teamMembers).values({
      id: crypto.randomUUID(),
      teamId,
      userId,
      role: 'MEMBER',
    });

    const room = await db.select().from(chatRooms).where(and(eq(chatRooms.teamId, teamId), eq(chatRooms.type, 'GROUP'))).limit(1);
    if (room.length) {
      await db.insert(chatRoomParticipants).values({
        id: crypto.randomUUID(),
        roomId: room[0].id,
        userId,
        role: 'MEMBER',
        isActive: true,
      });
    }

    return c.json({ success: true, message: 'Joined team' });
  } catch (e) {
    console.error('Join team error:', e);
    return c.json({ success: false, error: 'Failed to join team' }, 500);
  }
});

// POST /api/teams/:teamId/leave
app.post('/:teamId/leave', async (c) => {
  try {
    const db = createDb(c.env.DB);
    const userId = await requireAuth(c, db);
    if (!userId) return c.json({ success: false, error: 'Unauthorized' }, 401);

    const teamId = c.req.param('teamId');
    const member = await db
      .select()
      .from(teamMembers)
      .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)))
      .limit(1);
    if (!member.length) return c.json({ success: false, error: 'Not a member' }, 403);
    if (member[0].role === 'ADMIN') {
      const adminCount = await db.select().from(teamMembers).where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.role, 'ADMIN')));
      if (adminCount.length <= 1) return c.json({ success: false, error: 'Cannot leave: make another admin first' }, 400);
    }

    await db.delete(teamMembers).where(eq(teamMembers.id, member[0].id));

    const room = await db.select().from(chatRooms).where(and(eq(chatRooms.teamId, teamId), eq(chatRooms.type, 'GROUP'))).limit(1);
    if (room.length) {
      await db.update(chatRoomParticipants).set({ isActive: false }).where(and(eq(chatRoomParticipants.roomId, room[0].id), eq(chatRoomParticipants.userId, userId)));
    }

    return c.json({ success: true, message: 'Left team' });
  } catch (e) {
    console.error('Leave team error:', e);
    return c.json({ success: false, error: 'Failed to leave team' }, 500);
  }
});

// GET /api/teams/:teamId/tasks
app.get('/:teamId/tasks', async (c) => {
  try {
    const db = createDb(c.env.DB);
    const teamId = c.req.param('teamId');

    const teamRow = await db.select().from(teams).where(eq(teams.id, teamId)).limit(1);
    if (!teamRow.length) return c.json({ success: false, error: 'Team not found' }, 404);

    const tasksList = await db.select().from(teamTasks).where(eq(teamTasks.teamId, teamId)).orderBy(teamTasks.position, teamTasks.createdAt);
    return c.json({ success: true, tasks: tasksList });
  } catch (e) {
    console.error('List tasks error:', e);
    return c.json({ success: false, error: 'Failed to list tasks' }, 500);
  }
});

// POST /api/teams/:teamId/tasks
app.post('/:teamId/tasks', async (c) => {
  try {
    const db = createDb(c.env.DB);
    const userId = await requireAuth(c, db);
    if (!userId) return c.json({ success: false, error: 'Unauthorized' }, 401);

    const teamId = c.req.param('teamId');
    const member = await db
      .select()
      .from(teamMembers)
      .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)))
      .limit(1);
    if (!member.length) return c.json({ success: false, error: 'Not a team member' }, 403);

    const body = await c.req.json();
    const { title, description, status = 'TODO', assignedTo, dueAt } = body;
    if (!title || typeof title !== 'string' || !title.trim()) {
      return c.json({ success: false, error: 'Title is required' }, 400);
    }

    const maxPos = await db.select().from(teamTasks).where(eq(teamTasks.teamId, teamId)).orderBy(desc(teamTasks.position)).limit(1);
    const position = (maxPos[0]?.position ?? 0) + 1;

    const taskId = crypto.randomUUID();
    await db.insert(teamTasks).values({
      id: taskId,
      teamId,
      title: title.trim(),
      description: typeof description === 'string' ? description : null,
      status: ['TODO', 'IN_PROGRESS', 'DONE'].includes(status) ? status : 'TODO',
      createdBy: userId,
      assignedTo: assignedTo || null,
      dueAt: dueAt ? new Date(dueAt) : null,
      position,
    });

    const task = await db.select().from(teamTasks).where(eq(teamTasks.id, taskId)).limit(1);
    return c.json({ success: true, task: task[0] });
  } catch (e) {
    console.error('Create task error:', e);
    return c.json({ success: false, error: 'Failed to create task' }, 500);
  }
});

// PATCH /api/teams/:teamId/tasks/:taskId
app.patch('/:teamId/tasks/:taskId', async (c) => {
  try {
    const db = createDb(c.env.DB);
    const userId = await requireAuth(c, db);
    if (!userId) return c.json({ success: false, error: 'Unauthorized' }, 401);

    const teamId = c.req.param('teamId');
    const taskId = c.req.param('taskId');
    const member = await db
      .select()
      .from(teamMembers)
      .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)))
      .limit(1);
    if (!member.length) return c.json({ success: false, error: 'Not a team member' }, 403);

    const taskRow = await db.select().from(teamTasks).where(and(eq(teamTasks.id, taskId), eq(teamTasks.teamId, teamId))).limit(1);
    if (!taskRow.length) return c.json({ success: false, error: 'Task not found' }, 404);

    const body = await c.req.json();
    const updates: Record<string, unknown> = {};
    if (typeof body.title === 'string' && body.title.trim()) updates.title = body.title.trim();
    if (typeof body.description === 'string') updates.description = body.description || null;
    if (['TODO', 'IN_PROGRESS', 'DONE'].includes(body.status)) updates.status = body.status;
    if (body.assignedTo !== undefined) updates.assignedTo = body.assignedTo || null;
    if (body.dueAt !== undefined) updates.dueAt = body.dueAt ? new Date(body.dueAt) : null;
    if (typeof body.position === 'number') updates.position = body.position;
    updates.updatedAt = new Date();

    if (Object.keys(updates).length <= 1) return c.json({ success: true, task: taskRow[0] });

    await db.update(teamTasks).set(updates as any).where(eq(teamTasks.id, taskId));
    const updated = await db.select().from(teamTasks).where(eq(teamTasks.id, taskId)).limit(1);
    return c.json({ success: true, task: updated[0] });
  } catch (e) {
    console.error('Update task error:', e);
    return c.json({ success: false, error: 'Failed to update task' }, 500);
  }
});

// DELETE /api/teams/:teamId/tasks/:taskId
app.delete('/:teamId/tasks/:taskId', async (c) => {
  try {
    const db = createDb(c.env.DB);
    const userId = await requireAuth(c, db);
    if (!userId) return c.json({ success: false, error: 'Unauthorized' }, 401);

    const teamId = c.req.param('teamId');
    const taskId = c.req.param('taskId');
    const member = await db
      .select()
      .from(teamMembers)
      .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)))
      .limit(1);
    if (!member.length) return c.json({ success: false, error: 'Not a team member' }, 403);

    await db.delete(teamTasks).where(and(eq(teamTasks.id, taskId), eq(teamTasks.teamId, teamId)));
    return c.json({ success: true, message: 'Task deleted' });
  } catch (e) {
    console.error('Delete task error:', e);
    return c.json({ success: false, error: 'Failed to delete task' }, 500);
  }
});

export default app;

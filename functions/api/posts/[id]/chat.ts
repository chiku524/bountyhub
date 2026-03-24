import { Hono } from 'hono';
import type { Context } from 'hono';
import { eq, desc, and, sql } from 'drizzle-orm';
import { chatMessages, chatRoomParticipants, users, profiles, posts } from '../../../../drizzle/schema';
import { createDb } from '../../../../src/utils/db';
import { getUserIdFromSession } from '../../../../src/utils/auth';
import { broadcastMessageToRoom } from '../../chat';

interface Env {
  DB: D1Database;
  CHAT_ROOM_DO?: DurableObjectNamespace;
}

type AppContext = Context<{ Bindings: Env }>;

/** Use raw D1 for chat_rooms so we never depend on is_public column (works before/after migration). */
async function getOrCreatePostRoom(d1: D1Database, postId: string, postTitle: string): Promise<{ id: string; name: string; description: string | null; type: string; postId: string | null; isActive: number; createdAt: number; updatedAt: number } | null> {
  const row = await d1.prepare(
    'SELECT id, name, description, type, post_id, is_active, created_at, updated_at FROM chat_rooms WHERE post_id = ? AND type = ?'
  ).bind(postId, 'POST').first<{ id: string; name: string; description: string | null; type: string; post_id: string | null; is_active: number; created_at: number; updated_at: number }>();
  if (row) {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      type: row.type,
      postId: row.post_id,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
  const roomId = crypto.randomUUID();
  const name = `Post: ${postTitle}`;
  const description = `Chat for post ${postId}`;
  await d1.prepare(
    'INSERT INTO chat_rooms (id, name, description, type, post_id, is_active) VALUES (?, ?, ?, ?, ?, 1)'
  ).bind(roomId, name, description, 'POST', postId).run();
  const created = await d1.prepare(
    'SELECT id, name, description, type, post_id, is_active, created_at, updated_at FROM chat_rooms WHERE id = ?'
  ).bind(roomId).first<{ id: string; name: string; description: string | null; type: string; post_id: string | null; is_active: number; created_at: number; updated_at: number }>();
  if (!created) return null;
  return {
    id: created.id,
    name: created.name,
    description: created.description,
    type: created.type,
    postId: created.post_id,
    isActive: created.is_active,
    createdAt: created.created_at,
    updatedAt: created.updated_at,
  };
}

/** Get or create post chat room and join. Call with postId from c.req.param('id'). */
export async function getPostChatRoom(c: AppContext, postId: string) {
  try {
    const db = createDb(c.env.DB);

    const postRow = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
    if (!postRow.length) {
      return c.json({ success: false, error: 'Post not found' }, 404);
    }

    const room = await getOrCreatePostRoom(c.env.DB, postId, postRow[0].title);
    if (!room) {
      return c.json({ success: false, error: 'Failed to get or create room' }, 500);
    }

    const roomId = room.id;
    const sessionCookie = c.get('sessionId');
    let joined = false;
    if (sessionCookie) {
      const userId = await getUserIdFromSession(sessionCookie, db);
      if (userId) {
        const existing = await db
          .select()
          .from(chatRoomParticipants)
          .where(and(
            eq(chatRoomParticipants.roomId, roomId),
            eq(chatRoomParticipants.userId, userId)
          ))
          .limit(1);
        if (!existing.length) {
          await db.insert(chatRoomParticipants).values({
            id: crypto.randomUUID(),
            roomId,
            userId,
            role: 'MEMBER',
            isActive: true,
          });
          joined = true;
        } else if (!existing[0].isActive) {
          await db
            .update(chatRoomParticipants)
            .set({ isActive: true, lastReadAt: new Date() })
            .where(eq(chatRoomParticipants.id, existing[0].id));
          joined = true;
        }
      }
    }

    return c.json({
      success: true,
      room: {
        id: room.id,
        name: room.name,
        description: room.description,
        type: room.type,
        postId: room.postId,
        isActive: room.isActive === 1,
        createdAt: new Date(room.createdAt * 1000).toISOString(),
      },
      joined,
    });
  } catch (error) {
    console.error('Error getting post chat room:', error);
    return c.json({ success: false, error: 'Failed to get post chat room' }, 500);
  }
}

/** Get messages for post chat. Call with postId from c.req.param('id'). */
export async function getPostChatMessages(c: AppContext, postId: string) {
  try {
    const limit = parseInt(c.req.query('limit') || '50');
    const after = c.req.query('after');
    const db = createDb(c.env.DB);

    const room = await getOrCreatePostRoom(c.env.DB, postId, '');
    if (!room) {
      return c.json({ success: true, messages: [] });
    }

    const whereConditions = [eq(chatMessages.roomId, room.id)];
    if (after) {
      whereConditions.push(sql`${chatMessages.createdAt} > ${after}`);
    }

    const messages = await db
      .select({
        id: chatMessages.id,
        content: chatMessages.content,
        messageType: chatMessages.messageType,
        mediaUrl: chatMessages.mediaUrl,
        fileName: chatMessages.fileName,
        fileSize: chatMessages.fileSize,
        replyToId: chatMessages.replyToId,
        isEdited: chatMessages.isEdited,
        editedAt: chatMessages.editedAt,
        createdAt: chatMessages.createdAt,
        author: {
          id: users.id,
          username: users.username,
          role: users.role,
        },
        profile: {
          profilePicture: profiles.profilePicture,
        },
      })
      .from(chatMessages)
      .innerJoin(users, eq(chatMessages.authorId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(and(...whereConditions))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);

    return c.json({ success: true, messages: messages.reverse() });
  } catch (error) {
    console.error('Error fetching post chat messages:', error);
    return c.json({ success: false, error: 'Failed to fetch messages' }, 500);
  }
}

/** Send message to post chat. Call with postId from c.req.param('id'). */
export async function postPostChatMessage(c: AppContext, postId: string) {
  try {
    const sessionCookie = c.get('sessionId');
    if (!sessionCookie) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const db = createDb(c.env.DB);
    const userId = await getUserIdFromSession(sessionCookie, db);
    if (!userId) {
      return c.json({ success: false, error: 'Invalid session' }, 401);
    }

    const postRow = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
    if (!postRow.length) {
      return c.json({ success: false, error: 'Post not found' }, 404);
    }

    const room = await getOrCreatePostRoom(c.env.DB, postId, postRow[0].title);
    if (!room) {
      return c.json({ success: false, error: 'Failed to get or create room' }, 500);
    }

    const roomId = room.id;
    const body = await c.req.json().catch(() => ({}));
    const content = body?.content;
    const messageType = body?.messageType ?? 'TEXT';
    if (!content) {
      return c.json({ success: false, error: 'Message content is required' }, 400);
    }

    const participant = await db
      .select()
      .from(chatRoomParticipants)
      .where(and(
        eq(chatRoomParticipants.roomId, roomId),
        eq(chatRoomParticipants.userId, userId),
        eq(chatRoomParticipants.isActive, true)
      ))
      .limit(1);

    if (!participant.length) {
      await db.insert(chatRoomParticipants).values({
        id: crypto.randomUUID(),
        roomId,
        userId,
        role: 'MEMBER',
        isActive: true,
      });
    }

    const messageId = crypto.randomUUID();
    await db.insert(chatMessages).values({
      id: messageId,
      roomId,
      authorId: userId,
      content,
      messageType,
      isEdited: false,
    });

    const message = await db
      .select({
        id: chatMessages.id,
        content: chatMessages.content,
        messageType: chatMessages.messageType,
        mediaUrl: chatMessages.mediaUrl,
        fileName: chatMessages.fileName,
        fileSize: chatMessages.fileSize,
        replyToId: chatMessages.replyToId,
        isEdited: chatMessages.isEdited,
        editedAt: chatMessages.editedAt,
        createdAt: chatMessages.createdAt,
        author: {
          id: users.id,
          username: users.username,
          role: users.role,
        },
        profile: {
          profilePicture: profiles.profilePicture,
        },
      })
      .from(chatMessages)
      .innerJoin(users, eq(chatMessages.authorId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(chatMessages.id, messageId))
      .limit(1);

    await broadcastMessageToRoom(c.env, roomId, message[0]);
    return c.json({ success: true, message: message[0] });
  } catch (error) {
    console.error('Error sending post chat message:', error);
    return c.json({ success: false, error: 'Failed to send message' }, 500);
  }
}

const chat = new Hono<{ Bindings: Env }>();

chat.get('/', async (c) => {
  const postId = c.req.param('id');
  if (!postId) return c.json({ success: false, error: 'Post not found' }, 404);
  return getPostChatRoom(c, postId);
});

chat.get('/messages', async (c) => {
  const postId = c.req.param('id');
  if (!postId) return c.json({ success: false, error: 'Bad request' }, 400);
  return getPostChatMessages(c, postId);
});

chat.post('/messages', async (c) => {
  const postId = c.req.param('id');
  if (!postId) return c.json({ success: false, error: 'Bad request' }, 400);
  return postPostChatMessage(c, postId);
});

export default chat;

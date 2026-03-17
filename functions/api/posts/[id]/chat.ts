import { Hono } from 'hono';
import { eq, desc, and, sql } from 'drizzle-orm';
import { chatRooms, chatMessages, chatRoomParticipants, users, profiles, posts } from '../../../../drizzle/schema';
import { getCookie } from 'hono/cookie';
import { createDb } from '../../../../src/utils/db';
import { getUserIdFromSession } from '../../../../src/utils/auth';

interface Env {
  DB: any;
}

const chat = new Hono<{ Bindings: Env }>();

// Get or create post chat room and join (GET /api/posts/:id/chat)
chat.get('/', async (c) => {
  try {
    const postId = c.req.param('id');
    if (!postId) return c.json({ success: false, error: 'Post not found' }, 404);
    const db = createDb(c.env.DB);

    const postRow = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
    if (!postRow.length) {
      return c.json({ success: false, error: 'Post not found' }, 404);
    }

    let room = await db
      .select()
      .from(chatRooms)
      .where(and(eq(chatRooms.postId, postId), eq(chatRooms.type, 'POST')))
      .limit(1);

    if (!room.length) {
      const roomId = crypto.randomUUID();
      await db.insert(chatRooms).values({
        id: roomId,
        name: `Post: ${postRow[0].title}`,
        description: `Chat for post ${postId}`,
        type: 'POST',
        postId,
        isActive: true,
      });
      room = await db.select().from(chatRooms).where(eq(chatRooms.id, roomId)).limit(1);
    }

    const roomId = room[0].id;
    const sessionCookie = getCookie(c, 'session');
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
        id: room[0].id,
        name: room[0].name,
        description: room[0].description,
        type: room[0].type,
        postId: room[0].postId,
        isActive: room[0].isActive,
        createdAt: room[0].createdAt,
      },
      joined,
    });
  } catch (error) {
    console.error('Error getting post chat room:', error);
    return c.json({ success: false, error: 'Failed to get post chat room' }, 500);
  }
});

// Get messages for post chat (GET /api/posts/:id/chat/messages)
chat.get('/messages', async (c) => {
  try {
    const postId = c.req.param('id');
    if (!postId) return c.json({ success: false, error: 'Bad request' }, 400);
    const limit = parseInt(c.req.query('limit') || '50');
    const after = c.req.query('after');
    const db = createDb(c.env.DB);

    const room = await db
      .select()
      .from(chatRooms)
      .where(and(eq(chatRooms.postId, postId), eq(chatRooms.type, 'POST')))
      .limit(1);

    if (!room.length) {
      return c.json({ success: true, messages: [] });
    }

    const whereConditions = [eq(chatMessages.roomId, room[0].id)];
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
});

// Send message to post chat (POST /api/posts/:id/chat/messages)
chat.post('/messages', async (c) => {
  try {
    const postId = c.req.param('id');
    if (!postId) return c.json({ success: false, error: 'Bad request' }, 400);
    const sessionCookie = getCookie(c, 'session');
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

    let room = await db
      .select()
      .from(chatRooms)
      .where(and(eq(chatRooms.postId, postId), eq(chatRooms.type, 'POST')))
      .limit(1);

    if (!room.length) {
      const roomId = crypto.randomUUID();
      await db.insert(chatRooms).values({
        id: roomId,
        name: `Post: ${postRow[0].title}`,
        description: `Chat for post ${postId}`,
        type: 'POST',
        postId,
        isActive: true,
      });
      room = await db.select().from(chatRooms).where(eq(chatRooms.id, roomId)).limit(1);
    }

    const roomId = room[0].id;
    const { content, messageType = 'TEXT' } = await c.req.json();
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

    return c.json({ success: true, message: message[0] });
  } catch (error) {
    console.error('Error sending post chat message:', error);
    return c.json({ success: false, error: 'Failed to send message' }, 500);
  }
});

export default chat;

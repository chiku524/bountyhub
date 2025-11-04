import { Hono } from 'hono';
import { eq, desc, and, sql } from 'drizzle-orm';
import { chatRooms, chatMessages, chatRoomParticipants, users, profiles } from '../../../drizzle/schema';
import { getCookie } from 'hono/cookie';
import { createDb } from '../../../src/utils/db';
import { getUserIdFromSession } from '../../../src/utils/auth';

interface Env {
  DB: any;
}

const chat = new Hono<{ Bindings: Env }>();

// Get all chat rooms
chat.get('/', async (c) => {
  try {
    const db = createDb(c.env.DB);
    
    console.log('Fetching chat rooms...');
    const rooms = await db
      .select({
        id: chatRooms.id,
        name: chatRooms.name,
        description: chatRooms.description,
        type: chatRooms.type,
        isActive: chatRooms.isActive,
        createdAt: chatRooms.createdAt,
        participantCount: chatRoomParticipants.id,
      })
      .from(chatRooms)
      .leftJoin(chatRoomParticipants, eq(chatRooms.id, chatRoomParticipants.roomId))
      .where(eq(chatRooms.isActive, true))
      .groupBy(chatRooms.id);

    console.log('Found rooms:', rooms.length);
    return c.json({ success: true, rooms });
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    return c.json({ success: false, error: 'Failed to fetch chat rooms' }, 500);
  }
});

// Get chat room by ID
chat.get('/:roomId', async (c) => {
  try {
    const roomId = c.req.param('roomId');
    const db = createDb(c.env.DB);
    
    const room = await db
      .select()
      .from(chatRooms)
      .where(eq(chatRooms.id, roomId))
      .limit(1);

    if (!room.length) {
      return c.json({ success: false, error: 'Chat room not found' }, 404);
    }

    return c.json({ success: true, room: room[0] });
  } catch (error) {
    console.error('Error fetching chat room:', error);
    return c.json({ success: false, error: 'Failed to fetch chat room' }, 500);
  }
});

// Create new chat room
chat.post('/', async (c) => {
  try {
    const sessionCookie = getCookie(c, 'session');
    if (!sessionCookie) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const db = createDb(c.env.DB);
    const userId = await getUserIdFromSession(sessionCookie, db);
    if (!userId) {
      return c.json({ success: false, error: 'Invalid session' }, 401);
    }

    const { name, description, type = 'GLOBAL' } = await c.req.json();
    
    if (!name) {
      return c.json({ success: false, error: 'Room name is required' }, 400);
    }

    const roomId = crypto.randomUUID();
    const newRoom = {
      id: roomId,
      name,
      description,
      type,
      createdBy: userId,
      isActive: true,
    };

    await db.insert(chatRooms).values(newRoom);

    // Add creator as participant
    await db.insert(chatRoomParticipants).values({
      id: crypto.randomUUID(),
      roomId,
      userId,
      role: 'ADMIN',
      isActive: true,
    });

    return c.json({ success: true, room: newRoom });
  } catch (error) {
    console.error('Error creating chat room:', error);
    return c.json({ success: false, error: 'Failed to create chat room' }, 500);
  }
});

// Get messages for a chat room
chat.get('/:roomId/messages', async (c) => {
  try {
    const roomId = c.req.param('roomId');
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');
    const after = c.req.query('after');
    const db = createDb(c.env.DB);
    
    let whereConditions = [eq(chatMessages.roomId, roomId)];
    
    // If 'after' parameter is provided, only fetch messages after that timestamp
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
      .limit(limit)
      .offset(offset);

    return c.json({ success: true, messages: messages.reverse() });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return c.json({ success: false, error: 'Failed to fetch messages' }, 500);
  }
});

// Send message to chat room
chat.post('/:roomId/messages', async (c) => {
  try {
    const sessionCookie = getCookie(c, 'session');
    if (!sessionCookie) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const db = createDb(c.env.DB);
    const userId = await getUserIdFromSession(sessionCookie, db);
    if (!userId) {
      return c.json({ success: false, error: 'Invalid session' }, 401);
    }

    const roomId = c.req.param('roomId');
    const { content, messageType = 'TEXT', mediaUrl, fileName, fileSize, replyToId } = await c.req.json();
    
    if (!content) {
      return c.json({ success: false, error: 'Message content is required' }, 400);
    }

    // Check if user is participant in the room
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
      return c.json({ success: false, error: 'You are not a participant in this room' }, 403);
    }

    const messageId = crypto.randomUUID();
    const newMessage = {
      id: messageId,
      roomId,
      authorId: userId,
      content,
      messageType,
      mediaUrl,
      fileName,
      fileSize,
      replyToId,
      isEdited: false,
    };

    await db.insert(chatMessages).values(newMessage);

    // Get the created message with author info
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
    console.error('Error sending message:', error);
    return c.json({ success: false, error: 'Failed to send message' }, 500);
  }
});

// Join chat room
chat.post('/:roomId/join', async (c) => {
  try {
    const sessionCookie = getCookie(c, 'session');
    if (!sessionCookie) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const db = createDb(c.env.DB);
    const userId = await getUserIdFromSession(sessionCookie, db);
    if (!userId) {
      return c.json({ success: false, error: 'Invalid session' }, 401);
    }

    const roomId = c.req.param('roomId');
    
    // Check if already a participant
    const existingParticipant = await db
      .select()
      .from(chatRoomParticipants)
      .where(and(
        eq(chatRoomParticipants.roomId, roomId),
        eq(chatRoomParticipants.userId, userId)
      ))
      .limit(1);

    if (existingParticipant.length) {
      // Reactivate if inactive
      if (!existingParticipant[0].isActive) {
        await db
          .update(chatRoomParticipants)
          .set({ isActive: true, lastReadAt: new Date() })
          .where(eq(chatRoomParticipants.id, existingParticipant[0].id));
      }
      return c.json({ success: true, message: 'Already a participant' });
    }

    // Add as new participant
    await db.insert(chatRoomParticipants).values({
      id: crypto.randomUUID(),
      roomId,
      userId,
      role: 'MEMBER',
      isActive: true,
    });

    return c.json({ success: true, message: 'Joined chat room successfully' });
  } catch (error) {
    console.error('Error joining chat room:', error);
    return c.json({ success: false, error: 'Failed to join chat room' }, 500);
  }
});

// Leave chat room
chat.post('/:roomId/leave', async (c) => {
  try {
    const sessionCookie = getCookie(c, 'session');
    if (!sessionCookie) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const db = createDb(c.env.DB);
    const userId = await getUserIdFromSession(sessionCookie, db);
    if (!userId) {
      return c.json({ success: false, error: 'Invalid session' }, 401);
    }

    const roomId = c.req.param('roomId');
    
    await db
      .update(chatRoomParticipants)
      .set({ isActive: false })
      .where(and(
        eq(chatRoomParticipants.roomId, roomId),
        eq(chatRoomParticipants.userId, userId)
      ));

    return c.json({ success: true, message: 'Left chat room successfully' });
  } catch (error) {
    console.error('Error leaving chat room:', error);
    return c.json({ success: false, error: 'Failed to leave chat room' }, 500);
  }
});

// Global chat room specific endpoints
chat.post('/global-chat/join', async (c) => {
  try {
    const sessionCookie = getCookie(c, 'session');
    if (!sessionCookie) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const db = createDb(c.env.DB);
    const userId = await getUserIdFromSession(sessionCookie, db);
    if (!userId) {
      return c.json({ success: false, error: 'Invalid session' }, 401);
    }

    console.log('Joining global chat for user:', userId);

    // Get or create global chat room
    let globalRoom = await db
      .select()
      .from(chatRooms)
      .where(eq(chatRooms.type, 'GLOBAL'))
      .limit(1);

    let roomId: string;
    if (!globalRoom.length) {
      // Create global chat room if it doesn't exist
      roomId = crypto.randomUUID();
      console.log('Creating global chat room with ID:', roomId);
      await db.insert(chatRooms).values({
        id: roomId,
        name: 'Global Chat',
        description: 'Global chat room for all users',
        type: 'GLOBAL',
        createdBy: userId,
        isActive: true,
      });
    } else {
      roomId = globalRoom[0].id;
      console.log('Using existing global chat room:', roomId);
    }
    
    // Check if already a participant
    const existingParticipant = await db
      .select()
      .from(chatRoomParticipants)
      .where(and(
        eq(chatRoomParticipants.roomId, roomId),
        eq(chatRoomParticipants.userId, userId)
      ))
      .limit(1);

    if (existingParticipant.length) {
      // Reactivate if inactive
      if (!existingParticipant[0].isActive) {
        console.log('Reactivating existing participant');
        await db
          .update(chatRoomParticipants)
          .set({ isActive: true, lastReadAt: new Date() })
          .where(eq(chatRoomParticipants.id, existingParticipant[0].id));
      } else {
        console.log('User already active participant');
      }
      return c.json({ success: true, message: 'Already a participant' });
    }

    // Add as new participant
    console.log('Adding new participant to global chat');
    await db.insert(chatRoomParticipants).values({
      id: crypto.randomUUID(),
      roomId,
      userId,
      role: 'MEMBER',
      isActive: true,
    });

    return c.json({ success: true, message: 'Joined global chat successfully' });
  } catch (error) {
    console.error('Error joining global chat:', error);
    return c.json({ success: false, error: 'Failed to join global chat' }, 500);
  }
});

chat.get('/global-chat/messages', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');
    const after = c.req.query('after');
    const db = createDb(c.env.DB);
    
    console.log('Fetching global chat messages:', { limit, offset, after });
    
    // Get global chat room
    const globalRoom = await db
      .select()
      .from(chatRooms)
      .where(eq(chatRooms.type, 'GLOBAL'))
      .limit(1);

    if (!globalRoom.length) {
      console.log('No global chat room found, returning empty messages');
      return c.json({ success: true, messages: [] });
    }

    const roomId = globalRoom[0].id;
    console.log('Found global chat room:', roomId);
    
    let whereConditions = [eq(chatMessages.roomId, roomId)];
    
    // If 'after' parameter is provided, only fetch messages after that timestamp
    if (after) {
      whereConditions.push(sql`${chatMessages.createdAt} > ${after}`);
      console.log('Filtering messages after:', after);
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
      .limit(limit)
      .offset(offset);

    console.log('Found messages:', messages.length);
    return c.json({ success: true, messages: messages.reverse() });
  } catch (error) {
    console.error('Error fetching global chat messages:', error);
    return c.json({ success: false, error: 'Failed to fetch messages' }, 500);
  }
});

chat.post('/global-chat/messages', async (c) => {
  try {
    const sessionCookie = getCookie(c, 'session');
    if (!sessionCookie) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const db = createDb(c.env.DB);
    const userId = await getUserIdFromSession(sessionCookie, db);
    if (!userId) {
      return c.json({ success: false, error: 'Invalid session' }, 401);
    }

    const { content, messageType = 'TEXT', mediaUrl, fileName, fileSize, replyToId } = await c.req.json();
    
    if (!content) {
      return c.json({ success: false, error: 'Message content is required' }, 400);
    }

    // Get global chat room
    let globalRoom = await db
      .select()
      .from(chatRooms)
      .where(eq(chatRooms.type, 'GLOBAL'))
      .limit(1);

    let roomId: string;
    if (!globalRoom.length) {
      // Create global chat room if it doesn't exist
      roomId = crypto.randomUUID();
      await db.insert(chatRooms).values({
        id: roomId,
        name: 'Global Chat',
        description: 'Global chat room for all users',
        type: 'GLOBAL',
        createdBy: userId,
        isActive: true,
      });
    } else {
      roomId = globalRoom[0].id;
    }

    // Check if user is participant in the room
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
      // Auto-join user to global chat
      await db.insert(chatRoomParticipants).values({
        id: crypto.randomUUID(),
        roomId,
        userId,
        role: 'MEMBER',
        isActive: true,
      });
    }

    const messageId = crypto.randomUUID();
    const newMessage = {
      id: messageId,
      roomId,
      authorId: userId,
      content,
      messageType,
      mediaUrl,
      fileName,
      fileSize,
      replyToId,
      isEdited: false,
    };

    await db.insert(chatMessages).values(newMessage);

    // Get the created message with author info
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
    console.error('Error sending global chat message:', error);
    return c.json({ success: false, error: 'Failed to send message' }, 500);
  }
});

export default chat; 
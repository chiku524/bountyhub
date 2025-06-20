import { eq, and } from 'drizzle-orm';
import { bookmarks, posts, users, profiles } from '../../drizzle/schema';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

export async function toggleBookmark(
  db: DrizzleD1Database<typeof import('../../drizzle/schema')>,
  postId: string,
  userId: string
) {
  const existingBookmark = await db
    .select()
    .from(bookmarks)
    .where(
      and(
        eq(bookmarks.postId, postId),
        eq(bookmarks.userId, userId)
      )
    )
    .limit(1);

  if (existingBookmark.length > 0) {
    await db
      .delete(bookmarks)
      .where(
        and(
          eq(bookmarks.postId, postId),
          eq(bookmarks.userId, userId)
        )
      );
    return { bookmarked: false };
  } else {
    await db.insert(bookmarks).values({
      id: crypto.randomUUID(),
      postId,
      userId,
      createdAt: new Date(),
    });
    return { bookmarked: true };
  }
}

export async function getUserBookmarks(
  db: DrizzleD1Database<typeof import('../../drizzle/schema')>,
  userId: string
) {
  // Debug: Check if db is available in the function
  if (!db) {
    console.error('Database is undefined in getUserBookmarks');
    return [];
  }

  try {
    const userBookmarks = await db
      .select({
        id: bookmarks.id,
        postId: bookmarks.postId,
        createdAt: bookmarks.createdAt,
        post: {
          id: posts.id,
          title: posts.title,
          content: posts.content,
          createdAt: posts.createdAt,
          authorId: posts.authorId,
        },
        user: {
          id: users.id,
          username: users.username,
        },
        profile: {
          profilePicture: profiles.profilePicture,
        },
      })
      .from(bookmarks)
      .innerJoin(posts, eq(bookmarks.postId, posts.id))
      .innerJoin(users, eq(posts.authorId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(bookmarks.userId, userId))
      .orderBy(bookmarks.createdAt);

    return userBookmarks;
  } catch (error) {
    console.error('Error fetching user bookmarks:', error);
    return [];
  }
}

export async function getBookmarkCount(
  db: DrizzleD1Database<typeof import('../../drizzle/schema')>,
  postId: string
) {
  try {
    const result = await db
      .select({ count: bookmarks.id })
      .from(bookmarks)
      .where(eq(bookmarks.postId, postId));

    return result.length;
  } catch (error) {
    console.error('Error fetching bookmark count:', error);
    return 0;
  }
}

export async function isBookmarked(
  db: DrizzleD1Database<typeof import('../../drizzle/schema')>,
  postId: string,
  userId: string
) {
  try {
    const bookmark = await db
      .select()
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.postId, postId),
          eq(bookmarks.userId, userId)
        )
      )
      .limit(1);

    return bookmark.length > 0;
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    return false;
  }
} 
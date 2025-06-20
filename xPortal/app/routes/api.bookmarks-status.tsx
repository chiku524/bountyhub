import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { eq, and } from 'drizzle-orm';
import { bookmarks } from '../../drizzle/schema';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { requireUserId } from "~/utils/auth.server";
import { checkBookmarkStatus } from "~/utils/bookmark.server";
import { createDb } from "~/utils/db.server";

interface CloudflareContext {
  env: {
    DB: DrizzleD1Database<typeof import('../../drizzle/schema')>;
  };
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const postId = url.searchParams.get('postId');
  const userId = url.searchParams.get('userId');

  if (!postId || !userId) {
    return json({ error: 'Missing postId or userId' }, { status: 400 });
  }

  try {
    const db = createDb((context as { env: { DB: DrizzleD1Database<typeof import('../../drizzle/schema')> } }).env.DB);
    
    if (!db) {
      console.error('Database is undefined in bookmarks-status loader');
      return json({ error: 'Database connection not available' }, { status: 500 });
    }

    const userBookmarks = await db
      .select()
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.postId, postId),
          eq(bookmarks.userId, userId)
        )
      )
      .limit(1);

    const isBookmarked = userBookmarks.length > 0;

    return json({ isBookmarked });
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    return json({ error: 'Failed to check bookmark status' }, { status: 500 });
  }
}

export async function action({ request, context }: ActionFunctionArgs) {
  try {
    const userId = await requireUserId(request);
    const { postId } = await request.json() as { postId: string };
    
    if (!postId) return json({ error: 'Missing postId' }, { status: 400 });
    
    const db = createDb((context as { env: { DB: DrizzleD1Database<typeof import('../../drizzle/schema')> } }).env.DB);

    if (!db) {
      console.error('Database is undefined in bookmarks-status action');
      return json({ error: 'Database connection not available' }, { status: 500 });
    }

    if (action === 'toggle') {
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
        return json({ isBookmarked: false });
      } else {
        await db.insert(bookmarks).values({
          id: crypto.randomUUID(),
          postId,
          userId,
          createdAt: new Date(),
        });
        return json({ isBookmarked: true });
      }
    }

    return json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return json({ error: 'Failed to toggle bookmark' }, { status: 500 });
  }
}


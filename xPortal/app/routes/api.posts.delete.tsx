import { json, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { getUser } from '~/utils/auth.server';
import { eq } from 'drizzle-orm';
import { posts } from '../../drizzle/schema';
import { createDb } from '~/utils/db.server';

export async function action({ request, context }: ActionFunctionArgs) {
    if (request.method !== 'DELETE') {
        return json({ error: 'Method not allowed' }, { status: 405 });
    }

    try {
        const typedContext = context as { env: { DB: D1Database; SESSION_SECRET?: string } };
  const db = createDb(typedContext.env.DB);
        const user = await getUser(request, db, typedContext.env);
        
        if (!user) {
            return json({ error: 'User not authenticated' }, { status: 401 });
        }

        const { postId } = await request.json() as { postId: string };
        
        if (!postId) {
            return json({ error: 'Post ID is required' }, { status: 400 });
        }

        // Check if user owns the post
        const post = await db
            .select()
            .from(posts)
            .where(eq(posts.id, postId))
            .limit(1);

        if (!post.length || post[0].authorId !== user.id) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Delete the post
        await db.delete(posts).where(eq(posts.id, postId));

        return json({ success: true });
    } catch (error) {
        console.error('Delete post error:', error);
        return json({ error: 'Failed to delete post' }, { status: 500 });
    }
}

export default function PostsDelete() {
  return null;
}


import { json, type ActionFunctionArgs } from '@remix-run/node';
import { requireUserId } from '~/utils/auth.server';
import { eq } from 'drizzle-orm';
import { posts } from '../../drizzle/schema';

export const action = async ({ request, context }: ActionFunctionArgs) => {
    if (request.method !== 'POST') {
        return json({ error: 'Method not allowed' }, { status: 405 });
    }

    try {
        const userId = await requireUserId(request);
        const { postId } = await request.json() as { postId: string };
        
        if (!postId) {
            return json({ error: 'Post ID is required' }, { status: 400 });
        }

        const db = (context as any).env.DB;

        // Check if user owns the post
        const post = await db
            .select()
            .from(posts)
            .where(eq(posts.id, postId))
            .limit(1);

        if (!post.length || post[0].authorId !== userId) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Delete the post
        await db.delete(posts).where(eq(posts.id, postId));

        return json({ success: true });
    } catch (error) {
        console.error('Delete post error:', error);
        return json({ error: 'Failed to delete post' }, { status: 500 });
    }
};

export default function () { return null; } 
import { ActionFunction, json } from '@remix-run/node';
import { deletePost } from '~/utils/user.server';
import { getUser } from '~/utils/auth.server';

export const action: ActionFunction = async ({ request }) => {
    if (request.method !== 'POST') {
        return json({ error: 'Method not allowed' }, { status: 405 });
    }

    try {
        const user = await getUser(request);
        if (!user) {
            return json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { postId } = await request.json();
        if (!postId) {
            return json({ error: 'Post ID is required' }, { status: 400 });
        }

        await deletePost(postId);
        return json({ success: true });
    } catch (error) {
        console.error('Delete post error:', error);
        return json({ error: 'Failed to delete post' }, { status: 500 });
    }
}; 
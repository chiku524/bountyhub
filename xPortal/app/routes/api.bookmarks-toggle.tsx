import { json } from '@remix-run/node';
import { requireUserId } from '~/utils/auth.server';
import { toggleBookmark } from '~/utils/bookmark.server';

export const action = async ({ request }: { request: Request }) => {
  const userId = await requireUserId(request);
  const { postId } = await request.json();
  if (!postId) return json({ error: 'Missing postId' }, { status: 400 });
  const result = await toggleBookmark(userId, postId);
  return json(result);
};

export default function () { return null; } 
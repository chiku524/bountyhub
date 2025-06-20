import { json, type ActionFunctionArgs } from '@remix-run/node';
import { requireUserId } from '~/utils/auth.server';
import { toggleBookmark } from '~/utils/bookmark.server';

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  const { postId } = await request.json() as { postId: string };
  if (!postId) return json({ error: 'Missing postId' }, { status: 400 });
  
  const db = (context as any).env.DB;
  const result = await toggleBookmark(db, postId, userId);
  return json(result);
};

export default function () { return null; } 
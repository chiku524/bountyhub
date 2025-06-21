import { json, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { requireUserId } from '~/utils/auth.server';
import { toggleBookmark } from '~/utils/bookmark.server';
import { createDb } from "~/utils/db.server";

export async function action({ request, context }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const { postId } = await request.json() as { postId: string };
  if (!postId) return json({ error: 'Missing postId' }, { status: 400 });
  
  const db = createDb((context as { env: { DB: D1Database } }).env.DB);
  const result = await toggleBookmark(db, postId, userId);
  return json(result);
}

export default function BookmarksToggle() {
  return null;
} 
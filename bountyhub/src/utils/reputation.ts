import { reputationHistory } from '../../drizzle/schema';
import { sql } from 'drizzle-orm';

export type ReputationAction =
  | 'POST_UPVOTED'
  | 'POST_DOWNVOTED'
  | 'ANSWER_UPVOTED'
  | 'ANSWER_DOWNVOTED'
  | 'ANSWER_ACCEPTED'
  | 'POST_CREATED'
  | 'ANSWER_CREATED'
  | 'COMMENT_CREATED'
  | 'COMMENT_UPVOTED'
  | 'COMMENT_DOWNVOTED'
  | 'BOUNTY_AWARDED'
  | 'CONTENT_FLAGGED';

export const REPUTATION_POINTS: Record<ReputationAction, number> = {
  POST_UPVOTED: 2,
  POST_DOWNVOTED: -1,
  ANSWER_UPVOTED: 2,
  ANSWER_DOWNVOTED: -1,
  ANSWER_ACCEPTED: 15,
  POST_CREATED: 10,
  ANSWER_CREATED: 5,
  COMMENT_CREATED: 1,
  COMMENT_UPVOTED: 1,
  COMMENT_DOWNVOTED: -1,
  BOUNTY_AWARDED: 50,
  CONTENT_FLAGGED: -10,
};

/**
 * Updates a user's reputation and logs the change.
 * @param db - The database instance
 * @param userId - The user whose reputation to update
 * @param action - The action type
 * @param referenceId - (Optional) Reference to the post/answer/etc.
 */
export async function updateReputation(db: any, userId: string, action: ReputationAction, referenceId?: string) {
  const points = REPUTATION_POINTS[action] || 0;
  if (!points) return;

  // Update user's reputation using raw SQL
  await db.run(sql`
    UPDATE users 
    SET reputation_points = reputation_points + ${points}, 
        updated_at = ${new Date().toISOString()}
    WHERE id = ${userId}
  `);

  // Log to reputation history
  await db.insert(reputationHistory).values({
    id: crypto.randomUUID(),
    userId,
    points,
    action,
    referenceId: referenceId || null,
    createdAt: new Date(),
  });
} 
import type { Db } from './db.server';
import { users, reputationHistory } from '../../drizzle/schema';
import { eq, desc , sql } from 'drizzle-orm';


// Reputation point values for different actions
export const REPUTATION_POINTS = {
  POST_CREATED: 10,
  POST_UPVOTED: 2,
  POST_DOWNVOTED: -1,
  ANSWER_CREATED: 5,
  ANSWER_ACCEPTED: 15,
  ANSWER_UPVOTED: 2,
  ANSWER_DOWNVOTED: -1,
  COMMENT_CREATED: 1,
  COMMENT_UPVOTED: 1,
  COMMENT_DOWNVOTED: -1,
  QUALITY_UPVOTE_RECEIVED: 5,
  QUALITY_DOWNVOTE_RECEIVED: -2,
  CREATE_POST: 10
} as const;

export async function addReputationPoints(
  db: Db,
  userId: string,
  points: number,
  action?: string,
  referenceId?: string
) {
  try {
    await db.update(users)
      .set({
        reputationPoints: sql`${users.reputationPoints} + ${points}`
      })
      .where(eq(users.id, userId))
      .run();

    if (action && referenceId) {
      await db.insert(reputationHistory).values({
        id: crypto.randomUUID(),
        userId,
        points,
        action,
        referenceId
      }).run();
    }
  } catch (error) {
    // Removed all console.error statements for cleaner production code.
  }
}

export async function getUserReputation(db: Db, userId: string) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        reputationPoints: true
      }
    });

    const history = await db.query.reputationHistory.findMany({
      where: eq(reputationHistory.userId, userId),
      orderBy: [desc(reputationHistory.createdAt)],
      limit: 10
    });

    return {
      reputationPoints: user?.reputationPoints || 0,
      reputationHistory: history
    };
  } catch (error) {
    return null;
  }
}

// Helper function to get reputation level based on points
export function getReputationLevel(points: number): string {
  if (points >= 1000) return 'Legend';
  if (points >= 500) return 'Expert';
  if (points >= 250) return 'Advanced';
  if (points >= 100) return 'Intermediate';
  if (points >= 50) return 'Contributor';
  return 'Beginner';
} 
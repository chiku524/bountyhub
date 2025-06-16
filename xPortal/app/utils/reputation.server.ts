import { prisma } from './prisma.server';

// Reputation point values for different actions
export const REPUTATION_POINTS = {
  POST_CREATED: 10,
  POST_UPVOTED: 5,
  POST_DOWNVOTED: -2,
  ANSWER_CREATED: 5,
  ANSWER_ACCEPTED: 15,
  ANSWER_UPVOTED: 10,
  ANSWER_DOWNVOTED: -2,
  COMMENT_CREATED: 2,
  COMMENT_UPVOTED: 2,
  COMMENT_DOWNVOTED: -1,
  QUALITY_UPVOTE_RECEIVED: 3,
  QUALITY_DOWNVOTE_RECEIVED: -1,
};

export async function addReputationPoints(
  userId: string,
  points: number,
  action: string,
  referenceId?: string
) {
  try {
    // Create reputation history entry
    await prisma.reputationHistory.create({
      data: {
        userId,
        points,
        action,
        referenceId,
      },
    });

    // Update user's total reputation points
    await prisma.user.update({
      where: { id: userId },
      data: {
        reputationPoints: {
          increment: points,
        },
      },
    });

    return true;
  } catch (error) {
    console.error('Error adding reputation points:', error);
    return false;
  }
}

export async function getUserReputation(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        reputationPoints: true,
        reputationHistory: {
          orderBy: { createdAt: 'desc' },
          take: 10, // Get last 10 reputation changes
        },
      },
    });

    return user;
  } catch (error) {
    console.error('Error getting user reputation:', error);
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
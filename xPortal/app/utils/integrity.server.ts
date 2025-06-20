import { eq, and, desc } from 'drizzle-orm';
import { userRatings, integrityHistory, integrityViolations, users } from '../../drizzle/schema';
import type { Db } from './db.server';
import { getUser } from './auth.server';
import { User } from '../../drizzle/schema';

export interface RatingData {
  ratedUserId: string;
  rating: number; // 1-10
  reason: string;
  context: string;
  referenceId?: string | null;
  referenceType?: string | null;
}

export interface ViolationData {
  targetUserId: string;
  violationType: string;
  description: string;
  evidence?: string | null;
  referenceId?: string | null;
  referenceType?: string | null;
}

export async function rateUser(
  db: Db,
  user: User,
  ratingData: {
    ratedUserId: string;
    rating: number;
    reason: string;
    context: string;
    referenceId?: string;
    referenceType?: string;
  }
): Promise<void> {
  try {
    // Check if user already rated this user for this reference
    const existingRating = await db
      .select()
      .from(userRatings)
      .where(and(
        eq(userRatings.raterId, user.id), 
        eq(userRatings.ratedUserId, ratingData.ratedUserId), 
        eq(userRatings.referenceId, ratingData.referenceId || null)
      ))
      .limit(1);

    if (existingRating.length > 0) {
      throw new Error('Already rated this user for this reference');
    }

    // Create new rating
    await db.insert(userRatings).values({
      id: crypto.randomUUID(),
      raterId: user.id,
      ratedUserId: ratingData.ratedUserId,
      rating: ratingData.rating,
      reason: ratingData.reason,
      context: ratingData.context,
      referenceId: ratingData.referenceId || null,
      referenceType: ratingData.referenceType || null,
    });

    // Add to integrity history
    await db.insert(integrityHistory).values({
      id: crypto.randomUUID(),
      userId: ratingData.ratedUserId,
      action: 'USER_RATED',
      points: ratingData.rating,
      description: `Rated by ${user.username}: ${ratingData.reason}`,
      referenceId: ratingData.referenceId || null,
      referenceType: ratingData.referenceType || null,
    });

    // Update user's integrity score
    await updateUserIntegrityScore(db, ratingData.ratedUserId);
  } catch (error) {
    console.error('Error rating user:', error);
    throw error;
  }
}

export async function reportViolation(request: Request, violationData: ViolationData) {
  const user = await getUser(request);
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Prevent self-reporting
  if (user.id === violationData.targetUserId) {
    throw new Error('Cannot report yourself');
  }

  try {
    // Check if user already reported this person for the same violation
    const existingViolation = await db.query.integrityViolations.findFirst({
      where: and(eq(integrityViolations.reporterId, user.id), eq(integrityViolations.targetUserId, violationData.targetUserId), eq(integrityViolations.violationType, violationData.violationType), eq(integrityViolations.referenceId, violationData.referenceId)),
    });

    if (existingViolation) {
      throw new Error('You have already reported this user for this violation');
    }

    // Create the violation report
    const violation = await db.insert(integrityViolations)
      .values({
        reporterId: user.id,
        targetUserId: violationData.targetUserId,
        violationType: violationData.violationType,
        description: violationData.description,
        evidence: violationData.evidence,
        referenceId: violationData.referenceId,
        referenceType: violationData.referenceType,
      })
      .returning({ id: true });

    // Add to integrity history
    await db.insert(integrityHistory)
      .values({
        userId: violationData.targetUserId,
        action: 'VIOLATION_REPORTED',
        points: -5, // Negative points for being reported
        description: `Reported for ${violationData.violationType.toLowerCase()}`,
        referenceId: violation.id,
        referenceType: 'VIOLATION',
      })
      .returning({ id: true });

    return violation;
  } catch (error) {
    console.error('Error in reportViolation:', error);
    throw new Error('Failed to submit violation report. Please try again.');
  }
}

export async function updateUserIntegrityScore(db: Db, userId: string) {
  try {
    // Get all ratings for the user
    const ratings = await db.query.userRatings.findMany({
      where: eq(userRatings.ratedUserId, userId),
      select: {
        rating: true,
      },
    });

    if (ratings.length === 0) {
      return;
    }

    // Calculate average rating
    const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / ratings.length;

    // Update user's integrity score
    await db.update(users)
      .set({
        integrityScore: averageRating,
        totalRatings: ratings.length,
      })
      .where(eq(users.id, userId));
  } catch (error) {
    console.error('Error updating integrity score:', error);
  }
}

export async function getUserIntegrityStats(userId: string) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      select: {
        integrityScore: true,
        totalRatings: true,
        integrityHistory: {
          orderBy: desc(integrityHistory.createdAt),
          take: 10,
        },
        ratingsReceived: {
          orderBy: desc(userRatings.createdAt),
          take: 5,
          include: {
            rater: {
              select: {
                username: true,
              },
            },
          },
        },
        integrityViolations: {
          where: {
            status: {
              in: ['PENDING', 'REVIEWED'],
            },
          },
          orderBy: desc(integrityViolations.createdAt),
          take: 5,
        },
      },
    });

    return user;
  } catch (error) {
    console.error('Error getting integrity stats:', error);
    return {
      integrityScore: 5.0,
      totalRatings: 0,
      integrityHistory: [],
      ratingsReceived: [],
      integrityViolations: [],
    };
  }
}

export function getIntegrityLevel(score: number): string {
  if (score >= 9.0) return 'Exceptional';
  if (score >= 8.0) return 'Excellent';
  if (score >= 7.0) return 'Good';
  if (score >= 6.0) return 'Fair';
  if (score >= 5.0) return 'Average';
  if (score >= 4.0) return 'Below Average';
  if (score >= 3.0) return 'Poor';
  if (score >= 2.0) return 'Very Poor';
  return 'Unacceptable';
}

export async function canRateUser(raterId: string, ratedUserId: string, context: string, referenceId?: string): Promise<boolean> {
  try {
    // Check if user already rated this person in the same context
    const existingRating = await db.query.userRatings.findFirst({
      where: and(eq(userRatings.userId, raterId), eq(userRatings.targetUserId, ratedUserId), eq(userRatings.referenceId, referenceId || null)),
    });

    return !existingRating;
  } catch (error) {
    console.error('Error checking if user can rate:', error);
    return true; // Allow rating if there's an error
  }
}

export async function getRatingContexts(): Promise<Array<{ value: string; label: string; description: string }>> {
  return [
    {
      value: 'BOUNTY_REJECTION',
      label: 'Bounty Rejection',
      description: 'User rejected a valid answer to their bounty question',
    },
    {
      value: 'ANSWER_QUALITY',
      label: 'Answer Quality',
      description: 'User provided poor quality or incorrect answers',
    },
    {
      value: 'COMMUNICATION',
      label: 'Communication',
      description: 'User was unresponsive or difficult to communicate with',
    },
    {
      value: 'SPAM',
      label: 'Spam',
      description: 'User posted spam or irrelevant content',
    },
    {
      value: 'HARASSMENT',
      label: 'Harassment',
      description: 'User engaged in harassing behavior',
    },
    {
      value: 'GENERAL',
      label: 'General Behavior',
      description: 'General behavior or conduct issues',
    },
  ];
}

export async function getViolationTypes(): Promise<Array<{ value: string; label: string; description: string }>> {
  return [
    {
      value: 'BOUNTY_REJECTION',
      label: 'Bounty Rejection',
      description: 'Rejected valid answer without proper justification',
    },
    {
      value: 'SPAM',
      label: 'Spam',
      description: 'Posted spam or irrelevant content',
    },
    {
      value: 'HARASSMENT',
      label: 'Harassment',
      description: 'Engaged in harassing or abusive behavior',
    },
    {
      value: 'PLAGIARISM',
      label: 'Plagiarism',
      description: 'Copied content without attribution',
    },
    {
      value: 'MISLEADING',
      label: 'Misleading Information',
      description: 'Provided intentionally misleading information',
    },
    {
      value: 'OTHER',
      label: 'Other',
      description: 'Other violation not covered above',
    },
  ];
} 
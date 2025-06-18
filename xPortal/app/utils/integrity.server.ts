import { prisma } from './prisma.server';
import { getUser } from './auth.server';

// Debug: Check if prisma is available
console.log('Integrity server - prisma object:', prisma);
console.log('Integrity server - prisma type:', typeof prisma);
if (prisma) {
  console.log('Integrity server - available models:', Object.keys(prisma));
}

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

export async function rateUser(request: Request, ratingData: RatingData) {
  const user = await getUser(request);
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Validate rating
  if (ratingData.rating < 1 || ratingData.rating > 10) {
    throw new Error('Rating must be between 1 and 10');
  }

  // Prevent self-rating
  if (user.id === ratingData.ratedUserId) {
    throw new Error('Cannot rate yourself');
  }

  try {
    // Check if user already rated this person in the same context
    const existingRating = await prisma.userRating.findUnique({
      where: {
        raterId_ratedUserId_referenceId: {
          raterId: user.id,
          ratedUserId: ratingData.ratedUserId,
          referenceId: ratingData.referenceId || null,
        },
      },
    });

    if (existingRating) {
      throw new Error('You have already rated this user in this context');
    }

    // Create the rating
    const newRating = await prisma.userRating.create({
      data: {
        raterId: user.id,
        ratedUserId: ratingData.ratedUserId,
        rating: ratingData.rating,
        reason: ratingData.reason,
        context: ratingData.context,
        referenceId: ratingData.referenceId || null,
        referenceType: ratingData.referenceType || null,
      },
    });

    // Update the rated user's integrity score
    await updateUserIntegrityScore(ratingData.ratedUserId);

    // Add to integrity history
    await prisma.integrityHistory.create({
      data: {
        userId: ratingData.ratedUserId,
        action: 'RATING_RECEIVED',
        points: ratingData.rating,
        description: `Received a ${ratingData.rating}/10 rating for ${ratingData.context.toLowerCase()}`,
        referenceId: newRating.id,
        referenceType: 'RATING',
      },
    });

    return newRating;
  } catch (error) {
    console.error('Error in rateUser:', error);
    throw new Error('Failed to submit rating. Please try again.');
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
    const existingViolation = await prisma.integrityViolation.findFirst({
      where: {
        reporterId: user.id,
        targetUserId: violationData.targetUserId,
        violationType: violationData.violationType,
        referenceId: violationData.referenceId,
        status: {
          in: ['PENDING', 'REVIEWED'],
        },
      },
    });

    if (existingViolation) {
      throw new Error('You have already reported this user for this violation');
    }

    // Create the violation report
    const violation = await prisma.integrityViolation.create({
      data: {
        reporterId: user.id,
        targetUserId: violationData.targetUserId,
        violationType: violationData.violationType,
        description: violationData.description,
        evidence: violationData.evidence,
        referenceId: violationData.referenceId,
        referenceType: violationData.referenceType,
      },
    });

    // Add to integrity history
    await prisma.integrityHistory.create({
      data: {
        userId: violationData.targetUserId,
        action: 'VIOLATION_REPORTED',
        points: -5, // Negative points for being reported
        description: `Reported for ${violationData.violationType.toLowerCase()}`,
        referenceId: violation.id,
        referenceType: 'VIOLATION',
      },
    });

    return violation;
  } catch (error) {
    console.error('Error in reportViolation:', error);
    throw new Error('Failed to submit violation report. Please try again.');
  }
}

export async function updateUserIntegrityScore(userId: string) {
  try {
    // Get all ratings for the user
    const ratings = await prisma.userRating.findMany({
      where: {
        ratedUserId: userId,
      },
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
    await prisma.user.update({
      where: { id: userId },
      data: {
        integrityScore: averageRating,
        totalRatings: ratings.length,
      },
    });
  } catch (error) {
    console.error('Error updating integrity score:', error);
  }
}

export async function getUserIntegrityStats(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        integrityScore: true,
        totalRatings: true,
        integrityHistory: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        ratingsReceived: {
          orderBy: { createdAt: 'desc' },
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
          orderBy: { createdAt: 'desc' },
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
    const existingRating = await prisma.userRating.findUnique({
      where: {
        raterId_ratedUserId_referenceId: {
          raterId,
          ratedUserId,
          referenceId: referenceId || null,
        },
      },
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
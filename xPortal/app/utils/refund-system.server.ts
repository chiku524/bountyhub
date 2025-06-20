import { refundBounty, addCompensation } from './virtual-wallet.server';
import type { Db } from './db.server';
import { refundRequests, refundRequestVotes, bounties } from '../../drizzle/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export interface RefundRequest {
  id: string;
  bountyId: string;
  requesterId: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  communityVotes: number;
  requiredVotes: number;
  createdAt: Date;
  expiresAt: Date;
}

export interface RefundRequestVote {
  id: string;
  refundRequestId: string;
  voterId: string;
  vote: boolean;
  reason?: string | null;
  rewardAmount: number;
  createdAt: Date;
}

export async function createRefundRequest(
  db: Db,
  bountyId: string,
  requesterId: string,
  reason: string
): Promise<RefundRequest> {
  try {
    // Check if bounty exists and is active
    const bounty = await db.query.bounties.findFirst({
      where: eq(bounties.id, bountyId)
    });

    if (!bounty) {
      throw new Error('Bounty not found');
    }

    if (bounty.status !== 'ACTIVE') {
      throw new Error('Bounty is not active');
    }

    // Check if refund request already exists
    const existingRequest = await db.query.refundRequests.findFirst({
      where: and(
        eq(refundRequests.bountyId, bountyId),
        eq(refundRequests.requesterId, requesterId),
        eq(refundRequests.status, 'PENDING')
      )
    });

    if (existingRequest) {
      throw new Error('Refund request already exists for this bounty');
    }

    // Calculate expiration time (24 hours from now)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const [refundRequest] = await db.insert(refundRequests).values({
      id: crypto.randomUUID(),
      bountyId,
      requesterId,
      reason,
      status: 'PENDING',
      communityVotes: 0,
      requiredVotes: 5,
      expiresAt,
    }).returning().all();

    return refundRequest;
  } catch (error) {
    console.error('Error creating refund request:', error);
    throw error;
  }
}

export async function voteOnRefundRequest(
  db: Db,
  refundRequestId: string,
  voterId: string,
  vote: boolean,
  reason?: string
): Promise<RefundRequestVote> {
  try {
    // Check if refund request exists and is pending
    const refundRequest = await db.query.refundRequests.findFirst({
      where: eq(refundRequests.id, refundRequestId)
    });

    if (!refundRequest) {
      throw new Error('Refund request not found');
    }

    if (refundRequest.status !== 'PENDING') {
      throw new Error('Refund request is not pending');
    }

    if (refundRequest.requesterId === voterId) {
      throw new Error('Cannot vote on your own refund request');
    }

    // Check if user already voted
    const existingVote = await db.query.refundRequestVotes.findFirst({
      where: and(
        eq(refundRequestVotes.refundRequestId, refundRequestId),
        eq(refundRequestVotes.voterId, voterId)
      )
    });

    if (existingVote) {
      throw new Error('Already voted on this refund request');
    }

    // Calculate reward amount (small compensation for voting)
    const rewardAmount = 0.1; // 0.1 tokens for voting

    const [voteRecord] = await db.insert(refundRequestVotes).values({
      id: crypto.randomUUID(),
      refundRequestId,
      voterId,
      vote,
      reason: reason || undefined,
      rewardAmount,
    }).returning().all();

    // Update community votes count
    const totalVotes = await db.select({ count: sql`count(*)` })
      .from(refundRequestVotes)
      .where(eq(refundRequestVotes.refundRequestId, refundRequestId))
      .get();

    const voteCount = totalVotes?.count as number || 0;

    await db.update(refundRequests)
      .set({ communityVotes: voteCount })
      .where(eq(refundRequests.id, refundRequestId))
      .run();

    // Give compensation to voter
    await addCompensation(db, voterId, rewardAmount, 'Voting on refund request');

    // Check if refund request should be approved/rejected
    const approvalVotes = await db.select({ count: sql`count(*)` })
      .from(refundRequestVotes)
      .where(and(
        eq(refundRequestVotes.refundRequestId, refundRequestId),
        eq(refundRequestVotes.vote, true)
      ))
      .get();

    const approvalCount = approvalVotes?.count as number || 0;
    const rejectionCount = voteCount - approvalCount;

    if (approvalCount >= refundRequest.requiredVotes) {
      // Approve refund
      await approveRefundRequest(db, refundRequestId);
    } else if (rejectionCount >= refundRequest.requiredVotes) {
      // Reject refund
      await rejectRefundRequest(db, refundRequestId);
    }

    return voteRecord;
  } catch (error) {
    console.error('Error voting on refund request:', error);
    throw error;
  }
}

async function approveRefundRequest(db: Db, refundRequestId: string) {
  try {
    const refundRequest = await db.query.refundRequests.findFirst({
      where: eq(refundRequests.id, refundRequestId)
    });

    if (!refundRequest) {
      throw new Error('Refund request not found');
    }

    const bounty = await db.query.bounties.findFirst({
      where: eq(bounties.id, refundRequest.bountyId)
    });

    if (!bounty) {
      throw new Error('Bounty not found');
    }

    // Calculate refund amount (with penalty)
    const refundAmount = bounty.amount * (1 - bounty.refundPenalty);

    // Process refund
    await refundBounty(db, refundRequest.requesterId, refundAmount, bounty.id);

    // Update refund request status
    await db.update(refundRequests)
      .set({ status: 'APPROVED' })
      .where(eq(refundRequests.id, refundRequestId))
      .run();

    // Give compensation to voters who voted correctly
    const correctVotes = await db.query.refundRequestVotes.findMany({
      where: and(
        eq(refundRequestVotes.refundRequestId, refundRequestId),
        eq(refundRequestVotes.vote, true)
      )
    });

    for (const vote of correctVotes) {
      await addCompensation(
        db,
        vote.voterId,
        vote.rewardAmount * 2, // Double reward for correct vote
        'Correctly voted to approve refund request'
      );
    }
  } catch (error) {
    console.error('Error approving refund request:', error);
    throw error;
  }
}

async function rejectRefundRequest(db: Db, refundRequestId: string) {
  try {
    // Update refund request status
    await db.update(refundRequests)
      .set({ status: 'REJECTED' })
      .where(eq(refundRequests.id, refundRequestId))
      .run();

    // Give compensation to voters who voted correctly
    const correctVotes = await db.query.refundRequestVotes.findMany({
      where: and(
        eq(refundRequestVotes.refundRequestId, refundRequestId),
        eq(refundRequestVotes.vote, false)
      )
    });

    for (const vote of correctVotes) {
      await addCompensation(
        db,
        vote.voterId,
        vote.rewardAmount * 2, // Double reward for correct vote
        'Correctly voted to reject refund request'
      );
    }
  } catch (error) {
    console.error('Error rejecting refund request:', error);
    throw error;
  }
}

export async function getRefundRequests(
  db: Db,
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
): Promise<RefundRequest[]> {
  try {
    const whereClause = status ? eq(refundRequests.status, status) : undefined;
    
    const requests = await db.query.refundRequests.findMany({
      where: whereClause,
      orderBy: [desc(refundRequests.createdAt)]
    });

    return requests;
  } catch (error) {
    console.error('Error getting refund requests:', error);
    return [];
  }
}

export async function getRefundRequestById(
  db: Db,
  refundRequestId: string
): Promise<RefundRequest | null> {
  try {
    const request = await db.query.refundRequests.findFirst({
      where: eq(refundRequests.id, refundRequestId)
    });

    return request || null;
  } catch (error) {
    console.error('Error getting refund request by ID:', error);
    return null;
  }
}

export async function expireRefundRequests(db: Db): Promise<void> {
  try {
    const now = new Date();
    
    await db.update(refundRequests)
      .set({ status: 'EXPIRED' })
      .where(and(
        eq(refundRequests.status, 'PENDING'),
        sql`${refundRequests.expiresAt} < ${now}`
      ))
      .run();
  } catch (error) {
    console.error('Error expiring refund requests:', error);
  }
} 
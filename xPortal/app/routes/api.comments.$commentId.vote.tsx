import { json } from '@remix-run/cloudflare';
import { eq, and } from 'drizzle-orm';
import { votes, comments } from '../../drizzle/schema';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import type { ActionFunctionArgs } from '@remix-run/cloudflare';

interface CloudflareContext {
  env: {
    DB: DrizzleD1Database<typeof import('../../drizzle/schema')>;
  };
}

export async function action({ request, params, context }: ActionFunctionArgs) {
  const { commentId } = params;
  
  if (!commentId) {
    return json({ error: 'Comment ID is required' }, { status: 400 });
  }

  const formData = await request.formData();
  const userId = formData.get('userId') as string;
  const value = parseInt(formData.get('value') as string);
  const voteType = formData.get('voteType') as string;
  const isQualityVote = formData.get('isQualityVote') === 'true';

  if (!userId || isNaN(value) || !voteType) {
    return json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const db = (context as unknown as CloudflareContext).env.DB;

    // Check if user already voted
    const existingVote = await db
      .select()
      .from(votes)
      .where(
        and(
          eq(votes.commentId, commentId),
          eq(votes.userId, userId),
          eq(votes.voteType, voteType)
        )
      )
      .limit(1);

    let totalVotes = 0;
    let upvotes = 0;
    let downvotes = 0;

    if (existingVote.length > 0) {
      // Update existing vote
      await db
        .update(votes)
        .set({
          value,
          updatedAt: new Date(),
        })
        .where(eq(votes.id, existingVote[0].id));
    } else {
      // Create new vote
      await db.insert(votes).values({
        id: crypto.randomUUID(),
        commentId,
        userId,
        value,
        voteType,
        isQualityVote,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Calculate vote counts
    const voteCounts = await db
      .select({
        totalVotes: votes.value,
        upvotes: votes.value,
        downvotes: votes.value,
      })
      .from(votes)
      .where(
        and(
          eq(votes.commentId, commentId),
          eq(votes.voteType, voteType)
        )
      );

    // Calculate totals
    voteCounts.forEach((vote) => {
      totalVotes += vote.totalVotes;
      if (vote.upvotes > 0) upvotes += vote.upvotes;
      if (vote.downvotes < 0) downvotes += Math.abs(vote.downvotes);
    });

    // Update comment with new vote counts
    const updateData: any = {};
    if (voteType === 'comment') {
      updateData.upvotes = upvotes;
      updateData.downvotes = downvotes;
    }

    await db
      .update(comments)
      .set(updateData)
      .where(eq(comments.id, commentId));

    return json({
      success: true,
      totalVotes,
      upvotes,
      downvotes,
    });
  } catch (error) {
    console.error('Error processing comment vote:', error);
    return json({ error: 'Failed to process vote' }, { status: 500 });
  }
} 
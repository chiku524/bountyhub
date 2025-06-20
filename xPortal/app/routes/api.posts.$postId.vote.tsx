import { json, type ActionFunctionArgs } from "@remix-run/cloudflare";
import { getUser } from "~/utils/auth.server";
import { eq, and } from "drizzle-orm";
import { votes, posts } from "../../drizzle/schema";
import { createDb } from "~/utils/db.server";

export async function action({ request, params, context }: ActionFunctionArgs) {
  const { postId } = params;
  
  if (!postId) {
    return json({ error: 'Post ID is required' }, { status: 400 });
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
    const db = createDb((context as { env: { DB: D1Database } }).env.DB);

    // Check if user already voted
    const existingVote = await db
      .select()
      .from(votes)
      .where(
        and(
          eq(votes.postId, postId),
          eq(votes.userId, userId),
          eq(votes.voteType, voteType)
        )
      )
      .limit(1);

    let totalVotes = 0;
    let qualityUpvotes = 0;
    let qualityDownvotes = 0;

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
        postId,
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
        qualityUpvotes: votes.value,
        qualityDownvotes: votes.value,
      })
      .from(votes)
      .where(
        and(
          eq(votes.postId, postId),
          eq(votes.voteType, voteType)
        )
      );

    // Calculate totals
    voteCounts.forEach((vote) => {
      totalVotes += vote.totalVotes;
      if (vote.qualityUpvotes > 0) qualityUpvotes += vote.qualityUpvotes;
      if (vote.qualityDownvotes < 0) qualityDownvotes += Math.abs(vote.qualityDownvotes);
    });

    // Update post with new vote counts
    const updateData: { visibilityVotes?: number; qualityUpvotes?: number; qualityDownvotes?: number } = {};
    if (voteType === 'visibility') {
      updateData.visibilityVotes = totalVotes;
    } else if (voteType === 'quality') {
      updateData.qualityUpvotes = qualityUpvotes;
      updateData.qualityDownvotes = qualityDownvotes;
    }

    await db
      .update(posts)
      .set(updateData)
      .where(eq(posts.id, postId));

    return json({
      success: true,
      totalVotes,
      qualityUpvotes,
      qualityDownvotes,
    });
  } catch (error) {
    console.error('Error processing vote:', error);
    return json({ error: 'Failed to process vote' }, { status: 500 });
  }
}


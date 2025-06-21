import { json, type ActionFunctionArgs } from "@remix-run/cloudflare";
import { eq, and } from "drizzle-orm";
import { votes, answers } from "../../drizzle/schema";
import { createDb } from "~/utils/db.server";

export async function action({ request, params, context }: ActionFunctionArgs) {
  const { answerId } = params;
  
  if (!answerId) {
    return json({ error: 'Answer ID is required' }, { status: 400 });
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
          eq(votes.answerId, answerId),
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
        answerId,
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
          eq(votes.answerId, answerId),
          eq(votes.voteType, voteType)
        )
      );

    // Calculate totals
    voteCounts.forEach((vote) => {
      totalVotes += vote.totalVotes;
      if (vote.upvotes > 0) upvotes += vote.upvotes;
      if (vote.downvotes < 0) downvotes += Math.abs(vote.downvotes);
    });

    // Update answer with new vote counts
    const updateData: { upvotes?: number; downvotes?: number } = {};
    if (voteType === 'answer') {
      updateData.upvotes = upvotes;
      updateData.downvotes = downvotes;
    }

    await db
      .update(answers)
      .set(updateData)
      .where(eq(answers.id, answerId));

    return json({
      success: true,
      totalVotes,
      upvotes,
      downvotes,
    });
  } catch (error) {
    console.error('Error processing answer vote:', error);
    return json({ error: 'Failed to process vote' }, { status: 500 });
  }
}

export default function AnswersVote() {
  return null;
} 
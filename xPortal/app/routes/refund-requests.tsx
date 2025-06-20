import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Layout } from "~/components/Layout";
import { RefundRequestsList } from "~/components/RefundRequestsList";
import { getRefundRequests } from "~/utils/refund-system.server";
import { requireUserId } from "~/utils/auth.server";
import { eq, and } from 'drizzle-orm';
import { refundRequests, bounties, posts, users, refundRequestVotes, answers } from '../../drizzle/schema';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  
  try {
    const db = (context as any).env.DB;
    
    // Fetch refund requests with related data
    const requests = await db
      .select({
        id: refundRequests.id,
        reason: refundRequests.reason,
        status: refundRequests.status,
        createdAt: refundRequests.createdAt,
        expiresAt: refundRequests.expiresAt,
        communityVotes: refundRequests.communityVotes,
        requiredVotes: refundRequests.requiredVotes,
        bountyId: refundRequests.bountyId,
        requesterId: refundRequests.requesterId,
      })
      .from(refundRequests)
      .where(eq(refundRequests.status, 'PENDING'))
      .orderBy(refundRequests.createdAt);

    // Fetch related data for each request
    const refundRequestsWithData = await Promise.all(
      requests.map(async (request: any) => {
        // Get bounty and post data
        const bounty = await db
          .select({
            amount: bounties.amount,
            postId: bounties.postId,
          })
          .from(bounties)
          .where(eq(bounties.id, request.bountyId))
          .get();

        if (!bounty) return null;

        const post = await db
          .select({
            title: posts.title,
            authorId: posts.authorId,
          })
          .from(posts)
          .where(eq(posts.id, bounty.postId))
          .get();

        if (!post) return null;

        // Get answers count
        const answersCount = await db
          .select({ count: answers.id })
          .from(answers)
          .where(eq(answers.postId, bounty.postId))
          .all();

        // Get requester data
        const requester = await db
          .select({
            username: users.username,
          })
          .from(users)
          .where(eq(users.id, request.requesterId))
          .get();

        // Get votes
        const votes = await db
          .select({
            id: refundRequestVotes.id,
            vote: refundRequestVotes.vote,
            voterId: refundRequestVotes.voterId,
            reason: refundRequestVotes.reason,
            createdAt: refundRequestVotes.createdAt,
            rewardAmount: refundRequestVotes.rewardAmount,
          })
          .from(refundRequestVotes)
          .where(eq(refundRequestVotes.refundRequestId, request.id))
          .all();

        return {
          id: request.id,
          reason: request.reason,
          status: request.status,
          createdAt: request.createdAt.toISOString(),
          expiresAt: request.expiresAt.toISOString(),
          communityVotes: request.communityVotes,
          requiredVotes: request.requiredVotes,
          bounty: {
            amount: bounty.amount,
            post: {
              title: post.title,
              answers: Array(answersCount.length).fill({ id: 'placeholder' }),
              author: { username: 'Unknown' }, // We'd need to join with users to get this
            },
          },
          requester: { username: requester?.username || 'Unknown' },
          votes: votes.map((vote: any) => ({
            ...vote,
            createdAt: vote.createdAt.toISOString(),
          })),
        };
      })
    );

    const validRequests = refundRequestsWithData.filter(Boolean);
    
    return json({
      refundRequests: validRequests,
      count: validRequests.length,
    });
  } catch (error) {
    console.error("Load refund requests error:", error);
    
    return json({
      refundRequests: [],
      count: 0,
      error: error instanceof Error ? error.message : "Failed to load refund requests"
    });
  }
}

export default function RefundRequestsPage() {
  const data = useLoaderData<typeof loader>();
  const { refundRequests, count } = data;
  const error = 'error' in data ? data.error as string : undefined;

  return (
    <Layout>
      <div className="w-auto max-w-8xl mx-auto mt-4 px-4 pb-16">
        <div className="mb-6 flex justify-between items-center mt-16">
          <div>
            <h1 className="text-2xl font-bold text-white">Refund Requests</h1>
            <p className="text-gray-400 text-sm mt-1">
              Help the community by voting on refund requests. Earn tokens for participating in governance (5% fee)!
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-indigo-400">{count}</div>
            <div className="text-gray-400 text-sm">Active Requests</div>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <div className="bg-neutral-900/50 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">How it works</h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-neutral-800 p-4 rounded-lg">
              <h3 className="font-medium text-indigo-400 mb-2">1. Review Requests</h3>
              <p className="text-gray-300">Read the refund reason and check if the bounty has helpful answers.</p>
            </div>
            <div className="bg-neutral-800 p-4 rounded-lg">
              <h3 className="font-medium text-indigo-400 mb-2">2. Vote Wisely</h3>
              <p className="text-gray-300">Approve legitimate refunds, reject attempts to get free help.</p>
            </div>
            <div className="bg-neutral-800 p-4 rounded-lg">
              <h3 className="font-medium text-indigo-400 mb-2">3. Earn Rewards</h3>
              <p className="text-gray-300">Get tokens (5% of bounty) and reputation points for participating in governance.</p>
            </div>
          </div>
        </div>

        <RefundRequestsList refundRequests={refundRequests} />
      </div>
    </Layout>
  );
} 
import { useState } from "react";
import { Form, useActionData, useNavigation } from "@remix-run/react";

interface RefundRequest {
  id: string;
  reason: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  communityVotes: number;
  requiredVotes: number;
  bounty: {
    amount: number;
    post: {
      title: string;
      answers: Array<{ id: string }>;
      author: { username: string };
    };
  };
  requester: { username: string };
  votes: Array<{ 
    id: string;
    vote: boolean; 
    voterId: string;
    reason: string | null;
    createdAt: string;
    rewardAmount: number;
  }>;
}

interface RefundRequestsListProps {
  refundRequests: RefundRequest[];
}

export function RefundRequestsList({ refundRequests }: RefundRequestsListProps) {
  const actionData = useActionData<any>();
  const navigation = useNavigation();
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [voteReason, setVoteReason] = useState("");

  const isSubmitting = navigation.state === "submitting";

  const handleVote = (requestId: string, vote: boolean) => {
    setSelectedRequest(requestId);
    setVoteReason("");
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return "Expired";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
  };

  if (refundRequests.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No active refund requests to vote on.</p>
        <p className="text-gray-500 text-sm mt-2">Check back later for new requests!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {actionData?.success && (
        <div className="bg-green-900/20 border border-green-500 rounded-lg p-4">
          <p className="text-green-400 text-sm">{actionData.message}</p>
        </div>
      )}

      {actionData?.error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <p className="text-red-400 text-sm">{actionData.error}</p>
        </div>
      )}

      {refundRequests.map((request) => (
        <div key={request.id} className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-white font-semibold">
                Refund Request by @{request.requester.username}
              </h3>
              <p className="text-gray-400 text-sm">
                Bounty: {request.bounty.amount} SOL • {request.bounty.post.answers.length} answers
              </p>
              <p className="text-gray-500 text-xs">
                {formatTimeRemaining(request.expiresAt)} • {request.communityVotes}/{request.requiredVotes} votes
              </p>
            </div>
            <div className="text-right">
              <span className="text-yellow-400 font-semibold">{request.bounty.amount} SOL</span>
            </div>
          </div>

          <div className="mb-3">
            <p className="text-gray-300 text-sm mb-2">
              <strong>Reason:</strong> {request.reason}
            </p>
            <p className="text-gray-400 text-xs">
              <strong>Post:</strong> {request.bounty.post.title}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => handleVote(request.id, true)}
                disabled={isSubmitting}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={() => handleVote(request.id, false)}
                disabled={isSubmitting}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Reject
              </button>
            </div>

            <div className="text-xs text-gray-500">
              {request.votes.length > 0 && (
                <span>
                  Votes: {request.votes.filter(v => v.vote).length} approve, {request.votes.filter(v => !v.vote).length} reject
                </span>
              )}
            </div>
          </div>

          {/* Vote Modal */}
          {selectedRequest === request.id && (
            <div className="mt-4 p-4 bg-neutral-700 rounded-lg">
              <h4 className="text-white font-medium mb-2">
                Vote on Refund Request
              </h4>
              
              {/* Anti-gaming requirements */}
              <div className="mb-3 p-3 bg-blue-900/20 border border-blue-500 rounded text-xs text-blue-300">
                <p className="font-medium mb-1">Voting Requirements:</p>
                <ul className="space-y-1 text-blue-200">
                  <li>• 50+ reputation points & 7+ days account age</li>
                  <li>• Must have previously engaged with this post</li>
                  <li>• Minimum 20 characters of reasoning required</li>
                  <li>• 5-minute minimum review time</li>
                  <li>• Max 10 votes per 24 hours</li>
                </ul>
              </div>

              <Form method="post" action="/api/refund/vote">
                <input type="hidden" name="refundRequestId" value={request.id} />
                
                <div className="mb-3">
                  <label htmlFor="voteReason" className="block text-sm text-gray-300 mb-1">
                    Reasoning for Vote *
                  </label>
                  <textarea
                    id="voteReason"
                    name="reason"
                    value={voteReason}
                    onChange={(e) => setVoteReason(e.target.value)}
                    required
                    minLength={20}
                    rows={3}
                    className="w-full px-3 py-2 bg-neutral-600 border border-neutral-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Explain your vote reasoning (minimum 20 characters)..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {voteReason.length}/20 characters minimum
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    name="vote"
                    value="true"
                    disabled={isSubmitting || voteReason.length < 20}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Submitting..." : "Approve"}
                  </button>
                  <button
                    type="submit"
                    name="vote"
                    value="false"
                    disabled={isSubmitting || voteReason.length < 20}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Submitting..." : "Reject"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRequest(null)}
                    className="px-4 py-2 bg-neutral-600 text-white text-sm rounded hover:bg-neutral-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </Form>
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 
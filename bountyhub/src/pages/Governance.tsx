import { useState, useEffect } from 'react'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'

interface RefundRequest {
  id: string
  reason: string
  status: string
  createdAt: string
  expiresAt: string
  communityVotes: number
  requiredVotes: number
  bounty: {
    amount: number
    post: {
      title: string
      answers: Array<{ id: string }>
      author: { username: string }
    }
  }
  requester: { username: string }
  votes: Array<{ 
    id: string
    vote: boolean 
    voterId: string
    reason: string | null
    createdAt: string
    rewardAmount: number
  }>
}

export default function Governance() {
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null)
  const [voteReason, setVoteReason] = useState('')
  const [voting, setVoting] = useState(false)

  useEffect(() => {
    fetchRefundRequests()
  }, [])

  const fetchRefundRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/refund-requests')
      if (!response.ok) throw new Error('Failed to fetch refund requests')
      const data = await response.json()
      setRefundRequests(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch refund requests')
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (requestId: string, vote: boolean) => {
    if (!voteReason.trim() || voteReason.length < 20) {
      setError('Please provide at least 20 characters of reasoning for your vote')
      return
    }

    try {
      setVoting(true)
      const response = await fetch('/api/refund/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refundRequestId: requestId,
          vote,
          reason: voteReason
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit vote')
      }

      // Refresh the refund requests
      await fetchRefundRequests()
      setSelectedRequest(null)
      setVoteReason('')
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit vote')
    } finally {
      setVoting(false)
    }
  }

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expires = new Date(expiresAt)
    const diff = expires.getTime() - now.getTime()
    
    if (diff <= 0) return 'Expired'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${hours}h ${minutes}m remaining`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Governance</h1>
          <p className="text-gray-400">
            Help the community by voting on refund requests. Earn tokens for participating in governance (5% fee)!
          </p>
        </div>

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

        {error && <ErrorMessage message={error} />}

        {refundRequests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No active refund requests to vote on.</p>
            <p className="text-gray-500 text-sm mt-2">Check back later for new requests!</p>
          </div>
        ) : (
          <div className="space-y-4">
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
                      onClick={() => setSelectedRequest(request.id)}
                      disabled={voting}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setSelectedRequest(request.id)}
                      disabled={voting}
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

                    <div className="mb-3">
                      <label htmlFor="voteReason" className="block text-sm text-gray-300 mb-1">
                        Reasoning for Vote *
                      </label>
                      <textarea
                        id="voteReason"
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
                        onClick={() => handleVote(request.id, true)}
                        disabled={voting || voteReason.length < 20}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {voting ? "Submitting..." : "Approve"}
                      </button>
                      <button
                        onClick={() => handleVote(request.id, false)}
                        disabled={voting || voteReason.length < 20}
                        className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {voting ? "Submitting..." : "Reject"}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRequest(null)
                          setVoteReason('')
                        }}
                        disabled={voting}
                        className="px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 
import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthProvider'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'

interface RefundRequest {
  id: string
  bountyId: string
  requesterId: string
  reason: string
  status: string
  communityVotes: number
  requiredVotes: number
  createdAt: string
  expiresAt: string
  bountyAmount: number
  postTitle: string
  requesterUsername: string
}

interface Vote {
  id: string
  voterId: string
  vote: boolean
  reason: string | null
  rewardAmount: number
  createdAt: string
  voterUsername: string
}

const API_URL = import.meta.env.VITE_API_URL || '';

const RefundRequests: React.FC = () => {
  const { user } = useAuth()
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null)
  const [voteReason, setVoteReason] = useState('')
  const [voting, setVoting] = useState(false)
  const [votes, setVotes] = useState<{ [key: string]: Vote[] }>({})

  useEffect(() => {
    if (user) {
      fetchRefundRequests()
    }
  }, [user])

  const fetchRefundRequests = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`${API_URL}/api/refund-requests`, { credentials: 'include' })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Failed to fetch refund requests')
        setRefundRequests([])
        return
      }
      if (Array.isArray(data)) {
        setRefundRequests(data)
      } else {
        setError(data.error || 'Failed to fetch refund requests')
        setRefundRequests([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch refund requests')
      setRefundRequests([])
    } finally {
      setLoading(false)
    }
  }

  const fetchVotes = async (requestId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/refund-requests/${requestId}/votes`, { credentials: 'include' })
      if (response.ok) {
        const votesData = await response.json()
        setVotes(prev => ({ ...prev, [requestId]: votesData }))
      }
    } catch (error) {
      console.error('Error fetching votes:', error)
    }
  }

  const handleVote = async (requestId: string, vote: boolean) => {
    if (!voteReason.trim() || voteReason.length < 20) {
      setError('Please provide at least 20 characters of reasoning for your vote')
      return
    }

    try {
      setVoting(true)
      setError(null)
      
      const response = await fetch(`${API_URL}/api/refund-requests/${requestId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vote: vote ? 'approve' : 'reject',
          reason: voteReason
        }),
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit vote')
      }

      // Refresh the refund requests and votes
      await fetchRefundRequests()
      await fetchVotes(requestId)
      setSelectedRequest(null)
      setVoteReason('')
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
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) return `${days}d ${hours}h remaining`
    if (hours > 0) return `${hours}h ${minutes}m remaining`
    return `${minutes}m remaining`
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-500', text: 'Pending' },
      APPROVED: { color: 'bg-green-500', text: 'Approved' },
      REJECTED: { color: 'bg-red-500', text: 'Rejected' },
      COMPLETED: { color: 'bg-blue-500', text: 'Completed' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'bg-gray-500', text: status }
    return (
      <span className={`px-2 py-1 text-xs font-medium text-white rounded-full ${config.color}`}>
        {config.text}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Refund Requests</h1>
        <p className="text-gray-400">
          Help the community by voting on refund requests. Earn tokens for participating in governance!
        </p>
      </div>

      <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-indigo-400 mb-3">How it works</h2>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
            <h3 className="font-medium text-indigo-400 mb-2">1. Review Requests</h3>
            <p className="text-gray-300">Read the refund reason and check if the bounty has helpful answers.</p>
          </div>
          <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
            <h3 className="font-medium text-indigo-400 mb-2">2. Vote Wisely</h3>
            <p className="text-gray-300">Approve legitimate refunds, reject attempts to get free help.</p>
          </div>
          <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
            <h3 className="font-medium text-indigo-400 mb-2">3. Earn Rewards</h3>
            <p className="text-gray-300">Get tokens and reputation points for participating in governance.</p>
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {refundRequests.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-white mb-2">No active refund requests</h3>
          <p className="text-gray-400">Check back later for new requests to vote on!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {refundRequests.map((request) => (
            <div key={request.id} className="bg-neutral-800 rounded-lg border border-neutral-700 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        Refund Request by @{request.requesterUsername}
                      </h3>
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-gray-400 text-sm mb-2">
                      <strong>Bounty:</strong> {request.bountyAmount} BBUX • <strong>Post:</strong> {request.postTitle}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {formatTimeRemaining(request.expiresAt)} • {request.communityVotes}/{request.requiredVotes} votes
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-yellow-400 font-semibold text-lg">{request.bountyAmount} BBUX</span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-white mb-2">Refund Reason:</h4>
                  <p className="text-gray-300 bg-neutral-700 p-3 rounded-lg">
                    {request.reason}
                  </p>
                </div>

                {/* Vote Results */}
                {votes[request.id] && votes[request.id].length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-white mb-2">Votes:</h4>
                    <div className="space-y-2">
                      {votes[request.id].map((vote) => (
                        <div key={vote.id} className="flex items-center justify-between bg-neutral-700 p-2 rounded">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">@{vote.voterUsername}</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              vote.vote ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                            }`}>
                              {vote.vote ? 'Approve' : 'Reject'}
                            </span>
                          </div>
                          {vote.reason && (
                            <span className="text-xs text-gray-400 truncate max-w-xs">
                              "{vote.reason}"
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {request.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedRequest(request.id)
                            if (!votes[request.id]) {
                              fetchVotes(request.id)
                            }
                          }}
                          disabled={voting}
                          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRequest(request.id)
                            if (!votes[request.id]) {
                              fetchVotes(request.id)
                            }
                          }}
                          disabled={voting}
                          className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>

                  <div className="text-xs text-gray-400">
                    {votes[request.id] && (
                      <span>
                        {votes[request.id].filter(v => v.vote).length} approve, {votes[request.id].filter(v => !v.vote).length} reject
                      </span>
                    )}
                  </div>
                </div>

                {/* Vote Modal */}
                {selectedRequest === request.id && request.status === 'PENDING' && (
                  <div className="mt-6 p-4 bg-neutral-700 rounded-lg border border-neutral-600">
                    <h4 className="text-indigo-400 font-medium mb-3">
                      Vote on Refund Request
                    </h4>
                    
                    {/* Anti-gaming requirements */}
                    <div className="mb-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded text-xs text-blue-300">
                      <p className="font-medium mb-1">Voting Requirements:</p>
                      <ul className="space-y-1 text-blue-200">
                        <li>• 50+ reputation points & 7+ days account age</li>
                        <li>• Must have previously engaged with this post</li>
                        <li>• Minimum 20 characters of reasoning required</li>
                        <li>• 5-minute minimum review time</li>
                        <li>• Max 10 votes per 24 hours</li>
                      </ul>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="voteReason" className="block text-sm font-medium text-gray-300 mb-2">
                        Reasoning for Vote *
                      </label>
                      <textarea
                        id="voteReason"
                        value={voteReason}
                        onChange={(e) => setVoteReason(e.target.value)}
                        required
                        minLength={20}
                        rows={3}
                        className="w-full px-3 py-2 bg-neutral-600 border border-neutral-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-400"
                        placeholder="Explain your vote reasoning (minimum 20 characters)..."
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        {voteReason.length}/20 characters minimum
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVote(request.id, true)}
                        disabled={voting || voteReason.length < 20}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {voting ? "Submitting..." : "Approve"}
                      </button>
                      <button
                        onClick={() => handleVote(request.id, false)}
                        disabled={voting || voteReason.length < 20}
                        className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {voting ? "Submitting..." : "Reject"}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRequest(null)
                          setVoteReason('')
                        }}
                        disabled={voting}
                        className="px-4 py-2 bg-neutral-600 text-white text-sm rounded-lg hover:bg-neutral-500 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RefundRequests 
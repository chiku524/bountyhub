import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthProvider'
import { useToast } from '../contexts/ToastContext'
import { config } from '../utils/config'

interface VoteButtonProps {
  itemId: string
  itemType: 'post' | 'comment'
  voteType: 'quality' | 'visibility'
  initialVotes: number
  userVote?: number
  onVoteChange?: (newVotes: number, newUserVote: number) => void
  className?: string
  /** Horizontal compact control for card footers; vertical is the list default. */
  orientation?: 'vertical' | 'horizontal'
}

export const VoteButton: React.FC<VoteButtonProps> = ({
  itemId,
  itemType,
  voteType,
  initialVotes,
  userVote = 0,
  onVoteChange,
  className = '',
  orientation = 'vertical',
}) => {
  const { user } = useAuth()
  const toast = useToast()
  const [votes, setVotes] = useState(initialVotes)
  const [userVoteState, setUserVoteState] = useState(userVote)
  const [loading, setLoading] = useState(false)

  const handleVote = async (value: number) => {
    if (!user) return

    setLoading(true)
    try {
      const endpoint = itemType === 'post' 
        ? `${config.api.baseUrl}/api/posts/${itemId}/vote`
        : `${config.api.baseUrl}/api/comments/${itemId}/vote`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          voteType,
          value
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to vote' }))
        throw new Error(errorData.error || 'Failed to vote')
      }

      const result = await response.json()
      setVotes(result.totalVotes)
      setUserVoteState(result.userVote)
      onVoteChange?.(result.totalVotes, result.userVote)
    } catch (error) {
      console.error('Vote error:', error)
      const msg = error instanceof Error ? error.message : 'Could not save your vote'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleUpvote = () => {
    if (userVoteState === 1) {
      handleVote(0) // Remove upvote
    } else {
      handleVote(1) // Add upvote
    }
  }

  const handleDownvote = () => {
    if (userVoteState === -1) {
      handleVote(0) // Remove downvote
    } else {
      handleVote(-1) // Add downvote
    }
  }

  const compact = orientation === 'horizontal'
  const btnSize = compact
    ? 'inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors'
    : 'inline-flex min-h-11 min-w-11 items-center justify-center rounded-md transition-colors'
  const iconClass = compact ? 'h-3.5 w-3.5' : 'h-5 w-5'

  return (
    <div
      className={
        compact
          ? `inline-flex items-center gap-0.5 ${className}`
          : `flex flex-col items-center justify-center space-y-1 ${className}`
      }
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleUpvote()
        }}
        disabled={loading || !user}
        className={`${btnSize} ${
          userVoteState === 1
            ? 'bg-green-500/20 text-green-500'
            : 'text-neutral-400 hover:bg-green-500/20 hover:text-green-500 dark:text-gray-400'
        } ${!user ? 'cursor-not-allowed opacity-50' : ''}`}
        title={!user ? 'Login to vote' : 'Upvote'}
      >
        <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20" aria-hidden>
          <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>

      <span
        className={
          compact
            ? 'min-w-6 text-center text-xs font-medium tabular-nums text-neutral-600 dark:text-neutral-300'
            : 'min-w-8 text-center text-sm font-medium text-gray-300'
        }
      >
        {votes}
      </span>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleDownvote()
        }}
        disabled={loading || !user}
        className={`${btnSize} ${
          userVoteState === -1
            ? 'bg-red-500/20 text-red-500'
            : 'text-neutral-400 hover:bg-red-500/20 hover:text-red-500 dark:text-gray-400'
        } ${!user ? 'cursor-not-allowed opacity-50' : ''}`}
        title={!user ? 'Login to vote' : 'Downvote'}
      >
        <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20" aria-hidden>
          <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  )
} 
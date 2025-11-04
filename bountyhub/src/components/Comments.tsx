import React, { useState, useEffect, useCallback, memo } from 'react'
import { useAuth } from '../contexts/AuthProvider'
import { LoadingSpinner } from './LoadingSpinner'
import { ErrorMessage } from './ErrorMessage'
import { ProfilePicture } from './ProfilePicture'
import { config } from '../utils/config'
import { Link } from 'react-router-dom'
import type { Comment } from '../types'

interface CommentsProps {
  postId: string
}

export const Comments: React.FC<CommentsProps> = memo(({ postId }) => {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [userVotes, setUserVotes] = useState<Record<string, number>>({})

  useEffect(() => {
    fetchComments()
  }, [postId])

  const fetchComments = async () => {
    try {
      const response = await fetch(`${config.api.baseUrl}/api/posts/${postId}/comments`, {
        credentials: 'include'
      })
      if (!response.ok) throw new Error('Failed to fetch comments')
      const data = await response.json()
      setComments(data.comments || data)
      setUserVotes(data.userVotes || {})
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = useCallback(async (commentId: string, value: number) => {
    if (!user) return

    try {
      const response = await fetch(`${config.api.baseUrl}/api/posts/${postId}/comments/${commentId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ value })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to vote' }))
        throw new Error(errorData.error || 'Failed to vote')
      }

      const result = await response.json()
      
      // Update comment vote counts
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, upvotes: result.upvotes, downvotes: result.downvotes }
          : comment
      ))

      // Update user's vote state
      setUserVotes(prev => ({
        ...prev,
        [commentId]: result.userVote
      }))
    } catch (err: any) {
      console.error('Vote error:', err)
      // You could show a toast notification here
    }
  }, [user, postId])

  const handleSubmitComment = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newComment.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch(`${config.api.baseUrl}/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: newComment.trim()
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to post comment' }))
        throw new Error(errorData.error || 'Failed to post comment')
      }
      
      const newCommentData = await response.json()
      setComments(prev => [newCommentData, ...prev])
      setNewComment('')
      setError(null) // Clear any previous errors
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }, [user, postId, newComment])

  const VoteButtons = ({ comment }: { comment: Comment }) => {
    const userVote = userVotes[comment.id] || 0
    const totalVotes = comment.upvotes - comment.downvotes

    return (
      <div className="flex items-center space-x-1">
        {/* Upvote Button */}
        <button
          onClick={() => handleVote(comment.id, userVote === 1 ? 0 : 1)}
          className={`p-1 rounded transition-colors ${
            userVote === 1 
              ? 'text-green-400 hover:text-green-300' 
              : 'text-gray-400 hover:text-green-400'
          }`}
          title="Upvote"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Vote Count */}
        <span className={`text-sm font-medium px-1 min-w-[2rem] text-center ${
          totalVotes > 0 ? 'text-green-400' : 
          totalVotes < 0 ? 'text-red-400' : 
          'text-gray-400'
        }`}>
          {totalVotes}
        </span>

        {/* Downvote Button */}
        <button
          onClick={() => handleVote(comment.id, userVote === -1 ? 0 : -1)}
          className={`p-1 rounded transition-colors ${
            userVote === -1 
              ? 'text-red-400 hover:text-red-300' 
              : 'text-gray-400 hover:text-red-400'
          }`}
          title="Downvote"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-white mb-4">Comments</h3>
        <LoadingSpinner size="md" />
      </div>
    )
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-white mb-4">
        Comments ({comments.length})
      </h3>

      {error && (
        <ErrorMessage 
          message={error} 
          onRetry={fetchComments}
          className="mb-4"
        />
      )}

      {/* Add Comment Form */}
      {user && (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full p-3 bg-neutral-800 border border-neutral-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            rows={3}
            disabled={submitting}
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-neutral-800 pr-2">
        {comments.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No comments yet. Be the first to comment!</p>
        ) : (
          comments
            .sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)) // Sort by vote count (highest first)
            .map((comment) => (
            <div key={comment.id} className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <ProfilePicture user={comment.author} size="sm" />
                  <span className="text-indigo-400 font-medium">
                    <Link 
                      to={`/users/${comment.author?.username}`}
                      className="hover:text-indigo-300 hover:underline transition-colors"
                    >
                      {comment.author?.username || `User ${comment.authorId}`}
                    </Link>
                  </span>
                  <span className="text-gray-500 text-sm">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <VoteButtons comment={comment} />
              </div>
              <p className="text-gray-300 whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}) 
import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthProvider'
import { LoadingSpinner } from './LoadingSpinner'
import { ErrorMessage } from './ErrorMessage'
import type { Comment } from '../types'

interface CommentsProps {
  postId: string
}

export const Comments: React.FC<CommentsProps> = ({ postId }) => {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [postId])

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`)
      if (!response.ok) throw new Error('Failed to fetch comments')
      const data = await response.json()
      setComments(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newComment.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment.trim(),
          authorId: user.id
        })
      })

      if (!response.ok) throw new Error('Failed to post comment')
      
      const newCommentData = await response.json()
      setComments(prev => [newCommentData, ...prev])
      setNewComment('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
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
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-indigo-400 font-medium">User {comment.authorId}</span>
                  <span className="text-gray-500 text-sm">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>👍 {comment.upvotes}</span>
                  <span>👎 {comment.downvotes}</span>
                </div>
              </div>
              <p className="text-gray-300 whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 
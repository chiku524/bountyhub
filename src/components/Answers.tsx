import React, { useState, useEffect, useCallback, memo } from 'react'
import { useAuth } from '../contexts/AuthProvider'
import { LoadingSpinner } from './LoadingSpinner'
import { ErrorMessage } from './ErrorMessage'
import { CodeBlockEditor } from './CodeBlockEditor'
import { ProfilePicture } from './ProfilePicture'
import { config } from '../utils/config'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'
import { ConfirmDialog } from './ConfirmDialog'
import type { Answer, Post, CodeBlock } from '../types'

interface AnswersProps {
  postId: string
  post: Post
  /** Called after the post's state changes (e.g. an answer was accepted and the bounty paid). */
  onPostChanged?: () => void
}

export const Answers: React.FC<AnswersProps> = memo(({ postId, post, onPostChanged }) => {
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const loginHref = `/login?redirectTo=${encodeURIComponent(location.pathname + location.search)}`
  const [acceptTarget, setAcceptTarget] = useState<Answer | null>(null)
  const [accepting, setAccepting] = useState(false)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newAnswer, setNewAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [userVotes, setUserVotes] = useState<Record<string, number>>({})
  const [answerCodeBlocks, setAnswerCodeBlocks] = useState<CodeBlock[]>([])

  useEffect(() => {
    fetchAnswers()
  }, [postId])

  const fetchAnswers = async () => {
    try {
      const response = await fetch(`${config.api.baseUrl}/api/posts/${postId}/answers`, {
        credentials: 'include'
      })
      if (!response.ok) throw new Error('Failed to fetch answers')
      const data = await response.json()
      setAnswers(data.answers || data)
      setUserVotes(data.userVotes || {})
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = useCallback(async (answerId: string, value: number) => {
    if (!user) {
      toast.info('Log in to vote on answers.')
      navigate(loginHref)
      return
    }
    try {
      const response = await fetch(`${config.api.baseUrl}/api/posts/${postId}/answers/${answerId}/vote`, {
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
      
      // Update answer vote counts
      setAnswers(prev => prev.map(answer => 
        answer.id === answerId 
          ? { ...answer, upvotes: result.upvotes, downvotes: result.downvotes }
          : answer
      ))

      // Update user's vote state
      setUserVotes(prev => ({
        ...prev,
        [answerId]: result.userVote
      }))
    } catch (err: any) {
      toast.error(err?.message || 'Failed to vote')
    }
  }, [user, postId, toast, navigate, loginHref])

  const handleAcceptAnswer = useCallback(async (answerId: string) => {
    if (!user || user.id !== post.authorId) return
    setAccepting(true)
    try {
      const response = await fetch(`${config.api.baseUrl}/api/posts/${postId}/answers/${answerId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to accept answer' }))
        throw new Error(errorData.error || 'Failed to accept answer')
      }

      // Update the answer to show it's accepted
      setAnswers(prev => prev.map(answer => ({
        ...answer,
        isAccepted: answer.id === answerId
      })))
      toast.success(
        post.reward && post.reward > 0
          ? `Answer accepted. ${post.reward} BBUX bounty released.`
          : 'Answer accepted.'
      )
      setAcceptTarget(null)
      onPostChanged?.()
    } catch (err: any) {
      toast.error(err?.message || 'Failed to accept answer')
    } finally {
      setAccepting(false)
    }
  }, [user, post, postId, toast, onPostChanged])

  const handleSubmitAnswer = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newAnswer.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch(`${config.api.baseUrl}/api/posts/${postId}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: newAnswer.trim(),
          codeBlocks: answerCodeBlocks
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to post answer' }))
        throw new Error(errorData.error || 'Failed to post answer')
      }
      
      const newAnswerData = await response.json()
      setAnswers(prev => [newAnswerData, ...prev])
      setNewAnswer('')
      setAnswerCodeBlocks([])
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }, [user, postId, newAnswer, answerCodeBlocks])

  const handleAddCodeBlock = useCallback((codeBlock: CodeBlock) => {
    setAnswerCodeBlocks(prev => [...prev, codeBlock])
  }, [])

  const handleRemoveCodeBlock = useCallback((index: number) => {
    setAnswerCodeBlocks(prev => prev.filter((_, i) => i !== index))
  }, [])

  const VoteButtons = ({ answer }: { answer: Answer }) => {
    const userVote = userVotes[answer.id] || 0
    const totalVotes = answer.upvotes - answer.downvotes

    return (
      <div className="flex items-center space-x-1">
        {/* Upvote Button */}
        <button
          onClick={() => handleVote(answer.id, userVote === 1 ? 0 : 1)}
          className={`p-1 rounded transition-colors ${
            userVote === 1 
              ? 'text-green-400 hover:text-green-300' 
              : 'text-neutral-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400'
          }`}
          title="Upvote"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Vote Count */}
        <span className={`text-sm font-medium px-1 min-w-8 text-center ${
          totalVotes > 0 ? 'text-green-400' : 
          totalVotes < 0 ? 'text-red-400' : 
          'text-neutral-500 dark:text-gray-400'
        }`}>
          {totalVotes}
        </span>

        {/* Downvote Button */}
        <button
          onClick={() => handleVote(answer.id, userVote === -1 ? 0 : -1)}
          className={`p-1 rounded transition-colors ${
            userVote === -1 
              ? 'text-red-400 hover:text-red-300' 
              : 'text-neutral-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400'
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
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">Answers</h3>
        <LoadingSpinner size="md" />
      </div>
    )
  }

  const isAuthor = Boolean(user && user.id === post.authorId)
  const hasAcceptedAnswer = answers.some((a) => a.isAccepted)
  const isOpen = post.status === 'OPEN'
  const hasBounty = Boolean(post.reward && post.reward > 0)
  const stickyCtaLabel = !user
    ? 'Sign in to answer'
    : isAuthor && hasBounty && isOpen
      ? 'Review answers to pay'
      : hasBounty && isOpen
        ? `Answer for ${post.reward} BBUX`
        : 'Write an answer'

  const scrollToPrimary = () => {
    if (!user) {
      navigate(loginHref)
      return
    }
    const target = isAuthor
      ? document.getElementById('post-answers-list')
      : document.getElementById('post-answer-form')
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    if (!isAuthor) {
      window.setTimeout(() => document.getElementById('answer-content')?.focus(), 350)
    }
  }

  return (
    <div className="mt-8 pb-24 md:pb-0">
      <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
        Answers ({answers.length})
      </h3>

      {error && (
        <ErrorMessage 
          message={error} 
          onRetry={fetchAnswers}
          className="mb-4"
        />
      )}

      {/* Add Answer Form */}
      {user && (
        <form id="post-answer-form" onSubmit={handleSubmitAnswer} className="mb-6 scroll-mt-24">
          <textarea
            id="answer-content"
            name="answerContent"
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            placeholder="Write your answer..."
            className="w-full p-3 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none"
            rows={6}
            disabled={submitting}
          />
          
          {/* Code Block Editor */}
          <div className="mt-4">
            <CodeBlockEditor 
              onAdd={handleAddCodeBlock}
              onCancel={() => {}} // No-op since we don't need to cancel the entire form
            />
          </div>

          {/* Display Added Code Blocks */}
          {answerCodeBlocks.length > 0 && (
            <div className="mt-4 space-y-3">
              <h4 className="text-sm font-medium text-neutral-700 dark:text-gray-300">Added Code Blocks:</h4>
              {answerCodeBlocks.map((block, index) => (
                <div key={index} className="bg-white dark:bg-neutral-900/80 rounded-lg p-4 border border-violet-300 dark:border-violet-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-1 bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 rounded-sm text-sm">
                      {block.language}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCodeBlock(index)}
                      className="text-neutral-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      title="Remove code block"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <pre className="bg-white dark:bg-neutral-900/80 p-4 rounded-lg overflow-x-auto max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-neutral-800 border border-neutral-200 dark:border-neutral-700">
                    <code className="text-sm text-neutral-900 dark:text-gray-300">{block.code}</code>
                  </pre>
                  {block.description && (
                    <p className="mt-2 text-sm text-neutral-600 dark:text-gray-400">{block.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={!newAnswer.trim() || submitting}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Posting...' : 'Post Answer'}
            </button>
          </div>
        </form>
      )}

      {/* Answers List */}
      <div
        id="post-answers-list"
        className="space-y-4 max-h-[600px] scroll-mt-24 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-neutral-800 pr-2"
      >
        {answers.length === 0 ? (
          <p className="text-neutral-500 dark:text-gray-400 text-center py-4">No answers yet. Be the first to answer!</p>
        ) : (
          answers
            .sort((a, b) => {
              // Sort by acceptance first, then by vote count
              if (a.isAccepted && !b.isAccepted) return -1
              if (!a.isAccepted && b.isAccepted) return 1
              return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)
            })
            .map((answer) => (
            <div key={answer.id} className={`bg-white dark:bg-neutral-800/50 rounded-lg p-4 border ${
              answer.isAccepted 
                ? 'border-green-500 dark:border-green-500 bg-green-50 dark:bg-green-900/20' 
                : 'border-neutral-200 dark:border-neutral-700'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <ProfilePicture user={answer.author} size="sm" />
                  <span className="text-indigo-400 font-medium">
                    <Link 
                      to={`/users/${answer.author?.username}`}
                      className="hover:text-indigo-300 hover:underline transition-colors"
                    >
                      {answer.author?.username || `User ${answer.authorId}`}
                    </Link>
                  </span>
                  <span className="text-neutral-500 dark:text-gray-500 text-sm">
                    {new Date(answer.createdAt).toLocaleDateString()}
                  </span>
                  {answer.isAccepted && (
                    <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full font-medium">
                      ✓ Accepted
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <VoteButtons answer={answer} />
                  {user && user.id === post.authorId && !answer.isAccepted && !hasAcceptedAnswer && answer.authorId !== user.id && (
                    <button
                      type="button"
                      onClick={() => setAcceptTarget(answer)}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-sm transition-colors"
                      title="Accept this answer"
                    >
                      Accept
                    </button>
                  )}
                </div>
              </div>
              <p className="text-neutral-700 dark:text-gray-300 whitespace-pre-wrap">{answer.content}</p>
              
              {/* Code Blocks */}
              {answer.codeBlocks && answer.codeBlocks.length > 0 && (
                <div className="mt-4 space-y-3">
                  <h4 className="text-sm font-medium text-neutral-700 dark:text-gray-300">Code Blocks:</h4>
                  {answer.codeBlocks.map((block, index) => (
                    <div key={index} className="bg-white dark:bg-neutral-900/80 rounded-lg p-4 border border-violet-300 dark:border-violet-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 rounded-sm text-sm">
                          {block.language}
                        </span>
                      </div>
                      <pre className="bg-white dark:bg-neutral-900/80 p-4 rounded-lg overflow-x-auto max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-neutral-800 border border-neutral-200 dark:border-neutral-700">
                        <code className="text-sm text-neutral-900 dark:text-gray-300">{block.code}</code>
                      </pre>
                      {block.description && (
                        <p className="mt-2 text-sm text-neutral-600 dark:text-gray-400">{block.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Mobile sticky primary CTA — sits left of Guide FAB */}
      {isOpen && (
        <div
          className="fixed inset-x-0 z-40 border-t border-neutral-200/80 bg-white/95 px-3 pt-2 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-900/95 md:hidden"
          style={{
            bottom: 0,
            paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))',
            paddingRight: 'max(5rem, calc(env(safe-area-inset-right, 0px) + 4.5rem))',
          }}
        >
          <button
            type="button"
            onClick={scrollToPrimary}
            className="btn-primary w-full min-h-11 justify-center text-sm font-semibold"
          >
            {stickyCtaLabel}
          </button>
        </div>
      )}
      <ConfirmDialog
        open={acceptTarget !== null}
        title={hasBounty ? `Accept this answer and pay ${post.reward} BBUX?` : 'Accept this answer?'}
        confirmLabel={hasBounty ? `Accept and pay ${post.reward} BBUX` : 'Accept answer'}
        busy={accepting}
        onCancel={() => setAcceptTarget(null)}
        onConfirm={() => acceptTarget && handleAcceptAnswer(acceptTarget.id)}
      >
        <p>
          {hasBounty
            ? `The bounty goes to ${acceptTarget?.author?.username ?? 'this answer\'s author'} and the question is marked completed. This can't be undone.`
            : 'The question will be marked completed. This can\'t be undone.'}
        </p>
      </ConfirmDialog>
    </div>
  )
}) 
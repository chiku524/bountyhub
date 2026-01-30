import React, { useState } from 'react'
import { FiStar, FiX } from 'react-icons/fi'
import { config } from '../utils/config'

interface IntegrityRatingModalProps {
  isOpen: boolean
  onClose: () => void
  targetUser: {
    id: string
    username: string
    integrityScore: number
    totalRatings: number
  }
  context?: string
  referenceId?: string
  referenceType?: string
}

const ratingContexts = [
  {
    value: 'BOUNTY_REJECTION',
    label: 'Bounty Rejection',
    description: 'User rejected a valid answer to their bounty question',
  },
  {
    value: 'ANSWER_QUALITY',
    label: 'Answer Quality',
    description: 'User provided poor quality or incorrect answers',
  },
  {
    value: 'COMMUNICATION',
    label: 'Communication',
    description: 'User was unresponsive or difficult to communicate with',
  },
  {
    value: 'SPAM',
    label: 'Spam',
    description: 'User posted spam or irrelevant content',
  },
  {
    value: 'HARASSMENT',
    label: 'Harassment',
    description: 'User engaged in harassing behavior',
  },
  {
    value: 'GENERAL',
    label: 'General Behavior',
    description: 'General behavior or conduct issues',
  },
]

export default function IntegrityRatingModal({
  isOpen,
  onClose,
  targetUser,
  context = 'GENERAL',
  referenceId,
  referenceType,
}: IntegrityRatingModalProps) {
  const [rating, setRating] = useState(5)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [selectedContext, setSelectedContext] = useState(context)
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!reason.trim()) {
      alert('Please provide a reason for your rating')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`${config.api.baseUrl}/api/integrity/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ratedUserId: targetUser.id,
          rating,
          reason: reason.trim(),
          context: selectedContext,
          referenceId,
          referenceType,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        alert('Rating submitted successfully')
        onClose()
        // Optionally refresh the page or update the integrity score
        window.location.reload()
      } else {
        alert(result.error || 'Failed to submit rating')
      }
    } catch (error) {
      console.error('Error submitting rating:', error)
      alert('Failed to submit rating')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRatingDescription = (rating: number): string => {
    if (rating >= 9) return 'Exceptional integrity'
    if (rating >= 8) return 'Excellent integrity'
    if (rating >= 7) return 'Good integrity'
    if (rating >= 6) return 'Fair integrity'
    if (rating >= 5) return 'Average integrity'
    if (rating >= 4) return 'Below average integrity'
    if (rating >= 3) return 'Poor integrity'
    if (rating >= 2) return 'Very poor integrity'
    return 'Unacceptable integrity'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-neutral-800 rounded-lg p-6 w-full max-w-md mx-4 border border-violet-500/30">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-violet-300">Rate {targetUser.username}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating Stars */}
          <div>
            <label className="block text-sm font-medium text-violet-300 mb-2" htmlFor="rating">
              Integrity Rating (1-10)
            </label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className={`p-1 transition-colors ${
                    star <= (hoveredRating || rating)
                      ? 'text-yellow-400'
                      : 'text-gray-400'
                  }`}
                >
                  <FiStar className="w-6 h-6 fill-current" />
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-400 mt-1">
              {rating}/10 - {getRatingDescription(rating)}
            </p>
          </div>

          {/* Context Selection */}
          <div>
            <label className="block text-sm font-medium text-violet-300 mb-2" htmlFor="context">
              Context
            </label>
            <select
              id="context"
              value={selectedContext}
              onChange={(e) => setSelectedContext(e.target.value)}
              className="w-full bg-neutral-700 border border-violet-500/30 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:ring-2 focus:ring-violet-500"
            >
              {ratingContexts.map((ctx) => (
                <option key={ctx.value} value={ctx.value}>
                  {ctx.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              {ratingContexts.find(ctx => ctx.value === selectedContext)?.description}
            </p>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-violet-300 mb-2" htmlFor="reason">
              Reason (required)
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a detailed reason for your rating..."
              className="w-full bg-neutral-700 border border-violet-500/30 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:ring-2 focus:ring-violet-500 resize-none"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-400 mt-1">
              {reason.length}/500 characters
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reason.trim()}
              className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 
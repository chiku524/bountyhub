import React, { useState, useEffect } from 'react';
import { useFetcher } from '@remix-run/react';
import { FiStar, FiX, FiAlertCircle } from 'react-icons/fi';

interface IntegrityRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: {
    id: string;
    username: string;
  };
  context?: string;
  referenceId?: string;
  referenceType?: string;
}

const RATING_CONTEXTS = [
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
];

export default function IntegrityRatingModal({
  isOpen,
  onClose,
  targetUser,
  context = 'GENERAL',
  referenceId,
  referenceType,
}: IntegrityRatingModalProps) {
  const [rating, setRating] = useState(5);
  const [selectedContext, setSelectedContext] = useState(context);
  const [reason, setReason] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const fetcher = useFetcher();

  const isSubmitting = fetcher.state === 'submitting';

  useEffect(() => {
    if ((fetcher.data as any)?.success) {
      onClose();
      setRating(5);
      setReason('');
      setSelectedContext(context);
    }
  }, [fetcher.data, onClose, context]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('ratedUserId', targetUser.id);
    formData.append('rating', rating.toString());
    formData.append('reason', reason);
    formData.append('context', selectedContext);
    if (referenceId) formData.append('referenceId', referenceId);
    if (referenceType) formData.append('referenceType', referenceType);

    fetcher.submit(formData, {
      method: 'post',
      action: '/api/integrity/rate',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-neutral-800 rounded-lg p-6 w-full max-w-md mx-4 border-2 border-violet-500/50 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Rate User Integrity</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-300">
            Rating <span className="text-violet-400 font-semibold">{targetUser.username}</span>
          </p>
        </div>

        <fetcher.Form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating Stars */}
          <div>
            <label className="block text-sm font-medium text-violet-300 mb-2">
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
            <label className="block text-sm font-medium text-violet-300 mb-2">
              Rating Context
            </label>
            <select
              value={selectedContext}
              onChange={(e) => setSelectedContext(e.target.value)}
              className="w-full bg-neutral-700 border border-violet-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500"
            >
              {RATING_CONTEXTS.map((ctx) => (
                <option key={ctx.value} value={ctx.value}>
                  {ctx.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              {RATING_CONTEXTS.find(c => c.value === selectedContext)?.description}
            </p>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-violet-300 mb-2">
              Reason for Rating
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why you're giving this rating..."
              className="w-full bg-neutral-700 border border-violet-500/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500 resize-none"
              rows={3}
              maxLength={500}
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              {reason.length}/500 characters
            </p>
          </div>

          {/* Error Display */}
          {(fetcher.data as any)?.error && (
            <div className="flex items-center space-x-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{(fetcher.data as any).error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors border border-neutral-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reason.trim()}
              className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:bg-neutral-600 disabled:cursor-not-allowed transition-colors border border-violet-500/50 shadow-[0_0_10px_rgba(139,92,246,0.3)]"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </fetcher.Form>
      </div>
    </div>
  );
}

function getRatingDescription(rating: number): string {
  if (rating >= 9) return 'Exceptional integrity';
  if (rating >= 8) return 'Excellent integrity';
  if (rating >= 7) return 'Good integrity';
  if (rating >= 6) return 'Fair integrity';
  if (rating >= 5) return 'Average integrity';
  if (rating >= 4) return 'Below average integrity';
  if (rating >= 3) return 'Poor integrity';
  if (rating >= 2) return 'Very poor integrity';
  return 'Unacceptable integrity';
} 
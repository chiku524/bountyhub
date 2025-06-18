import React, { useState } from 'react';
import { FiStar, FiTrendingUp, FiTrendingDown, FiShield } from 'react-icons/fi';
import IntegrityRatingModal from './IntegrityRatingModal';

interface IntegrityDisplayProps {
  user: {
    id: string;
    username: string;
    integrityScore: number;
    totalRatings: number;
  };
  currentUserId?: string;
  canRate?: boolean;
  context?: string;
  referenceId?: string;
  referenceType?: string;
}

export default function IntegrityDisplay({
  user,
  currentUserId,
  canRate = false,
  context,
  referenceId,
  referenceType,
}: IntegrityDisplayProps) {
  const [showRatingModal, setShowRatingModal] = useState(false);

  const integrityLevel = getIntegrityLevel(user.integrityScore);
  const integrityColor = getIntegrityColor(user.integrityScore);

  return (
    <>
      <div className="bg-neutral-700/50 rounded-lg p-4 border border-violet-500/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <FiShield className="w-5 h-5 text-violet-400" />
            <h3 className="text-lg font-semibold text-violet-300">Integrity Score</h3>
          </div>
          {canRate && currentUserId !== user.id && (
            <button
              onClick={() => setShowRatingModal(true)}
              className="px-3 py-1.5 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors border border-violet-500/50 shadow-[0_0_10px_rgba(139,92,246,0.3)]"
            >
              Rate User
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Score Display */}
          <div className="text-center">
            <div className={`text-3xl font-bold ${integrityColor}`}>
              {user.integrityScore.toFixed(1)}
            </div>
            <div className="text-sm text-gray-400">out of 10</div>
            <div className={`text-sm font-medium ${integrityColor} mt-1`}>
              {integrityLevel}
            </div>
          </div>

          {/* Rating Stars */}
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center space-x-1 mb-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                <FiStar
                  key={star}
                  className={`w-4 h-4 ${
                    star <= user.integrityScore
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-400'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-400">
              {user.totalRatings} rating{user.totalRatings !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Integrity Level Badge */}
        <div className="mt-3 flex justify-center">
          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getIntegrityBadgeStyle(user.integrityScore)}`}>
            {integrityLevel} Integrity
          </div>
        </div>

        {/* Quick Stats */}
        {user.totalRatings > 0 && (
          <div className="mt-4 pt-3 border-t border-violet-500/20">
            <div className="text-xs text-gray-400 text-center">
              Based on {user.totalRatings} community rating{user.totalRatings !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>

      {/* Rating Modal */}
      <IntegrityRatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        targetUser={user}
        context={context}
        referenceId={referenceId}
        referenceType={referenceType}
      />
    </>
  );
}

function getIntegrityLevel(score: number): string {
  if (score >= 9.0) return 'Exceptional';
  if (score >= 8.0) return 'Excellent';
  if (score >= 7.0) return 'Good';
  if (score >= 6.0) return 'Fair';
  if (score >= 5.0) return 'Average';
  if (score >= 4.0) return 'Below Average';
  if (score >= 3.0) return 'Poor';
  if (score >= 2.0) return 'Very Poor';
  return 'Unacceptable';
}

function getIntegrityColor(score: number): string {
  if (score >= 8.0) return 'text-green-400';
  if (score >= 6.0) return 'text-yellow-400';
  if (score >= 4.0) return 'text-orange-400';
  return 'text-red-400';
}

function getIntegrityBadgeStyle(score: number): string {
  if (score >= 8.0) {
    return 'bg-green-500/20 text-green-400 border-green-500/50';
  }
  if (score >= 6.0) {
    return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
  }
  if (score >= 4.0) {
    return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
  }
  return 'bg-red-500/20 text-red-400 border-red-500/50';
} 
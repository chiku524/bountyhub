import React, { useState } from 'react';
import { FiShield, FiStar } from 'react-icons/fi';
import IntegrityRatingModal from './IntegrityRatingModal';

interface IntegrityRatingButtonProps {
  targetUser: {
    id: string;
    username: string;
  };
  context: string;
  referenceId?: string;
  referenceType?: string;
  className?: string;
  variant?: 'button' | 'icon' | 'badge';
}

export default function IntegrityRatingButton({
  targetUser,
  context,
  referenceId,
  referenceType,
  className = '',
  variant = 'button'
}: IntegrityRatingButtonProps) {
  const [showModal, setShowModal] = useState(false);

  const getContextDescription = (context: string): string => {
    const descriptions: { [key: string]: string } = {
      'BOUNTY_REJECTION': 'Rate bounty rejection',
      'ANSWER_QUALITY': 'Rate answer quality',
      'COMMUNICATION': 'Rate communication',
      'SPAM': 'Rate spam behavior',
      'HARASSMENT': 'Rate harassment',
      'GENERAL': 'Rate general behavior'
    };
    return descriptions[context] || 'Rate user';
  };

  const renderButton = () => {
    switch (variant) {
      case 'icon':
        return (
          <button
            onClick={() => setShowModal(true)}
            className={`p-2 text-gray-400 hover:text-violet-400 transition-colors rounded-lg hover:bg-violet-500/10 ${className}`}
            title={getContextDescription(context)}
          >
            <FiShield className="w-4 h-4" />
          </button>
        );
      
      case 'badge':
        return (
          <button
            onClick={() => setShowModal(true)}
            className={`inline-flex items-center gap-1 px-2 py-1 text-xs bg-violet-500/20 text-violet-300 rounded-full border border-violet-500/30 hover:bg-violet-500/30 transition-colors ${className}`}
            title={getContextDescription(context)}
          >
            <FiStar className="w-3 h-3" />
            Rate
          </button>
        );
      
      default:
        return (
          <button
            onClick={() => setShowModal(true)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors border border-violet-500/50 shadow-[0_0_10px_rgba(139,92,246,0.3)] ${className}`}
          >
            <FiShield className="w-4 h-4" />
            Rate Integrity
          </button>
        );
    }
  };

  return (
    <>
      {renderButton()}
      
      <IntegrityRatingModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        targetUser={targetUser}
        context={context}
        referenceId={referenceId}
        referenceType={referenceType}
      />
    </>
  );
} 
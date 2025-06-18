import { useState } from 'react';
import { Form } from '@remix-run/react';
import portalTokenInfo from '../../portal-token-info';

const TOKEN_SYMBOL = portalTokenInfo.config.symbol;
const TOKEN_DECIMALS = portalTokenInfo.config.decimals;

interface BountyModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  onSubmit: (amount: number, expiresAt: Date | null) => Promise<void>;
  existingBounty?: {
    id: string;
    amount: string;
    expiresAt: string;
    status: string;
  } | null;
}

export function BountyModal({ isOpen, onClose, postId, onSubmit, existingBounty }: BountyModalProps) {
  const [amount, setAmount] = useState<string>(existingBounty?.amount || '');
  const [expiresAt, setExpiresAt] = useState<string>(existingBounty?.expiresAt ? new Date(existingBounty.expiresAt).toISOString().slice(0, 16) : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!existingBounty;
  const modalTitle = isEditing ? 'Edit Bounty' : 'Create Bounty';
  const submitButtonText = isSubmitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Bounty' : 'Create Bounty');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      setError(null);

      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Please enter a valid amount');
      }

      const expiresAtDate = expiresAt ? new Date(expiresAt) : null;
      if (expiresAtDate && expiresAtDate < new Date()) {
        throw new Error('Expiration date must be in the future');
      }

      await onSubmit(amountNum, expiresAtDate);
      setAmount('');
      setExpiresAt('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setAmount('');
      setExpiresAt('');
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-800 rounded-xl shadow-2xl max-w-md w-full border border-violet-500/30">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">{modalTitle}</h2>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <Form method="post" onSubmit={handleSubmit} className="space-y-6">
            <input type="hidden" name="postId" value={postId} />
            <input type="hidden" name="action" value="createBounty" />

            <div>
              <label htmlFor="amount" className="block text-lg font-medium text-gray-200 mb-2">
                Bounty Amount ({TOKEN_SYMBOL})
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.001"
                min="0.001"
                required
                className="w-full px-4 py-3 text-lg rounded-lg border-gray-600 bg-neutral-700 text-white shadow-sm focus:border-violet-500 focus:ring-violet-500 focus:ring-2 transition-colors"
                placeholder="0.1"
              />
              <p className="mt-1 text-sm text-gray-400">Minimum: 0.001 {TOKEN_SYMBOL}</p>
            </div>

            <div>
              <label htmlFor="expiresAt" className="block text-lg font-medium text-gray-200 mb-2">
                Expiration Date (Optional)
              </label>
              <input
                type="datetime-local"
                id="expiresAt"
                name="expiresAt"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-4 py-3 text-lg rounded-lg border-gray-600 bg-neutral-700 text-white shadow-sm focus:border-violet-500 focus:ring-violet-500 focus:ring-2 transition-colors"
              />
              <p className="mt-1 text-sm text-gray-400">Leave empty for no expiration</p>
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-500/30">
                {error}
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 text-lg font-medium text-gray-300 bg-neutral-700 rounded-lg hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 text-lg font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50 transition-colors"
              >
                {submitButtonText}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
} 
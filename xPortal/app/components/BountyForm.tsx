import { useState } from 'react';
import { Form } from '@remix-run/react';
import portalTokenInfo from '../../portal-token-info';

const TOKEN_SYMBOL = portalTokenInfo.config.symbol;
const TOKEN_DECIMALS = portalTokenInfo.config.decimals;

interface BountyFormProps {
  postId: string;
  onSubmit: (amount: number, expiresAt: Date | null) => Promise<void>;
}

export function BountyForm({ postId, onSubmit }: BountyFormProps) {
  const [amount, setAmount] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form method="post" onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="postId" value={postId} />
      <input type="hidden" name="action" value="createBounty" />

      <div>
        <label htmlFor="amount" className="block text-lg font-medium text-gray-700 mb-2">
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
          className="mt-1 block w-full px-4 py-3 text-lg rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-2 transition-colors"
          placeholder="0.1"
        />
        <p className="mt-1 text-sm text-gray-500">Minimum: 0.001 {TOKEN_SYMBOL}</p>
      </div>

      <div>
        <label htmlFor="expiresAt" className="block text-lg font-medium text-gray-700 mb-2">
          Expiration Date (Optional)
        </label>
        <input
          type="datetime-local"
          id="expiresAt"
          name="expiresAt"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          className="mt-1 block w-full px-4 py-3 text-lg rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-2 transition-colors"
        />
        <p className="mt-1 text-sm text-gray-500">Leave empty for no expiration</p>
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full inline-flex justify-center rounded-lg border border-transparent bg-indigo-600 py-3 px-6 text-lg font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? 'Creating Bounty...' : 'Create Bounty'}
      </button>
    </Form>
  );
} 
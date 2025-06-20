import { useState } from "react";
import { Form, useActionData, useNavigation } from "@remix-run/react";

interface RefundRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  bountyId: string;
  bountyAmount: number;
  canRefund: boolean;
  waitTime?: number;
}

export function RefundRequestModal({
  isOpen,
  onClose,
  bountyId,
  bountyAmount,
  canRefund,
  waitTime
}: RefundRequestModalProps) {
  const [reason, setReason] = useState("");
  const actionData = useActionData<any>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  if (!isOpen) return null;

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-neutral-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold text-white mb-4">Request Bounty Refund</h2>
        
        {actionData?.error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-4">
            <p className="text-red-400 text-sm">
              {actionData.error} {actionData.waitTime ? `Must wait ${Math.ceil(actionData.waitTime)} more hours.` : ''}
            </p>
          </div>
        )}

        {actionData?.success && (
          <div className="bg-green-900/20 border border-green-500 rounded-lg p-4 mb-4">
            <p className="text-green-400 text-sm">{actionData.message}</p>
          </div>
        )}

        <div className="mb-4">
          <p className="text-gray-300 text-sm mb-2">
            Bounty Amount: <span className="text-yellow-400 font-semibold">{bountyAmount} SOL</span>
          </p>
          <p className="text-gray-400 text-xs">
            Community will vote on your refund request within 48 hours. 
            If approved, you'll receive a refund minus any penalties for helpful answers.
            A 5% fee goes to community governance rewards.
          </p>
        </div>

        <Form method="post" action="/api/refund/request">
          <input type="hidden" name="bountyId" value={bountyId} />
          
          <div className="mb-4">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-300 mb-2">
              Reason for Refund *
            </label>
            <textarea
              id="reason"
              name="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              minLength={10}
              maxLength={500}
              rows={4}
              className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Explain why you need a refund (minimum 10 characters)..."
              disabled={!canRefund || isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              {reason.length}/500 characters
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canRefund || isSubmitting || reason.length < 10}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Request Refund"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
} 
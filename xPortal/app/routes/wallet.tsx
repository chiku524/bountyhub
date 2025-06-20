import { json, type LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData, Form, useActionData, useNavigation, useRouteError, isRouteErrorResponse } from "@remix-run/react";
import { getWalletDetails } from "~/utils/virtual-wallet.server";
import { getUser } from "~/utils/auth.server";
import { createDb } from "~/utils/db.server";
import { useState } from "react";
import { Layout } from "~/components/Layout";
import { DirectDeposit } from "~/components/DirectDeposit";
import bountyBucksInfo from '../../bounty-bucks-info.json';
import { TokenSupplyService } from "../utils/token-supply.server";

const TOKEN_SYMBOL = bountyBucksInfo.symbol;
const TOKEN_DECIMALS = 9; // From the attributes in the JSON

export const meta: MetaFunction = () => {
  return [
    { title: "Wallet - BountyHub" },
    { name: "description", content: "Manage your virtual wallet and transactions" },
  ];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const db = createDb((context as any).env.DB)
  const user = await getUser(request, db);
  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const walletData = await getWalletDetails(db, user.id);
  const supplyStats = await TokenSupplyService.getSupplyStats();

  return json({ user, walletData, supplyStats });
}

export default function WalletPage() {
  const { walletData, user, supplyStats } = useLoaderData<typeof loader>();
  const { wallet, transactions } = walletData;
  const [activeTab, setActiveTab] = useState<'overview' | 'deposit' | 'withdraw'>('overview');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showDepositConfirmation, setShowDepositConfirmation] = useState(false);
  const [pendingDeposit, setPendingDeposit] = useState<any>(null);
  const [depositResult, setDepositResult] = useState<any>(null);
  const [isDepositLoading, setIsDepositLoading] = useState(false);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);
  const [depositMode, setDepositMode] = useState<'direct' | 'manual'>('direct');
  const actionData = useActionData();
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false);
  const [withdrawResult, setWithdrawResult] = useState<any>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return '💰';
      case 'WITHDRAW':
        return '💸';
      case 'BOUNTY_CREATED':
        return '🎯';
      case 'BOUNTY_CLAIMED':
        return '🏆';
      case 'BOUNTY_REFUNDED':
        return '↩️';
      default:
        return '📊';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
      case 'BOUNTY_CLAIMED':
      case 'BOUNTY_REFUNDED':
        return 'text-green-600';
      case 'WITHDRAW':
      case 'BOUNTY_CREATED':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleDeposit = async (amount: number) => {
    try {
      const response = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      const result = await response.json() as { success: boolean; error?: string };
      if (result.success) {
        setDepositResult(result);
        setShowDepositModal(false);
        setShowDepositConfirmation(true);
      } else {
        alert(result.error || 'Failed to create deposit request');
      }
    } catch (error) {
      console.error('Deposit error:', error);
      alert('Failed to create deposit request');
    }
  };

  const handleConfirmDeposit = async (transactionId: string) => {
    try {
      const response = await fetch('/api/wallet/confirm-deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId }),
      });
      const result = await response.json() as { success: boolean; error?: string };
      if (result.success) {
        setDepositResult(result);
        setShowDepositConfirmation(false);
        setTimeout(() => window.location.reload(), 1000);
      } else {
        alert(result.error || 'Failed to confirm deposit');
      }
    } catch (error) {
      console.error('Confirm deposit error:', error);
      alert('Failed to confirm deposit');
    }
  };

  const handleWithdraw = async (amount: number) => {
    try {
      const response = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      const result = await response.json() as { success: boolean; error?: string };
      if (result.success) {
        setWithdrawResult(result);
        setShowWithdrawModal(false);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setWithdrawError(result.error || 'Withdrawal failed.');
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      setWithdrawError('Withdrawal failed.');
    }
  };

  // Add null checks for wallet object
  const walletBalance = wallet?.balance || 0;
  const walletTotalEarned = wallet?.totalEarned || 0;
  const walletTotalSpent = wallet?.totalSpent || 0;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Wallet</h1>
          <p className="text-gray-300">Manage your virtual {TOKEN_SYMBOL} balance and transactions</p>
        </div>

        {/* Wallet Overview Card */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Virtual Balance</h2>
              <p className="text-3xl font-bold">{wallet ? wallet.balance.toFixed(4) : '0.0000'} {TOKEN_SYMBOL}</p>
              <p className="text-blue-100 mt-2">Available for bounties and withdrawals</p>
            </div>
            <div className="text-right">
              <div className="mb-2">
                <p className="text-blue-100">Total Earned</p>
                <p className="text-xl font-semibold">{wallet ? wallet.totalEarned.toFixed(4) : '0.0000'} {TOKEN_SYMBOL}</p>
              </div>
              <div>
                <p className="text-blue-100">Total Spent</p>
                <p className="text-xl font-semibold">{wallet ? wallet.totalSpent.toFixed(4) : '0.0000'} {TOKEN_SYMBOL}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Token Supply Stats */}
        <div className="bg-neutral-800 border border-yellow-600 rounded-lg p-4 mb-8">
          <h3 className="text-lg font-semibold text-yellow-300 mb-2">BBUX Token Supply</h3>
          <div className="flex flex-wrap gap-6 items-center">
            <div>
              <span className="block text-sm text-gray-400">Initial Supply</span>
              <span className="font-mono text-lg text-yellow-200">{supplyStats.initialSupply.toLocaleString()} {TOKEN_SYMBOL}</span>
            </div>
            <div>
              <span className="block text-sm text-gray-400">Current Supply</span>
              <span className="font-mono text-lg text-yellow-200">{supplyStats.currentSupply.toLocaleString()} {TOKEN_SYMBOL}</span>
            </div>
            <div>
              <span className="block text-sm text-gray-400">Burned</span>
              <span className="font-mono text-lg text-yellow-200">{supplyStats.burnedAmount.toLocaleString()} {TOKEN_SYMBOL}</span>
            </div>
            <div>
              <span className="block text-sm text-gray-400">Burn %</span>
              <span className="font-mono text-lg text-yellow-200">{supplyStats.burnPercentage.toFixed(4)}%</span>
            </div>
          </div>
          {supplyStats.burnPercentage >= 75 && (
            <div className="mt-4 p-3 bg-red-900 border border-red-700 text-red-200 rounded-lg">
              <strong>⚠️ WARNING:</strong> Token supply is running low! Please contact the platform admin.
            </div>
          )}
          {supplyStats.burnPercentage >= 50 && supplyStats.burnPercentage < 75 && (
            <div className="mt-4 p-3 bg-yellow-900 border border-yellow-700 text-yellow-200 rounded-lg">
              <strong>⚠️ NOTICE:</strong> Token supply is getting low. Monitor burn rates and consider governance action.
            </div>
          )}
          {supplyStats.burnPercentage < 50 && (
            <div className="mt-4 p-3 bg-green-900 border border-green-700 text-green-200 rounded-lg">
              <strong>✅ Supply is healthy.</strong>
            </div>
          )}
        </div>

        {/* User's Solana Addresses */}
        {user && (user.solanaAddress || user.tokenAccountAddress) && (
          <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4 text-white">Your Solana Addresses</h3>
            <div className="space-y-3">
              {user.solanaAddress && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Wallet Address
                  </label>
                  <p className="font-mono text-sm bg-neutral-700 p-2 rounded border border-neutral-600 break-all text-gray-200">
                    {user.solanaAddress}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Your generated Solana wallet address</p>
                </div>
              )}
              {user.tokenAccountAddress && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {TOKEN_SYMBOL} Token Account
                  </label>
                  <p className="font-mono text-sm bg-neutral-700 p-2 rounded border border-neutral-600 break-all text-gray-200">
                    {user.tokenAccountAddress}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Where your {TOKEN_SYMBOL} tokens are stored</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setShowDepositModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            💰 Buy {TOKEN_SYMBOL} with SOL
          </button>
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            💸 Sell {TOKEN_SYMBOL} for SOL
          </button>
        </div>

        {/* Deposit Modal */}
        {showDepositModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">Buy {TOKEN_SYMBOL} with SOL</h3>
                <button
                  onClick={() => setShowDepositModal(false)}
                  className="text-gray-400 hover:text-gray-200 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Deposit Mode Tabs */}
              <div className="flex space-x-1 mb-6 bg-neutral-700 rounded-lg p-1">
                <button
                  onClick={() => setDepositMode('direct')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    depositMode === 'direct'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  🚀 Direct Deposit
                </button>
                <button
                  onClick={() => setDepositMode('manual')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    depositMode === 'manual'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  📝 Manual Deposit
                </button>
              </div>

              {/* Direct Deposit */}
              {depositMode === 'direct' && (
                <DirectDeposit
                  onSuccess={() => {
                    setShowDepositModal(false);
                    setTimeout(() => window.location.reload(), 1000);
                  }}
                  onError={(error) => {
                    if (error !== 'cancelled') {
                      alert(error);
                    }
                    setShowDepositModal(false);
                  }}
                />
              )}

              {/* Manual Deposit */}
              {depositMode === 'manual' && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  await handleDeposit(parseFloat(formData.get('amount') as string));
                }} className="space-y-4">
                  <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-yellow-200 mb-2">Manual Deposit</h4>
                    <p className="text-yellow-300 text-sm">
                      You'll need to manually send SOL from your wallet and then confirm the transaction
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Amount (SOL)
                    </label>
                    <input
                      type="number"
                      name="amount"
                      step="0.001"
                      min="0.001"
                      max="1000"
                      required
                      className="w-full px-3 py-2 border border-neutral-600 bg-neutral-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.1"
                    />
                    <p className="text-sm text-gray-400 mt-1">
                      You will receive the same amount in {TOKEN_SYMBOL} tokens (1:1 exchange rate)
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowDepositModal(false)}
                      className="flex-1 px-4 py-2 text-gray-300 bg-neutral-700 rounded-md hover:bg-neutral-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isDepositLoading}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDepositLoading ? 'Creating...' : 'Create Deposit Request'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Deposit Confirmation Modal */}
        {showDepositConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">Confirm Deposit</h3>
                <button
                  onClick={() => {
                    setShowDepositConfirmation(false);
                    setPendingDeposit(null);
                  }}
                  className="text-gray-400 hover:text-gray-200 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="bg-blue-900 border border-blue-700 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-200 mb-2">Instructions:</h4>
                <ol className="list-decimal list-inside space-y-1 text-blue-300">
                  {pendingDeposit.instructions?.map((instruction: string, index: number) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ol>
              </div>

              <div className="bg-neutral-700 border border-neutral-600 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-200 mb-2">Platform Address:</h4>
                <p className="font-mono text-sm bg-neutral-600 p-2 rounded border border-neutral-500 text-gray-200">{pendingDeposit.platformAddress}</p>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                await handleConfirmDeposit(formData.get('transactionId') as string);
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Transaction Signature
                  </label>
                  <input
                    type="text"
                    name="transactionId"
                    required
                    className="w-full px-3 py-2 border border-neutral-600 bg-neutral-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Paste the transaction signature from your wallet"
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    Copy the transaction signature from your wallet after sending SOL
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDepositConfirmation(false);
                      setPendingDeposit(null);
                    }}
                    className="flex-1 px-4 py-2 text-gray-300 bg-neutral-700 rounded-md hover:bg-neutral-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isConfirmLoading}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isConfirmLoading ? 'Confirming...' : 'Confirm Deposit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Deposit Result Modal */}
        {depositResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6 w-full max-w-md mx-4">
              <div className="bg-green-900 border border-green-700 rounded-lg p-4">
                <h4 className="font-semibold text-green-200 mb-2">Deposit Successful!</h4>
                <p className="text-green-300">{depositResult.message}</p>
                <button
                  onClick={() => setDepositResult(null)}
                  className="mt-4 w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Withdraw Modal */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">Sell {TOKEN_SYMBOL} for SOL</h3>
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="text-gray-400 hover:text-gray-200 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                await handleWithdraw(parseFloat(formData.get('amount') as string));
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Amount ({TOKEN_SYMBOL})
                  </label>
                  <input
                    type="number"
                    name="amount"
                    step="0.001"
                    min="0.001"
                    max={wallet ? wallet.balance : 0}
                    required
                    className="w-full px-3 py-2 border border-neutral-600 bg-neutral-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.1"
                    onChange={(e) => {
                      const amount = parseFloat(e.target.value) || 0;
                      const fee = amount * 0.03;
                      const netAmount = amount - fee;
                      // Update fee display
                      const feeDisplay = document.getElementById('fee-display');
                      const netDisplay = document.getElementById('net-display');
                      if (feeDisplay) feeDisplay.textContent = fee.toFixed(4);
                      if (netDisplay) netDisplay.textContent = netAmount.toFixed(4);
                    }}
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    Available: {wallet ? wallet.balance.toFixed(4) : '0.0000'} {TOKEN_SYMBOL}
                  </p>
                  <div className="mt-2 p-3 bg-neutral-700 rounded-md">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Platform Fee (3%):</span>
                      <span className="text-yellow-400" id="fee-display">0.0000</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-300">You'll receive:</span>
                      <span className="text-green-400 font-medium" id="net-display">0.0000</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      The platform fee helps maintain and improve our services
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Destination Solana Address
                  </label>
                  <input
                    type="text"
                    name="destination"
                    required
                    className="w-full px-3 py-2 border border-neutral-600 bg-neutral-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your Solana address"
                  />
                </div>
                {withdrawError && (
                  <div className="bg-red-900 border border-red-700 text-red-200 rounded-lg p-3 text-sm">
                    {withdrawError}
                  </div>
                )}
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowWithdrawModal(false)}
                    className="flex-1 px-4 py-2 text-gray-300 bg-neutral-700 rounded-md hover:bg-neutral-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isWithdrawLoading}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isWithdrawLoading ? 'Processing...' : 'Withdraw'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Withdraw Result Modal */}
        {withdrawResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6 w-full max-w-md mx-4">
              <div className="bg-blue-900 border border-blue-700 rounded-lg p-4">
                <h4 className="font-semibold text-blue-200 mb-2">Withdrawal Successful!</h4>
                <p className="text-blue-300 mb-2">Your withdrawal has been processed.</p>
                
                {/* Fee breakdown */}
                <div className="mb-4 p-3 bg-blue-800 rounded-md">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-blue-200">Total Amount:</span>
                    <span className="text-white">{withdrawResult.totalAmount?.toFixed(4) || 'N/A'} {TOKEN_SYMBOL}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-blue-200">Platform Fee (3%):</span>
                    <span className="text-yellow-300">{withdrawResult.platformFee?.toFixed(4) || 'N/A'} {TOKEN_SYMBOL}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-blue-200">You received:</span>
                    <span className="text-green-300">{withdrawResult.netAmount?.toFixed(4) || 'N/A'} SOL</span>
                  </div>
                </div>
                
                <div className="mb-2">
                  <span className="block text-sm text-gray-300">Burn Transaction:</span>
                  <a
                    href={`https://explorer.solana.com/tx/${withdrawResult.burnSignature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline break-all"
                  >
                    {withdrawResult.burnSignature}
                  </a>
                </div>
                <div className="mb-2">
                  <span className="block text-sm text-gray-300">SOL Transaction:</span>
                  <a
                    href={`https://explorer.solana.com/tx/${withdrawResult.solSignature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline break-all"
                  >
                    {withdrawResult.solSignature}
                  </a>
                </div>
                {withdrawResult.platformFeeSignature && (
                  <div className="mb-2">
                    <span className="block text-sm text-gray-300">Platform Fee Transaction:</span>
                    <a
                      href={`https://explorer.solana.com/tx/${withdrawResult.platformFeeSignature}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 underline break-all"
                    >
                      {withdrawResult.platformFeeSignature}
                    </a>
                  </div>
                )}
                <button
                  onClick={() => setWithdrawResult(null)}
                  className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transaction History */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-white">Recent Transactions</h3>
            <a
              href="/transactions"
              className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
            >
              See All Transactions →
            </a>
          </div>
          {transactions.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction: any) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border border-neutral-700 rounded-lg hover:bg-neutral-700"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getTransactionIcon(transaction.type)}</span>
                    <div>
                      <p className="font-medium text-white">{transaction.description}</p>
                      <p className="text-sm text-gray-400">{formatDate(transaction.createdAt)}</p>
                      {transaction.bounty && (
                        <p className="text-sm text-blue-400">
                          Bounty: {transaction.bounty.post.title}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                      {transaction.type === 'WITHDRAW' || transaction.type === 'BOUNTY_CREATED' ? '-' : '+'}
                      {transaction.amount.toFixed(4)} {TOKEN_SYMBOL}
                    </p>
                    <p className="text-sm text-gray-400">
                      Balance: {transaction.balanceAfter.toFixed(4)} {TOKEN_SYMBOL}
                    </p>
                  </div>
                </div>
              ))}
              {transactions.length === 5 && (
                <div className="text-center pt-4">
                  <p className="text-gray-400 text-sm">
                    Showing 5 most recent transactions
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  
  return (
    <div className="h-screen w-full bg-neutral-900 flex flex-col items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-neutral-800 rounded-lg shadow-lg border border-red-500/30">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500/10 mb-4">
            <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-600 mb-2">
            Wallet Error
          </h1>
          <p className="text-gray-400 mb-6">
            {isRouteErrorResponse(error) 
              ? error.status === 404 
                ? "The wallet page you're looking for doesn't exist."
                : "Failed to load wallet data. Please try again."
              : "An unexpected error occurred while loading your wallet."}
          </p>
        </div>

        <div className="flex flex-col space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors text-center"
          >
            Try Again
          </button>
          <a
            href="/"
            className="w-full py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-neutral-700 hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors text-center"
          >
            Return Home
          </a>
        </div>
      </div>
    </div>
  );
} 
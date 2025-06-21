import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { getUser } from '~/utils/auth.server';
import { createDb } from '~/utils/db.server';
import { getVirtualWallet } from '~/utils/virtual-wallet.server';
import { Layout } from '~/components/Layout';
import { DirectDeposit } from '~/components/DirectDeposit';
import { useState } from 'react';
import { TokenSupplyService } from '../utils/token-supply.server';
import bountyBucksInfo from '../../bounty-bucks-info.json';

const TOKEN_SYMBOL = bountyBucksInfo.symbol;

export const meta: MetaFunction = () => {
  return [
    { title: 'Wallet - BountyHub' },
    { name: 'description', content: 'Manage your virtual wallet and transactions' },
  ];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const typedContext = context as { env: { DB: D1Database; SESSION_SECRET?: string } };
  const db = createDb(typedContext.env.DB)
  const user = await getUser(request, db, typedContext.env);
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const walletData = await getVirtualWallet(db, user.id);
  const supplyStats = await TokenSupplyService.getSupplyStats(typedContext.env);

  return json({ user, walletData, supplyStats });
}

export default function WalletPage() {
  const { walletData, user, supplyStats } = useLoaderData<typeof loader>();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showDepositConfirmation, setShowDepositConfirmation] = useState(false);
  const [depositMode, setDepositMode] = useState<'direct' | 'manual'>('direct');
  const [withdrawResult, setWithdrawResult] = useState<{ success: boolean; error?: string } | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  if (!walletData) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-3xl font-bold text-white mb-2">My Wallet</h1>
          <p className="text-gray-300">No wallet found for your account.</p>
        </div>
      </Layout>
    );
  }
  const wallet = walletData;

  const handleDeposit = async (amount: number) => {
    try {
      const response = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      const result = await response.json() as { success: boolean; error?: string };
      if (result.success) {
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
                  <label htmlFor="solanaAddress" className="block text-sm font-medium text-gray-300 mb-1">
                    Wallet Address
                  </label>
                  <p id="solanaAddress" className="font-mono text-sm bg-neutral-700 p-2 rounded border border-neutral-600 break-all text-gray-200">
                    {user.solanaAddress}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Your generated Solana wallet address</p>
                </div>
              )}
              {user.tokenAccountAddress && (
                <div>
                  <label htmlFor="tokenAccountAddress" className="block text-sm font-medium text-gray-300 mb-1">
                    {TOKEN_SYMBOL} Token Account
                  </label>
                  <p id="tokenAccountAddress" className="font-mono text-sm bg-neutral-700 p-2 rounded border border-neutral-600 break-all text-gray-200">
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
                      You&apos;ll need to manually send SOL from your wallet and then confirm the transaction
                    </p>
                  </div>

                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
                      Amount (SOL)
                    </label>
                    <input
                      id="amount"
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
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Create Deposit Request
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
                  }}
                  className="text-gray-400 hover:text-gray-200 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="bg-blue-900 border border-blue-700 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-200 mb-2">Instructions:</h4>
                <ol className="list-decimal list-inside space-y-1 text-blue-300">
                  {/* Instructions removed due to missing property */}
                </ol>
              </div>

              <div className="bg-neutral-700 border border-neutral-600 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-200 mb-2">Platform Address:</h4>
                {/* Platform address removed due to missing property */}
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                await handleConfirmDeposit(formData.get('transactionId') as string);
              }} className="space-y-4">
                <div>
                  <label htmlFor="transactionId" className="block text-sm font-medium text-gray-300 mb-2">
                    Transaction Signature
                  </label>
                  <input
                    id="transactionId"
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
                    }}
                    className="flex-1 px-4 py-2 text-gray-300 bg-neutral-700 rounded-md hover:bg-neutral-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirm Deposit
                  </button>
                </div>
              </form>
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
                  <label htmlFor="amountWithdraw" className="block text-sm font-medium text-gray-300 mb-2">
                    Amount ({TOKEN_SYMBOL})
                  </label>
                  <input
                    id="amountWithdraw"
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
                      <span className="text-gray-300">You&apos;ll receive:</span>
                      <span className="text-green-400 font-medium" id="net-display">0.0000</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      The platform fee helps maintain and improve our services
                    </p>
                  </div>
                </div>
                <div>
                  <label htmlFor="destination" className="block text-sm font-medium text-gray-300 mb-2">
                    Destination Solana Address
                  </label>
                  <input
                    id="destination"
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
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Withdraw
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Withdraw Result Modal */}
        {withdrawResult && withdrawResult.success && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6 w-full max-w-md mx-4">
              <div className="bg-blue-900 border border-blue-700 rounded-lg p-4">
                <h4 className="font-semibold text-blue-200 mb-2">Withdrawal Successful!</h4>
                <p className="text-blue-300 mb-2">Your withdrawal has been processed.</p>
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
      </div>
    </Layout>
  );
}
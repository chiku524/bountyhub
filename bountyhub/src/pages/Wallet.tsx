import { useEffect, useState } from 'react'
import { api } from '../utils/api'
import type { WalletInfo } from '../types'

export default function Wallet() {
  const [wallet, setWallet] = useState<WalletInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadWalletInfo()
  }, [])

  const loadWalletInfo = async () => {
    try {
      setLoading(true)
      setError(null)
      const walletData = await api.getWalletInfo()
      setWallet(walletData)
    } catch (err: any) {
      console.error('Wallet error:', err)
      setError(err.message || 'Failed to load wallet information')
    } finally {
      setLoading(false)
    }
  }

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!depositAmount || parseFloat(depositAmount) <= 0) return

    try {
      setActionLoading(true)
      await api.performWalletAction('deposit', parseFloat(depositAmount))
      setShowDepositModal(false)
      setDepositAmount('')
      await loadWalletInfo() // Reload wallet data
    } catch (err: any) {
      setError(err.message || 'Failed to process deposit')
    } finally {
      setActionLoading(false)
    }
  }

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return

    try {
      setActionLoading(true)
      await api.performWalletAction('withdraw', parseFloat(withdrawAmount))
      setShowWithdrawModal(false)
      setWithdrawAmount('')
      await loadWalletInfo() // Reload wallet data
    } catch (err: any) {
      setError(err.message || 'Failed to process withdrawal')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Wallet</h1>
          <div className="card bg-neutral-800 border-neutral-700 p-6">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              <span className="ml-3 text-gray-300">Loading wallet information...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Wallet</h1>
          <p className="text-gray-300">Manage your virtual BBUX balance and transactions</p>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Wallet Overview Card */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Virtual Balance</h2>
              <p className="text-3xl font-bold">
                {wallet ? wallet.balance.toFixed(4) : '0.0000'} BBUX
              </p>
              <p className="text-blue-100 mt-2">Available for bounties and withdrawals</p>
            </div>
            <div className="text-right">
              <div className="mb-2">
                <p className="text-blue-100">Total Earned</p>
                <p className="text-xl font-semibold">
                  {wallet ? wallet.totalEarned.toFixed(4) : '0.0000'} BBUX
                </p>
              </div>
              <div>
                <p className="text-blue-100">Total Spent</p>
                <p className="text-xl font-semibold">
                  {wallet ? wallet.totalSpent.toFixed(4) : '0.0000'} BBUX
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Details */}
        {wallet && (
          <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4 text-white">Wallet Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-gray-400">Address:</span>
                <span className="ml-2 text-white font-mono text-sm">{wallet.address}</span>
              </div>
              <div>
                <span className="font-medium text-gray-400">Total Deposited:</span>
                <span className="ml-2 text-white">{wallet.totalDeposited.toFixed(4)} BBUX</span>
              </div>
              <div>
                <span className="font-medium text-gray-400">Total Withdrawn:</span>
                <span className="ml-2 text-white">{wallet.totalWithdrawn.toFixed(4)} BBUX</span>
              </div>
              <div>
                <span className="font-medium text-gray-400">Created:</span>
                <span className="ml-2 text-white">
                  {new Date(wallet.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setShowDepositModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            💰 Buy BBUX with SOL
          </button>
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            💸 Sell BBUX for SOL
          </button>
        </div>

        {/* Deposit Modal */}
        {showDepositModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">Buy BBUX with SOL</h3>
                <button
                  onClick={() => setShowDepositModal(false)}
                  className="text-gray-400 hover:text-gray-200 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleDeposit} className="space-y-4">
                <div>
                  <label htmlFor="depositAmount" className="block text-sm font-medium text-gray-300 mb-2">
                    Amount (SOL)
                  </label>
                  <input
                    id="depositAmount"
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    step="0.001"
                    min="0.001"
                    max="1000"
                    required
                    className="w-full px-3 py-2 border border-neutral-600 bg-neutral-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.1"
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    You will receive the same amount in BBUX tokens (1:1 exchange rate)
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
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading ? 'Processing...' : 'Create Deposit Request'}
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
                <h3 className="text-xl font-semibold text-white">Sell BBUX for SOL</h3>
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="text-gray-400 hover:text-gray-200 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <label htmlFor="withdrawAmount" className="block text-sm font-medium text-gray-300 mb-2">
                    Amount (BBUX)
                  </label>
                  <input
                    id="withdrawAmount"
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    step="0.001"
                    min="0.001"
                    max={wallet?.balance || 0}
                    required
                    className="w-full px-3 py-2 border border-neutral-600 bg-neutral-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="10.0"
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    Available balance: {wallet?.balance.toFixed(4) || '0.0000'} BBUX
                  </p>
                </div>
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
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading ? 'Processing...' : 'Create Withdrawal Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 
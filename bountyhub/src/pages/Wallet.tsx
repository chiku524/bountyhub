import React, { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { api } from '../utils/api'
import type { WalletInfo, Transaction } from '../types'

function WalletContent() {
  const { wallet, connected, disconnect, signTransaction } = useWallet()
  const { setVisible } = useWalletModal()
  const [walletData, setWalletData] = useState<WalletInfo | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [showDepositConfirmation, setShowDepositConfirmation] = useState(false)
  const [depositMode, setDepositMode] = useState<'direct' | 'manual'>('direct')
  const [withdrawResult, setWithdrawResult] = useState<{ success: boolean; error?: string; fee?: number; netAmount?: number } | null>(null)
  const [withdrawError, setWithdrawError] = useState<string | null>(null)
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [destinationAddress, setDestinationAddress] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [depositTransactionId, setDepositTransactionId] = useState('')

  const publicKey = wallet?.adapter?.publicKey?.toString() || null
  console.log('Wallet Page - connected:', connected, 'publicKey:', publicKey)

  useEffect(() => {
    fetchWalletData()
    fetchTransactions()
  }, [])

  const fetchWalletData = async () => {
    try {
      const response = await api.getWalletInfo()
      setWalletData(response)
    } catch (error) {
      console.error('Error fetching wallet data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      const response = await api.getRecentTransactions()
      setTransactions(response)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  const handleDirectDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!connected) {
      setMessage('Please connect your wallet first')
      return
    }

    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setMessage('Please enter a valid amount')
      return
    }

    try {
      setActionLoading(true)
      setMessage('Creating direct deposit transaction...')
      
      // Get platform address from backend
      const walletInfo = await api.getWalletInfo()
      const platformAddress = walletInfo.platformAddress
      
      if (!platformAddress) {
        setMessage('Platform address not available')
        return
      }

      console.log('Platform address:', platformAddress)
      console.log('User public key:', publicKey)
      console.log('Deposit amount:', depositAmount)

      // Create transaction on frontend
      const { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = await import('@solana/web3.js')
      const connection = new Connection('https://api.devnet.solana.com')
      
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(publicKey!),
          toPubkey: new PublicKey(platformAddress),
          lamports: parseFloat(depositAmount) * LAMPORTS_PER_SOL
        })
      )

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = new PublicKey(publicKey!)

      setMessage('Please sign the transaction in your wallet...')

      try {
        // Sign the transaction with the user's wallet
        if (!signTransaction) {
          setMessage('Wallet not connected or signTransaction not available')
          return
        }
        const signedTransaction = await signTransaction(transaction)
        
        setMessage('Sending transaction to Solana network...')
        
        // Send the signed transaction
        const signature = await connection.sendRawTransaction(signedTransaction.serialize())
        
        setMessage('Waiting for transaction confirmation...')
        
        // Wait for confirmation
        await connection.confirmTransaction(signature)
        
        setMessage('Confirming deposit with platform...')
        
        // Confirm the deposit with the backend
        const confirmResponse = await api.confirmDirectDeposit(parseFloat(depositAmount), signature)
        
        if (confirmResponse.success) {
          setMessage(`Direct deposit successful! Transaction: ${signature.slice(0, 8)}...${signature.slice(-8)}`)
          setDepositAmount('')
          setShowDepositModal(false)
          
          // Refresh wallet data after successful deposit
          setTimeout(() => {
            fetchWalletData()
            fetchTransactions()
          }, 2000)
        } else {
          setMessage(`Transaction sent but confirmation failed: ${confirmResponse.message}`)
        }
      } catch (signError: any) {
        console.error('Sign error:', signError)
        setMessage(`Failed to sign transaction: ${signError.message}`)
      }
    } catch (err: any) {
      console.error('Direct deposit error:', err)
      setMessage(err.message || 'Failed to process direct deposit')
    } finally {
      setActionLoading(false)
    }
  }

  const handleManualDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!depositAmount || parseFloat(depositAmount) <= 0) return

    try {
      setActionLoading(true)
      setMessage('Creating deposit request...')
      
      // Get platform address first
      const walletInfo = await api.getWalletInfo()
      const platformAddress = walletInfo.platformAddress
      
      if (!platformAddress) {
        setMessage('Platform address not available')
        return
      }

      const response = await api.performWalletAction('deposit', parseFloat(depositAmount))
      
      if (response.success) {
        setDepositTransactionId(response.transactionId || '')
        setShowDepositModal(false)
        setShowDepositConfirmation(true)
        setDepositAmount('')
        setMessage('')
      } else {
        setMessage(response.message || 'Failed to create deposit request')
      }
    } catch (err: any) {
      setMessage(err.message || 'Failed to process deposit')
    } finally {
      setActionLoading(false)
    }
  }

  const handleConfirmDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget as HTMLFormElement)
    const transactionId = formData.get('transactionId') as string
    const signature = formData.get('signature') as string

    if (!transactionId || !signature) {
      setMessage('Transaction ID and signature are required')
      return
    }

    try {
      setActionLoading(true)
      setMessage('')
      
      const response = await api.confirmDeposit(transactionId, signature)
      
      if (response.success) {
        setMessage(`Deposit confirmed successfully! ${response.bbuxAmount ? response.bbuxAmount.toFixed(4) : depositAmount} BBUX added to your wallet.`)
        setShowDepositConfirmation(false)
        
        // Refresh wallet data
        setTimeout(() => {
          fetchWalletData()
          fetchTransactions()
        }, 1000)
      } else {
        setMessage(response.message || 'Failed to confirm deposit')
      }
    } catch (err: any) {
      setMessage(err.message || 'Failed to confirm deposit')
    } finally {
      setActionLoading(false)
    }
  }

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return

    if (!destinationAddress) {
      setWithdrawError('Please enter a destination address')
      return
    }

    try {
      setActionLoading(true)
      setWithdrawError('')
      
      const result = await api.performWalletActionWithAddress('withdraw', parseFloat(withdrawAmount), destinationAddress)
      
      if (result.success && result.transactionId) {
        const processResult = await api.processWithdrawal(result.transactionId)
        
        if (processResult.success) {
          setShowWithdrawModal(false)
          setWithdrawAmount('')
          setDestinationAddress('')
          await fetchWalletData()
          setWithdrawResult({ 
            success: true, 
            fee: result.fee,
            netAmount: result.netAmount
          })
        } else {
          setWithdrawError(processResult.message || 'Failed to process withdrawal')
        }
      } else {
        setWithdrawError(result.message || 'Failed to create withdrawal request')
      }
    } catch (err: any) {
      setWithdrawError(err.message || 'Withdrawal failed.')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-400'
      case 'PENDING':
        return 'text-yellow-400'
      case 'FAILED':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-800 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="h-32 bg-neutral-800 rounded"></div>
              <div className="h-32 bg-neutral-800 rounded"></div>
              <div className="h-32 bg-neutral-800 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Wallet</h1>
          <p className="text-gray-300">Manage your virtual BBUX balance and transactions</p>
        </div>

        {message && (
          <div className="bg-blue-900 border border-blue-700 rounded-lg p-4 mb-6">
            <p className="text-blue-200">{message}</p>
          </div>
        )}

        {/* Wallet Overview Card */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold mb-2">BBUX Token Balances</h2>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-blue-100">Platform Balance</p>
                  <p className="text-2xl font-bold">{walletData ? walletData.virtualBalance.toFixed(4) : '0.0000'} BBUX</p>
                  <p className="text-xs text-blue-200">Virtual tokens in the platform</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="mb-2">
                <p className="text-blue-100">Total Earned</p>
                <p className="text-xl font-semibold">{walletData ? walletData.totalEarned.toFixed(4) : '0.0000'} BBUX</p>
              </div>
              <div>
                <p className="text-blue-100">Total Spent</p>
                <p className="text-xl font-semibold">{walletData ? walletData.totalSpent.toFixed(4) : '0.0000'} BBUX</p>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Connection Status */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 text-white">Wallet Connection</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Connection Status:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                connected ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
              }`}>
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            {connected && publicKey && (
              <div>
                <span className="text-gray-300">Connected Address:</span>
                <p className="font-mono text-sm bg-neutral-700 p-2 rounded border border-neutral-600 break-all text-gray-200 mt-1">
                  {publicKey}
                </p>
              </div>
            )}
            <div className="flex space-x-3">
              {!connected ? (
                <button
                  onClick={() => setVisible(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Connect Wallet
                </button>
              ) : (
                <button
                  onClick={disconnect}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Disconnect Wallet
                </button>
              )}
              {connected && (
                <button
                  onClick={() => {
                    console.log('Wallet connected:', connected)
                    console.log('Public key:', publicKey)
                    console.log('Sign transaction available:', typeof signTransaction)
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Test Connection
                </button>
              )}
              {connected && (
                <button
                  onClick={async () => {
                    try {
                      setMessage('Testing wallet transaction...')
                      const { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = await import('@solana/web3.js')
                      const connection = new Connection('https://api.devnet.solana.com')
                      
                      // Create a simple test transaction (transfer 0.001 SOL to self)
                      const transaction = new Transaction().add(
                        SystemProgram.transfer({
                          fromPubkey: new PublicKey(publicKey!),
                          toPubkey: new PublicKey(publicKey!),
                          lamports: 0.001 * LAMPORTS_PER_SOL
                        })
                      )

                      const { blockhash } = await connection.getLatestBlockhash()
                      transaction.recentBlockhash = blockhash
                      transaction.feePayer = new PublicKey(publicKey!)

                      if (!signTransaction) {
                        setMessage('Wallet not connected or signTransaction not available')
                        return
                      }
                      const signedTransaction = await signTransaction(transaction)
                      const signature = await connection.sendRawTransaction(signedTransaction.serialize())
                      
                      setMessage(`Test transaction successful: ${signature.slice(0, 8)}...${signature.slice(-8)}`)
                    } catch (error: any) {
                      console.error('Test transaction error:', error)
                      setMessage(`Test transaction failed: ${error.message}`)
                    }
                  }}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                >
                  Test Transaction
                </button>
              )}
            </div>
          </div>
        </div>

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
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">Buy BBUX with SOL</h3>
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
                <form onSubmit={handleDirectDeposit} className="space-y-4">
                  <div className="bg-orange-900 border border-orange-700 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-orange-200 mb-2">Direct Deposit</h4>
                    <p className="text-orange-300 text-sm">
                      Send SOL directly from your connected wallet to receive virtual BBUX tokens instantly in your platform wallet.
                    </p>
                    {!connected && (
                      <p className="text-orange-200 text-sm mt-2 font-medium">
                        Please connect your wallet first to use direct deposit.
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="directDepositAmount" className="block text-sm font-medium text-gray-300 mb-2">
                      Amount (SOL)
                    </label>
                    <input
                      id="directDepositAmount"
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      step="0.001"
                      min="0.001"
                      max="1000"
                      required
                      className="w-full px-3 py-2 border border-neutral-600 bg-neutral-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="0.1"
                    />
                    <p className="text-sm text-gray-400 mt-1">
                      You will receive the same amount in real BBUX tokens (1:1 exchange rate)
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
                      disabled={actionLoading || !connected}
                      className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading ? 'Processing...' : 'Direct Deposit'}
                    </button>
                  </div>
                </form>
              )}

              {/* Manual Deposit */}
              {depositMode === 'manual' && (
                <form onSubmit={handleManualDeposit} className="space-y-4">
                  <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-yellow-200 mb-2">Manual Deposit</h4>
                    <p className="text-yellow-300 text-sm">
                      Send SOL to the platform address and receive virtual BBUX tokens in your platform wallet
                    </p>
                  </div>

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
                      You will receive the same amount in virtual BBUX tokens (1:1 exchange rate) in your platform wallet
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
              )}
            </div>
          </div>
        )}

        {/* Deposit Confirmation Modal */}
        {showDepositConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">Manual Deposit Instructions</h3>
                <button
                  onClick={() => setShowDepositConfirmation(false)}
                  className="text-gray-400 hover:text-gray-200 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="bg-blue-900 border border-blue-700 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-200 mb-2">Step-by-Step Instructions:</h4>
                <ol className="list-decimal list-inside space-y-2 text-blue-300 text-sm">
                  <li>Copy the platform address below</li>
                  <li>Send exactly <strong>{depositAmount} SOL</strong> to that address from your wallet</li>
                  <li>Copy the transaction signature from your wallet</li>
                  <li>Paste the signature below and click "Confirm Deposit"</li>
                </ol>
              </div>

              <div className="bg-green-900 border border-green-700 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-green-200 mb-2">Platform Address:</h4>
                <div className="flex items-center space-x-2">
                  <p className="font-mono text-sm text-green-300 break-all">{walletData?.platformAddress}</p>
                  <button
                    type="button"
                    onClick={() => {
                      if (walletData?.platformAddress) {
                        navigator.clipboard.writeText(walletData.platformAddress)
                        setMessage('Platform address copied to clipboard!')
                        setTimeout(() => setMessage(''), 2000)
                      }
                    }}
                    className="px-2 py-1 bg-green-700 text-green-200 rounded text-xs hover:bg-green-600"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <form onSubmit={handleConfirmDeposit} className="space-y-4">
                <div>
                  <label htmlFor="transactionId" className="block text-sm font-medium text-gray-300 mb-2">
                    Transaction ID
                  </label>
                  <input
                    id="transactionId"
                    type="text"
                    name="transactionId"
                    value={depositTransactionId}
                    readOnly
                    className="w-full px-3 py-2 border border-neutral-600 bg-neutral-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="signature" className="block text-sm font-medium text-gray-300 mb-2">
                    Transaction Signature
                  </label>
                  <input
                    id="signature"
                    type="text"
                    name="signature"
                    required
                    className="w-full px-3 py-2 border border-neutral-600 bg-neutral-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Paste the transaction signature from your wallet"
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    This signature proves you sent the SOL and allows us to credit your virtual BBUX balance
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowDepositConfirmation(false)}
                    className="flex-1 px-4 py-2 text-gray-300 bg-neutral-700 rounded-md hover:bg-neutral-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading ? 'Verifying...' : 'Confirm Deposit'}
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
                  <label htmlFor="amountWithdraw" className="block text-sm font-medium text-gray-300 mb-2">
                    Amount (BBUX)
                  </label>
                  <input
                    id="amountWithdraw"
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => {
                      setWithdrawAmount(e.target.value)
                      const amount = parseFloat(e.target.value) || 0
                      const fee = amount * 0.03
                      const netAmount = amount - fee
                      const feeDisplay = document.getElementById('fee-display')
                      const netDisplay = document.getElementById('net-display')
                      if (feeDisplay) feeDisplay.textContent = fee.toFixed(4)
                      if (netDisplay) netDisplay.textContent = netAmount.toFixed(4)
                    }}
                    step="0.001"
                    min="0.001"
                    max={walletData ? walletData.virtualBalance : 0}
                    required
                    className="w-full px-3 py-2 border border-neutral-600 bg-neutral-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.1"
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    Available: {walletData ? walletData.virtualBalance.toFixed(4) : '0.0000'} BBUX
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
                    value={destinationAddress}
                    onChange={(e) => setDestinationAddress(e.target.value)}
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
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading ? 'Processing...' : 'Withdraw'}
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
                {withdrawResult.fee && withdrawResult.netAmount && (
                  <div className="mt-3 p-3 bg-blue-800 rounded-md">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-blue-200">Fee (3%):</span>
                      <span className="text-yellow-300">{withdrawResult.fee.toFixed(4)} BBUX</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-200">You received:</span>
                      <span className="text-green-300 font-medium">{withdrawResult.netAmount.toFixed(4)} SOL</span>
                    </div>
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

        {/* Recent Transactions */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
          {transactions.length === 0 ? (
            <p className="text-gray-400">No transactions yet</p>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div key={tx.id} className="border border-neutral-700 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-white">{tx.type}</h4>
                      <p className="text-sm text-gray-400">{tx.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(tx.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-white">{tx.amount.toFixed(4)}</p>
                      <p className={`text-sm font-medium ${getStatusColor(tx.status)}`}>
                        {tx.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Wallet() {
  return (
    <WalletContent />
  )
} 
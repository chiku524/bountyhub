import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthProvider'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { Link } from 'react-router-dom'

interface GovernanceStats {
  totalStaked: number
  totalTreasury: number
  totalCollected: number
  totalDistributed: number
  activeStakers: number
  totalProposals: number
  activeProposals: number
}

interface UserGovernanceStats {
  stakedAmount: number
  totalRewardsEarned: number
  votingPower: number
  governanceParticipation: number
  lastRewardAt: string | null
}

interface RewardRate {
  baseRate: number
  activityBonus: number
  treasuryBonus: number
  participationPenalty: number
  totalRate: number
  maxRate: number
}

interface UserRewardRate extends RewardRate {
  governanceBonus: number
}

interface PlatformMetrics {
  monthlyVolume: number
  activeStakers: number
  treasuryHealth: 'LOW' | 'MEDIUM' | 'HIGH'
  participationLevel: 'LOW' | 'MEDIUM' | 'HIGH'
}

interface TransparencyLog {
  id: string
  logType: string
  amount: number
  feeAmount: number
  description: string
  userId?: string
  referenceId?: string
  referenceType?: string
  balanceBefore?: number
  balanceAfter?: number
  treasuryBalanceBefore?: number
  treasuryBalanceAfter?: number
  createdAt: string
}

interface GovernanceActivity {
  id: string
  activityType: string
  amount: number
  description: string
  userId?: string
  referenceId?: string
  referenceType?: string
  metadata?: string
  createdAt: string
}

const API_URL = import.meta.env.VITE_API_URL || '';

const Governance: React.FC = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<GovernanceStats | null>(null)
  const [userStats, setUserStats] = useState<UserGovernanceStats | null>(null)
  const [rewardRate, setRewardRate] = useState<RewardRate | null>(null)
  const [userRewardRate, setUserRewardRate] = useState<UserRewardRate | null>(null)
  const [platformMetrics, setPlatformMetrics] = useState<PlatformMetrics | null>(null)
  const [transparencyLogs, setTransparencyLogs] = useState<TransparencyLog[]>([])
  const [governanceActivity, setGovernanceActivity] = useState<GovernanceActivity[]>([])
  const [stakeAmount, setStakeAmount] = useState('')
  const [unstakeAmount, setUnstakeAmount] = useState('')
  const [stakingLoading, setStakingLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadGovernanceData()
    }
  }, [user])

  const loadGovernanceData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [statsRes, userStatsRes, rewardRateRes, userRewardRateRes, platformMetricsRes, logsRes, activityRes] = await Promise.all([
        fetch(`${API_URL}/api/governance?action=stats`, { credentials: 'include' }),
        fetch(`${API_URL}/api/governance?action=user-stats`, { credentials: 'include' }),
        fetch(`${API_URL}/api/governance?action=reward-rate`, { credentials: 'include' }),
        fetch(`${API_URL}/api/governance?action=user-reward-rate`, { credentials: 'include' }),
        fetch(`${API_URL}/api/governance?action=platform-metrics`, { credentials: 'include' }),
        fetch(`${API_URL}/api/governance?action=transparency-logs&limit=20`, { credentials: 'include' }),
        fetch(`${API_URL}/api/governance?action=governance-activity&limit=20`, { credentials: 'include' })
      ])

      // Helper to handle error objects
      const handleApiResponse = async (res: Response, setState: (v: any) => void, key: string) => {
        const data = await res.json()
        if (!res.ok || data.error) {
          if (data.error === 'Invalid action') {
            setError('Governance data is not available right now. (Invalid action)')
          } else {
            setError(data.error || 'Failed to load governance data')
          }
          setState(null)
        } else {
          setState(data[key])
        }
      }

      await handleApiResponse(statsRes, setStats, 'stats')
      await handleApiResponse(userStatsRes, setUserStats, 'userStats')
      await handleApiResponse(rewardRateRes, setRewardRate, 'rewardRate')
      await handleApiResponse(userRewardRateRes, setUserRewardRate, 'userRewardRate')
      await handleApiResponse(platformMetricsRes, setPlatformMetrics, 'platformMetrics')
      await handleApiResponse(logsRes, setTransparencyLogs, 'logs')
      await handleApiResponse(activityRes, setGovernanceActivity, 'activity')
    } catch (err) {
      setError('Failed to load governance data')
      console.error('Error loading governance data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    try {
      setStakingLoading(true)
      setError(null)

      const response = await fetch(`${API_URL}/api/governance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stake', amount: parseFloat(stakeAmount) }),
        credentials: 'include',
      })

      const result = await response.json()

      if (result.success) {
        setStakeAmount('')
        await loadGovernanceData()
      } else {
        setError(result.error || 'Failed to stake')
      }
    } catch (err) {
      setError('Failed to stake')
      console.error('Error staking:', err)
    } finally {
      setStakingLoading(false)
    }
  }

  const handleUnstake = async () => {
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    try {
      setStakingLoading(true)
      setError(null)

      const response = await fetch(`${API_URL}/api/governance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unstake', amount: parseFloat(unstakeAmount) }),
        credentials: 'include',
      })

      const result = await response.json()

      if (result.success) {
        setUnstakeAmount('')
        await loadGovernanceData()
      } else {
        setError(result.error || 'Failed to unstake')
      }
    } catch (err) {
      setError('Failed to unstake')
      console.error('Error unstaking:', err)
    } finally {
      setStakingLoading(false)
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatPercentage = (rate: number) => {
    return (rate * 100).toFixed(3)
  }

  const getLogTypeColor = (logType: string) => {
    switch (logType) {
      case 'BOUNTY_PLACED': return 'text-blue-600 dark:text-blue-400'
      case 'BOUNTY_CLAIMED': return 'text-green-600 dark:text-green-400'
      case 'GOVERNANCE_FEE': return 'text-purple-600 dark:text-purple-400'
      case 'REWARD_DISTRIBUTED': return 'text-yellow-600 dark:text-yellow-400'
      case 'STAKE_ADDED': return 'text-indigo-600 dark:text-indigo-400'
      case 'STAKE_REMOVED': return 'text-red-600 dark:text-red-400'
      default: return 'text-neutral-600 dark:text-gray-400'
    }
  }

  const getTreasuryHealthColor = (health: string) => {
    switch (health) {
      case 'HIGH': return 'text-green-400'
      case 'MEDIUM': return 'text-yellow-400'
      case 'LOW': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getParticipationLevelColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'text-green-400'
      case 'MEDIUM': return 'text-yellow-400'
      case 'LOW': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Governance Dashboard</h1>
            <p className="text-neutral-600 dark:text-gray-400">Transparent virtual governance system for BountyBucks</p>
          </div>
          <Link
            to="/refund-requests"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            View Refund Requests
          </Link>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Governance Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="text-sm font-medium text-neutral-600 dark:text-gray-400">Total Staked</h3>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{formatAmount(stats.totalStaked)} BBUX</p>
          </div>
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="text-sm font-medium text-neutral-600 dark:text-gray-400">Treasury Balance</h3>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{formatAmount(stats.totalTreasury)} BBUX</p>
          </div>
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="text-sm font-medium text-neutral-600 dark:text-gray-400">Total Collected</h3>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{formatAmount(stats.totalCollected)} BBUX</p>
          </div>
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="text-sm font-medium text-neutral-600 dark:text-gray-400">Total Distributed</h3>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{formatAmount(stats.totalDistributed)} BBUX</p>
          </div>
        </div>
      )}

      {/* Dynamic Reward Rate & Platform Metrics */}
      {(rewardRate || platformMetrics) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Dynamic Reward Rate Breakdown */}
          {rewardRate && (
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
              <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Dynamic Reward Rate</h2>
                <p className="text-sm text-neutral-600 dark:text-gray-400">Current daily staking reward breakdown</p>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600 dark:text-gray-400">Base Rate:</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">{formatPercentage(rewardRate.baseRate)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Activity Bonus:</span>
                    <span className="font-semibold text-green-400">+{formatPercentage(rewardRate.activityBonus)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Treasury Bonus:</span>
                    <span className="font-semibold text-blue-400">+{formatPercentage(rewardRate.treasuryBonus)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Participation Penalty:</span>
                    <span className="font-semibold text-red-400">-{formatPercentage(rewardRate.participationPenalty)}%</span>
                  </div>
                  <hr className="border-neutral-700" />
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-neutral-900 dark:text-white">Total Rate:</span>
                    <span className="text-xl font-bold text-indigo-400">{formatPercentage(rewardRate.totalRate)}%</span>
                  </div>
                  <div className="text-xs text-neutral-600 dark:text-gray-400">
                    Maximum rate: {formatPercentage(rewardRate.maxRate)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Platform Metrics */}
          {platformMetrics && (
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
              <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Platform Health</h2>
                <p className="text-sm text-neutral-600 dark:text-gray-400">Current platform activity metrics</p>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600 dark:text-gray-400">Monthly Volume:</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">{formatAmount(platformMetrics.monthlyVolume)} BBUX</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600 dark:text-gray-400">Active Stakers:</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">{platformMetrics.activeStakers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600 dark:text-gray-400">Treasury Health:</span>
                    <span className={`font-semibold ${getTreasuryHealthColor(platformMetrics.treasuryHealth)}`}>
                      {platformMetrics.treasuryHealth}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600 dark:text-gray-400">Participation Level:</span>
                    <span className={`font-semibold ${getParticipationLevelColor(platformMetrics.participationLevel)}`}>
                      {platformMetrics.participationLevel}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* User's Personalized Reward Rate */}
      {userRewardRate && (
        <div className="bg-linear-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/50 dark:to-purple-900/50 border border-indigo-200 dark:border-indigo-700 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">Your Personalized Reward Rate</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-neutral-700 dark:text-gray-300">Base Rate:</span>
                <span className="font-semibold text-neutral-900 dark:text-white">{formatPercentage(userRewardRate.baseRate)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-700 dark:text-gray-300">Activity Bonus:</span>
                <span className="font-semibold text-green-600 dark:text-green-400">+{formatPercentage(userRewardRate.activityBonus)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-700 dark:text-gray-300">Treasury Bonus:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">+{formatPercentage(userRewardRate.treasuryBonus)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-700 dark:text-gray-300">Governance Bonus:</span>
                <span className="font-semibold text-purple-600 dark:text-purple-400">+{formatPercentage(userRewardRate.governanceBonus)}%</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-neutral-700 dark:text-gray-300">Participation Penalty:</span>
                <span className="font-semibold text-red-600 dark:text-red-400">-{formatPercentage(userRewardRate.participationPenalty)}%</span>
              </div>
              <hr className="border-indigo-300 dark:border-indigo-700" />
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-neutral-900 dark:text-white">Your Total Rate:</span>
                <span className="text-xl font-bold text-indigo-600 dark:text-indigo-300">{formatPercentage(userRewardRate.totalRate)}%</span>
              </div>
              <div className="text-sm text-indigo-700 dark:text-indigo-200">
                {userRewardRate.governanceBonus > 0 ? 
                  "🎉 You qualify for governance participation bonus!" : 
                  "Participate in governance to earn bonus rewards!"
                }
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Governance Stats */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Your Governance Stats</h2>
          </div>
          <div className="p-6">
            {userStats ? (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-gray-400">Staked Amount:</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">{formatAmount(userStats.stakedAmount)} BBUX</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-gray-400">Total Rewards Earned:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">{formatAmount(userStats.totalRewardsEarned)} BBUX</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-gray-400">Voting Power:</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">{formatAmount(userStats.votingPower)} BBUX</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-gray-400">Governance Participation:</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">{userStats.governanceParticipation} votes</span>
                </div>
                {userStats.lastRewardAt && (
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-gray-400">Last Reward:</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">{formatDate(userStats.lastRewardAt)}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-neutral-600 dark:text-gray-400">No governance stats available</p>
            )}
          </div>
        </div>

        {/* Staking Actions */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Staking Actions</h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Stake */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                Stake BBUX for Governance
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="Amount to stake"
                  className="flex-1 px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-gray-400"
                  min="0"
                  step="0.01"
                />
                <button
                  onClick={handleStake}
                  disabled={stakingLoading || !stakeAmount}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {stakingLoading ? 'Staking...' : 'Stake'}
                </button>
              </div>
              <p className="text-xs text-neutral-500 dark:text-gray-400 mt-1">
                Earn {rewardRate ? formatPercentage(rewardRate.totalRate) : '0.000'}% daily rewards on staked amount
              </p>
            </div>

            {/* Unstake */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-2">
                Unstake BBUX from Governance
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={unstakeAmount}
                  onChange={(e) => setUnstakeAmount(e.target.value)}
                  placeholder="Amount to unstake"
                  className="flex-1 px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-gray-400"
                  min="0"
                  step="0.01"
                />
                <button
                  onClick={handleUnstake}
                  disabled={stakingLoading || !unstakeAmount}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {stakingLoading ? 'Unstaking...' : 'Unstake'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transparency Logs */}
      <div className="mt-8 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Transparency Logs</h2>
          <p className="text-sm text-neutral-600 dark:text-gray-400">Real-time transparency of all governance activities</p>
        </div>
        <div className="overflow-auto scrollbar-thin max-h-96">
          {transparencyLogs.length === 0 ? (
            <div className="text-center text-neutral-500 dark:text-gray-400 py-4">No transparency logs available.</div>
          ) : (
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
              <thead className="bg-neutral-100 dark:bg-neutral-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-gray-300 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-gray-300 uppercase tracking-wider">Fee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-gray-300 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-gray-300 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                {transparencyLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getLogTypeColor(log.logType)}`}>
                        {log.logType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                      {formatAmount(log.amount)} BBUX
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                      {log.feeAmount > 0 ? `${formatAmount(log.feeAmount)} BBUX` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900 dark:text-white">
                      {log.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-gray-400">
                      {formatDate(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Governance Activity Feed */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 mt-8">
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Governance Activity Feed</h2>
          <p className="text-sm text-neutral-600 dark:text-gray-400">Recent governance actions and events</p>
        </div>
        <div className="overflow-auto scrollbar-thin max-h-96">
          {governanceActivity.length === 0 ? (
            <div className="text-center text-neutral-500 dark:text-gray-400 py-4">No governance activity available.</div>
          ) : (
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
              <thead className="bg-neutral-100 dark:bg-neutral-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-gray-300 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-gray-300 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-gray-300 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                {governanceActivity.map((activity) => (
                  <tr key={activity.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getLogTypeColor(activity.activityType)}`}>
                        {activity.activityType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                      {formatAmount(activity.amount)} BBUX
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900 dark:text-white">
                      {activity.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-gray-400">
                      {formatDate(activity.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default Governance 
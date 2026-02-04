import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthProvider'
import { api } from '../utils/api'
import { PageContainer } from '../components/PageContainer'
import { PageHeader } from '../components/PageHeader'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { FiTrendingUp, FiUsers, FiDollarSign, FiMessageSquare, FiCheckCircle, FiActivity } from 'react-icons/fi'

interface PlatformStats {
  activeBounties: number
  questionsAnswered: number
  totalRewards: string
  communityMembers: number
  totalPosts: number
  totalAnswers: number
  totalBBUX: string
}

interface AdminStats {
  totalUsers: number
  userCount: number
  moderatorCount: number
  adminCount: number
}

export default function Analytics() {
  const { user } = useAuth()
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null)
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'all'>('all')

  useEffect(() => {
    fetchStats()
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 300000)
    return () => clearInterval(interval)
  }, [selectedPeriod])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const [platformData, adminData] = await Promise.all([
        api.request<PlatformStats>('/api/stats'),
        user?.role === 'admin' ? api.getAdminStats().catch(() => null) : Promise.resolve(null)
      ])

      setPlatformStats(platformData)
      if (adminData) {
        setAdminStats(adminData.stats)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !platformStats) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading analytics...</p>
        </div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorMessage message={error} onRetry={fetchStats} />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title="Analytics Dashboard"
        description="Platform statistics and insights"
        actions={
          <div className="flex gap-2">
            {['today', 'week', 'month', 'all'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period as typeof selectedPeriod)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-indigo-600 text-white'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
          </div>
        }
      />

        {/* Platform Stats Grid */}
        {platformStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <FiDollarSign className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Active</span>
              </div>
              <h3 className="text-2xl font-bold mb-1">{platformStats.activeBounties}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Bounties</p>
            </div>

            <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <FiCheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Answered</span>
              </div>
              <h3 className="text-2xl font-bold mb-1">{platformStats.questionsAnswered}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Questions Answered</p>
            </div>

            <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <FiTrendingUp className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
              </div>
              <h3 className="text-2xl font-bold mb-1">{platformStats.totalRewards}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Rewards (BBUX)</p>
            </div>

            <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FiUsers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Members</span>
              </div>
              <h3 className="text-2xl font-bold mb-1">{platformStats.communityMembers}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Community Members</p>
            </div>
          </div>
        )}

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Posts & Answers */}
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 shadow-xs">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FiMessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Content Statistics
            </h2>
            {platformStats && (
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-neutral-200 dark:border-neutral-700">
                  <span className="text-gray-600 dark:text-gray-400">Total Posts</span>
                  <span className="text-lg font-semibold">{platformStats.totalPosts}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-neutral-200 dark:border-neutral-700">
                  <span className="text-gray-600 dark:text-gray-400">Total Answers</span>
                  <span className="text-lg font-semibold">{platformStats.totalAnswers}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-600 dark:text-gray-400">Answer Rate</span>
                  <span className="text-lg font-semibold">
                    {platformStats.totalPosts > 0
                      ? ((platformStats.totalAnswers / platformStats.totalPosts) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Token & Economy */}
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 shadow-xs">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FiDollarSign className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Token Economy
            </h2>
            {platformStats && (
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-neutral-200 dark:border-neutral-700">
                  <span className="text-gray-600 dark:text-gray-400">Total BBUX in Circulation</span>
                  <span className="text-lg font-semibold">{platformStats.totalBBUX}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-neutral-200 dark:border-neutral-700">
                  <span className="text-gray-600 dark:text-gray-400">Total Rewards Distributed</span>
                  <span className="text-lg font-semibold">{platformStats.totalRewards} BBUX</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-600 dark:text-gray-400">Active Bounties Value</span>
                  <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                    {platformStats.activeBounties} active
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Admin Stats (if admin) */}
        {user?.role === 'admin' && adminStats && (
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 shadow-xs">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FiActivity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Admin Statistics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{adminStats.totalUsers}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Users</p>
              </div>
              <div className="text-center p-4 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
                <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{adminStats.userCount}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Regular Users</p>
              </div>
              <div className="text-center p-4 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{adminStats.moderatorCount}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Moderators</p>
              </div>
              <div className="text-center p-4 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{adminStats.adminCount}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Admins</p>
              </div>
            </div>
          </div>
        )}
    </PageContainer>
  )
}


import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'
import { useAuth } from '../contexts/AuthProvider'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { PageMetadata } from '../components/PageMetadata'
import { FiGithub, FiCode, FiGitPullRequest, FiAlertCircle, FiFileText, FiStar, FiAward, FiTrendingUp } from 'react-icons/fi'
import type { GitHubRepository } from '../types'

interface Contribution {
  id: string
  userId: string
  repositoryId?: string
  repository?: GitHubRepository
  type: 'COMMIT' | 'PULL_REQUEST' | 'ISSUE' | 'CODE_REVIEW' | 'BUG_SUBMISSION' | 'FEATURE_SUGGESTION' | 'DOCUMENTATION'
  title: string
  description?: string
  githubUrl?: string
  status: 'PENDING' | 'APPROVED' | 'MERGED' | 'CLOSED' | 'REJECTED'
  contributionDate: string
  rewardAmount: number
  points: number
  createdAt: string
}

export default function Contributions() {
  const { user } = useAuth()
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (user) {
      loadContributions()
    } else {
      setLoading(false)
    }
  }, [user, typeFilter, statusFilter])

  const loadContributions = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.getContributions({
        userId: user?.id,
        type: typeFilter || undefined,
        status: statusFilter || undefined,
      })
      setContributions(response.contributions || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load contributions')
    } finally {
      setLoading(false)
    }
  }

  const filteredContributions = contributions.filter(contrib =>
    contrib.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (contrib.description && contrib.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'COMMIT':
        return <FiCode className="w-5 h-5" />
      case 'PULL_REQUEST':
        return <FiGitPullRequest className="w-5 h-5" />
      case 'ISSUE':
        return <FiAlertCircle className="w-5 h-5" />
      case 'CODE_REVIEW':
        return <FiStar className="w-5 h-5" />
      case 'BUG_SUBMISSION':
        return <FiAlertCircle className="w-5 h-5" />
      case 'FEATURE_SUGGESTION':
        return <FiTrendingUp className="w-5 h-5" />
      case 'DOCUMENTATION':
        return <FiFileText className="w-5 h-5" />
      default:
        return <FiGithub className="w-5 h-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'COMMIT':
        return 'bg-green-100 dark:bg-green-600 text-green-700 dark:text-white'
      case 'PULL_REQUEST':
        return 'bg-blue-100 dark:bg-blue-600 text-blue-700 dark:text-white'
      case 'ISSUE':
        return 'bg-yellow-100 dark:bg-yellow-600 text-yellow-700 dark:text-white'
      case 'CODE_REVIEW':
        return 'bg-purple-100 dark:bg-purple-600 text-purple-700 dark:text-white'
      case 'BUG_SUBMISSION':
        return 'bg-red-100 dark:bg-red-600 text-red-700 dark:text-white'
      case 'FEATURE_SUGGESTION':
        return 'bg-indigo-100 dark:bg-indigo-600 text-indigo-700 dark:text-white'
      case 'DOCUMENTATION':
        return 'bg-cyan-100 dark:bg-cyan-600 text-cyan-700 dark:text-white'
      default:
        return 'bg-neutral-100 dark:bg-neutral-600 text-neutral-700 dark:text-white'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'MERGED':
        return 'bg-green-100 dark:bg-green-600 text-green-700 dark:text-white'
      case 'PENDING':
        return 'bg-yellow-100 dark:bg-yellow-600 text-yellow-700 dark:text-white'
      case 'CLOSED':
      case 'REJECTED':
        return 'bg-red-100 dark:bg-red-600 text-red-700 dark:text-white'
      default:
        return 'bg-neutral-100 dark:bg-neutral-600 text-neutral-700 dark:text-white'
    }
  }

  const totalPoints = contributions.reduce((sum, contrib) => sum + contrib.points, 0)
  const totalRewards = contributions.reduce((sum, contrib) => sum + contrib.rewardAmount, 0)

  if (!user) {
    return (
      <div className="min-h-screen bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xs flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">Please log in to view contributions</h1>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xs">
      <PageMetadata
        title="My Contributions"
        description="Track your open-source contributions and rewards"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            My Contributions
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Track your open-source contributions, rewards, and achievements
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <FiAward className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Total Contributions</h3>
            </div>
            <p className="text-3xl font-bold text-neutral-900 dark:text-white">{contributions.length}</p>
          </div>
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <FiStar className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Total Points</h3>
            </div>
            <p className="text-3xl font-bold text-neutral-900 dark:text-white">{totalPoints}</p>
          </div>
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <FiTrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Total Rewards</h3>
            </div>
            <p className="text-3xl font-bold text-neutral-900 dark:text-white">
              ${totalRewards.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search contributions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <FiGithub className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="COMMIT">Commits</option>
            <option value="PULL_REQUEST">Pull Requests</option>
            <option value="ISSUE">Issues</option>
            <option value="CODE_REVIEW">Code Reviews</option>
            <option value="BUG_SUBMISSION">Bug Submissions</option>
            <option value="FEATURE_SUGGESTION">Feature Suggestions</option>
            <option value="DOCUMENTATION">Documentation</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="MERGED">Merged</option>
            <option value="CLOSED">Closed</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Contributions List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : filteredContributions.length === 0 ? (
          <div className="text-center py-12">
            <FiGithub className="w-16 h-16 text-neutral-400 dark:text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-4">
              {contributions.length === 0
                ? 'No contributions yet. Start contributing to open-source projects!'
                : 'No contributions match your filters.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredContributions.map((contrib) => (
              <div
                key={contrib.id}
                className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-2 rounded-lg ${getTypeColor(contrib.type)}`}>
                      {getTypeIcon(contrib.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-1">
                        {contrib.title}
                      </h3>
                      {contrib.description && (
                        <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-2 line-clamp-2">
                          {contrib.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
                        {contrib.repository && (
                          <span className="flex items-center gap-1">
                            <FiGithub className="w-4 h-4" />
                            {contrib.repository.fullName}
                          </span>
                        )}
                        <span>
                          {new Date(contrib.contributionDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(contrib.type)}`}>
                      {contrib.type.replace('_', ' ')}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(contrib.status)}`}>
                      {contrib.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <div className="flex items-center gap-4 text-sm">
                    {contrib.points > 0 && (
                      <div className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400">
                        <FiStar className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium">{contrib.points} points</span>
                      </div>
                    )}
                    {contrib.rewardAmount > 0 && (
                      <div className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400">
                        <FiAward className="w-4 h-4 text-green-500" />
                        <span className="font-medium">${contrib.rewardAmount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  {contrib.githubUrl && (
                    <a
                      href={contrib.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      View on GitHub
                      <FiGithub className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


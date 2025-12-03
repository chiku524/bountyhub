import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'
import { useAuth } from '../contexts/AuthProvider'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { PageMetadata } from '../components/PageMetadata'
import { FiPlus, FiSearch, FiTrendingUp, FiDollarSign, FiUsers } from 'react-icons/fi'
import type { BugBountyCampaign } from '../types'

export default function BugBountyCampaigns() {
  const { user } = useAuth()
  const [campaigns, setCampaigns] = useState<BugBountyCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [limit] = useState(12)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showMyCampaigns, setShowMyCampaigns] = useState(false)

  useEffect(() => {
    loadCampaigns()
  }, [page, statusFilter, showMyCampaigns])

  const loadCampaigns = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.getBugBountyCampaigns({
        page,
        limit,
        status: statusFilter || undefined,
        ownerId: showMyCampaigns && user ? user.id : undefined,
        isPublic: showMyCampaigns ? undefined : true,
      })
      setCampaigns(response.campaigns)
      setTotal(response.total)
    } catch (err: any) {
      setError(err.message || 'Failed to load campaigns')
    } finally {
      setLoading(false)
    }
  }

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 dark:bg-green-600 text-green-700 dark:text-white'
      case 'PAUSED':
        return 'bg-yellow-100 dark:bg-yellow-600 text-yellow-700 dark:text-white'
      case 'COMPLETED':
        return 'bg-blue-100 dark:bg-blue-600 text-blue-700 dark:text-white'
      case 'CANCELLED':
        return 'bg-red-100 dark:bg-red-600 text-red-700 dark:text-white'
      case 'DRAFT':
        return 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-white'
      default:
        return 'bg-neutral-100 dark:bg-neutral-600 text-neutral-700 dark:text-white'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
      <PageMetadata
        title="Bug Bounty Campaigns"
        description="Discover and participate in bug bounty campaigns"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                Bug Bounty Campaigns
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                Find security vulnerabilities and earn rewards
              </p>
            </div>
            {user && (
              <Link
                to="/bug-bounty/campaigns/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
              >
                <FiPlus className="w-5 h-5" />
                Create Campaign
              </Link>
            )}
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
                className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="COMPLETED">Completed</option>
                <option value="DRAFT">Draft</option>
              </select>
              {user && (
                <button
                  onClick={() => {
                    setShowMyCampaigns(!showMyCampaigns)
                    setPage(1)
                  }}
                  className={`px-4 py-2 border rounded-lg font-medium transition-colors ${
                    showMyCampaigns
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white'
                  }`}
                >
                  My Campaigns
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-4">
              {searchQuery ? 'No campaigns match your search.' : 'No campaigns found.'}
            </p>
            {user && !showMyCampaigns && (
              <Link
                to="/bug-bounty/campaigns/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
              >
                <FiPlus className="w-5 h-5" />
                Create First Campaign
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Campaigns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredCampaigns.map((campaign) => (
                <Link
                  key={campaign.id}
                  to={`/bug-bounty/campaigns/${campaign.id}`}
                  className="block bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 hover:shadow-lg transition-all duration-200 hover:border-indigo-500 dark:hover:border-indigo-400"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-white line-clamp-2 flex-1">
                      {campaign.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </div>
                  
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4 line-clamp-3">
                    {campaign.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <FiDollarSign className="w-4 h-4" />
                      <span className="font-medium text-neutral-900 dark:text-white">
                        {formatCurrency(campaign.minReward)} - {formatCurrency(campaign.maxReward)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <FiTrendingUp className="w-4 h-4" />
                      <span>Budget: {formatCurrency(campaign.totalBudget)}</span>
                      <span className="text-neutral-400 dark:text-neutral-500">
                        ({((campaign.totalBudget - campaign.remainingBudget) / campaign.totalBudget * 100).toFixed(0)}% used)
                      </span>
                    </div>
                    {campaign.submissionCount !== undefined && (
                      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                        <FiUsers className="w-4 h-4" />
                        <span>{campaign.submissionCount} submission{campaign.submissionCount !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>

                  {campaign.repository && (
                    <div className="mb-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                      <a
                        href={campaign.repository.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        {campaign.repository.fullName}
                      </a>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                    <span>Created {new Date(campaign.createdAt).toLocaleDateString()}</span>
                    {campaign.owner && (
                      <span>by {campaign.owner.username}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {total > limit && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-700"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-neutral-600 dark:text-neutral-400">
                  Page {page} of {Math.ceil(total / limit)}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(Math.ceil(total / limit), p + 1))}
                  disabled={page >= Math.ceil(total / limit)}
                  className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-700"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}


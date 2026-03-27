import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useEscapeKey } from '../hooks/useEscapeKey'
import { api } from '../utils/api'
import { useAuth } from '../contexts/AuthProvider'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { PageMetadata } from '../components/PageMetadata'
import { FiArrowLeft, FiEdit, FiTrash2, FiPlus, FiDollarSign, FiTrendingUp, FiUsers, FiExternalLink, FiAlertCircle } from 'react-icons/fi'
import type { BugBountyCampaign, BugSubmission } from '../types'

export default function BugBountyCampaignDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState<BugBountyCampaign | null>(null)
  const [submissions, setSubmissions] = useState<BugSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEscapeKey(showDeleteConfirm, () => setShowDeleteConfirm(false))

  useEffect(() => {
    if (id) {
      loadCampaign()
      loadSubmissions()
    }
  }, [id])

  const loadCampaign = async () => {
    if (!id) return
    try {
      setLoading(true)
      setError(null)
      const data = await api.getBugBountyCampaign(id)
      setCampaign(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load campaign')
    } finally {
      setLoading(false)
    }
  }

  const loadSubmissions = async () => {
    if (!id) return
    try {
      const response = await api.getBugSubmissions(id, { limit: 10 })
      setSubmissions(response.submissions)
    } catch (err: any) {
      console.error('Failed to load submissions:', err)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    try {
      setDeleting(true)
      await api.deleteBugBountyCampaign(id)
      navigate('/bug-bounty/campaigns')
    } catch (err: any) {
      setError(err.message || 'Failed to delete campaign')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

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

  const isOwner = user && campaign && user.id === campaign.ownerId

  if (loading) {
    return (
      <div className="min-h-screen bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xs flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xs">
        <PageMetadata title="Campaign Not Found" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <ErrorMessage message={error || 'Campaign not found'} />
            <Link
              to="/bug-bounty/campaigns"
              className="inline-flex items-center gap-2 mt-4 text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to Campaigns
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xs">
      <PageMetadata
        title={campaign.title}
        description={campaign.description}
      />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/bug-bounty/campaigns"
            className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 mb-4"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Campaigns
          </Link>
          
          <div className="flex flex-col gap-4 @xl/main:flex-row @xl/main:items-start @xl/main:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                  {campaign.title}
                </h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(campaign.status)}`}>
                  {campaign.status}
                </span>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                {campaign.description}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                {campaign.owner && (
                  <span>
                    Created by <Link to={`/users/${campaign.owner.username}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">{campaign.owner.username}</Link>
                  </span>
                )}
                <span>Created {new Date(campaign.createdAt).toLocaleDateString()}</span>
                {campaign.startDate && (
                  <span>Started {new Date(campaign.startDate).toLocaleDateString()}</span>
                )}
                {campaign.endDate && (
                  <span>Ends {new Date(campaign.endDate).toLocaleDateString()}</span>
                )}
              </div>
            </div>
            
            {isOwner && (
              <div className="flex gap-2">
                <Link
                  to={`/bug-bounty/campaigns/${campaign.id}/edit`}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  <FiEdit className="w-4 h-4" />
                  Edit
                </Link>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 dark:border-red-700 rounded-lg bg-white dark:bg-neutral-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <FiTrash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                Delete Campaign?
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                Are you sure you want to delete this campaign? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} />
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 @3xl/main:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 @3xl/main:col-span-2">
            {/* Campaign Stats */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                Campaign Statistics
              </h2>
              <div className="grid grid-cols-1 gap-4 min-[360px]:grid-cols-2">
                <div>
                  <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 mb-1">
                    <FiDollarSign className="w-4 h-4" />
                    <span className="text-sm">Total Budget</span>
                  </div>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {formatCurrency(campaign.totalBudget)}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 mb-1">
                    <FiTrendingUp className="w-4 h-4" />
                    <span className="text-sm">Remaining</span>
                  </div>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {formatCurrency(campaign.remainingBudget)}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    {((campaign.totalBudget - campaign.remainingBudget) / campaign.totalBudget * 100).toFixed(1)}% used
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 mb-1">
                    <FiUsers className="w-4 h-4" />
                    <span className="text-sm">Submissions</span>
                  </div>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {submissions.length}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 mb-1">
                    <FiAlertCircle className="w-4 h-4" />
                    <span className="text-sm">Reward Range</span>
                  </div>
                  <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                    {formatCurrency(campaign.minReward)} - {formatCurrency(campaign.maxReward)}
                  </p>
                </div>
              </div>
            </div>

            {/* Repository Link */}
            {campaign.repository && (
              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                  Linked Repository
                </h2>
                <a
                  href={campaign.repository.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {campaign.repository.fullName}
                  <FiExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}

            {/* Scope & Rules */}
            {(campaign.scope || campaign.rules) && (
              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                  Campaign Details
                </h2>
                {campaign.scope && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Scope
                    </h3>
                    <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4">
                      <pre className="text-sm text-neutral-900 dark:text-white whitespace-pre-wrap">
                        {typeof campaign.scope === 'string' ? campaign.scope : JSON.stringify(campaign.scope, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
                {campaign.rules && (
                  <div>
                    <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Rules
                    </h3>
                    <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4">
                      <pre className="text-sm text-neutral-900 dark:text-white whitespace-pre-wrap">
                        {typeof campaign.rules === 'string' ? campaign.rules : JSON.stringify(campaign.rules, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Submissions */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                  Bug Submissions
                </h2>
                {user && campaign.status === 'ACTIVE' && (
                  <Link
                    to={`/bug-bounty/campaigns/${campaign.id}/submit`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <FiPlus className="w-4 h-4" />
                    Submit Bug
                  </Link>
                )}
              </div>
              {submissions.length === 0 ? (
                <p className="text-neutral-600 dark:text-neutral-400 text-center py-8">
                  No submissions yet. Be the first to submit a bug!
                </p>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <Link
                      key={submission.id}
                      to={`/bug-bounty/submissions/${submission.id}`}
                      className="block p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                          {submission.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          submission.severity === 'CRITICAL' ? 'bg-red-100 dark:bg-red-600 text-red-700 dark:text-white' :
                          submission.severity === 'HIGH' ? 'bg-orange-100 dark:bg-orange-600 text-orange-700 dark:text-white' :
                          submission.severity === 'MEDIUM' ? 'bg-yellow-100 dark:bg-yellow-600 text-yellow-700 dark:text-white' :
                          submission.severity === 'LOW' ? 'bg-blue-100 dark:bg-blue-600 text-blue-700 dark:text-white' :
                          'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-white'
                        }`}>
                          {submission.severity}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-2">
                        {submission.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                        <span>Status: {submission.status}</span>
                        {submission.rewardAmount && (
                          <span>Reward: {formatCurrency(submission.rewardAmount)}</span>
                        )}
                        <span>Submitted {new Date(submission.createdAt).toLocaleDateString()}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Campaign Info */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Campaign Information
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-neutral-600 dark:text-neutral-400">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-600 dark:text-neutral-400">Public:</span>
                  <span className="ml-2 text-neutral-900 dark:text-white">
                    {campaign.isPublic ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-600 dark:text-neutral-400">Team Bounties:</span>
                  <span className="ml-2 text-neutral-900 dark:text-white">
                    {campaign.allowTeamBounties ? 'Allowed' : 'Not Allowed'}
                  </span>
                </div>
                {campaign.startDate && (
                  <div>
                    <span className="text-neutral-600 dark:text-neutral-400">Start Date:</span>
                    <span className="ml-2 text-neutral-900 dark:text-white">
                      {new Date(campaign.startDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {campaign.endDate && (
                  <div>
                    <span className="text-neutral-600 dark:text-neutral-400">End Date:</span>
                    <span className="ml-2 text-neutral-900 dark:text-white">
                      {new Date(campaign.endDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


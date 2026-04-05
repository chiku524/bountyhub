import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../utils/api'
import { useAuth } from '../contexts/AuthProvider'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { PageMetadata } from '../components/PageMetadata'
import { FiArrowLeft, FiSave } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import type { GitHubRepository } from '../types'
import { EmptyState } from '../components/EmptyState'
import { useLocalStorageDraft } from '../hooks/useLocalStorageDraft'

const CAMPAIGN_DRAFT_KEY = 'bountyhub-draft-bug-campaign'

export default function BugBountyCampaignCreate() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [repositories, setRepositories] = useState<GitHubRepository[]>([])
  const [loadingRepos, setLoadingRepos] = useState(false)

  // Form state: pre-select repository from query (e.g. from repo detail page)
  const repoIdFromUrl = searchParams.get('repositoryId') || ''
  const [repositoryId, setRepositoryId] = useState(repoIdFromUrl)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'DRAFT' | 'ACTIVE'>('DRAFT')
  const [totalBudget, setTotalBudget] = useState('')
  const [minReward, setMinReward] = useState('')
  const [maxReward, setMaxReward] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [allowTeamBounties, setAllowTeamBounties] = useState(false)
  const [scope, setScope] = useState('')
  const [rules, setRules] = useState('')
  const [severityLevels, setSeverityLevels] = useState('')
  const [showDraftBanner, setShowDraftBanner] = useState(false)

  const campaignDraftSnapshot = useMemo(
    () => ({
      repositoryId,
      title,
      description,
      status,
      totalBudget,
      minReward,
      maxReward,
      startDate,
      endDate,
      isPublic,
      allowTeamBounties,
      scope,
      rules,
      severityLevels,
    }),
    [
      repositoryId,
      title,
      description,
      status,
      totalBudget,
      minReward,
      maxReward,
      startDate,
      endDate,
      isPublic,
      allowTeamBounties,
      scope,
      rules,
      severityLevels,
    ],
  )

  const { clearDraft, readDraft } = useLocalStorageDraft(CAMPAIGN_DRAFT_KEY, campaignDraftSnapshot, Boolean(user))

  useEffect(() => {
    if (!user) return
    loadRepositories()
  }, [user])

  useEffect(() => {
    if (!user) return
    const d = readDraft() as Record<string, unknown> | null
    if (!d || typeof d !== 'object') return
    const has =
      (typeof d.title === 'string' && d.title.trim()) || (typeof d.description === 'string' && d.description.trim())
    if (has) setShowDraftBanner(true)
  }, [user, readDraft])

  // When repos load and URL has repositoryId, pre-select that repo
  useEffect(() => {
    if (repoIdFromUrl && repositories.length > 0 && repositories.some((r) => r.id === repoIdFromUrl)) {
      setRepositoryId(repoIdFromUrl)
    }
  }, [repoIdFromUrl, repositories])

  const loadRepositories = async () => {
    try {
      setLoadingRepos(true)
      const response = await api.getGitHubRepositories()
      setRepositories(response.repositories)
    } catch (err: any) {
      console.error('Failed to load repositories:', err)
      // Don't show error if user hasn't connected GitHub yet
    } finally {
      setLoadingRepos(false)
    }
  }

  const handleSyncRepositories = async () => {
    try {
      setLoadingRepos(true)
      const response = await api.syncGitHubRepositories()
      setRepositories(response.repositories)
    } catch (err: any) {
      setError(err.message || 'Failed to sync repositories')
    } finally {
      setLoadingRepos(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validation
    if (!title.trim()) {
      setError('Title is required')
      setLoading(false)
      return
    }
    if (!description.trim()) {
      setError('Description is required')
      setLoading(false)
      return
    }
    if (!totalBudget || parseFloat(totalBudget) <= 0) {
      setError('Total budget must be greater than 0')
      setLoading(false)
      return
    }
    if (!minReward || parseFloat(minReward) <= 0) {
      setError('Minimum reward must be greater than 0')
      setLoading(false)
      return
    }
    if (!maxReward || parseFloat(maxReward) <= 0) {
      setError('Maximum reward must be greater than 0')
      setLoading(false)
      return
    }
    if (parseFloat(minReward) > parseFloat(maxReward)) {
      setError('Minimum reward cannot be greater than maximum reward')
      setLoading(false)
      return
    }
    if (parseFloat(totalBudget) < parseFloat(maxReward)) {
      setError('Total budget must be at least equal to maximum reward')
      setLoading(false)
      return
    }

    try {
      const campaignData: any = {
        title: title.trim(),
        description: description.trim(),
        status,
        totalBudget: parseFloat(totalBudget),
        minReward: parseFloat(minReward),
        maxReward: parseFloat(maxReward),
        isPublic,
        allowTeamBounties,
      }

      if (repositoryId) {
        campaignData.repositoryId = repositoryId
      }

      if (startDate) {
        campaignData.startDate = new Date(startDate).toISOString()
      }

      if (endDate) {
        campaignData.endDate = new Date(endDate).toISOString()
      }

      if (scope.trim()) {
        try {
          campaignData.scope = JSON.parse(scope.trim())
        } catch {
          campaignData.scope = { domains: scope.trim().split('\n').filter(Boolean) }
        }
      }

      if (rules.trim()) {
        try {
          campaignData.rules = JSON.parse(rules.trim())
        } catch {
          campaignData.rules = { rules: rules.trim().split('\n').filter(Boolean) }
        }
      }

      if (severityLevels.trim()) {
        try {
          campaignData.severityLevels = JSON.parse(severityLevels.trim())
        } catch {
          // Default severity levels
          campaignData.severityLevels = {
            CRITICAL: { reward: parseFloat(maxReward), description: 'Critical vulnerabilities' },
            HIGH: { reward: parseFloat(maxReward) * 0.7, description: 'High severity issues' },
            MEDIUM: { reward: parseFloat(maxReward) * 0.4, description: 'Medium severity issues' },
            LOW: { reward: parseFloat(minReward), description: 'Low severity issues' },
            INFO: { reward: parseFloat(minReward) * 0.5, description: 'Informational issues' },
          }
        }
      }

      const campaign = await api.createBugBountyCampaign(campaignData)
      clearDraft()
      navigate(`/bug-bounty/campaigns/${campaign.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to create campaign')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <EmptyState
          title="Sign in to create a campaign"
          description="Log in to create a bug bounty program linked to your repositories."
          action={
            <Link to="/login" className="btn-primary">
              Log in
            </Link>
          }
          secondaryAction={
            <Link to="/signup" className="btn-secondary">
              Sign up
            </Link>
          }
        />
      </div>
    )
  }

  const applyCampaignDraft = () => {
    const d = readDraft() as Record<string, unknown> | null
    if (!d) return
    if (typeof d.repositoryId === 'string') setRepositoryId(d.repositoryId)
    if (typeof d.title === 'string') setTitle(d.title)
    if (typeof d.description === 'string') setDescription(d.description)
    if (d.status === 'DRAFT' || d.status === 'ACTIVE') setStatus(d.status)
    if (typeof d.totalBudget === 'string') setTotalBudget(d.totalBudget)
    if (typeof d.minReward === 'string') setMinReward(d.minReward)
    if (typeof d.maxReward === 'string') setMaxReward(d.maxReward)
    if (typeof d.startDate === 'string') setStartDate(d.startDate)
    if (typeof d.endDate === 'string') setEndDate(d.endDate)
    if (typeof d.isPublic === 'boolean') setIsPublic(d.isPublic)
    if (typeof d.allowTeamBounties === 'boolean') setAllowTeamBounties(d.allowTeamBounties)
    if (typeof d.scope === 'string') setScope(d.scope)
    if (typeof d.rules === 'string') setRules(d.rules)
    if (typeof d.severityLevels === 'string') setSeverityLevels(d.severityLevels)
    setShowDraftBanner(false)
  }

  return (
    <div className="min-h-screen bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xs">
      <PageMetadata
        title="Create Bug Bounty Campaign"
        description="Create a new bug bounty campaign"
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showDraftBanner && (
          <div
            className="mb-6 flex flex-col gap-3 rounded-xl border border-violet-200/80 bg-violet-50/90 p-4 text-sm text-violet-950 dark:border-violet-500/35 dark:bg-violet-950/40 dark:text-violet-100 @sm/main:flex-row @sm/main:items-center @sm/main:justify-between"
            role="status"
          >
            <p className="font-medium">You have an unsaved campaign draft on this device.</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={applyCampaignDraft} className="btn-primary text-sm py-2 px-3">
                Restore draft
              </button>
              <button
                type="button"
                onClick={() => {
                  clearDraft()
                  setShowDraftBanner(false)
                }}
                className="btn-secondary text-sm py-2 px-3"
              >
                Discard
              </button>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/bug-bounty/campaigns"
            className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 mb-4"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Campaigns
          </Link>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            Create Bug Bounty Campaign
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Set up a new bug bounty campaign to incentivize security research
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
              Basic Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Security Audit for MyApp"
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your bug bounty campaign, what you're looking for, and any important details..."
                  rows={6}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              {/* GitHub Repository */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  GitHub Repository (Optional)
                </label>
                {loadingRepos ? (
                  <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                    <LoadingSpinner size="sm" />
                    <span>Loading repositories...</span>
                  </div>
                ) : repositories.length === 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      No GitHub repositories found. Connect your GitHub account to link repositories.
                    </p>
                    <button
                      type="button"
                      onClick={handleSyncRepositories}
                      className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Sync Repositories
                    </button>
                  </div>
                ) : (
                  <select
                    value={repositoryId}
                    onChange={(e) => setRepositoryId(e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">No repository</option>
                    {repositories.map((repo) => (
                      <option key={repo.id} value={repo.id}>
                        {repo.fullName}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Budget & Rewards */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
              Budget & Rewards
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Total Budget ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value)}
                  placeholder="1000"
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Min Reward ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={minReward}
                  onChange={(e) => setMinReward(e.target.value)}
                  placeholder="50"
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Max Reward ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={maxReward}
                  onChange={(e) => setMaxReward(e.target.value)}
                  placeholder="500"
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Campaign Settings */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
              Campaign Settings
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Start Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Status *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'ACTIVE')}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded-sm focus:ring-indigo-500"
                  />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">
                    Make campaign public
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowTeamBounties}
                    onChange={(e) => setAllowTeamBounties(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded-sm focus:ring-indigo-500"
                  />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">
                    Allow team bounties
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Additional Settings (Optional) */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
              Additional Settings (Optional)
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Scope (JSON or plain text)
                </label>
                <textarea
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  placeholder='{"domains": ["example.com", "api.example.com"]} or plain text (one per line)'
                  rows={4}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Rules (JSON or plain text)
                </label>
                <textarea
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                  placeholder='{"rules": ["No DDoS attacks", "No social engineering"]} or plain text (one per line)'
                  rows={4}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Severity Levels (JSON - Optional)
                </label>
                <textarea
                  value={severityLevels}
                  onChange={(e) => setSeverityLevels(e.target.value)}
                  placeholder='{"CRITICAL": {"reward": 500, "description": "..."}, ...}'
                  rows={6}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                />
                <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                  Leave empty to use default severity levels based on reward range
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link
              to="/bug-bounty/campaigns"
              className="px-6 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Creating...
                </>
              ) : (
                <>
                  <FiSave className="w-5 h-5" />
                  Create Campaign
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


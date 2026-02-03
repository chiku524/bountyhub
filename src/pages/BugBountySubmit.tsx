import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import { useAuth } from '../contexts/AuthProvider'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { PageMetadata } from '../components/PageMetadata'
import { FiArrowLeft, FiSend } from 'react-icons/fi'
import type { BugBountyCampaign } from '../types'

const SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'] as const

export default function BugBountySubmit() {
  const { id: campaignId } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState<BugBountyCampaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'>('MEDIUM')
  const [stepsToReproduce, setStepsToReproduce] = useState('')
  const [impact, setImpact] = useState('')
  const [suggestedFix, setSuggestedFix] = useState('')

  useEffect(() => {
    if (campaignId && user) {
      loadCampaign()
    } else if (!user) {
      setLoading(false)
    }
  }, [campaignId, user])

  const loadCampaign = async () => {
    if (!campaignId) return
    try {
      setLoading(true)
      setError(null)
      const data = await api.getBugBountyCampaign(campaignId)
      setCampaign(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load campaign')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!campaignId) return
    setSubmitting(true)
    setError(null)

    if (!title.trim()) {
      setError('Title is required')
      setSubmitting(false)
      return
    }
    if (!description.trim()) {
      setError('Description is required')
      setSubmitting(false)
      return
    }

    try {
      await api.createBugSubmission(campaignId, {
        title: title.trim(),
        description: description.trim(),
        severity,
        stepsToReproduce: stepsToReproduce.trim() || undefined,
        impact: impact.trim() || undefined,
        suggestedFix: suggestedFix.trim() || undefined,
      })
      navigate(`/bug-bounty/campaigns/${campaignId}`)
    } catch (err: any) {
      setError(err?.message || err?.errorData?.error || 'Failed to submit bug')
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xs flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">Please log in to submit a bug</h1>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xs flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error && !campaign) {
    return (
      <div className="min-h-screen bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xs">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorMessage message={error} />
          <Link
            to="/bug-bounty/campaigns"
            className="mt-4 inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Campaigns
          </Link>
        </div>
      </div>
    )
  }

  if (campaign && campaign.status !== 'ACTIVE') {
    return (
      <div className="min-h-screen bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xs">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorMessage message="This campaign is not accepting submissions. Only active campaigns accept new bug reports." />
          <Link
            to={`/bug-bounty/campaigns/${campaignId}`}
            className="mt-4 inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Campaign
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xs">
      <PageMetadata
        title={`Submit Bug - ${campaign?.title ?? 'Campaign'}`}
        description="Submit a bug report to this bug bounty campaign"
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to={`/bug-bounty/campaigns/${campaignId}`}
          className="inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium mb-6"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to Campaign
        </Link>

        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
          Submit Bug Report
        </h1>
        {campaign && (
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Submitting to: <span className="font-medium text-neutral-900 dark:text-white">{campaign.title}</span>
          </p>
        )}

        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief summary of the vulnerability"
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
                  placeholder="Detailed description of the bug, how you found it, and what the impact is..."
                  rows={6}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Severity *
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as typeof severity)}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {SEVERITIES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Steps to Reproduce (optional)
                </label>
                <textarea
                  value={stepsToReproduce}
                  onChange={(e) => setStepsToReproduce(e.target.value)}
                  placeholder="1. Go to...&#10;2. Click on...&#10;3. Observe..."
                  rows={4}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Impact (optional)
                </label>
                <textarea
                  value={impact}
                  onChange={(e) => setImpact(e.target.value)}
                  placeholder="What could an attacker achieve with this vulnerability?"
                  rows={3}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Suggested Fix (optional)
                </label>
                <textarea
                  value={suggestedFix}
                  onChange={(e) => setSuggestedFix(e.target.value)}
                  placeholder="Recommendations for fixing the issue..."
                  rows={3}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Link
              to={`/bug-bounty/campaigns/${campaignId}`}
              className="px-6 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  Submitting...
                </>
              ) : (
                <>
                  <FiSend className="w-5 h-5" />
                  Submit Bug Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

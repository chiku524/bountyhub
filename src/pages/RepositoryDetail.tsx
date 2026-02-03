import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../utils/api'
import { useAuth } from '../contexts/AuthProvider'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { PageMetadata } from '../components/PageMetadata'
import { FiGithub, FiStar, FiGitBranch, FiExternalLink, FiArrowLeft, FiDollarSign } from 'react-icons/fi'
import type { GitHubRepository } from '../types'

export default function RepositoryDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [repo, setRepo] = useState<GitHubRepository | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setError('Invalid repository')
      setLoading(false)
      return
    }
    let cancelled = false
    api
      .getGitHubRepository(id)
      .then((data) => {
        if (!cancelled) setRepo(data)
      })
      .catch((err: any) => {
        if (!cancelled) setError(err?.message || err?.errorData?.error || 'Failed to load repository')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [id])

  if (!user) {
    return (
      <div className="min-h-screen bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xs flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">Please log in to view repository details</h1>
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

  if (error || !repo) {
    return (
      <div className="min-h-screen bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xs">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorMessage message={error || 'Repository not found'} />
          <Link
            to="/repositories"
            className="mt-4 inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 font-medium"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Repositories
          </Link>
        </div>
      </div>
    )
  }

  const topics = repo.topics ? (() => { try { return JSON.parse(repo.topics) as string[] } catch { return [] } })() : []

  return (
    <div className="min-h-screen bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xs">
      <PageMetadata
        title={`${repo.name} - GitHub Repositories`}
        description={repo.description || `View ${repo.fullName} on BountyHub`}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/repositories"
          className="inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium mb-6"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to Repositories
        </Link>

        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div className="flex items-start gap-3 min-w-0">
              <FiGithub className="w-10 h-10 text-neutral-500 dark:text-neutral-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white truncate">
                  {repo.name}
                </h1>
                <p className="text-neutral-500 dark:text-neutral-400 truncate">{repo.fullName}</p>
              </div>
            </div>
            <a
              href={repo.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-700 hover:bg-indigo-600 hover:text-white text-neutral-700 dark:text-neutral-200 rounded-lg font-medium transition-colors shrink-0"
            >
              <FiExternalLink className="w-4 h-4" />
              Open on GitHub
            </a>
          </div>

          {repo.description && (
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              {repo.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-neutral-600 dark:text-neutral-400">
            {repo.language && (
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-indigo-500" />
                <span>{repo.language}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <FiStar className="w-4 h-4" />
              <span>{repo.stars} stars</span>
            </div>
            <div className="flex items-center gap-1">
              <FiGitBranch className="w-4 h-4" />
              <span>{repo.forks} forks</span>
            </div>
            {repo.isPrivate && (
              <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 rounded text-xs">
                Private
              </span>
            )}
            {repo.isFork && (
              <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 rounded text-xs">
                Fork
              </span>
            )}
            <span className="text-neutral-500 dark:text-neutral-500">
              Default branch: {repo.defaultBranch}
            </span>
          </div>

          {topics.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {topics.map((topic: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400 rounded-full text-sm"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}

          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              {repo.lastSyncedAt && (
                <span>Last synced: {new Date(repo.lastSyncedAt).toLocaleString()}</span>
              )}
            </div>
            <Link
              to={`/bug-bounty/campaigns/create?repositoryId=${encodeURIComponent(repo.id)}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shrink-0"
            >
              <FiDollarSign className="w-4 h-4" />
              Create Bug Bounty Campaign
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

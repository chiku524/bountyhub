import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'
import { config } from '../utils/config'
import { useAuth } from '../contexts/AuthProvider'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { PageContainer } from '../components/PageContainer'
import { PageHeader } from '../components/PageHeader'
import { EmptyState } from '../components/EmptyState'
import { PageMetadata } from '../components/PageMetadata'
import { FiGithub, FiRefreshCw, FiStar, FiGitBranch, FiCode, FiExternalLink, FiLink } from 'react-icons/fi'
import { Pagination } from '../components/Pagination'
import type { GitHubRepository } from '../types'

const REPOS_PER_PAGE = 12

export default function Repositories() {
  const { user } = useAuth()
  const [repositories, setRepositories] = useState<GitHubRepository[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterLanguage, setFilterLanguage] = useState('')
  const [githubConnected, setGithubConnected] = useState(false)
  const [checkingConnection, setCheckingConnection] = useState(true)
  const [syncRequiresReconnect, setSyncRequiresReconnect] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const isMountedRef = useRef(true)

  // Use auth user's githubUsername for initial state so GitHub appears connected on first paint
  useEffect(() => {
    if (user?.githubUsername) {
      setGithubConnected(true)
    }
  }, [user?.githubUsername])

  useEffect(() => {
    isMountedRef.current = true

    if (user) {
      checkGitHubConnection().catch(err => {
        if (isMountedRef.current) {
          console.error('Error checking GitHub connection:', err)
        }
      })
    } else {
      if (isMountedRef.current) {
        setLoading(false)
        setCheckingConnection(false)
      }
    }

    return () => {
      isMountedRef.current = false
    }
  }, [user])

  const checkGitHubConnection = async () => {
    if (!isMountedRef.current) return

    try {
      setCheckingConnection(true)
      const response = await fetch(`${config.api.baseUrl}/api/auth/github/profile`, {
        credentials: 'include'
      })
      if (!isMountedRef.current) return

      if (response.ok) {
        setGithubConnected(true)
        await loadRepositories()
      } else {
        // Only set disconnected when we get a definitive "not connected" (404).
        // On network/5xx errors, keep trusting user?.githubUsername from auth so
        // client-side navigation doesn't briefly show "not connected" until refresh.
        if (response.status === 404) {
          setGithubConnected(false)
        }
        setLoading(false)
      }
    } catch (error) {
      if (!isMountedRef.current) return
      console.error('Error checking GitHub connection:', error)
      // On network error, don't overwrite: auth context may already have githubUsername
      if (user?.githubUsername) {
        setGithubConnected(true)
      } else {
        setGithubConnected(false)
      }
      setLoading(false)
    } finally {
      if (isMountedRef.current) {
        setCheckingConnection(false)
      }
    }
  }

  const loadRepositories = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.getGitHubRepositories()
      setRepositories(response.repositories)
    } catch (err: any) {
      setError(err.message || 'Failed to load repositories')
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    if (!githubConnected) {
      setError('Please connect your GitHub account first')
      return
    }
    try {
      setSyncing(true)
      setError(null)
      setSyncRequiresReconnect(false)
      const response = await api.syncGitHubRepositories()
      setRepositories(response.repositories)
    } catch (err: any) {
      // Extract error message: prefer details from API (includes GitHub status/message)
      const data = err?.errorData || {}
      let errorMessage = data.details && data.details.trim()
        ? data.details
        : (err?.message || data.error || 'Failed to sync repositories')
      if (data.details && data.error && !String(errorMessage).includes(data.error)) {
        errorMessage = `${data.error}: ${data.details}`
      }

      if (data.requiresReconnect) {
        setSyncRequiresReconnect(true)
        errorMessage = data.hint
          ? `${errorMessage}\n\n${data.hint}`
          : `${errorMessage}\n\nPlease disconnect and reconnect your GitHub account from Settings to grant repository access permissions.`
      }

      console.error('Sync error:', { message: err?.message, errorData: data, error: err })
      setError(errorMessage)
    } finally {
      setSyncing(false)
    }
  }

  const handleConnectGitHub = async () => {
    try {
      setError(null)
      const response = await fetch(`${config.api.baseUrl}/api/auth/github/connect`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await response.json().catch(() => ({}))
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl
      } else {
        setError(data?.error || data?.details || `Failed to connect GitHub account (${response.status})`)
      }
    } catch (_error) {
      setError('Failed to connect GitHub account')
    }
  }

  const filteredRepositories = repositories.filter(repo => {
    const matchesSearch = repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         repo.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesLanguage = !filterLanguage || repo.language === filterLanguage
    return matchesSearch && matchesLanguage
  })

  const totalPages = Math.max(1, Math.ceil(filteredRepositories.length / REPOS_PER_PAGE))
  const paginatedRepositories = filteredRepositories.slice(
    (currentPage - 1) * REPOS_PER_PAGE,
    currentPage * REPOS_PER_PAGE
  )

  const languages = Array.from(new Set(repositories.map(repo => repo.language).filter(Boolean))) as string[]

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filterLanguage])

  if (!user) {
    return (
      <div className="min-h-screen bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xs flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">Please log in to view repositories</h1>
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
    <>
      <PageMetadata
        title="GitHub Repositories"
        description="Manage and view your connected GitHub repositories"
      />
      <PageContainer>
        <PageHeader
          title="GitHub Repositories"
          description="Manage your connected GitHub repositories and track contributions"
          actions={
            <button
              onClick={handleSync}
              disabled={syncing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiRefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Repositories'}
            </button>
          }
        />

        {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <FiCode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
            </div>
            {languages.length > 0 && (
              <select
                value={filterLanguage}
                onChange={(e) => setFilterLanguage(e.target.value)}
                className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Languages</option>
                {languages.sort().map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} />
            {syncRequiresReconnect && (
              <Link
                to="/settings?tab=account"
                className="mt-2 inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
              >
                Open Settings to reconnect GitHub →
              </Link>
            )}
          </div>
        )}

        {/* Loading State */}
        {checkingConnection || loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : !githubConnected ? (
          <EmptyState
            icon={<FiGithub className="w-16 h-16 mx-auto" />}
            title="Connect GitHub"
            description="Connect your GitHub account to view and sync your repositories. BountyHub requests permission to list your repos when you connect."
            action={
              <button
                onClick={handleConnectGitHub}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
              >
                <FiLink className="w-5 h-5" />
                Connect GitHub Account
              </button>
            }
          />
        ) : filteredRepositories.length === 0 ? (
          <EmptyState
            icon={<FiGithub className="w-16 h-16 mx-auto" />}
            title={repositories.length === 0 ? 'No repositories yet' : 'No matches'}
            description={
              repositories.length === 0
                ? 'Sync repositories from GitHub to get started.'
                : 'No repositories match your filters.'
            }
            action={
              repositories.length === 0 ? (
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiRefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Syncing...' : 'Sync Repositories'}
                </button>
              ) : undefined
            }
          />
        ) : (
          <>
            {/* Repositories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedRepositories.map((repo) => (
                <div
                  key={repo.id}
                  className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 hover:shadow-lg transition-all duration-200 hover:border-indigo-500 dark:hover:border-indigo-400"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-1 truncate">
                        {repo.name}
                      </h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                        {repo.fullName}
                      </p>
                    </div>
                    <a
                      href={repo.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 ml-2 text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      <FiExternalLink className="w-5 h-5" />
                    </a>
                  </div>

                  {repo.description && (
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4 line-clamp-2">
                      {repo.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-neutral-600 dark:text-neutral-400">
                    {repo.language && (
                      <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                        <span>{repo.language}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <FiStar className="w-4 h-4" />
                      <span>{repo.stars}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiGitBranch className="w-4 h-4" />
                      <span>{repo.forks}</span>
                    </div>
                    {repo.isPrivate && (
                      <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 rounded-sm text-xs">
                        Private
                      </span>
                    )}
                    {repo.isFork && (
                      <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 rounded-sm text-xs">
                        Fork
                      </span>
                    )}
                  </div>

                  {repo.topics && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {JSON.parse(repo.topics).slice(0, 3).map((topic: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400 rounded-full text-xs"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <Link
                      to={`/repositories/${repo.id}`}
                      className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      View Details
                    </Link>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {repo.lastSyncedAt
                        ? `Synced ${new Date(repo.lastSyncedAt).toLocaleDateString()}`
                        : 'Not synced'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </PageContainer>
    </>
  )
}


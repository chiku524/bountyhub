import { Navigate, useLocation, Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../contexts/AuthProvider'
import { PageContainer } from './PageContainer'
import { LoadingSpinner } from './LoadingSpinner'
import { EmptyState } from './EmptyState'

type ProtectedRouteProps = {
  children: ReactNode
  /** When set, user.role must match (e.g. 'admin') */
  role?: 'admin' | 'moderator' | 'user'
  /** Optional custom title when unauthenticated */
  title?: string
  description?: string
}

/**
 * Gate for authenticated routes. Shows a loading state while auth resolves,
 * then either a login prompt, a forbidden state, or the child route.
 */
export function ProtectedRoute({
  children,
  role,
  title = 'Sign in required',
  description = 'Please log in to access this page.',
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading…</p>
        </div>
      </PageContainer>
    )
  }

  if (!user) {
    const returnTo = `${location.pathname}${location.search}`
    return (
      <PageContainer>
        <EmptyState
          title={title}
          description={description}
          action={
            <Link
              to={`/login?redirectTo=${encodeURIComponent(returnTo)}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
            >
              Go to Login
            </Link>
          }
        />
      </PageContainer>
    )
  }

  if (role && user.role !== role) {
    return (
      <PageContainer>
        <EmptyState
          title="Access denied"
          description="You do not have permission to view this page."
          action={
            <Link
              to="/community"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
            >
              Back to community
            </Link>
          }
        />
      </PageContainer>
    )
  }

  return <>{children}</>
}

/** Convenience wrapper that redirects instead of showing an empty state. */
export function ProtectedRedirect({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <LoadingSpinner size="lg" />
        </div>
      </PageContainer>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <>{children}</>
}

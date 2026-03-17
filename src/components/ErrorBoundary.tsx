import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { FiRefreshCw, FiHome } from 'react-icons/fi'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 bg-white dark:bg-neutral-900">
          <div className="text-center max-w-lg">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-500/10 text-red-500 mb-6">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">
              Something went wrong
            </h1>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400 text-sm">
              We've been notified and are looking into it. You can try refreshing or head back home.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium"
              >
                <FiRefreshCw className="w-5 h-5" />
                Refresh page
              </button>
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors font-medium"
              >
                <FiHome className="w-5 h-5" />
                Home
              </Link>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

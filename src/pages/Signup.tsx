import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthProvider'
import { useRestoreFocusWhenOpen } from '../hooks/useRestoreFocus'
import { config } from '../utils/config'
import { isDesktopApp } from '../utils/desktop'
import { LoadingSpinner } from '../components/LoadingSpinner'
import '../components/desktop-splash.css'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()
  const emailRef = useRef(null)
  const passwordRef = useRef(null)
  const usernameRef = useRef(null)
  const isDesktop = isDesktopApp()
  useRestoreFocusWhenOpen(loading)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    let navigated = false

    try {
      const result = await signup(email, password, username)
      if (result.success) {
        navigated = true
        navigate('/profile')
      } else {
        setError(result.error || 'Signup failed')
      }
    } catch (_err) {
      setError('An unexpected error occurred')
    } finally {
      if (!navigated) setLoading(false)
    }
  }

  return (
    <div
      className={
        isDesktop
          ? 'desktop-intro-canvas text-neutral-900 dark:text-white'
          : `min-h-screen flex items-center justify-center text-neutral-900 dark:text-white transition-colors duration-200 py-12 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xs`
      }
    >
      <div className={`w-full ${isDesktop ? 'max-w-[380px] px-4' : 'max-w-md space-y-8'}`}>
        <div
          className={
            isDesktop
              ? 'animate-intro-slide-in-delay rounded-2xl border border-cyan-500/20 dark:border-violet-500/30 bg-neutral-900/95 px-8 py-10 shadow-2xl backdrop-blur-sm'
              : ''
          }
        >
          <div>
            <h2 className={`text-center font-extrabold text-neutral-900 dark:text-white ${isDesktop ? 'text-2xl' : 'mt-6 text-3xl'}`}>
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-neutral-500 dark:text-gray-400">
              Or{' '}
              <Link to="/login" className="font-medium text-violet-400 hover:text-violet-300">
                sign in to your existing account
              </Link>
            </p>
          </div>
          <form
            className={`relative ${isDesktop ? 'mt-6 space-y-5' : 'mt-8 space-y-6'}`}
            onSubmit={handleSubmit}
            aria-busy={loading}
          >
            {loading && (
              <div
                className={`absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-lg ${isDesktop ? 'bg-neutral-950/75' : 'bg-white/85 dark:bg-neutral-950/80'}`}
                role="status"
                aria-live="polite"
              >
                <LoadingSpinner graphic="logo" size="lg" variant={isDesktop ? 'inverse' : 'default'} label={false} />
                <span className="text-sm text-neutral-600 dark:text-neutral-300">Creating your account…</span>
                <span className="sr-only">Creating account, please wait</span>
              </div>
            )}
            <div className={isDesktop ? 'space-y-3' : 'rounded-md shadow-xs -space-y-px'}>
              <div>
                <label htmlFor="username" className="sr-only">
                  Username
                </label>
                <input
                  ref={usernameRef}
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  className={`appearance-none relative block w-full px-3 py-2 border bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent sm:text-sm disabled:opacity-60 disabled:cursor-wait ${
                    isDesktop ? 'rounded-lg border-neutral-600 dark:border-gray-600' : 'rounded-none rounded-t-md border-neutral-300 dark:border-gray-700 focus:ring-violet-500 focus:border-violet-500 focus:z-10'
                  }`}
                  placeholder="Username"
                  aria-invalid={!!error}
                  aria-describedby="username-error"
                />
              </div>
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  ref={emailRef}
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className={`appearance-none relative block w-full px-3 py-2 border bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent sm:text-sm disabled:opacity-60 disabled:cursor-wait ${
                    isDesktop ? 'rounded-lg border-neutral-600 dark:border-gray-600' : 'rounded-none border-neutral-300 dark:border-gray-700 focus:ring-violet-500 focus:border-violet-500 focus:z-10'
                  }`}
                  placeholder="Email address"
                  aria-invalid={!!error}
                  aria-describedby="email-error"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  ref={passwordRef}
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className={`appearance-none relative block w-full px-3 py-2 border bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent sm:text-sm disabled:opacity-60 disabled:cursor-wait ${
                    isDesktop ? 'rounded-lg border-neutral-600 dark:border-gray-600' : 'rounded-none rounded-b-md border-neutral-300 dark:border-gray-700 focus:ring-violet-500 focus:border-violet-500 focus:z-10'
                  }`}
                  placeholder="Password"
                  aria-invalid={!!error}
                  aria-describedby="password-error"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-500/10 border border-red-500/20 p-4">
                <div className="text-sm text-red-500 dark:text-red-400">
                  {error}
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent text-sm font-medium text-white disabled:opacity-90 disabled:cursor-wait transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isDesktop
                    ? 'rounded-xl bg-indigo-600 hover:bg-indigo-500 focus:ring-cyan-400 focus:ring-offset-neutral-900'
                    : 'rounded-md bg-violet-600 hover:bg-violet-700 focus:ring-violet-500'
                }`}
              >
                <span>{loading ? 'Creating account…' : 'Create account'}</span>
              </button>
            </div>

            {/* GitHub OAuth */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className={`px-2 text-neutral-500 dark:text-gray-400 ${isDesktop ? 'bg-neutral-900/95' : 'bg-white/80 dark:bg-neutral-900/80'}`}>
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <a
                  href={`${config.api.baseUrl}/api/auth/github`}
                  className={`w-full flex items-center justify-center gap-3 px-4 py-2 border text-neutral-700 dark:text-neutral-300 transition-colors ${
                    isDesktop
                      ? 'border-cyan-500/30 dark:border-violet-500/30 rounded-xl bg-white/10 hover:bg-white/20 dark:bg-neutral-800 dark:hover:bg-neutral-700'
                      : 'border-neutral-300 dark:border-gray-600 rounded-md bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                  }`}
                >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                </svg>
                <span>Continue with GitHub</span>
              </a>
            </div>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
} 
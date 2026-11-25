import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'
import { AuthCard, authInputClass } from '../components/AuthCard'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.request('/api/auth/password-reset/request', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() }),
      })
      setSent(true)
    } catch (err: any) {
      setError(err?.message || 'Could not send the reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle={sent ? undefined : "Enter your account's email and we'll send you a link to choose a new password."}
    >
      {sent ? (
        <div className="space-y-4 text-center text-sm" role="status">
          <p>
            If an account exists for <strong>{email.trim()}</strong>, a reset link is on its way. It works for one hour.
          </p>
          <p className="text-neutral-500 dark:text-neutral-400">Can't find it? Check your spam folder, or try again.</p>
          <div className="flex justify-center gap-3">
            <button type="button" onClick={() => setSent(false)} className="btn-secondary px-4 py-2 text-sm">
              Try again
            </button>
            <Link to="/login" className="btn-primary px-4 py-2 text-sm">
              Back to log in
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" aria-busy={loading}>
          <div>
            <label htmlFor="reset-email" className="mb-1 block text-sm font-medium">
              Email address
            </label>
            <input
              id="reset-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className={authInputClass}
            />
          </div>
          {error && (
            <p className="text-sm text-red-500" role="alert">
              {error}
            </p>
          )}
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2">
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
          <p className="text-center text-sm">
            <Link to="/login" className="font-medium text-violet-500 hover:text-violet-400">
              Back to log in
            </Link>
          </p>
        </form>
      )}
    </AuthCard>
  )
}

import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../utils/api'
import { AuthCard, authInputClass } from '../components/AuthCard'
import { useToast } from '../contexts/ToastContext'

const MIN_LENGTH = 8

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const navigate = useNavigate()
  const toast = useToast()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const mismatch = confirm.length > 0 && confirm !== password
  const tooShort = password.length > 0 && password.length < MIN_LENGTH

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < MIN_LENGTH || password !== confirm) return
    setError('')
    setLoading(true)
    try {
      await api.request('/api/auth/password-reset/confirm', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      })
      toast.success('Password updated. Log in with your new password.')
      navigate('/login', { replace: true })
    } catch (err: any) {
      setError(err?.message || 'Could not reset your password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <AuthCard title="Reset link missing" subtitle="This page needs the link from your reset email.">
        <div className="text-center">
          <Link to="/forgot-password" className="btn-primary px-4 py-2 text-sm">
            Request a new link
          </Link>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Choose a new password" subtitle={`Use at least ${MIN_LENGTH} characters.`}>
      <form onSubmit={handleSubmit} className="space-y-4" aria-busy={loading}>
        <div>
          <label htmlFor="new-password" className="mb-1 block text-sm font-medium">
            New password
          </label>
          <input
            id="new-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            minLength={MIN_LENGTH}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className={authInputClass}
            aria-invalid={tooShort}
          />
          {tooShort && <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">At least {MIN_LENGTH} characters.</p>}
        </div>
        <div>
          <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium">
            Confirm new password
          </label>
          <input
            id="confirm-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={loading}
            className={authInputClass}
            aria-invalid={mismatch}
          />
          {mismatch && <p className="mt-1 text-xs text-red-500">Passwords don't match.</p>}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} />
          Show passwords
        </label>
        {error && (
          <p className="text-sm text-red-500" role="alert">
            {error}{' '}
            <Link to="/forgot-password" className="underline">
              Request a new link
            </Link>
          </p>
        )}
        <button
          type="submit"
          disabled={loading || password.length < MIN_LENGTH || password !== confirm}
          className="btn-primary w-full justify-center py-2 disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Set new password'}
        </button>
      </form>
    </AuthCard>
  )
}

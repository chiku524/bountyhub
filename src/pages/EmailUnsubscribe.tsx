import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../utils/api'
import { AuthCard } from '../components/AuthCard'

/** Landing page for the "unsubscribe" link in digest emails. Works without signing in. */
export default function EmailUnsubscribe() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [state, setState] = useState<'working' | 'done' | 'error'>(token ? 'working' : 'error')
  const [error, setError] = useState(token ? '' : 'This unsubscribe link is missing its token.')
  const started = useRef(false)

  useEffect(() => {
    if (!token || started.current) return
    started.current = true
    api
      .request('/api/notifications/digest/unsubscribe', { method: 'POST', body: JSON.stringify({ token }) })
      .then(() => setState('done'))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Could not unsubscribe right now.')
        setState('error')
      })
  }, [token])

  const settingsLink = (
    <div className="text-center">
      <Link to="/settings?tab=notifications" className="btn-primary px-4 py-2 text-sm">
        Notification settings
      </Link>
    </div>
  )

  if (state === 'working') return <AuthCard title="Unsubscribing…" subtitle="One moment.">{null}</AuthCard>
  if (state === 'done') {
    return (
      <AuthCard title="You're unsubscribed" subtitle="You won't get digest emails anymore. You can turn them back on in Settings.">
        {settingsLink}
      </AuthCard>
    )
  }
  return (
    <AuthCard title="Couldn't unsubscribe" subtitle={error}>
      {settingsLink}
    </AuthCard>
  )
}

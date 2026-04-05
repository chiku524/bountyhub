import { useEffect, useState } from 'react'
import { formatAbsoluteDateTime, formatRelativeTime } from '../utils/formatRelativeTime'

interface RelativeTimeProps {
  date: string | Date
  className?: string
  /** Recompute relative label periodically (ms). Default 60s. */
  tickMs?: number
}

export function RelativeTime({ date, className = '', tickMs = 60_000 }: RelativeTimeProps) {
  const [, bump] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => bump((n) => n + 1), tickMs)
    return () => window.clearInterval(id)
  }, [tickMs])

  const absolute = formatAbsoluteDateTime(date)
  const relative = formatRelativeTime(date)

  return (
    <time dateTime={typeof date === 'string' ? date : date.toISOString()} title={absolute} className={className}>
      {relative}
    </time>
  )
}

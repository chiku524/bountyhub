import { useEffect, useState } from 'react'
import { formatAbsoluteDateTime, formatRelativeTime } from '../utils/formatRelativeTime'

interface RelativeTimeProps {
  date: string | Date | number | null | undefined
  className?: string
  /** Recompute relative label periodically (ms). Default 60s. */
  tickMs?: number
}

function toDateTimeAttr(date: string | Date | number | null | undefined): string | undefined {
  if (date == null) return undefined
  if (typeof date === 'string') return date
  if (typeof date === 'number') {
    const ms = date < 10_000_000_000 ? date * 1000 : date
    const d = new Date(ms)
    return Number.isNaN(d.getTime()) ? undefined : d.toISOString()
  }
  if (date instanceof Date) {
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
  }
  return undefined
}

export function RelativeTime({ date, className = '', tickMs = 60_000 }: RelativeTimeProps) {
  const [, bump] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => bump((n) => n + 1), tickMs)
    return () => window.clearInterval(id)
  }, [tickMs])

  if (date == null) {
    return <span className={className}>—</span>
  }

  const absolute = formatAbsoluteDateTime(
    typeof date === 'number'
      ? new Date(date < 10_000_000_000 ? date * 1000 : date)
      : date,
  )
  const relative = formatRelativeTime(
    typeof date === 'number'
      ? new Date(date < 10_000_000_000 ? date * 1000 : date)
      : date,
  )
  const dateTime = toDateTimeAttr(date)

  return (
    <time dateTime={dateTime} title={absolute} className={className}>
      {relative}
    </time>
  )
}

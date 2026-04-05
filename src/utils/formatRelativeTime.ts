export function formatRelativeTime(iso: string | Date, nowMs: number = Date.now()): string {
  const t = typeof iso === 'string' ? new Date(iso).getTime() : iso.getTime()
  if (Number.isNaN(t)) return '—'
  const diffMs = nowMs - t
  const abs = Math.abs(diffMs)
  const future = diffMs < 0

  if (abs < 45_000) return future ? 'in a moment' : 'just now'
  if (abs < 60_000) {
    const s = Math.round(abs / 1000)
    return future ? `in ${s}s` : `${s}s ago`
  }

  const minute = 60_000
  const hour = 3_600_000
  const day = 86_400_000
  const week = 604_800_000
  const month = 2_592_000_000
  const year = 31_536_000_000

  const fmt = (n: number, unit: string, unitPlural: string) => {
    const u = n === 1 ? unit : unitPlural
    return future ? `in ${n} ${u}` : `${n} ${u} ago`
  }

  if (abs < hour) {
    const n = Math.round(abs / minute)
    return fmt(n, 'minute', 'minutes')
  }
  if (abs < day) {
    const n = Math.round(abs / hour)
    return fmt(n, 'hour', 'hours')
  }
  if (abs < week) {
    const n = Math.round(abs / day)
    return fmt(n, 'day', 'days')
  }
  if (abs < month) {
    const n = Math.round(abs / week)
    return fmt(n, 'week', 'weeks')
  }
  if (abs < year) {
    const n = Math.round(abs / month)
    return fmt(n, 'month', 'months')
  }
  const n = Math.round(abs / year)
  return fmt(n, 'year', 'years')
}

export function formatAbsoluteDateTime(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

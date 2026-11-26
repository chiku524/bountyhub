import { describe, expect, it } from 'vitest'
import type { AppNotification } from '../hooks/useNotificationsQuery'
import { FIRST_RUN_LOOKBACK_MS, MAX_ALERT_AGE_MS, pickAlerts } from './notificationAlerts'

const NOW = Date.UTC(2026, 10, 26, 12, 0, 0)

function n(id: string, minutesAgo: number, over: Partial<AppNotification> = {}): AppNotification {
  return {
    id,
    userId: 'u1',
    type: 'answer',
    title: `Title ${id}`,
    message: `Message ${id}`,
    read: false,
    createdAt: new Date(NOW - minutesAgo * 60_000).toISOString(),
    ...over,
  }
}

describe('pickAlerts', () => {
  it('first run only alerts what arrived in the last couple of minutes', () => {
    const d = pickAlerts([n('new', 1), n('old', 30)], null, NOW)
    expect(d.individual.map((x) => x.id)).toEqual(['new'])
    expect(d.watermark).toBe(NOW - 60_000)
  })

  it('first run with nothing recent sets the watermark to the lookback, not the past', () => {
    const d = pickAlerts([n('old', 30)], null, NOW)
    expect(d.individual).toEqual([])
    expect(d.watermark).toBe(NOW - FIRST_RUN_LOOKBACK_MS)
  })

  it('alerts everything newer than the watermark, oldest first, and advances it', () => {
    const wm = NOW - 10 * 60_000
    const d = pickAlerts([n('c', 1), n('b', 5), n('a', 20)], wm, NOW)
    expect(d.individual.map((x) => x.id)).toEqual(['b', 'c'])
    expect(d.watermark).toBe(NOW - 60_000)
  })

  it('does not alert again once the watermark has passed a notification', () => {
    const first = pickAlerts([n('a', 1)], NOW - 5 * 60_000, NOW)
    const second = pickAlerts([n('a', 1)], first.watermark, NOW + 30_000)
    expect(second.individual).toEqual([])
  })

  it('skips read notifications and votes', () => {
    const d = pickAlerts(
      [n('read', 1, { read: true }), n('vote', 1, { type: 'vote' }), n('bounty', 1, { type: 'bounty' })],
      NOW - 5 * 60_000,
      NOW,
    )
    expect(d.individual.map((x) => x.id)).toEqual(['bounty'])
  })

  it('never alerts anything older than a day, even with an old watermark', () => {
    const d = pickAlerts([n('ancient', 25 * 60), n('recent', 60)], NOW - 2 * MAX_ALERT_AGE_MS, NOW)
    expect(d.individual.map((x) => x.id)).toEqual(['recent'])
  })

  it('collapses a burst into one summary', () => {
    const list = [
      n('a', 1, { type: 'bounty' }),
      n('b', 2),
      n('c', 3),
      n('d', 4, { type: 'comment' }),
    ]
    const d = pickAlerts(list, NOW - 10 * 60_000, NOW)
    expect(d.individual).toEqual([])
    expect(d.summary).toEqual({
      title: '4 new notifications on BountyHub',
      body: '1 bounty awarded, 2 new answers, 1 other update',
    })
  })
})

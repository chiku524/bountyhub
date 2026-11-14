import { describe, expect, it } from 'vitest'
import {
  guideFollowUps,
  isTourIntent,
  localGuideResponse,
  matchFaqFallback,
  mergeActions,
  normalizeGuidePath,
  parseSupportActions,
} from './supportKnowledge'
import { filterTourSteps } from './supportTour'
import { formatTransactionStatus, formatPostStatus } from './walletStatus'

describe('supportKnowledge', () => {
  it('detects tour intents', () => {
    expect(isTourIntent('Give me a tour of the app')).toBe(true)
    expect(isTourIntent('show me around')).toBe(true)
    expect(isTourIntent('tour')).toBe(true)
    expect(isTourIntent('How do bounties work?')).toBe(false)
  })

  it('strips action tags and keeps allowed navigations', () => {
    const { reply, actions } = parseSupportActions(
      'Open Wallet to see your balance. [[action:navigate:/wallet]] [[action:start_tour]] [[action:navigate:/evil]]',
    )
    expect(reply).toContain('Open Wallet')
    expect(reply).not.toContain('[[action')
    expect(actions).toEqual([
      { type: 'navigate', path: '/wallet' },
      { type: 'start_tour' },
    ])
  })

  it('normalizes only allowlisted paths', () => {
    expect(normalizeGuidePath('/wallet/')).toBe('/wallet')
    expect(normalizeGuidePath('/docs#user-guide')).toBe('/docs')
    expect(normalizeGuidePath('/admin')).toBe(null)
    expect(normalizeGuidePath('https://evil.example')).toBe(null)
  })

  it('matches wallet FAQ', () => {
    const hit = matchFaqFallback('How do I deposit BBUX?')
    expect(hit?.actions).toEqual([{ type: 'navigate', path: '/wallet' }])
  })

  it('matches plural bounties FAQ (suggested Guide prompt)', () => {
    const hit = matchFaqFallback('How do bounties work?')
    expect(hit?.reply).toMatch(/Create a bounty/i)
    expect(hit?.actions).toEqual([{ type: 'navigate', path: '/posts/create' }])
  })

  it('returns a tour action from localGuideResponse', () => {
    const res = localGuideResponse('take me on a tour')
    expect(res.actions).toEqual([{ type: 'start_tour' }])
  })

  it('merges actions without duplicates', () => {
    expect(
      mergeActions([{ type: 'start_tour' }], [{ type: 'start_tour' }, { type: 'navigate', path: '/docs' }]),
    ).toEqual([{ type: 'start_tour' }, { type: 'navigate', path: '/docs' }])
  })
})

describe('filterTourSteps', () => {
  it('keeps the 3-step guest onboarding (bounty → wallet-guest → guide)', () => {
    const ids = filterTourSteps({ isDesktop: false, isAuthenticated: false }).map((s) => s.id)
    expect(ids).toEqual(['bounty', 'wallet-guest', 'guide'])
  })

  it('keeps the 3-step signed-in onboarding (bounty → wallet → guide)', () => {
    const ids = filterTourSteps({ isDesktop: true, isAuthenticated: true }).map((s) => s.id)
    expect(ids).toEqual(['bounty', 'wallet', 'guide'])
  })
})

describe('guideFollowUps', () => {
  it('returns 2–3 contextual chips', () => {
    const chips = guideFollowUps('How do bounties work?')
    expect(chips.length).toBeGreaterThanOrEqual(2)
    expect(chips.length).toBeLessThanOrEqual(3)
    expect(chips.every((c) => c.label && c.prompt)).toBe(true)
  })
})

describe('walletStatus', () => {
  it('maps pending / paid / failed to plain language', () => {
    expect(formatTransactionStatus('pending').label).toMatch(/Waiting/i)
    expect(formatTransactionStatus('completed').label).toBe('Paid')
    expect(formatTransactionStatus('failed').label).toMatch(/Didn/i)
    expect(formatPostStatus('OPEN').label).toBe('Open')
    expect(formatPostStatus('COMPLETED').label).toMatch(/paid/i)
  })
})

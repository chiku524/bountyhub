import { describe, expect, it } from 'vitest'
import {
  isTourIntent,
  localGuideResponse,
  matchFaqFallback,
  mergeActions,
  normalizeGuidePath,
  parseSupportActions,
} from './supportKnowledge'
import { filterTourSteps } from './supportTour'

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
  it('keeps guest web steps and omits signed-in chrome', () => {
    const ids = filterTourSteps({ isDesktop: false, isAuthenticated: false }).map((s) => s.id)
    expect(ids).toContain('welcome')
    expect(ids).toContain('home-nav')
    expect(ids).toContain('guide')
    expect(ids).not.toContain('wallet')
    expect(ids).not.toContain('desktop-sidebar')
  })

  it('keeps desktop signed-in sidebar instead of web top nav', () => {
    const ids = filterTourSteps({ isDesktop: true, isAuthenticated: true }).map((s) => s.id)
    expect(ids).toContain('desktop-sidebar')
    expect(ids).toContain('wallet')
    expect(ids).not.toContain('home-nav')
    expect(ids).not.toContain('top-nav')
  })
})

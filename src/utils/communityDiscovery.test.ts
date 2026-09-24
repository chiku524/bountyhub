import { describe, expect, it } from 'vitest'
import {
  COMMUNITY_DISCOVERY_TABS,
  filtersForDiscoveryTab,
  formatFeedSummary,
  getDiscoveryTab,
  isCommunityDiscoveryTab,
  parseDiscoveryTab,
} from './communityDiscovery'
import type { CommunityFilterOptions } from './communityPosts'

const base = (): CommunityFilterOptions => ({
  status: '',
  dateRange: '',
  sortBy: 'newest',
  hasBounty: false,
  unanswered: false,
  selectedTags: [],
})

describe('communityDiscovery', () => {
  it('exposes four discovery tabs', () => {
    expect(COMMUNITY_DISCOVERY_TABS.map((t) => t.id)).toEqual([
      'trending',
      'new',
      'bounties',
      'unanswered',
    ])
  })

  it('type-guards tab ids', () => {
    expect(isCommunityDiscoveryTab('trending')).toBe(true)
    expect(isCommunityDiscoveryTab('all')).toBe(false)
  })

  it('preserves selectedTags when switching tabs', () => {
    const next = filtersForDiscoveryTab('bounties', {
      ...base(),
      selectedTags: ['solana'],
    })
    expect(next.selectedTags).toEqual(['solana'])
    expect(next.hasBounty).toBe(true)
  })

  it('returns null when filters diverge from a tab preset', () => {
    expect(
      getDiscoveryTab({
        ...base(),
        status: 'closed',
        sortBy: 'trending',
        dateRange: 'month',
      })
    ).toBeNull()
  })

  it('defaults unknown URL tabs to trending', () => {
    expect(parseDiscoveryTab('')).toBe('trending')
    expect(parseDiscoveryTab('hot')).toBe('trending')
  })
})

describe('formatFeedSummary', () => {
  it('avoids duplicating tab and default sort labels', () => {
    expect(
      formatFeedSummary(4, 'trending', {
        ...base(),
        status: 'open',
        dateRange: 'month',
        sortBy: 'trending',
      })
    ).toBe('4 questions · Trending')
  })

  it('adds sort only when it differs from the tab default', () => {
    expect(
      formatFeedSummary(2, 'new', {
        ...base(),
        sortBy: 'oldest',
      })
    ).toBe('2 questions · New · oldest first')
  })

  it('includes selected tags when present', () => {
    expect(
      formatFeedSummary(1, 'bounties', {
        ...base(),
        status: 'open',
        hasBounty: true,
        sortBy: 'highestBounty',
        selectedTags: ['solana'],
      })
    ).toBe('1 question · Top Bounties · solana')
  })

  it('returns No questions when empty', () => {
    expect(formatFeedSummary(0, 'trending', base())).toBe('No questions')
  })
})


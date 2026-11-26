import { describe, expect, it } from 'vitest'
import {
  COMMUNITY_DISCOVERY_TABS,
  filtersForDiscoveryTab,
  formatFeedSummary,
  getDiscoveryTab,
  isCommunityDiscoveryTab,
  parseDiscoveryTab,
  visibleDiscoveryTabs,
} from './communityDiscovery'
import {
  buildCommunityPostsQuery,
  communityPostsQueryToSearchParams,
  type CommunityFilterOptions,
} from './communityPosts'

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


describe('Following tab', () => {
  it('is only shown to signed-in users, first in the list', () => {
    expect(visibleDiscoveryTabs(false).map((t) => t.id)).not.toContain('following')
    expect(visibleDiscoveryTabs(true)[0].id).toBe('following')
  })

  it('maps to the following filter and back', () => {
    const next = filtersForDiscoveryTab('following', { ...base(), selectedTags: ['rust'] })
    expect(next.following).toBe(true)
    expect(next.selectedTags).toEqual(['rust'])
    expect(getDiscoveryTab(next)).toBe('following')
    expect(parseDiscoveryTab('following')).toBe('following')
  })

  it('clears the following filter when switching to a public tab', () => {
    const next = filtersForDiscoveryTab('new', { ...base(), following: true })
    expect(next.following).toBeUndefined()
  })

  it('sends following=true to the API', () => {
    const query = buildCommunityPostsQuery(1, 12, '', { ...base(), following: true })
    expect(communityPostsQueryToSearchParams(query)).toContain('following=true')
  })
})

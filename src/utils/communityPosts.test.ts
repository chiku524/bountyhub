import { describe, expect, it } from 'vitest'
import { buildCommunityPostsQuery, type CommunityFilterOptions } from './communityPosts'
import {
  filtersForDiscoveryTab,
  getDiscoveryTab,
  parseDiscoveryTab,
} from './communityDiscovery'
import { filtersForPreset, getDiscoveryPreset } from '../components/community/CommunityDiscoveryBar'

const baseFilters = (): CommunityFilterOptions => ({
  status: '',
  dateRange: '',
  sortBy: 'newest',
  hasBounty: false,
  unanswered: false,
  selectedTags: [],
})

describe('buildCommunityPostsQuery', () => {
  it('omits default newest sort and empty filters', () => {
    const query = buildCommunityPostsQuery(1, 12, '', baseFilters())
    expect(query).toEqual({
      page: 1,
      limit: 12,
      q: undefined,
      status: undefined,
      dateRange: undefined,
      hasBounty: undefined,
      unanswered: undefined,
      tags: undefined,
      sortBy: undefined,
    })
  })

  it('includes unanswered when requested', () => {
    const query = buildCommunityPostsQuery(2, 12, 'solana', {
      ...baseFilters(),
      unanswered: true,
      status: 'open',
    })
    expect(query.unanswered).toBe(true)
    expect(query.status).toBe('open')
    expect(query.q).toBe('solana')
    expect(query.page).toBe(2)
  })

  it('passes trending and highestBounty sort to the API', () => {
    expect(
      buildCommunityPostsQuery(1, 12, '', { ...baseFilters(), sortBy: 'trending' }).sortBy
    ).toBe('trending')
    expect(
      buildCommunityPostsQuery(1, 12, '', { ...baseFilters(), sortBy: 'highestBounty' }).sortBy
    ).toBe('highestBounty')
  })
})

describe('community discovery tabs', () => {
  it('parses tab query values with trending as default', () => {
    expect(parseDiscoveryTab(null)).toBe('trending')
    expect(parseDiscoveryTab('new')).toBe('new')
    expect(parseDiscoveryTab('bounties')).toBe('bounties')
    expect(parseDiscoveryTab('unanswered')).toBe('unanswered')
    expect(parseDiscoveryTab('nope')).toBe('trending')
  })

  it('maps Trending to open + month + trending sort (server hot ranking)', () => {
    const next = filtersForDiscoveryTab('trending', baseFilters())
    expect(next.status).toBe('open')
    expect(next.dateRange).toBe('month')
    expect(next.sortBy).toBe('trending')
    expect(getDiscoveryTab(next)).toBe('trending')
  })

  it('maps Top Bounties to open + hasBounty + highestBounty sort', () => {
    const next = filtersForDiscoveryTab('bounties', baseFilters())
    expect(next.hasBounty).toBe(true)
    expect(next.status).toBe('open')
    expect(next.sortBy).toBe('highestBounty')
    expect(getDiscoveryTab(next)).toBe('bounties')
  })

  it('maps Unanswered to open questions with no answers', () => {
    const next = filtersForDiscoveryTab('unanswered', baseFilters())
    expect(next.unanswered).toBe(true)
    expect(next.status).toBe('open')
    expect(getDiscoveryTab(next)).toBe('unanswered')
  })

  it('maps New to newest-first with no extra filters', () => {
    const next = filtersForDiscoveryTab('new', { ...baseFilters(), sortBy: 'oldest' })
    expect(next.dateRange).toBe('')
    expect(next.sortBy).toBe('newest')
    expect(getDiscoveryTab(next)).toBe('new')
  })

  it('keeps deprecated preset helpers working for All / Open', () => {
    expect(getDiscoveryPreset(baseFilters())).toBe('new')
    const open = filtersForPreset('open', baseFilters())
    expect(open.status).toBe('open')
    expect(getDiscoveryPreset(open)).toBe('open')
  })
})

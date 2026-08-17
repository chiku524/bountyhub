import { describe, expect, it } from 'vitest'
import { buildCommunityPostsQuery, type CommunityFilterOptions } from './communityPosts'
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
})

describe('community discovery presets', () => {
  it('treats an empty filter set as All', () => {
    expect(getDiscoveryPreset(baseFilters())).toBe('all')
  })

  it('maps Unanswered to open questions with no answers', () => {
    const next = filtersForPreset('unanswered', baseFilters())
    expect(next.unanswered).toBe(true)
    expect(next.status).toBe('open')
    expect(getDiscoveryPreset(next)).toBe('unanswered')
  })

  it('maps New this week to the last seven days, newest first', () => {
    const next = filtersForPreset('new', { ...baseFilters(), sortBy: 'oldest' })
    expect(next.dateRange).toBe('week')
    expect(next.sortBy).toBe('newest')
    expect(getDiscoveryPreset(next)).toBe('new')
  })
})

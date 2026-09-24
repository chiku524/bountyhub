import { describe, expect, it } from 'vitest'
import { normalizeCommunityPostView } from './communityPostView'

describe('normalizeCommunityPostView', () => {
  it('keeps list and maps compact to list', () => {
    expect(normalizeCommunityPostView('list')).toBe('list')
    expect(normalizeCommunityPostView('compact')).toBe('list')
  })

  it('maps card to grid and accepts grid', () => {
    expect(normalizeCommunityPostView('card')).toBe('grid')
    expect(normalizeCommunityPostView('grid')).toBe('grid')
  })

  it('accepts gallery', () => {
    expect(normalizeCommunityPostView('gallery')).toBe('gallery')
  })

  it('falls back to list for unknown or empty values', () => {
    expect(normalizeCommunityPostView(null)).toBe('list')
    expect(normalizeCommunityPostView(undefined)).toBe('list')
    expect(normalizeCommunityPostView('')).toBe('list')
    expect(normalizeCommunityPostView('cards')).toBe('list')
  })
})
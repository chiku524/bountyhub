import { describe, expect, it } from 'vitest'
import { normalizePostIds } from './useBookmarkStatuses'

describe('normalizePostIds', () => {
  it('dedupes, drops empties, and sorts for a stable batch key', () => {
    expect(normalizePostIds(['b', '', 'a', 'b', 'c'])).toEqual(['a', 'b', 'c'])
  })

  it('returns an empty list for empty input', () => {
    expect(normalizePostIds([])).toEqual([])
  })
})

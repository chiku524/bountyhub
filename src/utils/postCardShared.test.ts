import { describe, expect, it } from 'vitest'
import { firstImageUrl, isNewPost } from '../components/community/postCardShared'
import type { Post } from '../types'

function basePost(overrides: Partial<Post> = {}): Post {
  return {
    id: 'p1',
    title: 'Hello',
    content: 'Body',
    authorId: 'u1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'OPEN',
    ...overrides,
  }
}

describe('firstImageUrl', () => {
  it('returns null when media is missing or empty', () => {
    expect(firstImageUrl(basePost())).toBeNull()
    expect(firstImageUrl(basePost({ media: [] }))).toBeNull()
  })

  it('returns null when media is not an array (signed-in API shape quirks)', () => {
    expect(firstImageUrl(basePost({ media: { type: 'image', url: 'x' } as unknown as Post['media'] }))).toBeNull()
  })

  it('finds images case-insensitively (DB stores IMAGE)', () => {
    expect(
      firstImageUrl(
        basePost({
          media: [
            { type: 'IMAGE' as 'image', url: 'https://example.com/a.png', isScreenRecording: false },
          ],
        }),
      ),
    ).toBe('https://example.com/a.png')
  })

  it('prefers thumbnailUrl when present', () => {
    expect(
      firstImageUrl(
        basePost({
          media: [
            {
              type: 'image',
              url: 'https://example.com/full.png',
              thumbnailUrl: 'https://example.com/thumb.png',
              isScreenRecording: false,
            },
          ],
        }),
      ),
    ).toBe('https://example.com/thumb.png')
  })
})

describe('isNewPost', () => {
  it('handles null/invalid dates without throwing', () => {
    expect(isNewPost(null)).toBe(false)
    expect(isNewPost(undefined)).toBe(false)
    expect(isNewPost('not-a-date')).toBe(false)
  })

  it('accepts unix seconds and Date objects', () => {
    const nowSec = Math.floor(Date.now() / 1000)
    expect(isNewPost(nowSec)).toBe(true)
    expect(isNewPost(new Date())).toBe(true)
  })
})

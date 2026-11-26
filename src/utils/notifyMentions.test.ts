import { describe, expect, it } from 'vitest'
import { notifyMentionedUsers } from './notifications'

/** Minimal stand-in for the Drizzle calls notifyMentionedUsers makes. */
function fakeDb(existing: { id: string; username: string }[]) {
  const inserted: Record<string, unknown>[] = []
  const db = {
    select: () => ({
      from: () => ({
        // The real query filters by lower(username) IN (...); the fake returns everyone, so the
        // filtering by author / allowed / excluded ids below is what is under test.
        where: async () => existing.map(({ id }) => ({ id })),
      }),
    }),
    insert: () => ({
      values: async (rows: Record<string, unknown>[]) => {
        inserted.push(...rows)
      },
    }),
  }
  return { db, inserted }
}

const base = {
  authorId: 'u-author',
  authorUsername: 'author',
  where: 'Global Chat',
  navigationType: 'chat' as const,
  navigationUrl: '/chat',
}

describe('notifyMentionedUsers', () => {
  it('does nothing without mentions', async () => {
    const { db, inserted } = fakeDb([{ id: 'u1', username: 'alice' }])
    expect(await notifyMentionedUsers({ ...base, db, text: 'hello there' })).toEqual([])
    expect(inserted).toHaveLength(0)
  })

  it('notifies mentioned users but never the author', async () => {
    const { db, inserted } = fakeDb([
      { id: 'u1', username: 'alice' },
      { id: 'u-author', username: 'author' },
    ])
    expect(await notifyMentionedUsers({ ...base, db, text: 'hey @alice and @author' })).toEqual(['u1'])
    expect(inserted).toHaveLength(1)
    expect(inserted[0]).toMatchObject({
      userId: 'u1',
      type: 'mention',
      title: 'author mentioned you',
      navigationUrl: '/chat',
      message: 'author mentioned you in Global Chat: "hey @alice and @author"',
    })
  })

  it('respects allowed and excluded user ids', async () => {
    const { db } = fakeDb([
      { id: 'u1', username: 'alice' },
      { id: 'u2', username: 'bob' },
      { id: 'u3', username: 'carol' },
    ])
    const ids = await notifyMentionedUsers({
      ...base,
      db,
      text: '@alice @bob @carol',
      allowedUserIds: new Set(['u1', 'u2']),
      excludeUserIds: new Set(['u2']),
    })
    expect(ids).toEqual(['u1'])
  })

  it('skips the lookup when an edit adds no new mentions', async () => {
    const { db, inserted } = fakeDb([{ id: 'u1', username: 'alice' }])
    expect(await notifyMentionedUsers({ ...base, db, text: 'fixed typo @Alice', previousText: 'fixd typo @alice' })).toEqual([])
    expect(inserted).toHaveLength(0)
  })
})

import { describe, expect, it } from 'vitest'
import {
  MAX_FANOUT_RECIPIENTS,
  chunk,
  selectRecipients,
  watchedActivityNotification,
} from './followNotifications'

describe('followNotifications', () => {
  it('chunks into bounded groups', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
    expect(chunk([], 8)).toEqual([])
  })

  it('dedupes recipients and drops the actor, excluded and opted-out users', () => {
    expect(selectRecipients(['a', 'b', 'a', null, 'c', 'd'], ['b', undefined], ['d'])).toEqual(['a', 'c'])
  })

  it('caps fan-out', () => {
    const ids = Array.from({ length: MAX_FANOUT_RECIPIENTS + 20 }, (_, i) => `u${i}`)
    expect(selectRecipients(ids, [])).toHaveLength(MAX_FANOUT_RECIPIENTS)
  })

  it('describes watched-question activity', () => {
    const answer = watchedActivityNotification({ kind: 'answer', actorUsername: 'ana' }, 'How do I stake?')
    expect(answer.type).toBe('answer')
    expect(answer.message).toBe('ana answered "How do I stake?"')

    const comment = watchedActivityNotification({ kind: 'comment', actorUsername: 'bo' }, 'Q')
    expect(comment.setting).toBe('commentNotifications')

    const accepted = watchedActivityNotification({ kind: 'accepted' }, 'x'.repeat(200))
    expect(accepted.message.length).toBeLessThan(110)
  })
})

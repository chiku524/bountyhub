import { describe, expect, it } from 'vitest'
import { pickAutoAwardAnswer } from './expireBounties'

const a = (id: string, authorId: string, up: number, down: number, day: number) => ({
  id,
  authorId,
  upvotes: up,
  downvotes: down,
  createdAt: new Date(2026, 0, day),
})

describe('pickAutoAwardAnswer', () => {
  it('picks the highest net score, oldest first on ties', () => {
    const winner = pickAutoAwardAnswer([a('x', 'u1', 3, 1, 2), a('y', 'u2', 4, 2, 1), a('z', 'u3', 1, 0, 3)], 'asker')
    expect(winner?.id).toBe('y')
  })
  it('never picks the asker and requires a positive score', () => {
    expect(pickAutoAwardAnswer([a('x', 'asker', 9, 0, 1), a('y', 'u2', 1, 1, 2)], 'asker')).toBeNull()
  })
  it('returns null with no answers', () => {
    expect(pickAutoAwardAnswer([], 'asker')).toBeNull()
  })
})

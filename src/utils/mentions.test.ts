import { describe, expect, it } from 'vitest'
import { applyMention, extractMentions, findMentionQuery, mentionSnippet, splitMentions, stripCode } from './mentions'

describe('extractMentions', () => {
  it('finds mentions at the start, middle and before punctuation', () => {
    expect(extractMentions('@alice can you and @bob-smith look? thanks @carol_1.')).toEqual(['alice', 'bob-smith', 'carol_1'])
  })

  it('de-duplicates case-insensitively, keeping the first spelling', () => {
    expect(extractMentions('@Alice and @alice and @ALICE')).toEqual(['Alice'])
  })

  it('ignores emails, URLs and double @', () => {
    expect(extractMentions('mail me@example.com or see https://x.com/@dave and @@eve')).toEqual([])
  })

  it('does not end a username with a hyphen', () => {
    expect(extractMentions('ping @frank- now')).toEqual(['frank'])
  })

  it('ignores mentions in inline and fenced code', () => {
    const text = 'Use `@Override` here:\n```java\n@Deprecated\nclass A {}\n```\nthanks @grace'
    expect(extractMentions(text)).toEqual(['grace'])
  })

  it('caps the number of mentions', () => {
    const text = Array.from({ length: 15 }, (_, i) => `@user${i}`).join(' ')
    expect(extractMentions(text)).toHaveLength(10)
    expect(extractMentions(text, 3)).toEqual(['user0', 'user1', 'user2'])
  })
})

describe('splitMentions', () => {
  it('splits text around mentions and keeps the rest intact', () => {
    expect(splitMentions('hi @alice, meet @bob!')).toEqual([
      { type: 'text', value: 'hi ' },
      { type: 'mention', username: 'alice' },
      { type: 'text', value: ', meet ' },
      { type: 'mention', username: 'bob' },
      { type: 'text', value: '!' },
    ])
  })

  it('returns plain text unchanged when there is no mention', () => {
    expect(splitMentions('mail me@example.com')).toEqual([{ type: 'text', value: 'mail me@example.com' }])
  })
})

describe('findMentionQuery', () => {
  it('detects a partial mention before the caret', () => {
    expect(findMentionQuery('hi @al', 6)).toEqual({ start: 3, query: 'al' })
    expect(findMentionQuery('@', 1)).toEqual({ start: 0, query: '' })
  })

  it('returns null outside a mention', () => {
    expect(findMentionQuery('hi @al there', 12)).toBeNull()
    expect(findMentionQuery('me@exa', 6)).toBeNull()
  })
})

describe('applyMention', () => {
  it('replaces the partial mention and adds a space', () => {
    expect(applyMention('hi @al', 3, 6, 'alice')).toEqual({ value: 'hi @alice ', caret: 10 })
  })

  it('does not double the space when one follows', () => {
    expect(applyMention('hi @al there', 3, 6, 'alice')).toEqual({ value: 'hi @alice there', caret: 10 })
  })
})

describe('stripCode / mentionSnippet', () => {
  it('removes code and flattens whitespace', () => {
    expect(stripCode('a `b` c')).toBe('a  c')
    expect(mentionSnippet('hello\n\n  @bob   there')).toBe('hello @bob there')
    expect(mentionSnippet('x'.repeat(200), 10)).toBe(`${'x'.repeat(9)}…`)
  })
})

import { describe, expect, it } from 'vitest'
import { markdownToPlainText } from './markdownExcerpt'

describe('markdownToPlainText', () => {
  it('drops code fences and inline markup', () => {
    const md = 'I tried **useEffect** with a timer.\n\n```ts\nconst x = 1\n```\n\nSee [the docs](https://react.dev) and `useDeferredValue`.\n\n- one\n- _two_'
    expect(markdownToPlainText(md)).toBe('I tried useEffect with a timer. See the docs and useDeferredValue. one two')
  })
  it('keeps snake_case words intact', () => {
    expect(markdownToPlainText('rename my_var_name # not heading')).toBe('rename my_var_name # not heading')
  })
  it('turns headings and images into text', () => {
    expect(markdownToPlainText('## Title\n![diagram](x.png)')).toBe('Title diagram')
  })
})

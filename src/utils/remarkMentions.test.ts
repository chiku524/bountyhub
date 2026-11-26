import { describe, expect, it } from 'vitest'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import { remarkMentions } from './remarkMentions'

function links(markdown: string): string[] {
  const processor = unified().use(remarkParse).use(remarkGfm).use(remarkMentions)
  const tree = processor.runSync(processor.parse(markdown)) as unknown as { children?: unknown[] }
  const out: string[] = []
  const walk = (node: { type?: string; url?: string; children?: unknown[] }) => {
    if (node.type === 'link' && node.url) out.push(node.url)
    node.children?.forEach((c) => walk(c as typeof node))
  }
  walk(tree)
  return out
}

describe('remarkMentions', () => {
  it('links mentions in text, lists and emphasis', () => {
    expect(links('thanks @alice\n\n- **@bob** too')).toEqual(['/users/alice', '/users/bob'])
  })

  it('leaves code, existing links and emails alone', () => {
    expect(links('`@Override` and [@carol](https://example.com) and me@example.com')).toEqual([
      'https://example.com',
      'mailto:me@example.com',
    ])
  })
})

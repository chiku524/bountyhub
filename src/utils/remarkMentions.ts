import { splitMentions } from './mentions'

interface MdNode {
  type: string
  value?: string
  url?: string
  children?: MdNode[]
  data?: Record<string, unknown>
}

// Never turn text inside these into mentions (links already link somewhere; code is literal).
const SKIP = new Set(['link', 'linkReference', 'inlineCode', 'code', 'html', 'definition'])

function transform(node: MdNode): void {
  if (!node.children) return
  const next: MdNode[] = []
  for (const child of node.children) {
    if (child.type === 'text' && child.value && child.value.includes('@')) {
      const parts = splitMentions(child.value)
      if (parts.some((p) => p.type === 'mention')) {
        for (const p of parts) {
          if (p.type === 'text') next.push({ type: 'text', value: p.value })
          else
            next.push({
              type: 'link',
              url: `/users/${encodeURIComponent(p.username)}`,
              data: { hProperties: { dataMention: p.username } },
              children: [{ type: 'text', value: `@${p.username}` }],
            })
        }
        continue
      }
    }
    if (!SKIP.has(child.type)) transform(child)
    next.push(child)
  }
  node.children = next
}

/** Remark plugin: `@username` in Markdown text becomes a link to that user's profile. */
export function remarkMentions() {
  return (tree: MdNode) => transform(tree)
}

import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { CodeBlockView } from './CodeBlockView'

const components: Components = {
  a: ({ href, children }) => {
    const external = Boolean(href && /^https?:\/\//i.test(href))
    return (
      <a
        href={href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer nofollow' } : {})}
        className="text-indigo-600 underline decoration-indigo-400/50 underline-offset-2 hover:text-indigo-500 dark:text-indigo-400"
      >
        {children}
      </a>
    )
  },
  // Fenced code blocks get the same highlighted view as attached code blocks; inline `code` stays inline.
  code: ({ className, children }) => {
    const match = /language-(\w+)/.exec(className || '')
    const text = String(children ?? '')
    if (match || text.includes('\n')) {
      return <CodeBlockView code={text.replace(/\n$/, '')} language={match?.[1]} />
    }
    return (
      <code className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-[0.85em] text-pink-700 dark:bg-neutral-800 dark:text-pink-300">
        {children}
      </code>
    )
  },
  pre: ({ children }) => <>{children}</>,
  img: ({ src, alt }) => (
    <img src={typeof src === 'string' ? src : undefined} alt={alt ?? ''} loading="lazy" className="my-2 max-h-96 max-w-full rounded-lg" />
  ),
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto">
      <table className="min-w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border border-neutral-300 px-2 py-1 text-left dark:border-neutral-600">{children}</th>,
  td: ({ children }) => <td className="border border-neutral-300 px-2 py-1 dark:border-neutral-600">{children}</td>,
}

/**
 * Renders user-written Markdown (GitHub-flavoured). Raw HTML is not rendered, so content stays safe.
 * Plain text written before Markdown support renders the same, with line breaks kept.
 */
export function Markdown({ children, className = '' }: { children: string; className?: string }) {
  return (
    <div
      className={`markdown-body break-words text-neutral-700 dark:text-gray-300 [&_blockquote]:border-l-4 [&_blockquote]:border-neutral-300 [&_blockquote]:pl-3 [&_blockquote]:italic dark:[&_blockquote]:border-neutral-600 [&_h1]:mt-4 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:font-semibold [&_li]:my-0.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2 [&_p]:whitespace-pre-line [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 ${className}`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  )
}

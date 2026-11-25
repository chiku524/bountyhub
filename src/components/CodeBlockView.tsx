import { lazy, Suspense, useState } from 'react'
import { FiCheck, FiCopy } from 'react-icons/fi'

const HighlightedCode = lazy(() => import('./HighlightedCode'))

export interface CodeBlockViewProps {
  code: string
  language?: string
  description?: string | null
  /** Shown instead of the copy button, e.g. a remove control in editors. */
  action?: React.ReactNode
}

/** Read-only code block with syntax highlighting, language label and a Copy button. */
export function CodeBlockView({ code, language, description, action }: CodeBlockViewProps) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }

  const plain = (
    <pre className="max-h-96 overflow-auto rounded-lg bg-neutral-50 p-4 text-[0.8125rem] text-neutral-900 dark:bg-neutral-900/80 dark:text-gray-300">
      <code>{code}</code>
    </pre>
  )

  return (
    <div className="mb-4 rounded-lg border border-violet-300 bg-white p-3 dark:border-violet-500/30 dark:bg-neutral-900/80">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="rounded-sm bg-violet-100 px-2 py-1 text-xs text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
          {language || 'code'}
        </span>
        {action ?? (
          <button
            type="button"
            onClick={() => void copy()}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-neutral-600 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            aria-label={copied ? 'Copied' : 'Copy code'}
          >
            {copied ? <FiCheck className="h-3.5 w-3.5" aria-hidden /> : <FiCopy className="h-3.5 w-3.5" aria-hidden />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>
      <Suspense fallback={plain}>
        <HighlightedCode code={code} language={language} />
      </Suspense>
      {description && <p className="mt-2 text-sm text-neutral-600 dark:text-gray-400">{description}</p>}
    </div>
  )
}

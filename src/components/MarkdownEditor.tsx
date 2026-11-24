import { useId, useState } from 'react'
import { Markdown } from './Markdown'

interface MarkdownEditorProps {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  disabled?: boolean
  required?: boolean
  className?: string
}

/** Textarea with Write / Preview tabs for Markdown content (posts and answers). */
export function MarkdownEditor({
  id,
  value,
  onChange,
  placeholder,
  rows = 8,
  disabled,
  required,
  className = '',
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<'write' | 'preview'>('write')
  const autoId = useId()
  const textareaId = id ?? autoId

  const tabClass = (active: boolean) =>
    `rounded-md px-3 py-1 text-sm font-medium transition-colors ${
      active
        ? 'bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-200'
        : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
    }`

  return (
    <div className={`rounded-lg border border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-800 ${className}`}>
      <div className="flex items-center justify-between gap-2 border-b border-neutral-200 px-2 py-1.5 dark:border-neutral-700" role="tablist">
        <div className="flex gap-1">
          <button type="button" role="tab" aria-selected={tab === 'write'} className={tabClass(tab === 'write')} onClick={() => setTab('write')}>
            Write
          </button>
          <button type="button" role="tab" aria-selected={tab === 'preview'} className={tabClass(tab === 'preview')} onClick={() => setTab('preview')}>
            Preview
          </button>
        </div>
        <span className="text-xs text-neutral-400 dark:text-neutral-500">
          Markdown supported: **bold**, `code`, ```fences```, [links](https://…)
        </span>
      </div>
      {tab === 'write' ? (
        <textarea
          id={textareaId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          required={required}
          className="block w-full resize-y rounded-b-lg border-0 bg-transparent p-3 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-inset focus:ring-violet-500 dark:text-white dark:placeholder-gray-500 @sm/main:text-base"
        />
      ) : (
        <div className="min-h-32 p-3" aria-live="polite">
          {value.trim() ? <Markdown>{value}</Markdown> : <p className="text-sm text-neutral-400">Nothing to preview yet.</p>}
        </div>
      )}
    </div>
  )
}

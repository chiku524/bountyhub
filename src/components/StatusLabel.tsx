import { useState } from 'react'
import {
  statusToneClass,
  type StatusPresentation,
} from '../utils/walletStatus'

interface StatusLabelProps {
  status: StatusPresentation
  /** Show raw technical value in a compact expander. Default true. */
  showTechnical?: boolean
  className?: string
}

/**
 * Plain-language status with optional expandable technical detail.
 */
export function StatusLabel({ status, showTechnical = true, className = '' }: StatusLabelProps) {
  const [open, setOpen] = useState(false)

  return (
    <span className={`inline-flex flex-col items-end gap-0.5 ${className}`}>
      <span
        className={`text-sm font-medium ${statusToneClass(status.tone)}`}
        title={status.detail}
      >
        {status.label}
      </span>
      {showTechnical && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-[10px] font-medium uppercase tracking-wide text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          aria-expanded={open}
        >
          {open ? 'Hide detail' : 'Technical'}
        </button>
      )}
      {open && (
        <span className="max-w-[14rem] text-right text-[11px] leading-snug text-neutral-500 dark:text-neutral-400">
          {status.detail}
          {status.raw ? (
            <span className="mt-0.5 block font-mono text-[10px] opacity-80">({status.raw})</span>
          ) : null}
        </span>
      )}
    </span>
  )
}

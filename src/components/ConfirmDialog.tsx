import { useEffect, useId, useRef, type ReactNode } from 'react'
import { useEscapeKey } from '../hooks/useEscapeKey'
import { FocusRestoreBoundary } from './FocusRestoreBoundary'

export interface ConfirmDialogProps {
  open: boolean
  title: string
  children?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  /** 'danger' paints the confirm button red (deletes, logouts); 'primary' for money/positive actions. */
  tone?: 'danger' | 'primary'
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Accessible in-app confirmation dialog. Use instead of window.confirm(), which looks out of place
 * and behaves inconsistently inside the desktop webview.
 */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'primary',
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId()
  const descId = useId()
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEscapeKey(open && !busy, onCancel)

  useEffect(() => {
    if (open) cancelRef.current?.focus()
  }, [open])

  if (!open) return null

  const confirmClass =
    tone === 'danger'
      ? 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-400'
      : 'bg-violet-600 hover:bg-violet-500 focus-visible:ring-violet-400'

  return (
    <FocusRestoreBoundary>
      <div
        className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 px-4 dark:bg-black/70"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget && !busy) onCancel()
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={children ? descId : undefined}
          className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-700 dark:bg-neutral-800"
        >
          <h2 id={titleId} className="text-lg font-semibold text-neutral-900 dark:text-white">
            {title}
          </h2>
          {children && (
            <div id={descId} className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
              {children}
            </div>
          )}
          <div className="mt-6 flex justify-end gap-2">
            <button
              ref={cancelRef}
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-700"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={busy}
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition focus:outline-none focus-visible:ring-2 disabled:opacity-50 ${confirmClass}`}
            >
              {busy ? 'Working…' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </FocusRestoreBoundary>
  )
}

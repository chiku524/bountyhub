import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiX } from 'react-icons/fi'
import { isDesktopApp } from '../utils/desktop'

const STORAGE_KEY = 'bountyhub-first-run-dismissed'

export function FirstRunTips() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1'
    } catch {
      return true
    }
  })

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* ignore */
    }
    setDismissed(true)
  }, [])

  if (dismissed) return null

  const isDesktop = isDesktopApp()

  return (
    <div
      className="mb-4 rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 shadow-sm dark:border-amber-500/35 dark:bg-amber-950/40 dark:text-amber-50"
      role="region"
      aria-label="Getting started"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <p className="font-semibold text-amber-900 dark:text-amber-100">Welcome — quick start</p>
          <ol className="list-decimal space-y-1 pl-4 text-amber-900/90 dark:text-amber-100/90">
            <li>
              {isDesktop ? (
                <>Use the sidebar or press <kbd className="rounded bg-amber-200/80 px-1 dark:bg-amber-900/60">⌘K</kbd> /{' '}
                <kbd className="rounded bg-amber-200/80 px-1 dark:bg-amber-900/60">Ctrl+K</kbd> to jump anywhere.</>
              ) : (
                <>
                  Press <kbd className="rounded bg-amber-200/80 px-1 dark:bg-amber-900/60">⌘K</kbd> or{' '}
                  <kbd className="rounded bg-amber-200/80 px-1 dark:bg-amber-900/60">Ctrl+K</kbd> (or{' '}
                  <kbd className="rounded bg-amber-200/80 px-1 dark:bg-amber-900/60">/</kbd> when not typing) to open the command palette.
                </>
              )}
            </li>
            <li>
              <Link to="/wallet" className="font-medium underline decoration-amber-600/50 underline-offset-2 hover:decoration-amber-700 dark:decoration-amber-400/50">
                Connect your wallet
              </Link>{' '}
              when you are ready to move SOL / BBUX.
            </li>
            <li>
              Browse{' '}
              <Link to="/community" className="font-medium underline decoration-amber-600/50 underline-offset-2 hover:decoration-amber-700 dark:decoration-amber-400/50">
                Community
              </Link>{' '}
              or{' '}
              <Link to="/posts/create" className="font-medium underline decoration-amber-600/50 underline-offset-2 hover:decoration-amber-700 dark:decoration-amber-400/50">
                create a post
              </Link>
              .
            </li>
          </ol>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-lg p-2 text-amber-800 transition-colors hover:bg-amber-200/60 dark:text-amber-200 dark:hover:bg-amber-900/50"
          aria-label="Dismiss getting started tips"
        >
          <FiX className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

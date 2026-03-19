import { useEffect } from 'react'
import { useDesktopUpdate } from '../contexts/DesktopUpdateContext'
import { isDesktopApp } from '../utils/desktop'

const messages: Record<string, string> = {
  downloading: 'Downloading update…',
  installing: 'Installing update…',
  restarting: 'Update complete. Restarting the app…',
}

/** Actual window size for the update mini-window (real OS window, not inner fake) */
const UPDATE_WINDOW_WIDTH = 280
const UPDATE_WINDOW_HEIGHT = 240

export function DesktopUpdateOverlay() {
  const ctx = useDesktopUpdate()

  // Resize the actual Tauri window to a small mini-window while update is in progress
  useEffect(() => {
    if (!ctx || ctx.phase === 'idle' || ctx.phase === 'error' || !isDesktopApp()) return

    let cancelled = false
    async function shrinkWindow() {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window')
        const win = getCurrentWindow()
        if (!cancelled) await win.setSize({ type: 'Logical', width: UPDATE_WINDOW_WIDTH, height: UPDATE_WINDOW_HEIGHT })
      } catch (e) {
        if (import.meta.env.DEV) console.debug('[DesktopUpdateOverlay] setSize', e)
      }
    }
    shrinkWindow()
    return () => { cancelled = true }
  }, [ctx?.phase])

  if (!ctx) return null
  const { phase, errorMessage, setPhase, retryUpdate } = ctx
  if (phase === 'idle') return null

  if (phase === 'error') {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950/98 via-neutral-950 to-violet-950/90 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4 px-6 max-w-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/20">
            <svg className="h-6 w-6 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-center text-sm font-medium text-white">Update failed</p>
          <p className="text-center text-xs text-neutral-400">{errorMessage ?? 'Something went wrong.'}</p>
          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={() => setPhase('idle')}
              className="px-4 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              Continue
            </button>
            <button
              type="button"
              onClick={() => retryUpdate()}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950/98 via-neutral-950 to-violet-950/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 px-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20">
          <svg
            className="h-6 w-6 animate-spin text-indigo-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        <p className="text-center text-sm font-medium text-white">
          {messages[phase] ?? 'Preparing update…'}
        </p>
        <p className="text-center text-xs text-neutral-500">
          The app will restart automatically when the update is complete.
        </p>
      </div>
    </div>
  )
}

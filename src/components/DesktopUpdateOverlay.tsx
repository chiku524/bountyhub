import { useEffect } from 'react'
import { useDesktopUpdate } from '../contexts/DesktopUpdateContext'
import { isDesktopApp } from '../utils/desktop'

const messages: Record<string, string> = {
  checking: 'Checking for updates…',
  downloading: 'Downloading update…',
  installing: 'Installing update…',
  restarting: 'Update complete. Restarting the app…',
}

/** Window size for the update progress (downloading/installing/restarting) — fit spinner + message + subtitle */
const UPDATE_WINDOW_WIDTH = 400
const UPDATE_WINDOW_HEIGHT = 320
/** Window size for the error overlay (readable, then user can Continue to full) */
const ERROR_WINDOW_WIDTH = 460
const ERROR_WINDOW_HEIGHT = 380
/** Full app size when dismissing overlay (match useDesktopWindowSize) */
const FULL_WINDOW_WIDTH = 1200
const FULL_WINDOW_HEIGHT = 800

export function DesktopUpdateOverlay() {
  const ctx = useDesktopUpdate()

  // Resize and center the Tauri window: small for checking/download/install, larger for error
  useEffect(() => {
    if (!ctx || ctx.phase === 'idle' || !isDesktopApp()) return

    let cancelled = false
    async function resizeAndCenter() {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window')
        const win = getCurrentWindow()
        if (cancelled) return
        if (ctx.phase === 'error') {
          await win.setSize({ type: 'Logical', width: ERROR_WINDOW_WIDTH, height: ERROR_WINDOW_HEIGHT })
        } else {
          await win.setSize({ type: 'Logical', width: UPDATE_WINDOW_WIDTH, height: UPDATE_WINDOW_HEIGHT })
        }
        if (!cancelled) await win.center()
      } catch (e) {
        if (import.meta.env.DEV) console.debug('[DesktopUpdateOverlay] resize/center', e)
      }
    }
    resizeAndCenter()
    return () => { cancelled = true }
  }, [ctx?.phase])

  if (!ctx) return null
  const { phase, errorMessage, setPhase, retryUpdate } = ctx
  if (phase === 'idle') return null

  if (phase === 'error') {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950/98 via-neutral-950 to-violet-950/90 backdrop-blur-sm p-6 animate-fade-in">
        <div className="flex flex-col items-center gap-4 px-6 max-w-md w-full">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-red-500/20">
            <svg className="h-6 w-6 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-center text-sm font-medium text-white">Update failed</p>
          <p className="text-center text-xs text-neutral-400 break-words max-w-full">{errorMessage ?? 'Something went wrong.'}</p>
          <div className="flex gap-3 mt-2 flex-shrink-0">
            <button
              type="button"
              onClick={async () => {
                if (isDesktopApp()) {
                  try {
                    const { getCurrentWindow } = await import('@tauri-apps/api/window')
                    const win = getCurrentWindow()
                    await win.setSize({ type: 'Logical', width: FULL_WINDOW_WIDTH, height: FULL_WINDOW_HEIGHT })
                    await win.center()
                  } catch (e) {
                    if (import.meta.env.DEV) console.debug('[DesktopUpdateOverlay] expand on Continue', e)
                  }
                }
                setPhase('idle')
              }}
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
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950/98 via-neutral-950 to-violet-950/90 backdrop-blur-sm p-6 animate-fade-in">
      <div className="flex flex-col items-center gap-5 px-6 max-w-sm">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-500/20">
          <svg
            className="h-7 w-7 animate-spin text-indigo-400"
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
        <p className="text-center text-base font-medium text-white">
          {messages[phase] ?? 'Preparing update…'}
        </p>
        <p className="text-center text-xs text-neutral-500">
          {phase === 'checking'
            ? 'This may take a moment.'
            : 'The app will restart automatically when the update is complete.'}
        </p>
      </div>
    </div>
  )
}

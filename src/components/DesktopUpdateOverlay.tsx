import { useEffect } from 'react'
import { FiAward } from 'react-icons/fi'
import { useDesktopUpdate } from '../contexts/DesktopUpdateContext'
import { isDesktopApp } from '../utils/desktop'

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

  // Vibeminer-style: backdrop, card with icon area, app name, spinner, single label
  const label = phase === 'checking'
    ? 'Checking for updates…'
    : phase === 'downloading'
      ? 'Downloading update…'
      : phase === 'installing' || phase === 'restarting'
        ? 'Installing… The app will be restarting in a moment.'
        : 'Preparing update…'

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-neutral-950/95 backdrop-blur-sm animate-fade-in"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-neutral-900/90 px-10 py-8 shadow-xl">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/25 to-violet-500/20 text-2xl"
          aria-hidden
        >
          <FiAward className="h-7 w-7 text-cyan-400/90" aria-hidden />
        </div>
        <p className="mt-4 font-semibold text-lg text-white">BountyHub</p>
        <div
          className="mt-4 h-8 w-8 shrink-0 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin"
          aria-hidden
        />
        <p className="mt-4 text-sm text-neutral-400">{label}</p>
      </div>
    </div>
  )
}

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react'

export type DesktopUpdatePhase = 'idle' | 'checking' | 'downloading' | 'installing' | 'restarting' | 'error'

type ContextValue = {
  phase: DesktopUpdatePhase
  errorMessage: string | null
  /** Target version when downloading/installing (dice.express-style copy: "Downloading v…") */
  pendingUpdateVersion: string | null
  setPhase: (p: DesktopUpdatePhase, errorMessage?: string | null) => void
  setPendingUpdateVersion: (v: string | null) => void
  registerRetry: (fn: () => void) => void
  retryUpdate: () => void
}

const DesktopUpdateContext = createContext<ContextValue | null>(null)

export function DesktopUpdateProvider({ children }: { children: ReactNode }) {
  // Start idle so the app (intro) shows immediately; update check runs in background (vibeminer-style).
  const [phase, setPhaseState] = useState<DesktopUpdatePhase>(() => 'idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [pendingUpdateVersion, setPendingUpdateVersionState] = useState<string | null>(null)
  const retryRef = useRef<(() => void) | null>(null)
  const setPendingUpdateVersion = useCallback((v: string | null) => {
    setPendingUpdateVersionState(v)
  }, [])
  const setPhase = useCallback((p: DesktopUpdatePhase, errMsg?: string | null) => {
    setPhaseState(p)
    setErrorMessage(p === 'error' ? (errMsg ?? 'Update failed') : null)
    if (p === 'idle' || p === 'error') setPendingUpdateVersionState(null)
  }, [])
  const registerRetry = useCallback((fn: () => void) => {
    retryRef.current = fn
  }, [])
  const retryUpdate = useCallback(() => {
    retryRef.current?.()
  }, [])
  const value: ContextValue = {
    phase,
    errorMessage,
    pendingUpdateVersion,
    setPhase,
    setPendingUpdateVersion,
    registerRetry,
    retryUpdate,
  }
  return (
    <DesktopUpdateContext.Provider value={value}>
      {children}
    </DesktopUpdateContext.Provider>
  )
}

export function useDesktopUpdate() {
  const ctx = useContext(DesktopUpdateContext)
  return ctx
}

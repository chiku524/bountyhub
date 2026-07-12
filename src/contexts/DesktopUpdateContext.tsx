import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react'

export type DesktopUpdatePhase =
  | 'idle'
  | 'checking'
  | 'available'
  | 'downloading'
  | 'installing'
  | 'restarting'
  | 'error'

type ContextValue = {
  phase: DesktopUpdatePhase
  errorMessage: string | null
  /** Target version when available/downloading/installing */
  pendingUpdateVersion: string | null
  setPhase: (p: DesktopUpdatePhase, errorMessage?: string | null) => void
  setPendingUpdateVersion: (v: string | null) => void
  registerRetry: (fn: () => void) => void
  registerConfirm: (fn: () => void) => void
  retryUpdate: () => void
  confirmUpdate: () => void
  dismissUpdate: () => void
}

const DesktopUpdateContext = createContext<ContextValue | null>(null)

export function DesktopUpdateProvider({ children }: { children: ReactNode }) {
  const [phase, setPhaseState] = useState<DesktopUpdatePhase>(() => 'idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [pendingUpdateVersion, setPendingUpdateVersionState] = useState<string | null>(null)
  const retryRef = useRef<(() => void) | null>(null)
  const confirmRef = useRef<(() => void) | null>(null)

  const setPendingUpdateVersion = useCallback((v: string | null) => {
    setPendingUpdateVersionState(v)
  }, [])

  const setPhase = useCallback((p: DesktopUpdatePhase, errMsg?: string | null) => {
    setPhaseState(p)
    setErrorMessage(p === 'error' ? (errMsg ?? 'Update failed') : null)
    if (p === 'idle' || p === 'error') {
      // Keep version on error so the message can reference it; clear on idle
      if (p === 'idle') setPendingUpdateVersionState(null)
    }
  }, [])

  const registerRetry = useCallback((fn: () => void) => {
    retryRef.current = fn
  }, [])

  const registerConfirm = useCallback((fn: () => void) => {
    confirmRef.current = fn
  }, [])

  const retryUpdate = useCallback(() => {
    retryRef.current?.()
  }, [])

  const confirmUpdate = useCallback(() => {
    confirmRef.current?.()
  }, [])

  const dismissUpdate = useCallback(() => {
    setPhaseState('idle')
    setErrorMessage(null)
    setPendingUpdateVersionState(null)
  }, [])

  const value: ContextValue = {
    phase,
    errorMessage,
    pendingUpdateVersion,
    setPhase,
    setPendingUpdateVersion,
    registerRetry,
    registerConfirm,
    retryUpdate,
    confirmUpdate,
    dismissUpdate,
  }

  return (
    <DesktopUpdateContext.Provider value={value}>
      {children}
    </DesktopUpdateContext.Provider>
  )
}

export function useDesktopUpdate() {
  return useContext(DesktopUpdateContext)
}

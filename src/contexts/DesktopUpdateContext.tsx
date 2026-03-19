import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react'
import { isDesktopApp } from '../utils/desktop'

export type DesktopUpdatePhase = 'idle' | 'checking' | 'downloading' | 'installing' | 'restarting' | 'error'

type ContextValue = {
  phase: DesktopUpdatePhase
  errorMessage: string | null
  setPhase: (p: DesktopUpdatePhase, errorMessage?: string | null) => void
  registerRetry: (fn: () => void) => void
  retryUpdate: () => void
}

const DesktopUpdateContext = createContext<ContextValue | null>(null)

export function DesktopUpdateProvider({ children }: { children: ReactNode }) {
  const [phase, setPhaseState] = useState<DesktopUpdatePhase>(() =>
    isDesktopApp() ? 'checking' : 'idle'
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const retryRef = useRef<(() => void) | null>(null)
  const setPhase = useCallback((p: DesktopUpdatePhase, errMsg?: string | null) => {
    setPhaseState(p)
    setErrorMessage(p === 'error' ? (errMsg ?? 'Update failed') : null)
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
    setPhase,
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

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type DesktopUpdatePhase = 'idle' | 'downloading' | 'installing' | 'restarting'

type ContextValue = {
  phase: DesktopUpdatePhase
  setPhase: (p: DesktopUpdatePhase) => void
}

const DesktopUpdateContext = createContext<ContextValue | null>(null)

export function DesktopUpdateProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<DesktopUpdatePhase>('idle')
  const value: ContextValue = {
    phase,
    setPhase: useCallback((p: DesktopUpdatePhase) => setPhase(p), []),
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

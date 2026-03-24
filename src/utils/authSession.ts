import type { User } from '../types'
import { isDesktopApp } from './desktop'

export const BH_SESSION_STORAGE_KEY = 'bountyhub-desktop-session'
export const BH_USER_SNAPSHOT_KEY = 'bountyhub-desktop-user-snapshot'

function safeParseUser(raw: string | null): User | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function getDesktopSessionId(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(BH_SESSION_STORAGE_KEY)
  } catch {
    return null
  }
}

export function getDesktopUserSnapshot(): User | null {
  if (typeof window === 'undefined') return null
  try {
    return safeParseUser(window.localStorage.getItem(BH_USER_SNAPSHOT_KEY))
  } catch {
    return null
  }
}

export function persistDesktopSession(sessionId: string, user: User): void {
  if (!isDesktopApp() || typeof window === 'undefined') return
  try {
    window.localStorage.setItem(BH_SESSION_STORAGE_KEY, sessionId)
    window.localStorage.setItem(BH_USER_SNAPSHOT_KEY, JSON.stringify(user))
  } catch {
    // ignore quota / private mode
  }
}

export function clearDesktopSession(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(BH_SESSION_STORAGE_KEY)
    window.localStorage.removeItem(BH_USER_SNAPSHOT_KEY)
  } catch {
    void 0
  }
}

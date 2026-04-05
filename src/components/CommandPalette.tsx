import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import {
  FiBarChart2,
  FiEdit3,
  FiFileText,
  FiGithub,
  FiMessageCircle,
  FiSearch,
  FiSettings,
  FiShield,
  FiUsers,
  FiAward,
  FiCreditCard,
  FiCheckSquare,
  FiRefreshCw,
} from 'react-icons/fi'
import { useAuth } from '../contexts/AuthProvider'
import { isDesktopApp } from '../utils/desktop'
import { useRestoreFocusOnUnmount } from '../hooks/useRestoreFocus'
import { COMMAND_PALETTE_TOGGLE_EVENT } from '../constants/commandPaletteEvents'

interface CommandItem {
  id: string
  label: string
  to: string
  keywords?: string
  icon: ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
}

interface CommandPaletteContextValue {
  open: () => void
  close: () => void
  toggle: () => void
  isOpen: boolean
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null)

export function useCommandPalette(): CommandPaletteContextValue {
  const ctx = useContext(CommandPaletteContext)
  if (!ctx) {
    return {
      open: () => {},
      close: () => {},
      toggle: () => {},
      isOpen: false,
    }
  }
  return ctx
}

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false
  const tag = el.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (el.isContentEditable) return true
  return false
}

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false)
  const open = useCallback(() => setOpen(true), [])
  const close = useCallback(() => setOpen(false), [])
  const toggle = useCallback(() => setOpen((o) => !o), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        if (isDesktopApp()) return
        e.preventDefault()
        toggle()
        return
      }
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (isTypingTarget(e.target)) return
        e.preventDefault()
        open()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, toggle])

  useEffect(() => {
    const onExternalToggle = () => toggle()
    window.addEventListener(COMMAND_PALETTE_TOGGLE_EVENT, onExternalToggle)
    return () => window.removeEventListener(COMMAND_PALETTE_TOGGLE_EVENT, onExternalToggle)
  }, [toggle])

  const value = useMemo(
    () => ({ open, close, toggle, isOpen }),
    [open, close, toggle, isOpen],
  )

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      {isOpen ? <CommandPaletteDialog onClose={close} /> : null}
    </CommandPaletteContext.Provider>
  )
}

function CommandPaletteDialog({ onClose }: { onClose: () => void }) {
  useRestoreFocusOnUnmount()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const allItems: CommandItem[] = useMemo(
    () => [
      { id: 'community', label: 'Community', to: '/community', keywords: 'posts browse', icon: <FiUsers className="h-4 w-4" /> },
      { id: 'create', label: 'Create post', to: '/posts/create', keywords: 'bounty question new', icon: <FiEdit3 className="h-4 w-4" />, requireAuth: true },
      { id: 'chat', label: 'Team Hub', to: '/chat', keywords: 'messages', icon: <FiMessageCircle className="h-4 w-4" />, requireAuth: true },
      { id: 'wallet', label: 'Wallet', to: '/wallet', keywords: 'bbux solana', icon: <FiCreditCard className="h-4 w-4" />, requireAuth: true },
      { id: 'profile', label: 'Profile', to: '/profile', keywords: 'account', icon: <FiUsers className="h-4 w-4" />, requireAuth: true },
      { id: 'settings', label: 'Settings', to: '/settings', keywords: 'preferences', icon: <FiSettings className="h-4 w-4" />, requireAuth: true },
      { id: 'governance', label: 'Governance', to: '/governance', keywords: 'vote', icon: <FiCheckSquare className="h-4 w-4" />, requireAuth: true },
      { id: 'refunds', label: 'Refund requests', to: '/refund-requests', keywords: 'refund', icon: <FiRefreshCw className="h-4 w-4" />, requireAuth: true },
      { id: 'analytics', label: 'Analytics', to: '/analytics', keywords: 'stats', icon: <FiBarChart2 className="h-4 w-4" />, requireAuth: true },
      { id: 'bug', label: 'Bug bounty campaigns', to: '/bug-bounty/campaigns', keywords: 'security', icon: <FiShield className="h-4 w-4" /> },
      { id: 'repos', label: 'Repositories', to: '/repositories', keywords: 'github', icon: <FiGithub className="h-4 w-4" />, requireAuth: true },
      { id: 'contrib', label: 'Contributions', to: '/contributions', keywords: 'earn', icon: <FiAward className="h-4 w-4" />, requireAuth: true },
      { id: 'docs', label: 'Documentation', to: '/docs', keywords: 'help api', icon: <FiFileText className="h-4 w-4" /> },
      { id: 'transactions', label: 'Transactions', to: '/transactions', keywords: 'history', icon: <FiCreditCard className="h-4 w-4" />, requireAuth: true },
      { id: 'admin', label: 'Admin', to: '/admin', keywords: 'moderation', icon: <FiShield className="h-4 w-4" />, requireAuth: true, requireAdmin: true },
    ],
    [],
  )

  const items = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allItems.filter((item) => {
      if (item.requireAuth && !user) return false
      if (item.requireAdmin && user?.role !== 'admin') return false
      if (!q) return true
      const hay = `${item.label} ${item.keywords ?? ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [allItems, query, user])

  useEffect(() => {
    setHighlight(0)
  }, [query, items.length])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const run = useCallback(
    (to: string) => {
      navigate(to)
      onClose()
      setQuery('')
    },
    [navigate, onClose],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHighlight((h) => Math.min(h + 1, Math.max(0, items.length - 1)))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHighlight((h) => Math.max(h - 1, 0))
        return
      }
      if (e.key === 'Enter' && items[highlight]) {
        e.preventDefault()
        run(items[highlight]!.to)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [highlight, items, onClose, run])

  const modal = (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center bg-black/50 px-3 pt-[12vh] backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900">
        <div className="flex items-center gap-2 border-b border-neutral-200 px-3 py-2 dark:border-neutral-700">
          <FiSearch className="h-5 w-5 shrink-0 text-neutral-400" aria-hidden />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Go to…"
            className="min-w-0 flex-1 bg-transparent py-2 text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-white"
            aria-autocomplete="list"
            aria-controls="command-palette-list"
          />
          <kbd className="hidden shrink-0 rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-[10px] text-neutral-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 sm:inline">
            esc
          </kbd>
        </div>
        <ul id="command-palette-list" className="max-h-[min(50vh,320px)] overflow-y-auto py-1" role="listbox">
          {items.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-neutral-500 dark:text-neutral-400">No matches</li>
          ) : (
            items.map((item, i) => (
              <li key={item.id} role="option" aria-selected={i === highlight}>
                <button
                  type="button"
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                    i === highlight
                      ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-900/40 dark:text-indigo-100'
                      : 'text-neutral-800 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-white/5'
                  }`}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => run(item.to)}
                >
                  <span className="text-neutral-500 dark:text-neutral-400">{item.icon}</span>
                  {item.label}
                </button>
              </li>
            ))
          )}
        </ul>
        <div className="border-t border-neutral-200 px-3 py-2 text-[11px] text-neutral-400 dark:border-neutral-700 dark:text-neutral-500">
          <span className="mr-3">
            <kbd className="rounded border border-neutral-200 px-1 dark:border-neutral-600">⌘K</kbd> or{' '}
            <kbd className="rounded border border-neutral-200 px-1 dark:border-neutral-600">Ctrl K</kbd> to toggle
          </span>
          <span>
            <kbd className="rounded border border-neutral-200 px-1 dark:border-neutral-600">/</kbd> when not typing
          </span>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

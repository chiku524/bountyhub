import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FiHelpCircle, FiSend, FiX } from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthProvider'
import { useSupportGuide } from '../../contexts/SupportGuideContext'
import { ApiClient } from '../../utils/api'
import { isDesktopApp } from '../../utils/desktop'
import {
  localGuideResponse,
  type SupportAction,
  type SupportChatMessage,
} from '../../utils/supportKnowledge'
import {
  GUIDE_WELCOMED_KEY,
  TOUR_STORAGE_KEY,
  readStorageFlag,
  writeStorageFlag,
} from '../../utils/supportTour'
import { useRestoreFocusWhenOpen } from '../../hooks/useRestoreFocus'
import { ProductTour } from './ProductTour'

const WELCOME_REPLY =
  "Hi — I'm Guide, BountyHub's built-in helper. I can walk you through the app or answer questions about bounties, wallet, chat, and more."

const SUGGESTIONS = [
  { label: 'Take a tour', prompt: 'Give me a tour of the app' },
  { label: 'How do bounties work?', prompt: 'How do bounties work?' },
  { label: 'Wallet & BBUX', prompt: 'How do I use my wallet?' },
  { label: 'Open docs', prompt: 'Where is the documentation?' },
] as const

interface VisibleMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

function applyActions(
  actions: SupportAction[],
  startTour: () => void,
  navigate: ReturnType<typeof useNavigate>,
) {
  for (const action of actions) {
    if (action.type === 'start_tour') startTour()
    if (action.type === 'navigate') navigate(action.path)
  }
}

export function SupportGuide() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isOpen, open, close, startTour, consumePendingPrompt } = useSupportGuide()
  const isDesktop = isDesktopApp()
  const api = useMemo(() => new ApiClient(), [])
  const [messages, setMessages] = useState<VisibleMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const hideOnLaunch = location.pathname === '/launch'

  useRestoreFocusWhenOpen(isOpen)

  useEffect(() => {
    if (hideOnLaunch) return
    if (readStorageFlag(GUIDE_WELCOMED_KEY)) return
    const params = new URLSearchParams(window.location.search)
    if (params.get('welcome') === 'true') {
      writeStorageFlag(GUIDE_WELCOMED_KEY, true)
      return
    }
    const t = window.setTimeout(() => {
      open()
      writeStorageFlag(GUIDE_WELCOMED_KEY, true)
    }, 900)
    return () => window.clearTimeout(t)
  }, [hideOnLaunch, open])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('welcome') !== 'true') return
    if (readStorageFlag(TOUR_STORAGE_KEY)) return
    const t = window.setTimeout(() => startTour(), 700)
    return () => window.clearTimeout(t)
  }, [location.search, startTour])

  useEffect(() => {
    if (!isOpen) return
    const prompt = consumePendingPrompt()
    if (prompt) {
      void sendMessage(prompt)
    }
    const t = window.setTimeout(() => inputRef.current?.focus(), 80)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when opened
  }, [isOpen])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, sending, isOpen])

  const sendMessage = useCallback(
    async (raw: string) => {
      const text = raw.trim()
      if (!text || sending) return
      setError(null)
      setInput('')
      const userMsg: VisibleMessage = { id: crypto.randomUUID(), role: 'user', content: text }
      const nextHistory = [...messages, userMsg]
      setMessages(nextHistory)
      setSending(true)

      const payload: SupportChatMessage[] = nextHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const optimistic = localGuideResponse(text)
      if (optimistic.actions.some((a) => a.type === 'start_tour')) {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: 'assistant', content: optimistic.reply },
        ])
        applyActions(optimistic.actions, startTour, navigate)
        setSending(false)
        return
      }

      try {
        const res = await api.request<{
          reply: string
          actions?: SupportAction[]
        }>('/api/support-ai', {
          method: 'POST',
          body: JSON.stringify({
            messages: payload.slice(-12),
            context: {
              path: location.pathname,
              isDesktop,
              isAuthenticated: Boolean(user),
            },
          }),
          timeoutMs: 45_000,
        })
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: 'assistant', content: res.reply },
        ])
        applyActions(res.actions ?? [], startTour, navigate)
      } catch (err) {
        const local = localGuideResponse(text)
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: 'assistant', content: local.reply },
        ])
        applyActions(local.actions, startTour, navigate)
        if (!local.actions.length) {
          setError(err instanceof Error ? err.message : 'Could not reach Guide. Try again.')
        }
      } finally {
        setSending(false)
      }
    },
    [api, isDesktop, location.pathname, messages, navigate, sending, startTour, user],
  )

  if (hideOnLaunch) return <ProductTour />

  const panel = isOpen ? (
    <div
      className="fixed z-[70] flex h-[min(70vh,32rem)] w-[min(100vw-1.5rem,22rem)] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900"
      style={{
        bottom: 'max(5.75rem, calc(env(safe-area-inset-bottom, 0px) + 4.25rem))',
        right: 'max(1.5rem, env(safe-area-inset-right, 0px))',
      }}
      role="dialog"
      aria-modal="false"
      aria-labelledby="support-guide-title"
    >
      <div className="flex items-center justify-between gap-2 border-b border-neutral-200 bg-indigo-600 px-3 py-2.5 text-white dark:border-indigo-500/40">
        <div className="min-w-0">
          <h2 id="support-guide-title" className="text-sm font-semibold">
            Guide
          </h2>
          <p className="text-[11px] text-indigo-100">Ask about BountyHub or take a tour</p>
        </div>
        <button
          type="button"
          onClick={close}
          className="rounded-lg p-1.5 text-indigo-100 hover:bg-white/15 hover:text-white"
          aria-label="Close Guide"
        >
          <FiX className="h-5 w-5" />
        </button>
      </div>

      <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-200">{WELCOME_REPLY}</p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => void sendMessage(s.prompt)}
                  className="rounded-full border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-700 hover:border-indigo-300 hover:bg-indigo-50 dark:border-neutral-600 dark:text-neutral-200 dark:hover:border-indigo-400 dark:hover:bg-indigo-950/50"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[95%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'ml-auto bg-indigo-600 text-white'
                : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100'
            }`}
          >
            {m.content}
          </div>
        ))}
        {sending && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400" aria-live="polite">
            Guide is thinking…
          </p>
        )}
        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>

      <form
        className="border-t border-neutral-200 p-2 dark:border-neutral-700"
        onSubmit={(e) => {
          e.preventDefault()
          void sendMessage(input)
        }}
      >
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void sendMessage(input)
              }
            }}
            rows={1}
            maxLength={2000}
            placeholder="Ask a question…"
            className="max-h-24 min-h-[2.5rem] flex-1 resize-none rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
            aria-label="Ask Guide"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-neutral-400"
            aria-label="Send"
          >
            <FiSend className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  ) : null

  return (
    <>
      <button
        type="button"
        data-tour="guide"
        onClick={() => (isOpen ? close() : open())}
        className="fixed z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 text-neutral-950 shadow-lg transition hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-neutral-900"
        style={{
          bottom: 'max(1.5rem, env(safe-area-inset-bottom, 0px))',
          right: 'max(1.5rem, env(safe-area-inset-right, 0px))',
        }}
        aria-label={isOpen ? 'Close Guide' : 'Open Guide'}
        aria-expanded={isOpen}
        title="Ask Guide"
      >
        {isOpen ? <FiX className="h-6 w-6" /> : <FiHelpCircle className="h-6 w-6" />}
      </button>
      {panel}
      <ProductTour />
    </>
  )
}

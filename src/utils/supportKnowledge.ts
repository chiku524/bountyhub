/**
 * Shared support knowledge, intent detection, and action parsing for the in-app Guide.
 * Used by the Workers AI endpoint and by the client when the API is unavailable.
 */

export type SupportAction =
  | { type: 'start_tour' }
  | { type: 'navigate'; path: string }

export type SupportChatRole = 'user' | 'assistant'

export interface SupportChatMessage {
  role: SupportChatRole
  content: string
}

export const ALLOWED_GUIDE_PATHS = new Set([
  '/',
  '/community',
  '/posts/create',
  '/wallet',
  '/chat',
  '/docs',
  '/governance',
  '/settings',
  '/profile',
  '/bug-bounty/campaigns',
  '/repositories',
  '/contributions',
  '/analytics',
  '/refund-requests',
  '/transactions',
  '/download',
  '/login',
  '/signup',
  '/privacy',
  '/terms',
])

export const SUPPORT_KNOWLEDGE = `BountyHub is a decentralized Q&A platform. Users ask questions with optional BBUX bounties, answer questions, earn rewards, and participate in governance. Production site: https://bountyhub.tech. Support email: support@bountyhub.tech.

Core product
- BBUX is an in-app virtual token. Every account gets a virtual wallet automatically. You do not need a Solana wallet for basic use.
- Create a bounty from Create Bounty in the nav (web) or Create post in the desktop sidebar, or go to /posts/create. Add a title, content, tags, optional code/media, optional BBUX amount and duration.
- Authors accept one answer to distribute the bounty. Vote on answers to build reputation.
- Each post has a dedicated chat room for discussion while the post is active.
- Community (/community) is the main feed. Filter by All, New this week, Open, Unanswered, Bounties. Search is debounced. Sort and advanced filters are available.
- Wallet (/wallet): view BBUX balance and history. Deposit via Solana or earn in-app. Withdraw to a connected Solana wallet.
- Governance (/governance): stake BBUX for daily rewards (about 0.05%–0.12%). Vote on refund requests.
- Refunds: only the bounty creator can request a refund, typically within 7 days of bounty expiration. Community votes (about 48h). See /refund-requests and /docs#refund-system.
- Reputation and integrity scores unlock features and voting power.
- Notifications: answers, votes, comments, bounty awards, refund updates. Bell icon in the web top nav.
- Global chat and Team Hub (/chat): real-time chat with text, emoji, and GIFs. Team hubs have shared rooms and tasks. A purple chat bubble opens the chat sidebar (signed-in users).
- Bug bounty campaigns (/bug-bounty/campaigns): create campaigns for open-source projects, connect GitHub repos, set budgets, track submissions.
- GitHub: connect in Settings. Sync repositories (/repositories) and track contributions (/contributions).
- Desktop app: download from /download (Windows, macOS, Linux). Built with Tauri. Closing the window hides to the system tray; use the tray, dock, or taskbar to return. Command palette: ⌘K / Ctrl+K, or / when not typing.
- Command palette jumps to Community, Create post, Wallet, Chat, Docs, Settings, and more.
- Theme: light/dark toggle in the nav. Preference is remembered.
- Docs live at /docs (user guide, API, legal). Terms /privacy and /terms.

Getting started
1. Sign up with email or GitHub (/signup).
2. Complete your profile (/profile). Virtual BBUX wallet is created automatically.
3. Browse Community, then create a post or answer one.
4. Connect a Solana wallet when you are ready to deposit or withdraw.
5. Ask this Guide anytime, or email support@bountyhub.tech.

What this Guide can do
- Answer how-to questions about BountyHub.
- Start an interactive product tour when the user asks for a tour, walkthrough, or “show me around”.
- Point users to the right page (community, wallet, docs, etc.).
Do not invent features, prices, or legal advice. If unsure, say so and link /docs or support@bountyhub.tech.
Do not help with exploits, scraping, or unauthorized access.`

const TOUR_RE = /\b(tours?|walkthrough|show me around|guide me around)\b/i

export function isTourIntent(text: string): boolean {
  return TOUR_RE.test(text.trim())
}

export function normalizeGuidePath(path: string): string | null {
  const raw = path.trim()
  if (!raw.startsWith('/')) return null
  const noHash = raw.split('#')[0].split('?')[0]
  const cleaned = noHash.replace(/\/+$/, '') || '/'
  if (ALLOWED_GUIDE_PATHS.has(cleaned)) return cleaned
  return null
}

const ACTION_TAG_RE = /\[\[action:(start_tour|navigate:(\/[\w\-/#?]*))\]\]/gi

export function parseSupportActions(text: string): { reply: string; actions: SupportAction[] } {
  const actions: SupportAction[] = []
  const seen = new Set<string>()

  const reply = text
    .replace(ACTION_TAG_RE, (_full, kind: string, navPath?: string) => {
      const key = String(kind).toLowerCase()
      if (key === 'start_tour' && !seen.has('start_tour')) {
        seen.add('start_tour')
        actions.push({ type: 'start_tour' })
      } else if (key.startsWith('navigate:') && navPath) {
        const path = normalizeGuidePath(navPath)
        if (path && !seen.has(`navigate:${path}`)) {
          seen.add(`navigate:${path}`)
          actions.push({ type: 'navigate', path })
        }
      }
      return ''
    })
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return { reply, actions }
}

interface FaqEntry {
  tests: RegExp[]
  reply: string
  actions?: SupportAction[]
}

const FAQ: FaqEntry[] = [
  {
    tests: [TOUR_RE],
    reply:
      "Let's walk through BountyHub. I'll highlight the main parts of the app — skip anytime if you already know your way around.",
    actions: [{ type: 'start_tour' }],
  },
  {
    tests: [/\b(wallet|deposit|withdraw|solana|bbux balance)\b/i],
    reply:
      'Your virtual BBUX wallet is created with your account. Open Wallet to see balance and history. You can earn BBUX in-app; connect a Solana wallet when you want to deposit or withdraw. I can take you there.',
    actions: [{ type: 'navigate', path: '/wallet' }],
  },
  {
    tests: [/\b(create|post|ask|bounty|question)\b/i],
    reply:
      'Create a bounty from Create Bounty in the top nav (or Create post in the desktop sidebar). Add a title, details, tags, and optionally a BBUX bounty and duration. Authors accept one answer to pay out the bounty.',
    actions: [{ type: 'navigate', path: '/posts/create' }],
  },
  {
    tests: [/\b(chat|team hub|message|gif|emoji)\b/i],
    reply:
      'Signed-in users can open community chat from the purple bubble at the bottom-right, or go to Team Hub. Each bounty post also has its own chat room. Chat supports text, emoji, and GIFs.',
    actions: [{ type: 'navigate', path: '/chat' }],
  },
  {
    tests: [/\b(govern|stake|staking|vote|refund)\b/i],
    reply:
      'Stake BBUX on Governance for daily rewards. Refunds: only the bounty creator can request one (usually within 7 days after expiration); the community votes. See Governance and Refund requests.',
    actions: [{ type: 'navigate', path: '/governance' }],
  },
  {
    tests: [/\b(github|repositor|contribution)\b/i],
    reply:
      'Connect GitHub in Settings, then sync repositories and track contributions. You can also attach repos to bug bounty campaigns.',
    actions: [{ type: 'navigate', path: '/repositories' }],
  },
  {
    tests: [/\b(desktop|download|tauri|windows|macos|linux|tray)\b/i],
    reply:
      'The native desktop app is on the Download page (Windows, macOS, Linux). Closing the window hides BountyHub to the tray — use the tray icon or dock/taskbar to bring it back. ⌘K / Ctrl+K opens the command palette.',
    actions: [{ type: 'navigate', path: '/download' }],
  },
  {
    tests: [/\b(command palette|shortcut|ctrl\+k|⌘k|hotkey)\b/i],
    reply:
      'Press ⌘K or Ctrl+K (or / when you are not typing) to open the command palette and jump to Community, Wallet, Docs, and more.',
  },
  {
    tests: [/\b(sign ?up|register|create account|log ?in|sign ?in|github oauth)\b/i],
    reply:
      'Create an account with email or GitHub on Sign up. GitHub also lets you connect repositories later from Settings.',
    actions: [{ type: 'navigate', path: '/signup' }],
  },
  {
    tests: [/\b(docs|documentation|help article|user guide)\b/i],
    reply:
      'In-app docs cover the user guide, API, refunds, and legal. You can also email support@bountyhub.tech.',
    actions: [{ type: 'navigate', path: '/docs' }],
  },
  {
    tests: [/\b(bug bounty campaign|security campaign)\b/i],
    reply:
      'Bug bounty campaigns let maintainers fund security work on open-source repos. Browse campaigns or create one after you connect GitHub.',
    actions: [{ type: 'navigate', path: '/bug-bounty/campaigns' }],
  },
]

export function matchFaqFallback(message: string): { reply: string; actions: SupportAction[] } | null {
  const text = message.trim()
  if (!text) return null
  for (const entry of FAQ) {
    if (entry.tests.some((re) => re.test(text))) {
      return { reply: entry.reply, actions: entry.actions ?? [] }
    }
  }
  return null
}

export function defaultUnknownReply(): string {
  return 'I can help with BountyHub: bounties, wallet, chat, governance, the desktop app, and a product tour. Try asking “How do bounties work?” or “Give me a tour”. For anything I cannot answer, see /docs or email support@bountyhub.tech.'
}

export function mergeActions(primary: SupportAction[], extra: SupportAction[]): SupportAction[] {
  const out: SupportAction[] = []
  const seen = new Set<string>()
  for (const action of [...primary, ...extra]) {
    const key = action.type === 'navigate' ? `navigate:${action.path}` : action.type
    if (seen.has(key)) continue
    seen.add(key)
    out.push(action)
  }
  return out
}

export function localGuideResponse(message: string): { reply: string; actions: SupportAction[] } {
  const faq = matchFaqFallback(message)
  if (faq) return faq
  if (isTourIntent(message)) {
    return {
      reply:
        "Let's walk through BountyHub. I'll highlight the main parts of the app — skip anytime if you already know your way around.",
      actions: [{ type: 'start_tour' }],
    }
  }
  return { reply: defaultUnknownReply(), actions: [] }
}

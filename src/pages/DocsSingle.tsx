import { useEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FiMessageSquare, FiMail } from 'react-icons/fi'
import { PageMetadata } from '../components/PageMetadata'

const SECTION_IDS = [
  'overview',
  'platform-features',
  'user-guide',
  'ux-interface',
  'developer-guide',
  'api-reference',
  'deployment',
  'legal',
  'refund-system',
  'need-help'
] as const

const SECTION_LABELS: Record<(typeof SECTION_IDS)[number], string> = {
  overview: 'Overview',
  'platform-features': 'Platform Features',
  'user-guide': 'User Guide',
  'ux-interface': 'UX & Interface',
  'developer-guide': 'Developer Guide',
  'api-reference': 'API Reference',
  deployment: 'Deployment',
  legal: 'Legal',
  'refund-system': 'Refund System',
  'need-help': 'Need Help?'
}

const DEFAULT_SECTION: (typeof SECTION_IDS)[number] = 'overview'

const card = 'bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6'
const sectionTitle = 'text-2xl font-bold text-neutral-900 dark:text-white mb-4'
const subsectionTitle = 'text-lg font-semibold text-neutral-900 dark:text-white mb-2 mt-4'
const body = 'text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed'
const list = 'list-disc pl-5 space-y-1 text-neutral-600 dark:text-neutral-400 text-sm'

function isValidSection(id: string): id is (typeof SECTION_IDS)[number] {
  return SECTION_IDS.includes(id as (typeof SECTION_IDS)[number])
}

export default function DocsSingle() {
  const { hash } = useLocation()
  const sectionId = useMemo(() => {
    const id = hash.slice(1) || DEFAULT_SECTION
    return isValidSection(id) ? id : DEFAULT_SECTION
  }, [hash])

  // Sync URL hash when sectionId is default and hash is empty (e.g. first load on /docs)
  useEffect(() => {
    if (!hash && sectionId === DEFAULT_SECTION) {
      window.history.replaceState(null, '', '#overview')
    }
  }, [hash, sectionId])

  return (
    <div className="h-full min-h-0 flex flex-col w-full max-w-full">
      <PageMetadata
        title="Documentation - bountyhub"
        description="Complete documentation for bountyhub: platform overview, user guide, developer guide, API reference, deployment, legal, and refund system."
        keywords="bountyhub, documentation, user guide, API, developer, deployment, BBUX, bounty"
      />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-100 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg"
      >
        Skip to main content
      </a>

      {/* Minimal padding so container is near full viewport height/width without overlapping navbar/footer */}
      <div className="flex-1 min-h-0 w-full max-w-full overflow-hidden flex flex-col p-2 sm:p-3 lg:p-4">
        {/* Full-height container: only content inside scrolls (TOC + section), not the page */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col lg:flex-row rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/95 shadow-sm">
          {/* Table of Contents - scrollable within container */}
          <aside
            className="shrink-0 w-full lg:w-48 min-h-0 flex flex-col overflow-y-auto overflow-x-hidden scrollbar-hide border-b lg:border-b-0 lg:border-r border-neutral-200 dark:border-neutral-700"
            aria-label="Table of contents"
          >
          <div className="w-full lg:max-w-48 px-3 py-3 lg:py-3 mx-auto transition-opacity duration-300 ease-out">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3 text-center sticky top-0 bg-white dark:bg-neutral-800/95 py-1 z-10">
              Table of Contents
            </h2>
            <nav className="flex flex-row lg:flex-col gap-0.5 overflow-x-auto lg:overflow-x-visible overflow-y-visible scrollbar-hide pb-2 lg:pb-0 overscroll-x-contain">
              {SECTION_IDS.map((id) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className={`shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 text-center ${
                    sectionId === id
                      ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {SECTION_LABELS[id]}
                </a>
              ))}
            </nav>
          </div>
        </aside>

          {/* Section content - scrollable within container; uses most of container width */}
          <main
            id="main-content"
            className="flex-1 min-w-0 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-hide focus:outline-none scroll-smooth lg:flex lg:items-center lg:justify-center lg:self-stretch"
            tabIndex={-1}
            style={{ scrollBehavior: 'smooth' }}
          >
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-5 lg:px-8 py-4 pb-16 break-words transition-opacity duration-300 ease-out">
            {sectionId === 'overview' && (
              <>
                <h1 className={sectionTitle}>Overview</h1>
                <div className={card}>
                  <p className={body}>
                    bountyhub is a decentralized question-and-answer platform that incentivizes knowledge sharing through
                    a virtual token system (BBUX). Ask questions with bounties, provide quality answers, and earn rewards.
                    The platform combines community-driven governance, real-time chat, bug bounty campaigns, and GitHub
                    integration — all with optional Solana wallet support.
                  </p>
                  <p className={`${body} mt-3`}>
                    Our mission is to create a sustainable ecosystem where knowledge is valued and rewarded.
                  </p>
                </div>
              </>
            )}

            {sectionId === 'platform-features' && (
              <>
                <h1 className={sectionTitle}>Platform Features</h1>
                <div className="space-y-4">
                  <div className={card}>
                    <h2 className={subsectionTitle}>Virtual Token System (BBUX)</h2>
                    <p className={body}>Earn and spend BBUX through answers, governance, voting, and staking. Virtual wallets, no external wallet required for basic use.</p>
                  </div>
                  <div className={card}>
                    <h2 className={subsectionTitle}>Bounty System</h2>
                    <p className={body}>Create questions with BBUX bounties. Accept an answer to distribute the bounty. Time-based expiration and community voting on quality.</p>
                  </div>
                  <div className={card}>
                    <h2 className={subsectionTitle}>Governance & Staking</h2>
                    <p className={body}>Stake BBUX for dynamic daily rewards (0.05%–0.12%). Vote on refund requests. Treasury health and activity-based bonuses.</p>
                  </div>
                  <div className={card}>
                    <h2 className={subsectionTitle}>Reputation & Integrity</h2>
                    <p className={body}>Build reputation and integrity scores. Unlock features and voting power. Community-driven scoring.</p>
                  </div>
                  <div className={card}>
                    <h2 className={subsectionTitle}>Refund Request System</h2>
                    <p className={body}>Request refunds for unsatisfactory bounties. Community voting decides. Transparent process with time-based rules.</p>
                  </div>
                  <div className={card}>
                    <h2 className={subsectionTitle}>Notifications</h2>
                    <p className={body}>Real-time notifications for answers, votes, comments, bounty awards, and refund updates. Unread count and mark-as-read.</p>
                  </div>
                  <div className={card}>
                    <h2 className={subsectionTitle}>Global Chat</h2>
                    <p className={body}>Real-time community chat with text, emojis, and GIFs (GIPHY). Persistent sidebar, mobile-friendly.</p>
                  </div>
                  <div className={card}>
                    <h2 className={subsectionTitle}>Bug Bounty Campaigns</h2>
                    <p className={body}>Create campaigns for open source projects. Connect GitHub repos, set budgets, track submissions and verification.</p>
                  </div>
                  <div className={card}>
                    <h2 className={subsectionTitle}>GitHub Integration</h2>
                    <p className={body}>OAuth GitHub connection. Sync repositories, track contributions, link repos to bug bounty campaigns.</p>
                  </div>
                  <div className={card}>
                    <h2 className={subsectionTitle}>Progressive Web App (PWA)</h2>
                    <p className={body}>Install on desktop or mobile. Offline support, standalone app experience, automatic updates.</p>
                  </div>
                </div>
              </>
            )}

            {sectionId === 'user-guide' && (
              <>
                <h1 className={sectionTitle}>User Guide</h1>
                <div className="space-y-4">
                  <div className={card}>
                    <h2 className={subsectionTitle}>Getting Started</h2>
                    <p className={body}>Sign up with email or GitHub. Complete your profile. Your virtual BBUX wallet is created automatically.</p>
                  </div>
                  <div className={card}>
                    <h2 className={subsectionTitle}>Asking Questions</h2>
                    <p className={body}>Use “Create Bounty” (nav or /posts/create). Add title, content, tags, optional code/media. Optionally set a BBUX bounty and duration.</p>
                  </div>
                  <div className={card}>
                    <h2 className={subsectionTitle}>Answering Questions</h2>
                    <p className={body}>Open a post and submit an answer. Authors can accept one answer; bounty is then distributed. Vote on quality to build reputation.</p>
                  </div>
                  <div className={card}>
                    <h2 className={subsectionTitle}>Wallet & Transactions</h2>
                    <p className={body}>View balance and history under Wallet. Deposit via Solana or earn BBUX in-app. Withdraw to connected Solana wallet.</p>
                  </div>
                  <div className={card}>
                    <h2 className={subsectionTitle}>Settings</h2>
                    <p className={body}>Update profile, social links, password. Connect or disconnect GitHub. Manage notification preferences.</p>
                  </div>
                </div>
              </>
            )}

            {sectionId === 'ux-interface' && (
              <>
                <h1 className={sectionTitle}>UX & Interface</h1>
                <p className={`${body} mb-4`}>These features make the app easier and more pleasant to use.</p>
                <div className="space-y-4">
                  <div className={card}>
                    <h2 className={subsectionTitle}>Toast Notifications</h2>
                    <p className={body}>Success and error feedback appear as toasts (bottom-right). Shown after creating a post, updating profile picture or settings, changing password, connecting GitHub, and on upload/recording errors. You can dismiss them manually.</p>
                  </div>
                  <div className={card}>
                    <h2 className={subsectionTitle}>Create Bounty Button</h2>
                    <p className={body}>A prominent “Create Bounty” button appears in the top navigation when you’re logged in (desktop and mobile). One click takes you to the post creation page.</p>
                  </div>
                  <div className={card}>
                    <h2 className={subsectionTitle}>Community Search</h2>
                    <p className={body}>Search on the Community page is debounced (300ms). Results update shortly after you stop typing, reducing unnecessary updates and keeping the list responsive.</p>
                  </div>
                  <div className={card}>
                    <h2 className={subsectionTitle}>Scroll to Top & Back to Top</h2>
                    <p className={body}>When you switch routes, the page scrolls to the top. After scrolling down, a “Back to top” button appears (bottom-left); use it to scroll back to the top smoothly.</p>
                  </div>
                  <div className={card}>
                    <h2 className={subsectionTitle}>Community Filters</h2>
                    <p className={body}>The Filters panel (Community page) includes Status, Date range, Sort by, and “Has Bounty only.” Tags are in a separate section with search. Layout is spaced for clarity; “Clear all filters” resets everything.</p>
                  </div>
                  <div className={card}>
                    <h2 className={subsectionTitle}>Theme-Aware Loading</h2>
                    <p className={body}>Loading spinners and post skeletons respect light/dark theme so they look consistent in both modes.</p>
                  </div>
                  <div className={card}>
                    <h2 className={subsectionTitle}>Light/Dark Mode</h2>
                    <p className={body}>Toggle theme from the nav. Preference is remembered. UI is optimized for both themes.</p>
                  </div>
                </div>
              </>
            )}

            {sectionId === 'developer-guide' && (
              <>
                <h1 className={sectionTitle}>Developer Guide</h1>
                <div className={card}>
                  <h2 className={subsectionTitle}>Tech Stack</h2>
                  <ul className={list}>
                    <li>Frontend: React 18, TypeScript, Vite, Tailwind CSS, React Router</li>
                    <li>Backend: Cloudflare Workers, Hono, Drizzle ORM, D1 (SQLite)</li>
                    <li>Auth: JWT; optional GitHub OAuth</li>
                    <li>Wallet: Solana Web3.js, wallet adapters</li>
                  </ul>
                  <h2 className={subsectionTitle}>Development</h2>
                  <p className={body}>Clone repo, <code className="bg-neutral-200 dark:bg-neutral-700 px-1 rounded">npm install</code>, copy <code className="bg-neutral-200 dark:bg-neutral-700 px-1 rounded">.env.example</code> to <code className="bg-neutral-200 dark:bg-neutral-700 px-1 rounded">.env</code>, then <code className="bg-neutral-200 dark:bg-neutral-700 px-1 rounded">npm run dev:full</code> for frontend + Workers.</p>
                  <h2 className={subsectionTitle}>Project Layout</h2>
                  <p className={body}>Frontend in <code className="bg-neutral-200 dark:bg-neutral-700 px-1 rounded">src/</code> (pages, components, contexts, utils). API in <code className="bg-neutral-200 dark:bg-neutral-700 px-1 rounded">functions/</code>. Schema and migrations in <code className="bg-neutral-200 dark:bg-neutral-700 px-1 rounded">drizzle/</code>.</p>
                </div>
              </>
            )}

            {sectionId === 'api-reference' && (
              <>
                <h1 className={sectionTitle}>API Reference</h1>
                <div className={card}>
                  <h2 className={subsectionTitle}>Base URL</h2>
                  <p className={body}>Production: your Workers URL. Development: <code className="bg-neutral-200 dark:bg-neutral-700 px-1 rounded">http://localhost:8787</code>.</p>
                  <h2 className={subsectionTitle}>Authentication</h2>
                  <p className={body}>Cookie-based sessions (credentials: include). Login/signup return user; protected routes require a valid session.</p>
                  <h2 className={subsectionTitle}>Main Areas</h2>
                  <ul className={list}>
                    <li><code className="bg-neutral-200 dark:bg-neutral-700 px-1 rounded">/api/auth</code> — login, signup, logout, me, GitHub</li>
                    <li><code className="bg-neutral-200 dark:bg-neutral-700 px-1 rounded">/api/posts</code> — CRUD, list, get, create, edit, delete</li>
                    <li><code className="bg-neutral-200 dark:bg-neutral-700 px-1 rounded">/api/wallet</code> — balance, deposit, withdraw, transactions</li>
                    <li><code className="bg-neutral-200 dark:bg-neutral-700 px-1 rounded">/api/notifications</code> — list, read, unread count</li>
                    <li><code className="bg-neutral-200 dark:bg-neutral-700 px-1 rounded">/api/chat</code> — rooms, messages, global chat</li>
                    <li><code className="bg-neutral-200 dark:bg-neutral-700 px-1 rounded">/api/governance</code> — stake, rewards, refund votes</li>
                    <li><code className="bg-neutral-200 dark:bg-neutral-700 px-1 rounded">/api/tags</code> — list tags</li>
                  </ul>
                  <p className={`${body} mt-3`}>All request/response bodies use JSON. Errors return a message or details field.</p>
                </div>
              </>
            )}

            {sectionId === 'deployment' && (
              <>
                <h1 className={sectionTitle}>Deployment</h1>
                <div className={card}>
                  <p className={body}>
                    Frontend: Cloudflare Pages (e.g. auto-deploy from GitHub). Build with <code className="bg-neutral-200 dark:bg-neutral-700 px-1 rounded">npm run build</code>.
                    Backend: Cloudflare Workers. Create D1 database, run migrations (<code className="bg-neutral-200 dark:bg-neutral-700 px-1 rounded">wrangler d1 migrations apply</code>),
                    set secrets (JWT, GitHub client, etc.), then <code className="bg-neutral-200 dark:bg-neutral-700 px-1 rounded">npm run deploy:workers</code>.
                  </p>
                  <p className={`${body} mt-3`}>See the repository <code className="bg-neutral-200 dark:bg-neutral-700 px-1 rounded">docs/deployment.md</code> for prerequisites, DNS, and troubleshooting.</p>
                </div>
              </>
            )}

            {sectionId === 'legal' && (
              <>
                <h1 className={sectionTitle}>Legal</h1>
                <div className={card}>
                  <p className={body}>Terms of Service and Privacy Policy govern use of bountyhub. By using the platform you accept these terms.</p>
                  <ul className={`${list} mt-3`}>
                    <li><Link to="/terms" className="text-indigo-600 dark:text-indigo-400 hover:underline">Terms of Service</Link></li>
                    <li><Link to="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline">Privacy Policy</Link></li>
                  </ul>
                </div>
              </>
            )}

            {sectionId === 'refund-system' && (
              <>
                <h1 className={sectionTitle}>Refund System</h1>
                <div className="space-y-4">
                  <div className={card}>
                    <h2 className={subsectionTitle}>Overview</h2>
                    <p className={body}>You can request a refund of a bounty under certain conditions. Outcomes are decided by community voting.</p>
                  </div>
                  <div className={card}>
                    <h2 className={subsectionTitle}>Eligibility</h2>
                    <ul className={list}>
                      <li>Only the bounty creator can request a refund</li>
                      <li>Requests must be within the allowed time window (e.g. within 7 days of bounty expiration)</li>
                      <li>Abuse may result in penalties</li>
                    </ul>
                  </div>
                  <div className={card}>
                    <h2 className={subsectionTitle}>Process</h2>
                    <p className={body}>Submit a refund request from the post; provide reason and details. Community votes (e.g. 48h). If approved, bounty is returned; if denied, it remains or is distributed per rules.</p>
                  </div>
                  <div className={card}>
                    <h2 className={subsectionTitle}>Governance & Voting</h2>
                    <p className={body}>One vote per user per request. Quorum and majority rules apply. Results are transparent.</p>
                  </div>
                </div>
              </>
            )}

            {sectionId === 'need-help' && (
              <>
                <h1 className={sectionTitle}>Need Help?</h1>
                <div className={`${card} flex flex-col sm:flex-row gap-4 items-center justify-between`}>
                  <p className={body}>Can’t find what you need? Ask the community or contact support.</p>
                  <div className="flex flex-wrap gap-3 shrink-0">
                    <Link
                      to="/community"
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                    >
                      <FiMessageSquare className="w-4 h-4 mr-2" />
                      Ask the Community
                    </Link>
                    <a
                      href="mailto:support@bountyhub.tech"
                      className="inline-flex items-center px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors text-sm"
                    >
                      <FiMail className="w-4 h-4 mr-2" />
                      Contact Support
                    </a>
                  </div>
                </div>
              </>
            )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

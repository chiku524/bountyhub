import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { FiArrowRight, FiMonitor, FiSmartphone } from 'react-icons/fi'
import { logoUrl } from '../utils/logoUrl'
import { PageMetadata } from '../components/PageMetadata'
import { ThemeToggle } from '../components/ThemeToggle'
import { useAuth } from '../contexts/AuthProvider'

function useRevealOnScroll() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-pitch-reveal]')
    if (!els.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const el = entry.target as HTMLElement
          observer.unobserve(el)
          requestAnimationFrame(() => el.classList.add('pitch-revealed'))
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

const SECTION_LINKS = [
  { id: 'what', label: 'What' },
  { id: 'how', label: 'How' },
  { id: 'why', label: 'Why now' },
  { id: 'product', label: 'Product' },
] as const

/**
 * Public executive pitch at /pitch — brand-first landing composition, not a dashboard.
 */
export default function Pitch() {
  const { user } = useAuth()
  const [heroReady, setHeroReady] = useState(false)
  const [navSolid, setNavSolid] = useState(false)

  useRevealOnScroll()

  useEffect(() => {
    const t = requestAnimationFrame(() => setHeroReady(true))
    return () => cancelAnimationFrame(t)
  }, [])

  useEffect(() => {
    const onScroll = () => setNavSolid(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=Syne:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </Helmet>
      <PageMetadata
        title="BountyHub — Pitch"
        description="Executive summary of BountyHub: Q&A bounties, BBUX wallet, Guide, and desktop — the platform where questions meet rewards on Solana."
        keywords="BountyHub, pitch, bounties, BBUX, Solana, Guide, desktop app, bug bounty"
      />

      <div className="pitch-page min-h-screen text-[var(--pitch-ink)] dark:text-[var(--pitch-foam)]">
        {/* Ambient field */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
          <div className="absolute inset-0 bg-[var(--pitch-canvas)] dark:bg-[var(--pitch-void)]" />
          <div className="pitch-mesh absolute -left-1/4 top-[-20%] h-[70vh] w-[80vw] rounded-full opacity-80 dark:opacity-60" />
          <div className="pitch-mesh-alt absolute -right-1/4 bottom-[-10%] h-[55vh] w-[70vw] rounded-full opacity-70 dark:opacity-50" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(232,163,23,0.18),transparent_55%),radial-gradient(ellipse_at_90%_20%,rgba(232,93,58,0.14),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_20%_0%,rgba(232,163,23,0.12),transparent_55%),radial-gradient(ellipse_at_85%_30%,rgba(14,116,144,0.16),transparent_45%)]" />
        </div>

        {/* Slim pitch nav */}
        <header
          className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
            navSolid
              ? 'border-b border-black/5 bg-[var(--pitch-canvas)]/85 backdrop-blur-md dark:border-white/10 dark:bg-[var(--pitch-void)]/80'
              : 'bg-transparent'
          }`}
        >
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
            <Link to="/" className="flex min-w-0 items-center gap-2" aria-label="BountyHub home">
              <img src={logoUrl} alt="" className="h-7 w-7 object-contain sm:h-8 sm:w-8" aria-hidden />
              <span className="truncate font-[family-name:var(--pitch-display)] text-lg font-bold tracking-tight text-bounty-wordmark sm:text-xl">
                BountyHub
              </span>
            </Link>
            <nav className="hidden items-center gap-6 md:flex" aria-label="Pitch sections">
              {SECTION_LINKS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => scrollTo(s.id)}
                  className="font-[family-name:var(--pitch-body)] text-sm font-medium text-[var(--pitch-muted)] transition-colors hover:text-[var(--pitch-ink)] dark:hover:text-white"
                >
                  {s.label}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link
                to={user ? '/community' : '/signup'}
                className="inline-flex min-h-9 items-center rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-amber-500"
              >
                {user ? 'Open app' : 'Get started'}
              </Link>
            </div>
          </div>
        </header>

        {/* Hero — brand, one headline, one sentence, CTAs, full-bleed visual */}
        <section className="relative min-h-[100svh] overflow-hidden pt-14 sm:pt-16">
          <div className="absolute inset-0">
            <img
              src="/social-banner.jpg"
              alt=""
              className={`h-full w-full object-cover transition-transform duration-[1.4s] ease-out ${
                heroReady ? 'scale-100' : 'scale-105'
              }`}
              aria-hidden
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0e1116]/75 via-[#0e1116]/55 to-[var(--pitch-canvas)] dark:to-[var(--pitch-void)]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0e1116]/50 via-transparent to-[#0e1116]/35" />
          </div>

          <div className="relative mx-auto flex min-h-[calc(100svh-3.5rem)] max-w-6xl flex-col justify-end px-4 pb-16 pt-24 sm:px-6 sm:pb-24 sm:pt-28">
            <p
              className={`font-[family-name:var(--pitch-display)] text-5xl font-extrabold leading-[0.95] tracking-tight text-white sm:text-7xl md:text-8xl transition-all duration-700 ${
                heroReady ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
              }`}
            >
              <span className="text-bounty-wordmark">BountyHub</span>
            </p>
            <h1
              className={`mt-5 max-w-2xl font-[family-name:var(--pitch-display)] text-2xl font-semibold leading-tight text-white sm:text-3xl md:text-4xl transition-all delay-100 duration-700 ${
                heroReady ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
              }`}
            >
              Where questions meet rewards.
            </h1>
            <p
              className={`mt-4 max-w-xl font-[family-name:var(--pitch-body)] text-base leading-relaxed text-white/80 sm:text-lg transition-all delay-200 duration-700 ${
                heroReady ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
              }`}
            >
              A decentralized Q&amp;A and security bounty platform — post BBUX rewards, earn for answers,
              settle on your in-app wallet, and ship with Guide beside you on web and desktop.
            </p>
            <div
              className={`mt-8 flex flex-col gap-3 sm:flex-row sm:items-center transition-all delay-300 duration-700 ${
                heroReady ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
              }`}
            >
              <Link
                to={user ? '/community' : '/signup'}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-amber-500 px-6 text-base font-semibold text-neutral-950 transition hover:bg-amber-400"
              >
                {user ? 'Enter Community' : 'Create an account'}
                <FiArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <button
                type="button"
                onClick={() => scrollTo('how')}
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/30 bg-white/5 px-6 text-base font-medium text-white backdrop-blur-sm transition hover:bg-white/10"
              >
                See how it works
              </button>
            </div>
          </div>
        </section>

        {/* What / who */}
        <section id="what" className="scroll-mt-20 border-t border-black/5 dark:border-white/10">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 md:grid-cols-12 md:gap-10 md:py-28">
            <div className="md:col-span-5" data-pitch-reveal>
              <p className="font-[family-name:var(--pitch-body)] text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">
                What it is
              </p>
              <h2 className="mt-3 font-[family-name:var(--pitch-display)] text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                Knowledge and security bounties in one product.
              </h2>
            </div>
            <div
              className="space-y-6 font-[family-name:var(--pitch-body)] text-base leading-relaxed text-[var(--pitch-muted)] md:col-span-7 sm:text-lg"
              data-pitch-reveal
            >
              <p>
                BountyHub is a live platform at{' '}
                <a href="https://bountyhub.tech" className="font-medium text-amber-800 underline-offset-2 hover:underline dark:text-amber-300">
                  bountyhub.tech
                </a>
                . Authors fund questions with optional BBUX rewards; the community answers; accepting an
                answer pays out on your virtual balance. Maintainers can also run structured security bug
                bounty campaigns tied to GitHub repositories.
              </p>
              <p>
                <span className="font-semibold text-[var(--pitch-ink)] dark:text-white">Who it&apos;s for:</span>{' '}
                builders who need fast, incentivized answers; open-source maintainers who want scoped
                vulnerability reports; researchers and contributors who earn BBUX for useful work.
              </p>
            </div>
          </div>
        </section>

        {/* How — bounty / wallet / Guide as continuous narrative */}
        <section
          id="how"
          className="scroll-mt-20 border-t border-black/5 bg-black/[0.03] dark:border-white/10 dark:bg-white/[0.03]"
        >
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
            <div className="max-w-2xl" data-pitch-reveal>
              <p className="font-[family-name:var(--pitch-body)] text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">
                How it works
              </p>
              <h2 className="mt-3 font-[family-name:var(--pitch-display)] text-3xl font-bold tracking-tight sm:text-4xl">
                Bounty. Wallet. Guide.
              </h2>
              <p className="mt-4 font-[family-name:var(--pitch-body)] text-base text-[var(--pitch-muted)] sm:text-lg">
                Three surfaces people touch every day — kept plain-language in the product, not buried in chain jargon.
              </p>
            </div>

            <ol className="mt-14 space-y-0">
              {[
                {
                  n: '01',
                  title: 'Bounties',
                  body: 'Create a post with an optional BBUX reward and duration. Answers compete; the author accepts one to distribute the bounty. Each post has its own chat room while it stays open.',
                },
                {
                  n: '02',
                  title: 'Wallet',
                  body: 'Every account gets a virtual BBUX wallet automatically — no Solana wallet required to start. Deposit SOL to top up, earn in-app, and withdraw SOL when you cash out. Status stays human-readable: waiting, paid, didn’t go through.',
                },
                {
                  n: '03',
                  title: 'Guide',
                  body: 'An always-on product helper answers how-to questions, can start a short onboarding tour, and sits beside the UI on web and desktop — so new users learn the product without leaving the app.',
                },
              ].map((step, i) => (
                <li
                  key={step.n}
                  className="grid gap-4 border-t border-black/10 py-10 dark:border-white/10 md:grid-cols-12 md:gap-8"
                  data-pitch-reveal
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <span className="font-[family-name:var(--pitch-display)] text-sm font-bold tracking-widest text-amber-600 dark:text-amber-400 md:col-span-2">
                    {step.n}
                  </span>
                  <h3 className="font-[family-name:var(--pitch-display)] text-2xl font-bold md:col-span-3">
                    {step.title}
                  </h3>
                  <p className="font-[family-name:var(--pitch-body)] text-base leading-relaxed text-[var(--pitch-muted)] md:col-span-7 sm:text-lg">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Why now */}
        <section id="why" className="scroll-mt-20 border-t border-black/5 dark:border-white/10">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
            <div className="max-w-3xl" data-pitch-reveal>
              <p className="font-[family-name:var(--pitch-body)] text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">
                Why now
              </p>
              <h2 className="mt-3 font-[family-name:var(--pitch-display)] text-3xl font-bold tracking-tight sm:text-4xl">
                Incentives belong next to the work — not in a separate spreadsheet.
              </h2>
              <div className="mt-6 space-y-5 font-[family-name:var(--pitch-body)] text-base leading-relaxed text-[var(--pitch-muted)] sm:text-lg">
                <p>
                  Teams already ask questions in chat and track security work in GitHub. BountyHub connects
                  those workflows to a rewards balance: Q&amp;A bounties for speed, campaign flows for
                  scoped vulnerability reports, governance and refunds when a bounty needs community
                  judgment.
                </p>
                <p>
                  Built on Cloudflare Workers and D1 with Solana for deposits and withdrawals, plus a native
                  Tauri desktop app — so the same product is reachable from a browser tab or a tray icon.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Product — web + desktop */}
        <section
          id="product"
          className="scroll-mt-20 border-t border-black/5 bg-gradient-to-b from-amber-50/40 to-transparent dark:border-white/10 dark:from-amber-950/20 dark:to-transparent"
        >
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
            <div className="max-w-2xl" data-pitch-reveal>
              <p className="font-[family-name:var(--pitch-body)] text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">
                Product highlights
              </p>
              <h2 className="mt-3 font-[family-name:var(--pitch-display)] text-3xl font-bold tracking-tight sm:text-4xl">
                One product, two surfaces.
              </h2>
            </div>

            <div className="mt-14 grid gap-12 md:grid-cols-2">
              <article data-pitch-reveal className="relative">
                <div className="mb-4 flex items-center gap-3 text-amber-700 dark:text-amber-400">
                  <FiSmartphone className="h-5 w-5" aria-hidden />
                  <span className="font-[family-name:var(--pitch-body)] text-sm font-semibold uppercase tracking-wider">
                    Web
                  </span>
                </div>
                <h3 className="font-[family-name:var(--pitch-display)] text-2xl font-bold">bountyhub.tech</h3>
                <p className="mt-3 font-[family-name:var(--pitch-body)] text-base leading-relaxed text-[var(--pitch-muted)]">
                  Community feed, bounty detail with sticky answer actions on mobile, wallet and
                  transactions, Team Hub chat, governance, bug bounty campaigns, and in-app docs — with
                  Guide available from any page.
                </p>
              </article>
              <article data-pitch-reveal className="relative">
                <div className="mb-4 flex items-center gap-3 text-amber-700 dark:text-amber-400">
                  <FiMonitor className="h-5 w-5" aria-hidden />
                  <span className="font-[family-name:var(--pitch-body)] text-sm font-semibold uppercase tracking-wider">
                    Desktop
                  </span>
                </div>
                <h3 className="font-[family-name:var(--pitch-display)] text-2xl font-bold">
                  Native Windows, macOS, Linux
                </h3>
                <p className="mt-3 font-[family-name:var(--pitch-body)] text-base leading-relaxed text-[var(--pitch-muted)]">
                  Tauri desktop builds stay connected to the same API. Close to tray, jump with the command
                  palette, and keep Community, Wallet, and Guide a click away — installers on the{' '}
                  <Link to="/download" className="font-medium text-amber-800 underline-offset-2 hover:underline dark:text-amber-300">
                    Download
                  </Link>{' '}
                  page.
                </p>
              </article>
            </div>

            <aside
              className="mt-16 border-l-2 border-amber-500/70 pl-5 sm:pl-6"
              data-pitch-reveal
            >
              <h3 className="font-[family-name:var(--pitch-display)] text-xl font-bold sm:text-2xl">
                Guide as a product surface
              </h3>
              <p className="mt-3 max-w-3xl font-[family-name:var(--pitch-body)] text-base leading-relaxed text-[var(--pitch-muted)] sm:text-lg">
                Guide is BountyHub&apos;s built-in helper — multi-turn answers about bounties, wallet, and
                chat, plus a skippable first-run tour. When AI is briefly unavailable, quick FAQ answers are
                labeled clearly. Contextual sponsored slots can appear under replies without delaying the
                answer itself.
              </p>
            </aside>
          </div>
        </section>

        {/* Close */}
        <section className="border-t border-black/5 dark:border-white/10">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-20 sm:px-6 md:flex-row md:items-end md:justify-between md:py-28">
            <div className="max-w-xl" data-pitch-reveal>
              <h2 className="font-[family-name:var(--pitch-display)] text-3xl font-bold tracking-tight sm:text-4xl">
                Ready when you are.
              </h2>
              <p className="mt-3 font-[family-name:var(--pitch-body)] text-base text-[var(--pitch-muted)] sm:text-lg">
                Sign up with email or GitHub. Your BBUX wallet is created with the account.
              </p>
            </div>
            <div className="flex flex-wrap gap-3" data-pitch-reveal>
              <Link
                to={user ? '/community' : '/signup'}
                className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-amber-600 px-6 text-base font-semibold text-white transition hover:bg-amber-500"
              >
                {user ? 'Go to Community' : 'Get started'}
                <FiArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                to="/docs"
                className="inline-flex min-h-12 items-center rounded-lg border border-black/15 px-6 text-base font-medium transition hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/5"
              >
                Read the docs
              </Link>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .pitch-page {
          --pitch-display: 'Syne', ui-sans-serif, system-ui, sans-serif;
          --pitch-body: 'DM Sans', ui-sans-serif, system-ui, sans-serif;
          --pitch-ink: #141210;
          --pitch-muted: #5c564e;
          --pitch-canvas: #ebe9e4;
          --pitch-void: #0e1116;
          --pitch-foam: #eceae6;
        }
        .dark .pitch-page {
          --pitch-muted: #a39e96;
        }
        .pitch-mesh {
          background: radial-gradient(circle at 30% 40%, rgba(232, 163, 23, 0.35), transparent 60%);
          filter: blur(48px);
          animation: pitch-drift 18s ease-in-out infinite alternate;
        }
        .pitch-mesh-alt {
          background: radial-gradient(circle at 60% 50%, rgba(232, 93, 58, 0.28), transparent 65%);
          filter: blur(56px);
          animation: pitch-drift 22s ease-in-out infinite alternate-reverse;
        }
        @keyframes pitch-drift {
          from { transform: translate3d(0, 0, 0) scale(1); }
          to { transform: translate3d(4%, -3%, 0) scale(1.06); }
        }
        [data-pitch-reveal] {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        [data-pitch-reveal].pitch-revealed {
          opacity: 1;
          transform: translateY(0);
        }
        @media (prefers-reduced-motion: reduce) {
          .pitch-mesh, .pitch-mesh-alt { animation: none; }
          [data-pitch-reveal] { opacity: 1; transform: none; transition: none; }
        }
      `}</style>
    </>
  )
}

import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthProvider'
import { useEffect, useRef, useState } from 'react'
import { api } from '../utils/api'
import { PageMetadata } from '../components/PageMetadata'
import { useScrollReveal } from '../hooks/useLandingMotion'
import { CountUp } from '../components/landing/CountUp'
import { FiUsers, FiDollarSign, FiAward, FiZap, FiShield, FiTrendingUp, FiGithub, FiCode } from 'react-icons/fi'

interface PlatformStats {
  activeBounties: number
  questionsAnswered: number
  totalRewards: string
  communityMembers: number
  totalPosts: number
  totalAnswers: number
  totalBBUX: string
}

export default function Home() {
  const { user } = useAuth()
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [statsError, setStatsError] = useState(false)
  const [heroMounted, setHeroMounted] = useState(false)

  const pageRef = useRef<HTMLDivElement>(null)
  useScrollReveal(pageRef)

  useEffect(() => {
    const t = requestAnimationFrame(() => setHeroMounted(true))
    return () => cancelAnimationFrame(t)
  }, [])

  // Mount static Tiny Startups embed (in index.html) into the hero.
  // CSS hides the badge unless it lives inside #tinystartups-badge-hero.
  useEffect(() => {
    const badge = document.getElementById('tinystartups-badge')
    const hero = document.getElementById('tinystartups-badge-hero')
    if (!badge || !hero) return
    hero.appendChild(badge)
    return () => {
      document.body.appendChild(badge)
    }
  }, [])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const platformStats = await api.getPlatformStats()
        setStats(platformStats)
        setStatsError(false)
      } catch (error) {
        console.error('Failed to fetch platform stats:', error)
        setStatsError(true)
        setStats({
          activeBounties: 0,
          questionsAnswered: 0,
          totalRewards: '0.00',
          communityMembers: 0,
          totalPosts: 0,
          totalAnswers: 0,
          totalBBUX: '0.00'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatBbux = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M BBUX'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K BBUX'
    }
    return num.toFixed(2) + ' BBUX'
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <>
      <PageMetadata 
        title="bountyhub — Q&A bounties & security bug bounties"
        description="Ask questions with BBUX rewards, answer to earn, and run security bug bounty campaigns tied to your GitHub repositories. Bounties settle on your in-platform balance; deposit SOL to fund BBUX and withdraw SOL when you cash out."
        keywords="bounty, bug bounty, security, GitHub, cryptocurrency, Solana, blockchain, rewards, questions, answers, BBUX, decentralized, open source"
      />
      <div aria-hidden="true" className="landing-progress bg-linear-to-r from-amber-400 via-orange-400 to-rose-500" />
      <div ref={pageRef} className="min-h-screen bg-linear-to-br from-amber-50/40 via-white/80 to-indigo-50/30 dark:from-[#0b1020]/90 dark:via-neutral-900/95 dark:to-indigo-950/40 backdrop-blur-xs text-neutral-900 dark:text-white transition-colors duration-200 pt-16">
        {/* Hero Section */}
        <section id="hero" className="relative isolate overflow-hidden max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 border-b border-neutral-200/70 dark:border-neutral-700/50">
          <div aria-hidden="true" className="absolute inset-0 -z-10">
            <div className="landing-orb landing-orb--amber -top-24 -left-16 h-[26rem] w-[26rem] sm:h-[34rem] sm:w-[34rem]" />
            <div className="landing-orb landing-orb--indigo -bottom-32 -right-20 h-[24rem] w-[24rem] sm:h-[32rem] sm:w-[32rem]" />
          </div>
          <div className="text-center">
            <h1
              className={`text-3xl sm:text-5xl md:text-7xl font-bold mb-6 transition-opacity duration-300 ${
                heroMounted ? 'animate-fade-in-up' : 'opacity-0'
              }`}
              style={heroMounted ? { animationDelay: '0ms' } : undefined}
            >
              Welcome to{' '}
              <span className="text-bounty-wordmark landing-wordmark">bountyhub</span>
            </h1>
            <p
              className={`text-xl text-neutral-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto transition-opacity duration-300 ${
                heroMounted ? 'animate-fade-in-up' : 'opacity-0'
              }`}
              style={heroMounted ? { animationDelay: '120ms' } : undefined}
            >
              Q&amp;A bounties for fast answers, plus <strong className="font-semibold text-neutral-800 dark:text-neutral-100">security bug bounty programs</strong> for the repos you care about.
              Post rewards in BBUX, review submissions, and credit researchers on your platform balance—deposit SOL to top up and withdraw SOL when you cash out.
            </p>

            <div
              className={`flex flex-col sm:flex-row flex-wrap gap-4 justify-center transition-opacity duration-300 ${
                heroMounted ? 'animate-fade-in-up' : 'opacity-0'
              }`}
              style={heroMounted ? { animationDelay: '240ms' } : undefined}
            >
              {user ? (
                <>
                  <Link
                    to="/posts/create"
                    className="landing-cta btn-primary text-lg px-8 py-4"
                  >
                    Create a Q&amp;A bounty
                  </Link>
                  <Link
                    to="/bug-bounty/campaigns"
                    className="landing-cta text-lg px-8 py-4 rounded-lg font-medium border-2 border-amber-500/50 text-amber-800 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-950/30 hover:bg-amber-100/90 dark:hover:bg-amber-900/40 transition-colors text-center"
                  >
                    Bug bounty programs
                  </Link>
                  <Link
                    to="/community"
                    className="landing-cta btn-secondary text-lg px-8 py-4"
                  >
                    Browse community
                  </Link>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => scrollToSection('cta')}
                    data-tour="get-started"
                    className="landing-cta btn-primary text-lg px-8 py-4"
                  >
                    Get started
                  </button>
                  <Link
                    to="/bug-bounty/campaigns"
                    className="landing-cta text-lg px-8 py-4 rounded-lg font-medium border-2 border-amber-500/50 text-amber-800 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-950/30 hover:bg-amber-100/90 dark:hover:bg-amber-900/40 transition-colors text-center"
                  >
                    Explore bug bounties
                  </Link>
                  <Link
                    to="/login"
                    className="landing-cta btn-secondary text-lg px-8 py-4"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>

            <div
              id="tinystartups-badge-hero"
              className={`mt-10 flex justify-center transition-opacity duration-300 ${
                heroMounted ? 'animate-fade-in-up' : 'opacity-0'
              }`}
              style={heroMounted ? { animationDelay: '360ms' } : undefined}
            />
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-b border-neutral-200/70 dark:border-neutral-700/50 transition-colors duration-200 hover:bg-neutral-50/30 dark:hover:bg-neutral-800/20">
          <div className="text-center mb-16" data-animate="fade-in-up">
            <h2 className="text-2xl sm:text-4xl font-bold mb-4">Platform features</h2>
            <p className="text-xl text-neutral-600 dark:text-gray-300 max-w-2xl mx-auto">
              One place for knowledge bounties, security campaigns, and BBUX rewards—with Solana for deposits and withdrawals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="group card bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 shadow-xs hover:shadow-lg hover:border-amber-300/70 dark:hover:border-amber-500/40 transition-[box-shadow,border-color,translate] duration-300 ease-out hover:-translate-y-1" data-animate="scale-in" data-animate-delay="0">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-6">
                  <FiZap className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Q&amp;A bounties</h3>
                <p className="text-neutral-600 dark:text-gray-400">
                  Post questions with BBUX-backed rewards. The best answers get credited on-platform — fast iteration for teams and builders.
                </p>
              </div>
            </div>

            <div className="group card bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 shadow-xs hover:shadow-lg hover:border-amber-300/70 dark:hover:border-amber-500/40 transition-[box-shadow,border-color,translate] duration-300 ease-out hover:-translate-y-1" data-animate="scale-in" data-animate-delay="50">
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-6">
                  <FiDollarSign className="w-8 h-8 text-amber-700 dark:text-amber-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">BBUX &amp; wallet</h3>
                <p className="text-neutral-600 dark:text-gray-400">
                  Connect a wallet to deposit SOL and receive BBUX. Bounties, tips, and payouts move on your virtual balance; withdraw SOL when you are ready.
                </p>
              </div>
            </div>

            <div className="group card bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 shadow-xs hover:shadow-lg hover:border-amber-300/70 dark:hover:border-amber-500/40 transition-[box-shadow,border-color,translate] duration-300 ease-out hover:-translate-y-1" data-animate="scale-in" data-animate-delay="100">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-6">
                  <FiTrendingUp className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Reputation &amp; growth</h3>
                <p className="text-neutral-600 dark:text-gray-400">
                  Earn standing as you answer, ship fixes, and participate — unlock higher-trust opportunities over time.
                </p>
              </div>
            </div>

            <div className="group card bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 shadow-xs hover:shadow-lg hover:border-amber-300/70 dark:hover:border-amber-500/40 transition-[box-shadow,border-color,translate] duration-300 ease-out hover:-translate-y-1" data-animate="scale-in" data-animate-delay="150">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-6">
                  <FiUsers className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Community &amp; teams</h3>
                <p className="text-neutral-600 dark:text-gray-400">
                  Browse posts, follow experts, and use Team Hub alongside your bounty workflows.
                </p>
              </div>
            </div>

            <div className="group card bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 shadow-xs hover:shadow-lg hover:border-amber-300/70 dark:hover:border-amber-500/40 transition-[box-shadow,border-color,translate] duration-300 ease-out hover:-translate-y-1" data-animate="scale-in" data-animate-delay="200">
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-6">
                  <FiAward className="w-8 h-8 text-amber-700 dark:text-amber-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Gamification</h3>
                <p className="text-neutral-600 dark:text-gray-400">
                  Badges, leaderboards, and BBUX — keep contributors motivated across Q&amp;A and security work.
                </p>
              </div>
            </div>

            <div className="group card bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 shadow-xs hover:shadow-lg hover:border-amber-300/70 dark:hover:border-amber-500/40 transition-[box-shadow,border-color,translate] duration-300 ease-out hover:-translate-y-1" data-animate="scale-in" data-animate-delay="250">
              <div className="text-center">
                <div className="w-16 h-16 bg-rose-100 dark:bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-6">
                  <FiShield className="w-8 h-8 text-rose-600 dark:text-rose-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Security-minded</h3>
                <p className="text-neutral-600 dark:text-gray-400">
                  Bug bounty campaigns, scoped submissions, and review flows designed for maintainers and researchers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bug bounty programs */}
        <section
          id="bug-bounties"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-b border-neutral-200/70 dark:border-neutral-700/50 bg-linear-to-b from-amber-50/50 via-white/60 to-transparent dark:from-amber-950/20 dark:via-neutral-900/40 dark:to-transparent"
        >
          <div className="text-center mb-12" data-animate="fade-in-up">
            <h2 className="text-2xl sm:text-4xl font-bold mb-4">Security bug bounty programs</h2>
            <p className="text-xl text-neutral-600 dark:text-gray-300 max-w-3xl mx-auto">
              Run structured campaigns on top of repositories you track on bountyhub. Set scope and rewards in BBUX, collect vulnerability reports through a guided submission flow, and triage outcomes with your team before crediting researchers on-platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div
              className="group rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white/90 dark:bg-neutral-800/60 p-6 shadow-xs hover:shadow-lg hover:border-indigo-300/70 dark:hover:border-indigo-500/40 transition-[box-shadow,border-color,translate] duration-300 ease-out hover:-translate-y-1"
              data-animate="scale-in"
              data-animate-delay="0"
            >
              <div className="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center mb-4 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-6">
                <FiGithub className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Repo-linked campaigns</h3>
              <p className="text-neutral-600 dark:text-gray-400 text-sm leading-relaxed">
                Create a program from a connected GitHub repository so scope, expectations, and payout rules stay tied to the codebase contributors already know.
              </p>
            </div>
            <div
              className="group rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white/90 dark:bg-neutral-800/60 p-6 shadow-xs hover:shadow-lg hover:border-indigo-300/70 dark:hover:border-indigo-500/40 transition-[box-shadow,border-color,translate] duration-300 ease-out hover:-translate-y-1"
              data-animate="scale-in"
              data-animate-delay="60"
            >
              <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center mb-4 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-6">
                <FiCode className="w-7 h-7 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Structured submissions</h3>
              <p className="text-neutral-600 dark:text-gray-400 text-sm leading-relaxed">
                Researchers file reports against an active campaign with steps to reproduce and severity context — so reviewers can decide quickly and fairly.
              </p>
            </div>
            <div
              className="group rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white/90 dark:bg-neutral-800/60 p-6 shadow-xs hover:shadow-lg hover:border-indigo-300/70 dark:hover:border-indigo-500/40 transition-[box-shadow,border-color,translate] duration-300 ease-out hover:-translate-y-1"
              data-animate="scale-in"
              data-animate-delay="120"
            >
              <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center mb-4 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-6">
                <FiShield className="w-7 h-7 text-amber-700 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">BBUX rewards &amp; review</h3>
              <p className="text-neutral-600 dark:text-gray-400 text-sm leading-relaxed">
                Offer BBUX rewards, track campaign status from open listings through accepted submissions, and keep a clear trail for maintainers and hunters—without per-bounty on-chain transfers.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center" data-animate="fade-in-up">
            <Link to="/bug-bounty/campaigns" className="landing-cta btn-primary text-center text-lg px-8 py-3.5">
              Browse campaigns
            </Link>
            <Link
              to="/bug-bounty/campaigns/create"
              className="landing-cta text-lg px-8 py-3.5 rounded-lg font-medium border-2 border-indigo-400/50 text-indigo-800 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-950/40 hover:bg-indigo-100/90 dark:hover:bg-indigo-900/50 transition-colors text-center"
            >
              Launch a program
            </Link>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-white/50 dark:bg-neutral-800/30 border-y border-neutral-200/70 dark:border-neutral-700/50 transition-colors duration-200 hover:bg-white/70 dark:hover:bg-neutral-800/40">
          <div className="text-center mb-16" data-animate="fade-in-up">
            <h2 className="text-2xl sm:text-4xl font-bold mb-4">How it works</h2>
            <p className="text-xl text-neutral-600 dark:text-gray-300 max-w-2xl mx-auto">
              Three steps to fund knowledge, ship fixes, or hunt bugs with BBUX
            </p>
          </div>

          <div className="relative grid md:grid-cols-3 gap-8">
            {/* Connector drawn behind the step numbers once the row scrolls into view */}
            <div
              aria-hidden="true"
              className="hidden md:block absolute top-16 left-[16.6%] right-[16.6%] h-0.5 bg-linear-to-r from-indigo-300/70 via-amber-300/70 to-rose-300/70 dark:from-indigo-500/40 dark:via-amber-500/40 dark:to-rose-500/40"
              data-animate="draw-line"
              data-animate-delay="150"
            />
            <div className="group text-center rounded-2xl border border-transparent dark:border-transparent p-6 transition-all duration-300 hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:bg-white/60 dark:hover:bg-neutral-700/30 hover:shadow-md" data-animate="fade-in-up" data-animate-delay="0">
              <div className="relative w-20 h-20 bg-indigo-100 dark:bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-indigo-600 dark:text-indigo-400 ring-4 ring-white/80 dark:ring-neutral-900/80 transition-transform duration-300 ease-out group-hover:scale-110" data-animate="pop-in" data-animate-delay="200">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4">Sign up &amp; connect</h3>
              <p className="text-neutral-600 dark:text-gray-400">
                Create your account and connect a Solana wallet so you can deposit SOL, hold BBUX on-platform, and withdraw SOL later.
              </p>
            </div>

            <div className="group text-center rounded-2xl border border-transparent p-6 transition-all duration-300 hover:border-amber-200 dark:hover:border-amber-500/30 hover:bg-white/60 dark:hover:bg-neutral-700/30 hover:shadow-md" data-animate="fade-in-up" data-animate-delay="80">
              <div className="relative w-20 h-20 bg-amber-100 dark:bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-amber-700 dark:text-amber-400 ring-4 ring-white/80 dark:ring-neutral-900/80 transition-transform duration-300 ease-out group-hover:scale-110" data-animate="pop-in" data-animate-delay="400">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4">Choose your track</h3>
              <p className="text-neutral-600 dark:text-gray-400">
                Post a Q&amp;A bounty, join discussions in the community, or open a security campaign for your repository.
              </p>
            </div>

            <div className="group text-center rounded-2xl border border-transparent p-6 transition-all duration-300 hover:border-rose-200 dark:hover:border-rose-500/30 hover:bg-white/60 dark:hover:bg-neutral-700/30 hover:shadow-md" data-animate="fade-in-up" data-animate-delay="160">
              <div className="relative w-20 h-20 bg-rose-100 dark:bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-rose-600 dark:text-rose-400 ring-4 ring-white/80 dark:ring-neutral-900/80 transition-transform duration-300 ease-out group-hover:scale-110" data-animate="pop-in" data-animate-delay="600">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4">Ship, review, earn</h3>
              <p className="text-neutral-600 dark:text-gray-400">
                Answer questions, submit vulnerability reports, or triage incoming work — rewards credit as BBUX instantly; cash out via Solana withdrawal when you choose.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section id="stats" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-b border-neutral-200/70 dark:border-neutral-700/50 transition-colors duration-200 hover:bg-neutral-50/30 dark:hover:bg-neutral-800/20">
          <div className="text-center mb-16" data-animate="fade-in-up">
            <h2 className="text-2xl sm:text-4xl font-bold mb-4">Platform statistics</h2>
            <p className="text-xl text-neutral-600 dark:text-gray-300 max-w-2xl mx-auto">
              {statsError
                ? 'We could not load live numbers right now — the figures below are placeholders until the service is reachable again.'
                : 'Live activity across Q&A bounties, answers, and BBUX offered across the platform'}
            </p>
            {!loading && statsError && (
              <p
                className="mt-4 mx-auto max-w-xl rounded-lg border border-amber-200/80 bg-amber-50/90 px-4 py-2 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-950/50 dark:text-amber-100"
                role="status"
              >
                Couldn&apos;t load live stats. Refresh the page to try again.
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 min-[360px]:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center rounded-xl py-6 px-4 border border-transparent transition-all duration-300 hover:border-indigo-200/80 dark:hover:border-indigo-500/30 hover:bg-white/50 dark:hover:bg-neutral-700/30 hover:shadow-md" data-animate="scale-in" data-animate-delay="0">
              <div className="text-3xl md:text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                {loading ? (
                  <div className="animate-pulse bg-indigo-100 dark:bg-indigo-400/20 h-8 w-16 mx-auto rounded-sm"></div>
                ) : (
                  <CountUp value={stats?.activeBounties || 0} format={(n) => formatNumber(Math.round(n))} />
                )}
              </div>
              <div className="text-neutral-600 dark:text-gray-400">Active bounties</div>
            </div>
            <div className="text-center rounded-xl py-6 px-4 border border-transparent transition-all duration-300 hover:border-rose-200/80 dark:hover:border-rose-500/30 hover:bg-white/50 dark:hover:bg-neutral-700/30 hover:shadow-md" data-animate="scale-in" data-animate-delay="60">
              <div className="text-3xl md:text-4xl font-bold text-rose-600 dark:text-rose-400 mb-2">
                {loading ? (
                  <div className="animate-pulse bg-rose-100 dark:bg-rose-400/20 h-8 w-16 mx-auto rounded-sm"></div>
                ) : (
                  <CountUp value={stats?.questionsAnswered || 0} format={(n) => formatNumber(Math.round(n))} />
                )}
              </div>
              <div className="text-neutral-600 dark:text-gray-400">Questions answered</div>
            </div>
            <div className="text-center rounded-xl py-6 px-4 border border-transparent transition-all duration-300 hover:border-amber-200/80 dark:hover:border-amber-500/30 hover:bg-white/50 dark:hover:bg-neutral-700/30 hover:shadow-md" data-animate="scale-in" data-animate-delay="120">
              <div className="text-3xl md:text-4xl font-bold text-amber-700 dark:text-amber-400 mb-2">
                {loading ? (
                  <div className="animate-pulse bg-amber-100 dark:bg-amber-400/20 h-8 w-16 mx-auto rounded-sm"></div>
                ) : (
                  <CountUp value={parseFloat(stats?.totalRewards || '0') || 0} format={formatBbux} />
                )}
              </div>
              <div className="text-neutral-600 dark:text-gray-400">BBUX in bounty pools</div>
            </div>
            <div className="text-center rounded-xl py-6 px-4 border border-transparent transition-all duration-300 hover:border-orange-200/80 dark:hover:border-orange-500/30 hover:bg-white/50 dark:hover:bg-neutral-700/30 hover:shadow-md" data-animate="scale-in" data-animate-delay="180">
              <div className="text-3xl md:text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                {loading ? (
                  <div className="animate-pulse bg-orange-100 dark:bg-orange-400/20 h-8 w-16 mx-auto rounded-sm"></div>
                ) : (
                  <CountUp value={stats?.communityMembers || 0} format={(n) => formatNumber(Math.round(n))} />
                )}
              </div>
              <div className="text-neutral-600 dark:text-gray-400">Community members</div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="cta" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="landing-glow bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xs rounded-2xl p-6 sm:p-12 text-center border-2 border-amber-500/45 dark:border-amber-500/40 shadow-[0_0_24px_rgba(245,158,11,0.12)] dark:shadow-[0_0_28px_rgba(245,158,11,0.15)] transition-all duration-300 hover:scale-[1.01] hover:border-amber-400/60 hover:shadow-[0_0_32px_rgba(245,158,11,0.18)] dark:hover:shadow-[0_0_36px_rgba(251,191,36,0.18)]" data-animate="scale-in">
            <h2 className="text-2xl sm:text-4xl font-bold mb-4 text-neutral-900 dark:text-white">Ready to get started?</h2>
            <p className="text-xl mb-8 text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
              Open a Q&amp;A bounty, browse active security programs, or launch your own campaign — fund BBUX with Solana deposits and withdraw when you cash out.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center">
              {user ? (
                <>
                  <Link
                    to="/posts/create"
                    className="landing-cta btn-primary text-lg px-8 py-4 font-semibold shadow-lg shadow-amber-900/15"
                  >
                    Create a Q&amp;A bounty
                  </Link>
                  <Link
                    to="/bug-bounty/campaigns"
                    className="landing-cta text-lg px-8 py-4 rounded-lg font-semibold border-2 border-amber-500/50 text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/35 hover:bg-amber-100 dark:hover:bg-amber-900/45 transition-colors"
                  >
                    Bug bounty hub
                  </Link>
                  <Link
                    to="/community"
                    className="landing-cta px-8 py-4 bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-600 transition-colors font-semibold text-lg border-2 border-neutral-200 dark:border-neutral-600"
                  >
                    Browse community
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/signup"
                    data-tour="get-started"
                    className="landing-cta btn-primary text-lg px-8 py-4 font-semibold shadow-lg shadow-amber-900/15"
                  >
                    Sign up free
                  </Link>
                  <Link
                    to="/bug-bounty/campaigns"
                    className="landing-cta text-lg px-8 py-4 rounded-lg font-semibold border-2 border-amber-500/50 text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/35 hover:bg-amber-100 dark:hover:bg-amber-900/45 transition-colors"
                  >
                    Explore bug bounties
                  </Link>
                  <Link
                    to="/login"
                    className="landing-cta px-8 py-4 bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-600 transition-colors font-semibold text-lg border-2 border-neutral-200 dark:border-neutral-600"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthProvider'
import { useEffect, useState } from 'react'
import { api } from '../utils/api'
import { PageMetadata } from '../components/PageMetadata'
import { HomeNav } from '../components/HomeNav'
import { FiUsers, FiDollarSign, FiAward, FiZap, FiShield, FiTrendingUp } from 'react-icons/fi'

/** Run scroll-triggered animations when elements with data-animate enter view. */
function useScrollAnimations() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-animate]')
    if (!els.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const el = entry.target as HTMLElement
          const name = el.getAttribute('data-animate')
          const delay = el.getAttribute('data-animate-delay')
          if (!name) continue
          observer.unobserve(el)
          requestAnimationFrame(() => {
            el.classList.add(`animate-${name}`)
            if (delay) el.style.animationDelay = `${delay}ms`
          })
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -60px 0px' }
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

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
  const [heroMounted, setHeroMounted] = useState(false)

  useScrollAnimations()

  useEffect(() => {
    const t = requestAnimationFrame(() => setHeroMounted(true))
    return () => cancelAnimationFrame(t)
  }, [])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const platformStats = await api.getPlatformStats()
        setStats(platformStats)
      } catch (error) {
        console.error('Failed to fetch platform stats:', error)
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

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount)
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M SOL'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K SOL'
    }
    return num.toFixed(2) + ' SOL'
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
        title="bountyhub - Decentralized Bounty Platform"
        description="The decentralized bounty platform where questions meet rewards. Ask questions, offer bounties, and earn cryptocurrency rewards on Solana. Join the future of decentralized knowledge sharing."
        keywords="bounty, cryptocurrency, solana, blockchain, rewards, questions, answers, BBUX, decentralized, knowledge sharing"
      />
      <HomeNav onScrollTo={scrollToSection} />
      <div className="min-h-screen bg-linear-to-br from-neutral-50/50 via-white/50 to-neutral-50/50 dark:from-neutral-900/50 dark:via-neutral-800/50 dark:to-neutral-900/50 backdrop-blur-xs text-neutral-900 dark:text-white transition-colors duration-200 pt-16">
        {/* Hero Section */}
        <section id="hero" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 border-b border-neutral-200/70 dark:border-neutral-700/50">
          <div className="text-center">
            <h1
              className={`text-5xl md:text-7xl font-bold mb-6 transition-opacity duration-300 ${
                heroMounted ? 'animate-fade-in-up' : 'opacity-0'
              }`}
              style={heroMounted ? { animationDelay: '0ms' } : undefined}
            >
              Welcome to{' '}
              <span className="bg-linear-to-r from-cyan-400 to-violet-400 dark:from-cyan-400 dark:to-violet-400 bg-clip-text text-transparent">
                bountyhub
              </span>
            </h1>
            <p
              className={`text-xl text-neutral-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto transition-opacity duration-300 ${
                heroMounted ? 'animate-fade-in-up' : 'opacity-0'
              }`}
              style={heroMounted ? { animationDelay: '120ms' } : undefined}
            >
              The decentralized bounty platform where questions meet rewards.
              Ask questions, offer bounties, and earn rewards in cryptocurrency.
            </p>

            <div
              className={`flex flex-col sm:flex-row gap-4 justify-center transition-opacity duration-300 ${
                heroMounted ? 'animate-fade-in-up' : 'opacity-0'
              }`}
              style={heroMounted ? { animationDelay: '240ms' } : undefined}
            >
              {user ? (
                <>
                  <Link
                    to="/posts/create"
                    className="btn-primary text-lg px-8 py-4"
                  >
                    Create a Bounty
                  </Link>
                  <Link
                    to="/community"
                    className="btn-secondary text-lg px-8 py-4"
                  >
                    Browse Community
                  </Link>
                </>
              ) : (
                <>
                  <button
                    onClick={() => scrollToSection('cta')}
                    className="btn-primary text-lg px-8 py-4"
                  >
                    Get Started
                  </button>
                  <Link
                    to="/login"
                    className="btn-secondary text-lg px-8 py-4"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-b border-neutral-200/70 dark:border-neutral-700/50 transition-colors duration-200 hover:bg-neutral-50/30 dark:hover:bg-neutral-800/20">
          <div className="text-center mb-16" data-animate="fade-in-up">
            <h2 className="text-4xl font-bold mb-4">Platform Features</h2>
            <p className="text-xl text-neutral-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need to participate in the decentralized bounty ecosystem
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="card bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 shadow-xs hover:shadow-lg transition-shadow duration-300 hover:-translate-y-0.5" data-animate="scale-in" data-animate-delay="0">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiZap className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Create Bounties</h3>
                <p className="text-neutral-600 dark:text-gray-400">
                  Post questions with cryptocurrency rewards and get answers from the community.
                </p>
              </div>
            </div>

            <div className="card bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 shadow-xs hover:shadow-lg transition-shadow duration-300 hover:-translate-y-0.5" data-animate="scale-in" data-animate-delay="50">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiDollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Earn Rewards</h3>
                <p className="text-neutral-600 dark:text-gray-400">
                  Answer questions and earn cryptocurrency rewards for your expertise.
                </p>
              </div>
            </div>

            <div className="card bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 shadow-xs hover:shadow-lg transition-shadow duration-300 hover:-translate-y-0.5" data-animate="scale-in" data-animate-delay="100">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiTrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Build Reputation</h3>
                <p className="text-neutral-600 dark:text-gray-400">
                  Build your reputation and unlock higher rewards as you contribute to the community.
                </p>
              </div>
            </div>

            <div className="card bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 shadow-xs hover:shadow-lg transition-shadow duration-300 hover:-translate-y-0.5" data-animate="scale-in" data-animate-delay="150">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiUsers className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
                <p className="text-neutral-600 dark:text-gray-400">
                  Join a vibrant community of experts and learners sharing knowledge.
                </p>
              </div>
            </div>

            <div className="card bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 shadow-xs hover:shadow-lg transition-shadow duration-300 hover:-translate-y-0.5" data-animate="scale-in" data-animate-delay="200">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiAward className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Gamification</h3>
                <p className="text-neutral-600 dark:text-gray-400">
                  Earn reputation points, badges, and climb the leaderboards.
                </p>
              </div>
            </div>

            <div className="card bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 shadow-xs hover:shadow-lg transition-shadow duration-300 hover:-translate-y-0.5" data-animate="scale-in" data-animate-delay="250">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiShield className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure & Transparent</h3>
                <p className="text-neutral-600 dark:text-gray-400">
                  Built on Solana blockchain for security, transparency, and decentralization.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-white/50 dark:bg-neutral-800/30 border-y border-neutral-200/70 dark:border-neutral-700/50 transition-colors duration-200 hover:bg-white/70 dark:hover:bg-neutral-800/40">
          <div className="text-center mb-16" data-animate="fade-in-up">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-neutral-600 dark:text-gray-300 max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center rounded-2xl border border-transparent dark:border-transparent p-6 transition-all duration-300 hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:bg-white/60 dark:hover:bg-neutral-700/30 hover:shadow-md" data-animate="fade-in-up" data-animate-delay="0">
              <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-indigo-600 dark:text-indigo-400 transition-transform duration-300">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4">Sign Up</h3>
              <p className="text-neutral-600 dark:text-gray-400">
                Create your account and connect your Solana wallet to get started.
              </p>
            </div>

            <div className="text-center rounded-2xl border border-transparent p-6 transition-all duration-300 hover:border-green-200 dark:hover:border-green-500/30 hover:bg-white/60 dark:hover:bg-neutral-700/30 hover:shadow-md" data-animate="fade-in-up" data-animate-delay="80">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-green-600 dark:text-green-400">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4">Post or Answer</h3>
              <p className="text-neutral-600 dark:text-gray-400">
                Post a question with a bounty or answer questions to earn rewards.
              </p>
            </div>

            <div className="text-center rounded-2xl border border-transparent p-6 transition-all duration-300 hover:border-purple-200 dark:hover:border-purple-500/30 hover:bg-white/60 dark:hover:bg-neutral-700/30 hover:shadow-md" data-animate="fade-in-up" data-animate-delay="160">
              <div className="w-20 h-20 bg-purple-100 dark:bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-purple-600 dark:text-purple-400">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4">Earn & Build</h3>
              <p className="text-neutral-600 dark:text-gray-400">
                Receive rewards in your wallet and build your reputation in the community.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section id="stats" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-b border-neutral-200/70 dark:border-neutral-700/50 transition-colors duration-200 hover:bg-neutral-50/30 dark:hover:bg-neutral-800/20">
          <div className="text-center mb-16" data-animate="fade-in-up">
            <h2 className="text-4xl font-bold mb-4">Platform Statistics</h2>
            <p className="text-xl text-neutral-600 dark:text-gray-300 max-w-2xl mx-auto">
              Join thousands of users already participating in the bounty ecosystem
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center rounded-xl py-6 px-4 border border-transparent transition-all duration-300 hover:border-indigo-200/80 dark:hover:border-indigo-500/30 hover:bg-white/50 dark:hover:bg-neutral-700/30 hover:shadow-md" data-animate="scale-in" data-animate-delay="0">
              <div className="text-3xl md:text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                {loading ? (
                  <div className="animate-pulse bg-indigo-100 dark:bg-indigo-400/20 h-8 w-16 mx-auto rounded-sm"></div>
                ) : (
                  formatNumber(stats?.activeBounties || 0)
                )}
              </div>
              <div className="text-neutral-600 dark:text-gray-400">Active Bounties</div>
            </div>
            <div className="text-center rounded-xl py-6 px-4 border border-transparent transition-all duration-300 hover:border-green-200/80 dark:hover:border-green-500/30 hover:bg-white/50 dark:hover:bg-neutral-700/30 hover:shadow-md" data-animate="scale-in" data-animate-delay="60">
              <div className="text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                {loading ? (
                  <div className="animate-pulse bg-green-100 dark:bg-green-400/20 h-8 w-16 mx-auto rounded-sm"></div>
                ) : (
                  formatNumber(stats?.questionsAnswered || 0)
                )}
              </div>
              <div className="text-neutral-600 dark:text-gray-400">Questions Answered</div>
            </div>
            <div className="text-center rounded-xl py-6 px-4 border border-transparent transition-all duration-300 hover:border-purple-200/80 dark:hover:border-purple-500/30 hover:bg-white/50 dark:hover:bg-neutral-700/30 hover:shadow-md" data-animate="scale-in" data-animate-delay="120">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {loading ? (
                  <div className="animate-pulse bg-purple-100 dark:bg-purple-400/20 h-8 w-16 mx-auto rounded-sm"></div>
                ) : (
                  formatCurrency(stats?.totalRewards || '0.00')
                )}
              </div>
              <div className="text-neutral-600 dark:text-gray-400">Total Rewards</div>
            </div>
            <div className="text-center rounded-xl py-6 px-4 border border-transparent transition-all duration-300 hover:border-yellow-200/80 dark:hover:border-yellow-500/30 hover:bg-white/50 dark:hover:bg-neutral-700/30 hover:shadow-md" data-animate="scale-in" data-animate-delay="180">
              <div className="text-3xl md:text-4xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                {loading ? (
                  <div className="animate-pulse bg-yellow-100 dark:bg-yellow-400/20 h-8 w-16 mx-auto rounded-sm"></div>
                ) : (
                  formatNumber(stats?.communityMembers || 0)
                )}
              </div>
              <div className="text-neutral-600 dark:text-gray-400">Community Members</div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="cta" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xs rounded-2xl p-12 text-center border-2 border-violet-500/50 dark:border-violet-500/50 shadow-[0_0_20px_rgba(34,211,238,0.15)] dark:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all duration-300 hover:scale-[1.01] hover:border-cyan-400/50 hover:shadow-[0_0_28px_rgba(34,211,238,0.2)] dark:hover:shadow-[0_0_28px_rgba(34,211,238,0.25)]" data-animate="scale-in">
            <h2 className="text-4xl font-bold mb-4 text-neutral-900 dark:text-white">Ready to Get Started?</h2>
            <p className="text-xl mb-8 text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
              Join the decentralized bounty platform and start earning rewards today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <>
                  <Link
                    to="/posts/create"
                    className="px-8 py-4 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-violet-500/50"
                  >
                    Create Your First Bounty
                  </Link>
                  <Link
                    to="/community"
                    className="px-8 py-4 bg-white dark:bg-neutral-700 text-violet-600 dark:text-violet-400 rounded-lg hover:bg-violet-50 dark:hover:bg-neutral-600 transition-colors font-semibold text-lg border-2 border-violet-500/30 dark:border-violet-500/30"
                  >
                    Browse Community
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="px-8 py-4 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-violet-500/50"
                  >
                    Sign Up Free
                  </Link>
                  <Link
                    to="/login"
                    className="px-8 py-4 bg-white dark:bg-neutral-700 text-violet-600 dark:text-violet-400 rounded-lg hover:bg-violet-50 dark:hover:bg-neutral-600 transition-colors font-semibold text-lg border-2 border-violet-500/30 dark:border-violet-500/30"
                  >
                    Sign In
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

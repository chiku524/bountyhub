import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthProvider'
import { useEffect, useState } from 'react'
import { api } from '../utils/api'
import { PageMetadata } from '../components/PageMetadata'

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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const platformStats = await api.getPlatformStats()
        setStats(platformStats)
      } catch (error) {
        console.error('Failed to fetch platform stats:', error)
        // Set default values if API fails
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

  return (
    <>
      <PageMetadata 
        title="bountyhub - Decentralized Bounty Platform"
        description="The decentralized bounty platform where questions meet rewards. Ask questions, offer bounties, and earn cryptocurrency rewards on Solana. Join the future of decentralized knowledge sharing."
        keywords="bounty, cryptocurrency, solana, blockchain, rewards, questions, answers, BBUX, decentralized, knowledge sharing"
      />
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                bountyhub
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              The decentralized bounty platform where questions meet rewards. 
              Ask questions, offer bounties, and earn rewards in cryptocurrency.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
                  <Link
                    to="/signup"
                    className="btn-primary text-lg px-8 py-4"
                  >
                    Get Started
                  </Link>
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

          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="card bg-neutral-800/50 border-neutral-700">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Create Bounties</h3>
                <p className="text-gray-400">
                  Post questions with cryptocurrency rewards and get answers from the community.
                </p>
              </div>
            </div>

            <div className="card bg-neutral-800/50 border-neutral-700">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Earn Rewards</h3>
                <p className="text-gray-400">
                  Answer questions and earn cryptocurrency rewards for your expertise.
                </p>
              </div>
            </div>

            <div className="card bg-neutral-800/50 border-neutral-700">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Build Reputation</h3>
                <p className="text-gray-400">
                  Build your reputation and unlock higher rewards as you contribute to the community.
                </p>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-8">Platform Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-400 mb-2">
                  {loading ? (
                    <div className="animate-pulse bg-indigo-400/20 h-8 w-16 mx-auto rounded"></div>
                  ) : (
                    formatNumber(stats?.activeBounties || 0)
                  )}
                </div>
                <div className="text-gray-400">Active Bounties</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {loading ? (
                    <div className="animate-pulse bg-green-400/20 h-8 w-16 mx-auto rounded"></div>
                  ) : (
                    formatNumber(stats?.questionsAnswered || 0)
                  )}
                </div>
                <div className="text-gray-400">Questions Answered</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  {loading ? (
                    <div className="animate-pulse bg-purple-400/20 h-8 w-16 mx-auto rounded"></div>
                  ) : (
                    formatCurrency(stats?.totalRewards || '0.00')
                  )}
                </div>
                <div className="text-gray-400">Total Rewards</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">
                  {loading ? (
                    <div className="animate-pulse bg-yellow-400/20 h-8 w-16 mx-auto rounded"></div>
                  ) : (
                    formatNumber(stats?.communityMembers || 0)
                  )}
                </div>
                <div className="text-gray-400">Community Members</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 
import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { 
  FiCreditCard, FiLogOut, FiUsers, FiDollarSign, FiSettings, 
  FiCheckSquare, FiRefreshCw, FiBarChart2, FiShield, FiGithub, 
  FiAward, FiChevronDown, FiMenu, FiX
} from 'react-icons/fi'
import { useAuth } from '../contexts/AuthProvider'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { Notifications } from './Notifications'
import { ThemeToggle } from './ThemeToggle'
import type { NotificationsRef } from './Notifications'
import logo from '/logo.svg'

function WalletButton() {
  const { wallet, connected, disconnect } = useWallet()
  const { setVisible } = useWalletModal()

  const handleWalletClick = () => {
    if (connected) {
      disconnect()
    } else {
      setVisible(true)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  if (connected) {
    return (
      <button
        onClick={handleWalletClick}
        className="px-3 py-1.5 bg-green-600/20 border border-green-500/30 rounded-lg text-green-400 text-xs font-medium transition-all duration-300 hover:bg-green-600/30 hover:border-green-500/50 flex items-center gap-2"
      >
        <FiCreditCard className="w-4 h-4" />
        <span className="hidden sm:inline">
          {wallet?.adapter?.publicKey ? formatAddress(wallet.adapter.publicKey.toString()) : 'Connected'}
        </span>
      </button>
    )
  }

  return (
    <button
      onClick={handleWalletClick}
      className="px-3 py-1.5 bg-violet-600/20 border border-violet-500/30 rounded-lg text-violet-400 text-xs font-medium transition-all duration-300 hover:bg-violet-600/30 hover:border-violet-500/50 flex items-center gap-2"
    >
      <FiCreditCard className="w-4 h-4" />
      <span className="hidden sm:inline">Connect Wallet</span>
    </button>
  )
}

export function TopNav() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [governanceOpen, setGovernanceOpen] = useState(false)
  const [openSourceOpen, setOpenSourceOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const notificationsRef = useRef<NotificationsRef>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.dropdown-menu') && !target.closest('.dropdown-trigger')) {
        setGovernanceOpen(false)
        setOpenSourceOpen(false)
      }
    }
    
    if (governanceOpen || openSourceOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [governanceOpen, openSourceOpen])

  // Fetch unread count from Notifications component
  const handleNotificationsUpdate = (count: number) => {
    setUnreadCount(count)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-neutral-800/70 backdrop-blur-xs border-b border-neutral-200/50 dark:border-neutral-700/50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 shrink-0">
            <img src={logo} alt="bountyhub logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent hidden sm:block">
              bountyhub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 flex-1 justify-center">
            {/* Profile */}
            {user && (
              <Link
                to="/profile"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  isActive('/profile')
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5'
                }`}
              >
                {user.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={`${user.username}'s profile`}
                    className="w-5 h-5 rounded-full object-cover border border-indigo-500/30"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{user.username.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <span>Profile</span>
              </Link>
            )}

            {/* Community */}
            <Link
              to="/community"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                isActive('/community')
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5'
              }`}
            >
              <FiUsers className="w-4 h-4" />
              <span>Community</span>
            </Link>

            {/* Governance Dropdown */}
            <div className="relative dropdown-menu">
              <button
                onClick={() => setGovernanceOpen(!governanceOpen)}
                className={`dropdown-trigger px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  isActive('/governance') || isActive('/refund-requests')
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5'
                }`}
              >
                <FiCheckSquare className="w-4 h-4" />
                <span>Governance</span>
                <FiChevronDown className={`w-3 h-3 transition-transform ${governanceOpen ? 'rotate-180' : ''}`} />
              </button>
              {governanceOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 py-1 z-50">
                  <Link
                    to="/governance"
                    onClick={() => setGovernanceOpen(false)}
                    className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    <FiCheckSquare className="w-4 h-4" />
                    <span>Governance</span>
                  </Link>
                  <Link
                    to="/refund-requests"
                    onClick={() => setGovernanceOpen(false)}
                    className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    <FiRefreshCw className="w-4 h-4" />
                    <span>Refund Requests</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Open Source Dropdown */}
            <div className="relative dropdown-menu">
              <button
                onClick={() => setOpenSourceOpen(!openSourceOpen)}
                className={`dropdown-trigger px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  isActive('/bug-bounty') || isActive('/repositories') || isActive('/contributions')
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5'
                }`}
              >
                <FiGithub className="w-4 h-4" />
                <span>Open Source</span>
                <FiChevronDown className={`w-3 h-3 transition-transform ${openSourceOpen ? 'rotate-180' : ''}`} />
              </button>
              {openSourceOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 py-1 z-50">
                  <Link
                    to="/bug-bounty/campaigns"
                    onClick={() => setOpenSourceOpen(false)}
                    className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    <FiShield className="w-4 h-4" />
                    <span>Bug Bounty</span>
                  </Link>
                  <Link
                    to="/repositories"
                    onClick={() => setOpenSourceOpen(false)}
                    className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    <FiGithub className="w-4 h-4" />
                    <span>Repositories</span>
                  </Link>
                  <Link
                    to="/contributions"
                    onClick={() => setOpenSourceOpen(false)}
                    className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    <FiAward className="w-4 h-4" />
                    <span>Contributions</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Analytics */}
            <Link
              to="/analytics"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                isActive('/analytics')
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5'
              }`}
            >
              <FiBarChart2 className="w-4 h-4" />
              <span>Analytics</span>
            </Link>

            {/* Admin Panel - Only show for admin users */}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  isActive('/admin')
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Admin</span>
              </Link>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-2 shrink-0">
            {/* Wallet */}
            <WalletButton />

            {/* Notifications */}
            <div className="relative">
              <button
                data-notifications-button-topnav
                onClick={() => notificationsRef.current?.toggle()}
                className="p-2 rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors relative"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {user && unreadCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <Notifications ref={notificationsRef} onUnreadCountChange={handleNotificationsUpdate} />
            </div>

            {/* Settings */}
            <Link
              to="/settings"
              className={`p-2 rounded-md transition-colors ${
                isActive('/settings')
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5'
              }`}
            >
              <FiSettings className="w-5 h-5" />
            </Link>

            {/* Wallet (standalone link) */}
            <Link
              to="/wallet"
              className={`p-2 rounded-md transition-colors ${
                isActive('/wallet')
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5'
              }`}
            >
              <FiDollarSign className="w-5 h-5" />
            </Link>

            {/* Theme Toggle */}
            <div className="p-2">
              <ThemeToggle />
            </div>

            {/* Logout */}
            {user && (
              <button
                onClick={handleLogout}
                className="p-2 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Logout"
              >
                <FiLogOut className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5"
          >
            {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-200 dark:border-neutral-700">
            <div className="space-y-1">
              {user && (
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5"
                >
                  Profile
                </Link>
              )}
              <Link
                to="/community"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5"
              >
                Community
              </Link>
              <div>
                <button
                  onClick={() => setGovernanceOpen(!governanceOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5"
                >
                  <span>Governance</span>
                  <FiChevronDown className={`w-4 h-4 transition-transform ${governanceOpen ? 'rotate-180' : ''}`} />
                </button>
                {governanceOpen && (
                  <div className="pl-4 space-y-1">
                    <Link
                      to="/governance"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        setGovernanceOpen(false)
                      }}
                      className="block px-3 py-2 rounded-md text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5"
                    >
                      Governance
                    </Link>
                    <Link
                      to="/refund-requests"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        setGovernanceOpen(false)
                      }}
                      className="block px-3 py-2 rounded-md text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5"
                    >
                      Refund Requests
                    </Link>
                  </div>
                )}
              </div>
              <div>
                <button
                  onClick={() => setOpenSourceOpen(!openSourceOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5"
                >
                  <span>Open Source</span>
                  <FiChevronDown className={`w-4 h-4 transition-transform ${openSourceOpen ? 'rotate-180' : ''}`} />
                </button>
                {openSourceOpen && (
                  <div className="pl-4 space-y-1">
                    <Link
                      to="/bug-bounty/campaigns"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        setOpenSourceOpen(false)
                      }}
                      className="block px-3 py-2 rounded-md text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5"
                    >
                      Bug Bounty
                    </Link>
                    <Link
                      to="/repositories"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        setOpenSourceOpen(false)
                      }}
                      className="block px-3 py-2 rounded-md text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5"
                    >
                      Repositories
                    </Link>
                    <Link
                      to="/contributions"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        setOpenSourceOpen(false)
                      }}
                      className="block px-3 py-2 rounded-md text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5"
                    >
                      Contributions
                    </Link>
                  </div>
                )}
              </div>
              <Link
                to="/analytics"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5"
              >
                Analytics
              </Link>
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Admin
                </Link>
              )}
              <Link
                to="/wallet"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5"
              >
                Wallet
              </Link>
              <Link
                to="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5"
              >
                Settings
              </Link>
              <div className="px-3 py-2">
                <ThemeToggle />
              </div>
              {user && (
                <button
                  onClick={() => {
                    handleLogout()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}


import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { 
  FiCreditCard, FiLogOut, FiUsers, FiDollarSign, FiSettings, 
  FiCheckSquare, FiRefreshCw, FiBarChart2, FiShield, FiGithub, 
  FiAward, FiChevronDown, FiMenu, FiX, FiDownload, FiMessageCircle
} from 'react-icons/fi'
import { useAuth } from '../contexts/AuthProvider'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { Notifications } from './Notifications'
import { ThemeToggle } from './ThemeToggle'
import type { NotificationsRef } from './Notifications'
import { logoUrl } from '../utils/logoUrl'

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
  const [exploreOpen, setExploreOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileAccountOpen, setMobileAccountOpen] = useState(false)
  const notificationsRef = useRef<NotificationsRef>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.nav-dropdown') && !target.closest('.nav-dropdown-trigger')) {
        setExploreOpen(false)
        setProfileOpen(false)
      }
    }
    if (exploreOpen || profileOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [exploreOpen, profileOpen])

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
          <Link to="/" className="flex items-center space-x-2 shrink-0" aria-label="bountyhub home">
            <img src={logoUrl} alt="" className="w-8 h-8 object-contain" aria-hidden />
            <span className="text-xl font-bold bg-linear-to-r from-cyan-400 to-violet-400 dark:from-cyan-400 dark:to-violet-400 bg-clip-text text-transparent hidden sm:block">
              bountyhub
            </span>
          </Link>

          {/* Desktop Navigation - Center: Create Bounty + single Explore dropdown */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center max-w-xl">
            {user && (
              <Link
                to="/posts/create"
                className="px-3 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white flex items-center gap-2"
              >
                <FiAward className="w-4 h-4 shrink-0" />
                <span>Create Bounty</span>
              </Link>
            )}
            {/* Explore: Community, Download, Governance, Open Source */}
            <div className="relative nav-dropdown">
              <button
                type="button"
                onClick={() => setExploreOpen(!exploreOpen)}
                className={`nav-dropdown-trigger px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  isActive('/community') || isActive('/chat') || isActive('/download') || isActive('/governance') || isActive('/refund-requests') || isActive('/analytics') || isActive('/bug-bounty') || isActive('/repositories') || isActive('/contributions')
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5'
                }`}
                aria-expanded={exploreOpen}
                aria-haspopup="true"
              >
                <FiUsers className="w-4 h-4 shrink-0" />
                <span>Explore</span>
                <FiChevronDown className={`w-3.5 h-3.5 transition-transform shrink-0 ${exploreOpen ? 'rotate-180' : ''}`} />
              </button>
              {exploreOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 w-56 bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 py-1.5 z-50">
                  <Link
                    to="/community"
                    onClick={() => setExploreOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
                  >
                    <FiUsers className="w-4 h-4 shrink-0 text-neutral-500" />
                    <span>Community</span>
                  </Link>
                  <Link
                    to="/chat"
                    onClick={() => setExploreOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
                  >
                    <FiMessageCircle className="w-4 h-4 shrink-0 text-neutral-500" />
                    <span>Team Hub</span>
                  </Link>
                  <Link
                    to="/download"
                    onClick={() => setExploreOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
                  >
                    <FiDownload className="w-4 h-4 shrink-0 text-neutral-500" />
                    <span>Download</span>
                  </Link>
                  <div className="my-1 border-t border-neutral-200 dark:border-neutral-600" />
                  <Link
                    to="/governance"
                    onClick={() => setExploreOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
                  >
                    <FiCheckSquare className="w-4 h-4 shrink-0 text-neutral-500" />
                    <span>Governance</span>
                  </Link>
                  <Link
                    to="/refund-requests"
                    onClick={() => setExploreOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
                  >
                    <FiRefreshCw className="w-4 h-4 shrink-0 text-neutral-500" />
                    <span>Refund Requests</span>
                  </Link>
                  <Link
                    to="/analytics"
                    onClick={() => setExploreOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
                  >
                    <FiBarChart2 className="w-4 h-4 shrink-0 text-neutral-500" />
                    <span>Analytics</span>
                  </Link>
                  <div className="my-1 border-t border-neutral-200 dark:border-neutral-600" />
                  <Link
                    to="/bug-bounty/campaigns"
                    onClick={() => setExploreOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
                  >
                    <FiShield className="w-4 h-4 shrink-0 text-neutral-500" />
                    <span>Bug Bounty</span>
                  </Link>
                  <Link
                    to="/repositories"
                    onClick={() => setExploreOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
                  >
                    <FiGithub className="w-4 h-4 shrink-0 text-neutral-500" />
                    <span>Repositories</span>
                  </Link>
                  <Link
                    to="/contributions"
                    onClick={() => setExploreOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
                  >
                    <FiAward className="w-4 h-4 shrink-0 text-neutral-500" />
                    <span>Contributions</span>
                  </Link>
                </div>
              )}
            </div>

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  isActive('/admin')
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5'
                }`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Admin</span>
              </Link>
            )}
          </div>

          {/* Right: Wallet, Notifications, Profile dropdown, Theme */}
          <div className="hidden md:flex items-center gap-1 shrink-0">
            <WalletButton />
            <div className="relative">
              <button
                type="button"
                data-notifications-button-topnav
                onClick={() => notificationsRef.current?.toggle()}
                className="p-2 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors relative"
                aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notifications'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {user && unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-semibold rounded-full h-4 min-w-4 flex items-center justify-center px-1">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <Notifications ref={notificationsRef} onUnreadCountChange={handleNotificationsUpdate} />
            </div>

            {/* Profile dropdown: Profile, Settings, Wallet, Logout */}
            {user && (
              <div className="relative nav-dropdown">
                <button
                  type="button"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className={`nav-dropdown-trigger flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/profile') || isActive('/settings') || isActive('/wallet')
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5'
                  }`}
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                  aria-label="Account menu"
                >
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover border border-neutral-200 dark:border-neutral-600"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
                      <span className="text-white text-sm font-bold">{user.username.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <span className="max-w-28 truncate hidden lg:inline">{user.username}</span>
                  <FiChevronDown className={`w-4 h-4 shrink-0 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>
                {profileOpen && (
                  <div className="absolute top-full right-0 mt-1.5 w-56 bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 py-1.5 z-50">
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
                    >
                      {user.profilePicture ? (
                        <img src={user.profilePicture} alt="" className="w-6 h-6 rounded-full object-cover" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{user.username.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
                    >
                      <FiSettings className="w-4 h-4 shrink-0 text-neutral-500" />
                      <span>Settings</span>
                    </Link>
                    <Link
                      to="/wallet"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
                    >
                      <FiDollarSign className="w-4 h-4 shrink-0 text-neutral-500" />
                      <span>Wallet</span>
                    </Link>
                    <div className="my-1 border-t border-neutral-200 dark:border-neutral-600" />
                    <button
                      type="button"
                      onClick={() => { handleLogout(); setProfileOpen(false) }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <FiLogOut className="w-4 h-4 shrink-0" />
                      <span>Log out</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="pl-1">
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-controls="mobile-nav-menu"
          >
            {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div id="mobile-nav-menu" className="md:hidden py-4 border-t border-neutral-200 dark:border-neutral-700" role="navigation" aria-label="Mobile navigation">
            {/* Quick actions: Wallet + Notifications */}
            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-neutral-200 dark:border-neutral-600">
              <WalletButton />
              <button
                type="button"
                onClick={() => {
                  notificationsRef.current?.toggle()
                }}
                className="p-2 rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 relative"
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {user && unreadCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center min-w-4">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>
            <div className="space-y-0.5">
              {user && (
                <Link
                  to="/posts/create"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-base font-medium bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Create Bounty
                </Link>
              )}
              <div>
                <button
                  type="button"
                  onClick={() => setExploreOpen(!exploreOpen)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5"
                >
                  <span>Explore</span>
                  <FiChevronDown className={`w-4 h-4 transition-transform ${exploreOpen ? 'rotate-180' : ''}`} />
                </button>
                {exploreOpen && (
                  <div className="pl-4 mt-0.5 space-y-0.5">
                    <Link
                      to="/community"
                      onClick={() => { setMobileMenuOpen(false); setExploreOpen(false) }}
                      className="block px-3 py-2 rounded-lg text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5"
                    >
                      Community
                    </Link>
                    <Link
                      to="/chat"
                      onClick={() => { setMobileMenuOpen(false); setExploreOpen(false) }}
                      className="block px-3 py-2 rounded-lg text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5"
                    >
                      Team Hub
                    </Link>
                    <Link
                      to="/download"
                      onClick={() => { setMobileMenuOpen(false); setExploreOpen(false) }}
                      className="block px-3 py-2 rounded-lg text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5"
                    >
                      Download
                    </Link>
                    <Link
                      to="/governance"
                      onClick={() => { setMobileMenuOpen(false); setExploreOpen(false) }}
                      className="block px-3 py-2 rounded-lg text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5"
                    >
                      Governance
                    </Link>
                    <Link
                      to="/refund-requests"
                      onClick={() => { setMobileMenuOpen(false); setExploreOpen(false) }}
                      className="block px-3 py-2 rounded-lg text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5"
                    >
                      Refund Requests
                    </Link>
                    <Link
                      to="/analytics"
                      onClick={() => { setMobileMenuOpen(false); setExploreOpen(false) }}
                      className="block px-3 py-2 rounded-lg text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5"
                    >
                      Analytics
                    </Link>
                    <Link
                      to="/bug-bounty/campaigns"
                      onClick={() => { setMobileMenuOpen(false); setExploreOpen(false) }}
                      className="block px-3 py-2 rounded-lg text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5"
                    >
                      Bug Bounty
                    </Link>
                    <Link
                      to="/repositories"
                      onClick={() => { setMobileMenuOpen(false); setExploreOpen(false) }}
                      className="block px-3 py-2 rounded-lg text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5"
                    >
                      Repositories
                    </Link>
                    <Link
                      to="/contributions"
                      onClick={() => { setMobileMenuOpen(false); setExploreOpen(false) }}
                      className="block px-3 py-2 rounded-lg text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5"
                    >
                      Contributions
                    </Link>
                  </div>
                )}
              </div>
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Admin
                </Link>
              )}

              {/* Account: Profile, Settings, Wallet */}
              {user && (
                <div>
                  <button
                    type="button"
                    onClick={() => setMobileAccountOpen(!mobileAccountOpen)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5"
                  >
                    <span className="flex items-center gap-2">
                      {user.profilePicture ? (
                        <img src={user.profilePicture} alt="" className="w-6 h-6 rounded-full object-cover" />
                      ) : (
                        <span className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                      Account
                    </span>
                    <FiChevronDown className={`w-4 h-4 transition-transform ${mobileAccountOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileAccountOpen && (
                    <div className="pl-4 mt-0.5 space-y-0.5">
                      <Link
                        to="/profile"
                        onClick={() => { setMobileMenuOpen(false); setMobileAccountOpen(false) }}
                        className="block px-3 py-2 rounded-lg text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5"
                      >
                        Profile
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => { setMobileMenuOpen(false); setMobileAccountOpen(false) }}
                        className="block px-3 py-2 rounded-lg text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5"
                      >
                        Settings
                      </Link>
                      <Link
                        to="/wallet"
                        onClick={() => { setMobileMenuOpen(false); setMobileAccountOpen(false) }}
                        className="block px-3 py-2 rounded-lg text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5"
                      >
                        Wallet
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between px-3 py-2.5 border-t border-neutral-200 dark:border-neutral-600 mt-2 pt-2">
                <span className="text-sm text-neutral-500 dark:text-neutral-400">Theme</span>
                <ThemeToggle />
              </div>
              {user && (
                <button
                  type="button"
                  onClick={() => { handleLogout(); setMobileMenuOpen(false) }}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Log out
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}


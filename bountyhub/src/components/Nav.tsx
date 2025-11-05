import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiCreditCard, FiLogOut, FiUsers, FiDollarSign, FiSettings, FiCheckSquare, FiRefreshCw, FiBarChart2, FiShield, FiGithub, FiAward, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthProvider'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { Notifications } from './Notifications'
import { ThemeToggle } from './ThemeToggle'
import type { NotificationsRef } from './Notifications'
import logo from '/logo.svg'


function WalletButton({ expanded }: { expanded: boolean }) {
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
    if (expanded) {
      // Show more characters when expanded but still truncate to prevent overflow
      return `${address.slice(0, 8)}...${address.slice(-8)}`
    }
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  if (connected) {
    return (
      <div className="group/wallet relative w-full">
        <button
          onClick={handleWalletClick}
          className={`py-2 px-3 bg-green-600/20 border border-green-500/30 rounded-lg text-green-400 text-xs font-medium transition-all duration-300 hover:bg-green-600/30 hover:border-green-500/50 flex items-center justify-center gap-2 ${expanded ? 'w-full' : 'w-full'}`}
        >
          <FiCreditCard className="w-4 h-4" />
          {expanded && (
            <span className="truncate max-w-32">
              {wallet?.adapter?.publicKey ? formatAddress(wallet.adapter.publicKey.toString()) : 'Connected'}
            </span>
          )}
        </button>
        <button
          onClick={() => disconnect()}
          className="absolute inset-0 w-full py-2 px-3 bg-red-600/80 border border-red-500/80 rounded-lg text-red-400 text-xs font-medium transition-all duration-300 opacity-0 group-hover/wallet:opacity-100 flex items-center justify-center gap-2"
        >
          <FiLogOut className="w-4 h-4" />
          {expanded && <span>Disconnect</span>}
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleWalletClick}
      className={`py-2 px-3 bg-violet-600/20 border border-violet-500/30 rounded-lg text-violet-400 text-xs font-medium transition-all duration-300 hover:bg-violet-600/30 hover:border-violet-500/50 flex items-center justify-center gap-2 ${expanded ? 'w-full' : 'w-full'}`}
    >
      <FiCreditCard className="w-4 h-4" />
      {expanded && <span>Connect Wallet</span>}
    </button>
  )
}

export function Nav() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)
  const [openSourceOpen, setOpenSourceOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const notificationsRef = useRef<NotificationsRef>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetch unread count from Notifications component
  const handleNotificationsUpdate = (count: number) => {
    setUnreadCount(count)
  }

  // Detect expansion by mouse hover
  useEffect(() => {
    const nav = document.querySelector('.nav-container')
    if (!nav) return
    const handleMouseEnter = () => setExpanded(true)
    const handleMouseLeave = () => setExpanded(false)
    nav.addEventListener('mouseenter', handleMouseEnter)
    nav.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      nav.removeEventListener('mouseenter', handleMouseEnter)
      nav.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])


  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className='group fixed left-0 top-0 h-screen w-20 bg-white/70 dark:bg-neutral-800/70 backdrop-blur-sm border-r border-neutral-200/50 dark:border-neutral-700/50 flex flex-col items-center transition-all duration-300 ease-in-out hover:w-64 overflow-y-hidden z-[9999] nav-container hidden md:flex'>

      <div className="relative z-10 flex flex-col items-center w-full py-5 cursor-pointer" onClick={() => navigate('/')}>
        <div className="relative w-12 h-12 flex items-center justify-center">
          <img src={logo} alt="bountyhub logo" className="w-10 h-10 object-contain" />
        </div>
        <h1 className="text-gray-600 dark:text-gray-300 text-xs font-bold tracking-wider font-cursive transition-all duration-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 group-hover:text-lg mt-2">
          bountyhub
        </h1>
      </div>
      <hr className='border-b border-gray-300 dark:border-gray-500 w-4/6 relative z-10'/>

      <div className="relative z-10 flex flex-col items-center w-full flex-1 justify-center">
        {user && (
          <Link to="/profile" className="w-full py-3 flex justify-center items-center transition-all duration-300 group/item hover:bg-neutral-100 dark:hover:bg-white/5">
            <div className="relative flex items-center justify-center gap-4 px-4 py-1 w-full">
              {user.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt={`${user.username}'s profile`}
                  className="w-6 h-6 rounded-full object-cover border border-indigo-500/30"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{user.username.charAt(0).toUpperCase()}</span>
                </div>
              )}
              {expanded && <span className="text-gray-600 dark:text-gray-300 text-sm font-medium transition-all duration-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 whitespace-nowrap overflow-hidden max-w-xs">Profile</span>}
            </div>
          </Link>
        )}
        {user && <hr className='border-b border-gray-300 dark:border-gray-500 w-4/6 relative z-10'/>}

        <Link to="/community" className="w-full py-3 flex justify-center items-center transition-all duration-300 group/item hover:bg-neutral-100 dark:hover:bg-white/5">
          <div className="relative flex items-center justify-center gap-4 px-4 py-1 w-full">
            <FiUsers className="h-6 w-6 text-gray-600 dark:text-gray-300 transition-all duration-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 group-hover:scale-110" />
            {expanded && <span className="text-gray-600 dark:text-gray-300 text-sm font-medium transition-all duration-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 whitespace-nowrap overflow-hidden max-w-xs">Community</span>}
          </div>
        </Link>
        <hr className='border-b border-gray-300 dark:border-gray-500 w-4/6 relative z-10'/>

        <Link to="/governance" className="w-full py-3 flex justify-center items-center transition-all duration-300 group/item hover:bg-neutral-100 dark:hover:bg-white/5">
          <div className="relative flex items-center justify-center gap-4 px-4 py-1 w-full">
            <FiCheckSquare className="h-6 w-6 text-gray-600 dark:text-gray-300 transition-all duration-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 group-hover:scale-110" />
            {expanded && <span className="text-gray-600 dark:text-gray-300 text-sm font-medium transition-all duration-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 whitespace-nowrap overflow-hidden max-w-xs">Governance</span>}
          </div>
        </Link>
        <hr className='border-b border-gray-300 dark:border-gray-500 w-4/6 relative z-10'/>

        {/* Open Source Dropdown */}
        <div className="w-full relative group/dropdown">
          <button
            onClick={() => setOpenSourceOpen(!openSourceOpen)}
            className="w-full py-3 flex justify-center items-center transition-all duration-300 group/item hover:bg-neutral-100 dark:hover:bg-white/5"
          >
            <div className="relative flex items-center justify-center gap-4 px-4 py-1 w-full">
              <FiGithub className="h-6 w-6 text-gray-600 dark:text-gray-300 transition-all duration-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 group-hover:scale-110" />
              {expanded && (
                <>
                  <span className="text-gray-600 dark:text-gray-300 text-sm font-medium transition-all duration-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 whitespace-nowrap overflow-hidden max-w-xs">Open Source</span>
                  {openSourceOpen ? (
                    <FiChevronUp className="h-4 w-4 text-gray-600 dark:text-gray-300 ml-auto" />
                  ) : (
                    <FiChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-300 ml-auto" />
                  )}
                </>
              )}
            </div>
          </button>
          {expanded && openSourceOpen && (
            <div className="w-full bg-white dark:bg-neutral-800/90 border border-neutral-200 dark:border-neutral-700 rounded-lg mt-1 mb-2 overflow-hidden">
              <Link to="/bug-bounty/campaigns" className="w-full py-2 px-4 flex items-center gap-3 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors">
                <FiShield className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                <span className="text-gray-600 dark:text-gray-300 text-sm">Bug Bounty</span>
              </Link>
              <Link to="/repositories" className="w-full py-2 px-4 flex items-center gap-3 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors">
                <FiGithub className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                <span className="text-gray-600 dark:text-gray-300 text-sm">Repositories</span>
              </Link>
              <Link to="/contributions" className="w-full py-2 px-4 flex items-center gap-3 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors">
                <FiAward className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                <span className="text-gray-600 dark:text-gray-300 text-sm">Contributions</span>
              </Link>
            </div>
          )}
        </div>
        <hr className='border-b border-gray-300 dark:border-gray-500 w-4/6 relative z-10'/>

        {/* Tools Dropdown */}
        <div className="w-full relative group/dropdown">
          <button
            onClick={() => setToolsOpen(!toolsOpen)}
            className="w-full py-3 flex justify-center items-center transition-all duration-300 group/item hover:bg-neutral-100 dark:hover:bg-white/5"
          >
            <div className="relative flex items-center justify-center gap-4 px-4 py-1 w-full">
              <FiBarChart2 className="h-6 w-6 text-gray-600 dark:text-gray-300 transition-all duration-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 group-hover:scale-110" />
              {expanded && (
                <>
                  <span className="text-gray-600 dark:text-gray-300 text-sm font-medium transition-all duration-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 whitespace-nowrap overflow-hidden max-w-xs">Tools</span>
                  {toolsOpen ? (
                    <FiChevronUp className="h-4 w-4 text-gray-600 dark:text-gray-300 ml-auto" />
                  ) : (
                    <FiChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-300 ml-auto" />
                  )}
                </>
              )}
            </div>
          </button>
          {expanded && toolsOpen && (
            <div className="w-full bg-white dark:bg-neutral-800/90 border border-neutral-200 dark:border-neutral-700 rounded-lg mt-1 mb-2 overflow-hidden">
              <Link to="/analytics" className="w-full py-2 px-4 flex items-center gap-3 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors">
                <FiBarChart2 className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                <span className="text-gray-600 dark:text-gray-300 text-sm">Analytics</span>
              </Link>
              <Link to="/refund-requests" className="w-full py-2 px-4 flex items-center gap-3 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors">
                <FiRefreshCw className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                <span className="text-gray-600 dark:text-gray-300 text-sm">Refund Requests</span>
              </Link>
            </div>
          )}
        </div>
        <hr className='border-b border-gray-300 dark:border-gray-500 w-4/6 relative z-10'/>

        {/* Admin Panel - Only show for admin users */}
        {user?.role === 'admin' && (
          <>
            <Link to="/admin" className="w-full py-3 flex justify-center items-center transition-all duration-300 group/item hover:bg-neutral-100 dark:hover:bg-white/5">
              <div className="relative flex items-center justify-center gap-4 px-4 py-1 w-full">
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-300 transition-all duration-300 group-hover:text-red-600 dark:group-hover:text-red-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                {expanded && <span className="text-gray-600 dark:text-gray-300 text-sm font-medium transition-all duration-300 group-hover:text-red-600 dark:group-hover:text-red-300 whitespace-nowrap overflow-hidden max-w-xs">Admin Panel</span>}
              </div>
            </Link>
            <hr className='border-b border-gray-300 dark:border-gray-500 w-4/6 relative z-10'/>
          </>
        )}

        {/* Wallet Nav Item */}
        <Link to="/wallet" className="w-full py-3 flex justify-center items-center transition-all duration-300 group/item hover:bg-neutral-100 dark:hover:bg-white/5">
          <div className="relative flex items-center justify-center gap-4 px-4 py-1 w-full">
            <FiDollarSign className="h-6 w-6 text-gray-600 dark:text-gray-300 transition-all duration-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 group-hover:scale-110" />
            {expanded && <span className="text-gray-600 dark:text-gray-300 text-sm font-medium transition-all duration-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 whitespace-nowrap overflow-hidden max-w-xs">Wallet</span>}
          </div>
        </Link>
        <hr className='border-b border-gray-300 dark:border-gray-500 w-4/6 relative z-10'/>

        {/* Notifications */}
        <div
          data-notifications-button
          className="w-full py-3 flex justify-center items-center transition-all duration-300 group/item hover:bg-neutral-100 dark:hover:bg-white/5 cursor-pointer relative"
          onClick={() => notificationsRef.current?.toggle()}
        >
          <div className="relative flex items-center justify-center gap-4 px-4 py-1 w-full">
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-300 transition-all duration-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {expanded && <span className="text-gray-600 dark:text-gray-300 text-sm font-medium transition-all duration-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 whitespace-nowrap overflow-hidden max-w-xs">Notifications</span>}
            {/* Notification badge on parent div */}
            {user && unreadCount > 0 && (
              <span className={`absolute bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center z-20 ${
                expanded 
                  ? 'top-1 right-6' 
                  : 'top-0 right-5 -translate-y-1/2'
              }`}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          {/* Notifications popup (hidden by default) */}
          <Notifications ref={notificationsRef} onUnreadCountChange={handleNotificationsUpdate} />
        </div>
        <hr className='border-b border-gray-500 w-4/6 relative z-10'/>

        <Link to="/settings" className="w-full py-3 flex justify-center items-center transition-all duration-300 group/item hover:bg-white/5 dark:hover:bg-white/5">
          <div className="relative flex items-center justify-center gap-4 px-4 py-1 w-full">
            <FiSettings className="h-6 w-6 text-gray-600 dark:text-gray-300 transition-all duration-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 group-hover:scale-110" />
            {expanded && <span className="text-gray-600 dark:text-gray-300 text-sm font-medium transition-all duration-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 whitespace-nowrap overflow-hidden max-w-xs">Settings</span>}
          </div>
        </Link>
        <hr className='border-b border-gray-300 dark:border-gray-500 w-4/6 relative z-10'/>
        
        {/* Theme Toggle */}
        <div className="w-full py-3 flex justify-center items-center">
          <ThemeToggle />
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center w-full pb-5 gap-3">
        {/* Separator above wallet connector nav item */}
        <hr className='border-b border-gray-300 dark:border-gray-500 w-4/6 relative z-10'/>
        <div className="w-full flex justify-center items-center">
          <WalletButton expanded={expanded} />
        </div>
        {user && (
          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 bg-red-600/20 border border-red-500/30 rounded-lg text-red-400 text-xs font-medium transition-all duration-300 hover:bg-red-600/30 hover:border-red-500/50 flex items-center justify-center gap-2"
          >
            <FiLogOut className="w-4 h-4" />
            {expanded && <span className="hidden group-hover:block">Logout</span>}
          </button>
        )}
      </div>
    </div>
  )
} 
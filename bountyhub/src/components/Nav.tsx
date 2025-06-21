import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { FiCreditCard, FiLogOut, FiHome, FiUsers, FiDollarSign, FiSettings, FiPlus, FiBell } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthProvider'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { Notifications } from './Notifications'

interface BubbleConfig {
  size: number
  opacity: number
  duration: number
  className: string
}

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
      <div className="group/wallet relative">
        <button
          onClick={handleWalletClick}
          className="w-full py-2 px-3 bg-green-600/20 border border-green-500/30 rounded-lg text-green-400 text-xs font-medium transition-all duration-300 hover:bg-green-600/30 hover:border-green-500/50 flex items-center justify-center gap-2"
        >
          <FiCreditCard className="w-4 h-4" />
          <span className="hidden group-hover:block">
            {wallet?.adapter?.publicKey ? formatAddress(wallet.adapter.publicKey.toString()) : 'Connected'}
          </span>
        </button>
        <button
          onClick={() => disconnect()}
          className="absolute inset-0 w-full py-2 px-3 bg-red-600/80 border border-red-500/80 rounded-lg text-red-400 text-xs font-medium transition-all duration-300 opacity-0 group-hover/wallet:opacity-100 flex items-center justify-center gap-2"
        >
          <FiLogOut className="w-4 h-4" />
          <span className="hidden group-hover/wallet:block">Disconnect</span>
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleWalletClick}
      className="w-full py-2 px-3 bg-violet-600/20 border border-violet-500/30 rounded-lg text-violet-400 text-xs font-medium transition-all duration-300 hover:bg-violet-600/30 hover:border-violet-500/50 flex items-center justify-center gap-2"
    >
      <FiCreditCard className="w-4 h-4" />
      <span className="hidden group-hover:block">Connect Wallet</span>
    </button>
  )
}

export function Nav() {
  const [mounted, setMounted] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const bubbleConfigs: BubbleConfig[] = [
      { size: 4, opacity: 0.6, duration: 3.5, className: 'bubble' },
      { size: 3, opacity: 0.6, duration: 4, className: 'bubble-1' },
      { size: 2, opacity: 0.6, duration: 4.5, className: 'bubble-2' }
    ]

    const nav = document.querySelector('.nav-container')
    if (!nav) return

    const navHeight = nav.clientHeight

    // Create and append bubbles
    const container = document.querySelector('.bubble-container')
    if (!container) return

    // Clear existing bubbles
    container.innerHTML = ''

    // Function to create a single bubble
    const createBubble = (config: BubbleConfig, index: number) => {
      const bubble = document.createElement('div')
      bubble.className = `${config.className}-${index} absolute rounded-full bg-indigo-500/60 shadow-[0_0_8px_rgba(99,102,241,0.6),0_0_15px_rgba(99,102,241,0.4)]`
      bubble.style.width = `${config.size}px`
      bubble.style.height = `${config.size}px`
      bubble.style.opacity = config.opacity.toString()
      bubble.style.left = `${Math.random() * 100}%`
      bubble.style.top = '0%'

      container.appendChild(bubble)

      // Animate bubble
      gsap.to(bubble, {
        y: navHeight,
        duration: config.duration + (Math.random() * 2),
        ease: 'none',
        onUpdate: function() {
          // Add pulsing glow effect
          const progress = this.progress()
          const glowIntensity = 0.4 + Math.sin(progress * Math.PI * 2) * 0.3
          bubble.style.boxShadow = `0 0 ${8 + glowIntensity * 8}px rgba(99,102,241,${0.4 + glowIntensity * 0.3}), 0 0 ${15 + glowIntensity * 15}px rgba(99,102,241,${0.3 + glowIntensity * 0.2})`
        },
        onComplete: function() {
          // Remove the bubble when it reaches the bottom
          bubble.remove()
          // Create a new bubble at the top
          createBubble(config, index)
        }
      })
    }

    // Create initial set of bubbles
    bubbleConfigs.forEach((config) => {
      for (let i = 0; i < 15; i++) {
        createBubble(config, i)
      }
    })

    // Cleanup
    return () => {
      gsap.killTweensOf('.bubble, .bubble-1, .bubble-2')
    }
  }, [mounted])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className='group fixed left-0 top-0 h-screen w-20 bg-neutral-800 flex flex-col items-center transition-all duration-300 ease-in-out hover:w-64 overflow-hidden z-[9999] nav-container'>
      {/* Bubble Animation Container */}
      <div className="absolute inset-0 overflow-hidden bubble-container pointer-events-none">
        {/* Bubbles will be added here by JavaScript */}
      </div>

      <div className="relative z-10 flex flex-col items-center w-full py-5">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-300 transition-all duration-500 group-hover:text-indigo-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <h1 className="text-gray-300 text-xs font-bold tracking-wider font-cursive transition-all duration-500 group-hover:text-indigo-300 group-hover:text-lg mt-2">portal.ask</h1>
      </div>
      <hr className='border-b border-gray-500 w-4/6 relative z-10'/>

      <div className="relative z-10 flex flex-col items-center w-full flex-1 justify-center">
        <Link to="/" className="w-full py-3 flex justify-center items-center transition-all duration-300 group/item hover:bg-white/5">
          <div className="relative flex items-center justify-center gap-4 px-4 py-1 w-full">
            <FiHome className="h-6 w-6 text-gray-300 transition-all duration-300 group-hover:text-indigo-300 group-hover:scale-110" />
            <span className="text-gray-300 text-sm font-medium transition-all duration-300 group-hover:text-indigo-300 opacity-0 group-hover:opacity-100 whitespace-nowrap overflow-hidden max-w-0 group-hover:max-w-xs">Home</span>
          </div>
        </Link>

        {user && (
          <Link to="/profile" className="w-full py-3 flex justify-center items-center transition-all duration-300 group/item hover:bg-white/5">
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
              <span className="text-gray-300 text-sm font-medium transition-all duration-300 group-hover:text-indigo-300 opacity-0 group-hover:opacity-100 whitespace-nowrap overflow-hidden max-w-0 group-hover:max-w-xs">Profile</span>
            </div>
          </Link>
        )}

        <Link to="/community" className="w-full py-3 flex justify-center items-center transition-all duration-300 group/item hover:bg-white/5">
          <div className="relative flex items-center justify-center gap-4 px-4 py-1 w-full">
            <FiUsers className="h-6 w-6 text-gray-300 transition-all duration-300 group-hover:text-indigo-300 group-hover:scale-110" />
            <span className="text-gray-300 text-sm font-medium transition-all duration-300 group-hover:text-indigo-300 opacity-0 group-hover:opacity-100 whitespace-nowrap overflow-hidden max-w-0 group-hover:max-w-xs">Community</span>
          </div>
        </Link>

        <Link to="/wallet" className="w-full py-3 flex justify-center items-center transition-all duration-300 group/item hover:bg-white/5">
          <div className="relative flex items-center justify-center gap-4 px-4 py-1 w-full">
            <FiDollarSign className="h-6 w-6 text-gray-300 transition-all duration-300 group-hover:text-indigo-300 group-hover:scale-110" />
            <span className="text-gray-300 text-sm font-medium transition-all duration-300 group-hover:text-indigo-300 opacity-0 group-hover:opacity-100 whitespace-nowrap overflow-hidden max-w-0 group-hover:max-w-xs">Wallet</span>
          </div>
        </Link>

        <Link to="/posts/create" className="w-full py-3 flex justify-center items-center transition-all duration-300 group/item hover:bg-white/5">
          <div className="relative flex items-center justify-center gap-4 px-4 py-1 w-full">
            <FiPlus className="h-6 w-6 text-gray-300 transition-all duration-300 group-hover:text-indigo-300 group-hover:scale-110" />
            <span className="text-gray-300 text-sm font-medium transition-all duration-300 group-hover:text-indigo-300 opacity-0 group-hover:opacity-100 whitespace-nowrap overflow-hidden max-w-0 group-hover:max-w-xs">Create Post</span>
          </div>
        </Link>

        {/* Notifications */}
        <div className="w-full py-3 flex justify-center items-center transition-all duration-300 group/item hover:bg-white/5">
          <div className="relative flex items-center justify-center gap-4 px-4 py-1 w-full">
            <div className="relative">
              <FiBell className="h-6 w-6 text-gray-300 transition-all duration-300 group-hover:text-indigo-300 group-hover:scale-110" />
              <Notifications />
            </div>
            <span className="text-gray-300 text-sm font-medium transition-all duration-300 group-hover:text-indigo-300 opacity-0 group-hover:opacity-100 whitespace-nowrap overflow-hidden max-w-0 group-hover:max-w-xs">Notifications</span>
          </div>
        </div>

        <Link to="/settings" className="w-full py-3 flex justify-center items-center transition-all duration-300 group/item hover:bg-white/5">
          <div className="relative flex items-center justify-center gap-4 px-4 py-1 w-full">
            <FiSettings className="h-6 w-6 text-gray-300 transition-all duration-300 group-hover:text-indigo-300 group-hover:scale-110" />
            <span className="text-gray-300 text-sm font-medium transition-all duration-300 group-hover:text-indigo-300 opacity-0 group-hover:opacity-100 whitespace-nowrap overflow-hidden max-w-0 group-hover:max-w-xs">Settings</span>
          </div>
        </Link>
      </div>

      <div className="relative z-10 flex flex-col items-center w-full pb-5 gap-3">
        <WalletButton />
        
        {user && (
          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 bg-red-600/20 border border-red-500/30 rounded-lg text-red-400 text-xs font-medium transition-all duration-300 hover:bg-red-600/30 hover:border-red-500/50 flex items-center justify-center gap-2"
          >
            <FiLogOut className="w-4 h-4" />
            <span className="hidden group-hover:block">Logout</span>
          </button>
        )}
      </div>
    </div>
  )
} 
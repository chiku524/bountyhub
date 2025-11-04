import { Link, useLocation } from 'react-router-dom'
import { FiUsers, FiCheckSquare, FiDollarSign, FiUser, FiBarChart2 } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthProvider'

export function MobileNav() {
  const location = useLocation()
  const { user } = useAuth()
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/')

  if (!user) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm border-t border-neutral-200/50 dark:border-neutral-700/50 md:hidden">
      <div className="flex items-center justify-around h-16 px-2 overflow-x-auto">
        <Link
          to="/community"
          className={`flex flex-col items-center justify-center flex-1 min-w-[60px] h-full transition-colors ${
            isActive('/community') 
              ? 'text-indigo-600 dark:text-indigo-400' 
              : 'text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
          }`}
        >
          <FiUsers className="w-5 h-5" />
          <span className="text-xs mt-0.5">Community</span>
        </Link>

        <Link
          to="/governance"
          className={`flex flex-col items-center justify-center flex-1 min-w-[60px] h-full transition-colors ${
            isActive('/governance') 
              ? 'text-indigo-600 dark:text-indigo-400' 
              : 'text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
          }`}
        >
          <FiCheckSquare className="w-5 h-5" />
          <span className="text-xs mt-0.5">Governance</span>
        </Link>

        <Link
          to="/analytics"
          className={`flex flex-col items-center justify-center flex-1 min-w-[60px] h-full transition-colors ${
            isActive('/analytics') 
              ? 'text-indigo-600 dark:text-indigo-400' 
              : 'text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
          }`}
        >
          <FiBarChart2 className="w-5 h-5" />
          <span className="text-xs mt-0.5">Analytics</span>
        </Link>

        <Link
          to="/wallet"
          className={`flex flex-col items-center justify-center flex-1 min-w-[60px] h-full transition-colors ${
            isActive('/wallet') 
              ? 'text-indigo-600 dark:text-indigo-400' 
              : 'text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
          }`}
        >
          <FiDollarSign className="w-5 h-5" />
          <span className="text-xs mt-0.5">Wallet</span>
        </Link>

        <Link
          to="/profile"
          className={`flex flex-col items-center justify-center flex-1 min-w-[60px] h-full transition-colors ${
            isActive('/profile') 
              ? 'text-indigo-600 dark:text-indigo-400' 
              : 'text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
          }`}
        >
          <FiUser className="w-5 h-5" />
          <span className="text-xs mt-0.5">Profile</span>
        </Link>
      </div>
    </nav>
  )
}


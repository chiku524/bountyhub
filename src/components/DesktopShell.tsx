import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  FiAward,
  FiUsers,
  FiCreditCard,
  FiSettings,
  FiLogOut,
  FiShield,
  FiEdit3,
  FiUser,
  FiMessageCircle,
  FiCheckSquare,
  FiRefreshCw,
  FiBarChart2,
  FiGithub,
  FiFileText,
} from 'react-icons/fi'
import { useAuth } from '../contexts/AuthProvider'
import { isDesktopApp } from '../utils/desktop'
import { logoUrl } from '../utils/logoUrl'

const SIDEBAR_WIDTH = 240

function DesktopSidebar() {
  const { user, loading, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  function navLink(
    href: string,
    label: string,
    Icon: React.ComponentType<{ className?: string }>,
    active?: boolean
  ) {
    return (
      <Link
        to={href}
        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
          active ? 'bg-white/10 text-white' : 'text-neutral-400 hover:bg-white/5 hover:text-white'
        }`}
      >
        <Icon className="h-5 w-5 shrink-0" />
        <span>{label}</span>
      </Link>
    )
  }

  async function handleSignOut() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside
      className="fixed left-0 top-0 z-40 flex h-screen w-[240px] flex-col border-r border-white/5 bg-neutral-900/98 backdrop-blur-md"
      style={{ width: SIDEBAR_WIDTH }}
    >
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-white/5 px-4">
        <Link
          to="/community"
          className="flex items-center gap-2 font-semibold tracking-tight text-white transition hover:text-white"
        >
          <img src={logoUrl} alt="" className="h-8 w-8 shrink-0 object-contain" width={32} height={32} aria-hidden />
          <span>BountyHub</span>
        </Link>
        <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-neutral-400">
          App
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto scrollbar-hide px-3 py-4">
        <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
          Main
        </p>
        {navLink('/community', 'Community', FiUsers, location.pathname === '/community')}
        {navLink('/chat', 'Team Hub', FiMessageCircle, location.pathname === '/chat')}
        {navLink('/posts/create', 'Create post', FiEdit3, location.pathname === '/posts/create')}
        {navLink('/profile', 'Profile', FiUser, location.pathname.startsWith('/profile'))}
        {navLink('/wallet', 'Wallet', FiCreditCard, location.pathname === '/wallet')}
        <p className="mb-1 mt-4 px-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
          Explore
        </p>
        {navLink('/governance', 'Governance', FiCheckSquare, location.pathname === '/governance')}
        {navLink('/refund-requests', 'Refund requests', FiRefreshCw, location.pathname === '/refund-requests')}
        {navLink('/analytics', 'Analytics', FiBarChart2, location.pathname === '/analytics')}
        {navLink('/bug-bounty/campaigns', 'Bug bounty', FiShield, location.pathname.startsWith('/bug-bounty'))}
        {navLink('/repositories', 'Repositories', FiGithub, location.pathname.startsWith('/repositories'))}
        {navLink('/contributions', 'Contributions', FiAward, location.pathname === '/contributions')}
        {navLink('/docs', 'Docs', FiFileText, location.pathname.startsWith('/docs'))}
        {navLink('/transactions', 'Transactions', FiCreditCard, location.pathname === '/transactions')}
        <p className="mb-1 mt-4 px-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
          Settings
        </p>
        {navLink('/settings', 'Settings', FiSettings, location.pathname.startsWith('/settings'))}
        {!loading && user?.role === 'admin' && (
          <Link
            to="/admin"
            className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-amber-400/90 transition hover:bg-amber-500/10 hover:text-amber-300"
          >
            <FiShield className="h-5 w-5 shrink-0" />
            <span>Admin</span>
          </Link>
        )}
      </nav>
      <div className="shrink-0 border-t border-white/5 p-3">
        {!loading && user ? (
          <div className="space-y-2">
            <p className="truncate px-3 text-xs text-neutral-500" title={user.email ?? user.username}>
              {user.username || user.email}
            </p>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400/90 transition hover:bg-red-500/10 hover:text-red-300"
            >
              <FiLogOut className="h-5 w-5 shrink-0" aria-hidden />
              <span>Log out</span>
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-cyan-400 transition hover:bg-cyan-500/10"
          >
            <span>Sign in</span>
          </Link>
        )}
      </div>
    </aside>
  )
}

function DesktopShellInner({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-neutral-950">
      <DesktopSidebar />
      <main className="min-h-screen flex-1 overflow-auto scrollbar-hide" style={{ marginLeft: SIDEBAR_WIDTH }}>
        {children}
      </main>
    </div>
  )
}

export function DesktopShell({ children }: { children: React.ReactNode }) {
  if (!isDesktopApp()) return <>{children}</>
  return <DesktopShellInner>{children}</DesktopShellInner>
}

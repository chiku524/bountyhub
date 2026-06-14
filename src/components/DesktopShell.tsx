import { useEffect, useState } from 'react'
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
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi'
import { useAuth } from '../contexts/AuthProvider'
import { isDesktopApp } from '../utils/desktop'
import { logoUrl } from '../utils/logoUrl'
import { WalletMenuButton } from './WalletMenuButton'
import { useCommandPalette } from './CommandPalette'
import { useMediaQuery } from '../hooks/useMediaQuery'

const SIDEBAR_WIDTH_EXPANDED = 240
const SIDEBAR_WIDTH_COLLAPSED = 72
const NARROW_WINDOW_QUERY = '(max-width: 1024px)'

function DesktopSidebar({
  collapsed,
  onToggleCollapse,
}: {
  collapsed: boolean
  onToggleCollapse: () => void
}) {
  const { user, loading, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const { open: openCommandPalette } = useCommandPalette()

  function navLink(
    href: string,
    label: string,
    Icon: React.ComponentType<{ className?: string }>,
    active?: boolean
  ) {
    return (
      <Link
        to={href}
        title={collapsed ? label : undefined}
        aria-label={collapsed ? label : undefined}
        className={`flex items-center rounded-lg text-sm transition-colors ${
          collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'
        } ${
          active ? 'bg-white/10 text-white' : 'text-neutral-400 hover:bg-white/5 hover:text-white'
        }`}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {!collapsed && <span className="truncate">{label}</span>}
      </Link>
    )
  }

  async function handleSignOut() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside
      className="fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-white/5 bg-neutral-900/98 backdrop-blur-md transition-[width] duration-200"
      style={{ width: collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED }}
    >
      <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-white/5 px-2">
        <Link
          to="/community"
          title={collapsed ? 'BountyHub' : undefined}
          className={`flex min-w-0 flex-1 items-center font-semibold tracking-tight text-white transition hover:text-white ${
            collapsed ? 'justify-center gap-0' : 'gap-2'
          }`}
        >
          <img src={logoUrl} alt="" className="h-8 w-8 shrink-0 object-contain" width={32} height={32} aria-hidden />
          {!collapsed && <span className="truncate">BountyHub</span>}
        </Link>
        {!collapsed && (
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={openCommandPalette}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"
              aria-label="Open command palette"
              title="Go to… (⌘K)"
            >
              <FiSearch className="h-5 w-5" />
            </button>
            <WalletMenuButton />
          </div>
        )}
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto scrollbar-hide px-2 py-4">
        {!collapsed && (
          <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
            Main
          </p>
        )}
        {navLink('/community', 'Community', FiUsers, location.pathname === '/community')}
        {navLink('/chat', 'Team Hub', FiMessageCircle, location.pathname === '/chat')}
        {navLink('/posts/create', 'Create post', FiEdit3, location.pathname === '/posts/create')}
        {navLink('/profile', 'Profile', FiUser, location.pathname.startsWith('/profile'))}
        {navLink('/wallet', 'Wallet', FiCreditCard, location.pathname === '/wallet')}
        {!collapsed && (
          <p className="mb-1 mt-4 px-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
            Explore
          </p>
        )}
        {collapsed && <div className="my-2 border-t border-white/5" aria-hidden />}
        {navLink('/governance', 'Governance', FiCheckSquare, location.pathname === '/governance')}
        {navLink('/refund-requests', 'Refund requests', FiRefreshCw, location.pathname === '/refund-requests')}
        {navLink('/analytics', 'Analytics', FiBarChart2, location.pathname === '/analytics')}
        {navLink('/bug-bounty/campaigns', 'Bug bounty', FiShield, location.pathname.startsWith('/bug-bounty'))}
        {navLink('/repositories', 'Repositories', FiGithub, location.pathname.startsWith('/repositories'))}
        {navLink('/contributions', 'Contributions', FiAward, location.pathname === '/contributions')}
        {navLink('/docs', 'Docs', FiFileText, location.pathname.startsWith('/docs'))}
        {navLink('/transactions', 'Transactions', FiCreditCard, location.pathname === '/transactions')}
        {!collapsed && (
          <p className="mb-1 mt-4 px-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
            Settings
          </p>
        )}
        {collapsed && <div className="my-2 border-t border-white/5" aria-hidden />}
        {navLink('/settings', 'Settings', FiSettings, location.pathname.startsWith('/settings'))}
        {!loading && user?.role === 'admin' && (
          <Link
            to="/admin"
            title={collapsed ? 'Admin' : undefined}
            className={`mt-2 flex items-center rounded-lg text-sm text-amber-400/90 transition hover:bg-amber-500/10 hover:text-amber-300 ${
              collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'
            }`}
          >
            <FiShield className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Admin</span>}
          </Link>
        )}
      </nav>
      <div className="shrink-0 space-y-2 border-t border-white/5 p-2">
        {collapsed && (
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={openCommandPalette}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"
              aria-label="Open command palette"
              title="Go to… (⌘K)"
            >
              <FiSearch className="h-5 w-5" />
            </button>
            <WalletMenuButton />
          </div>
        )}
        {!loading && user ? (
          <div className="space-y-2">
            {!collapsed && (
              <p className="truncate px-3 text-xs text-neutral-500" title={user.email ?? user.username}>
                {user.username || user.email}
              </p>
            )}
            <button
              type="button"
              onClick={handleSignOut}
              title={collapsed ? 'Log out' : undefined}
              className={`flex w-full items-center rounded-lg text-sm text-red-400/90 transition hover:bg-red-500/10 hover:text-red-300 ${
                collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'
              }`}
            >
              <FiLogOut className="h-5 w-5 shrink-0" aria-hidden />
              {!collapsed && <span>Log out</span>}
            </button>
          </div>
        ) : (
          !collapsed && (
            <Link
              to="/login"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-cyan-400 transition hover:bg-cyan-500/10"
            >
              <span>Sign in</span>
            </Link>
          )
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex w-full items-center justify-center rounded-lg py-2 text-neutral-500 transition-colors hover:bg-white/5 hover:text-white"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <FiChevronRight className="h-5 w-5" /> : <FiChevronLeft className="h-5 w-5" />}
        </button>
      </div>
    </aside>
  )
}

function DesktopShellInner({ children }: { children: React.ReactNode }) {
  const isNarrowWindow = useMediaQuery(NARROW_WINDOW_QUERY)
  const [userCollapsed, setUserCollapsed] = useState<boolean | null>(null)
  const collapsed = userCollapsed ?? isNarrowWindow
  const sidebarWidth = collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED

  useEffect(() => {
    if (userCollapsed === null && !isNarrowWindow) {
      setUserCollapsed(false)
    }
  }, [isNarrowWindow, userCollapsed])

  function handleToggleCollapse() {
    setUserCollapsed((prev) => !(prev ?? isNarrowWindow))
  }

  return (
    <div className="flex min-h-screen min-w-0 bg-neutral-950">
      <DesktopSidebar collapsed={collapsed} onToggleCollapse={handleToggleCollapse} />
      <main
        className="flex min-h-0 flex-1 min-w-0 flex-col overflow-hidden scrollbar-hide transition-[margin-left] duration-200"
        style={{ marginLeft: sidebarWidth }}
      >
        {children}
      </main>
    </div>
  )
}

export function DesktopShell({ children }: { children: React.ReactNode }) {
  if (!isDesktopApp()) return <>{children}</>
  return <DesktopShellInner>{children}</DesktopShellInner>
}

export { SIDEBAR_WIDTH_EXPANDED, SIDEBAR_WIDTH_COLLAPSED }

import { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthProvider'

interface LayoutProps {
  children: ReactNode
  showNav?: boolean
}

export default function Layout({ children, showNav = true }: LayoutProps) {
  const location = useLocation()
  const { user } = useAuth()
  const isHomePage = location.pathname === '/'
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'
  const isDocsPage = location.pathname.startsWith('/docs')
  const isLegalPage = isDocsPage || location.pathname === '/privacy' || location.pathname === '/terms'
  const isPublicPage = isHomePage || isAuthPage || isLegalPage
  
  // Determine if we need sidebar margin for authenticated nav
  const showAuthenticatedNav = Boolean(user) && !isPublicPage
  const needsSidebarMargin = showAuthenticatedNav && showNav
  
  return (
    <div className={`flex-1 flex flex-col ${needsSidebarMargin ? 'md:ml-20' : ''} pb-16 md:pb-0`}>
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
} 
import { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { Nav } from './Nav'
import { MobileNav } from './MobileNav'
import { Footer } from './Footer'
import { InstallPrompt } from './InstallPrompt'
import { useBountyNotifications } from '../hooks/useBountyNotifications'
import ChatSidebar from './ChatSidebar'

interface LayoutProps {
  children: ReactNode
  showNav?: boolean
}

export default function Layout({ children, showNav = true }: LayoutProps) {
  const location = useLocation()
  const isHomePage = location.pathname === '/'
  
  // Enable bounty notifications polling
  useBountyNotifications()
  
  // Don't show default nav on home page (it has its own HomeNav)
  const shouldShowNav = showNav && !isHomePage
  
  return (
    <>
      {/* Content wrapper - less opaque to show animated background */}
      <div className="min-h-screen w-full bg-white/30 dark:bg-neutral-900/30 flex flex-row transition-colors duration-200">
        {/* Desktop Navigation - Hidden on mobile and home page */}
        {shouldShowNav && <div className="hidden md:block relative z-20"><Nav /></div>}
        <div className={`flex-1 flex flex-col ${shouldShowNav ? 'md:ml-20' : ''} pb-16 md:pb-0`}>
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
          {!isHomePage && <Footer />}
        </div>
      </div>
      {/* Mobile Navigation - Visible only on mobile and not on home page */}
      {shouldShowNav && <MobileNav />}
      {!isHomePage && <ChatSidebar />}
      {/* PWA Install Prompt */}
      <InstallPrompt />
    </>
  )
} 
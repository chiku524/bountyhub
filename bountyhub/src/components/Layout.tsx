import { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { Nav } from './Nav'
import { MobileNav } from './MobileNav'
import { Footer } from './Footer'
import { InstallPrompt } from './InstallPrompt'
import { AnimatedBackground } from './AnimatedBackground'
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
  
  return (
    <div className="relative min-h-screen">
      {/* Animated Background */}
      <AnimatedBackground />
      
      <div className="relative min-h-screen w-full bg-neutral-50 dark:bg-neutral-900/95 flex flex-row transition-colors duration-200">
        {/* Desktop Navigation - Hidden on mobile */}
        {showNav && <div className="hidden md:block"><Nav /></div>}
        <div className={`flex-1 flex flex-col ${showNav ? 'md:ml-20' : ''} pb-16 md:pb-0 relative z-10`}>
          <main className="flex-1 overflow-y-auto relative z-10">
            {children}
          </main>
          <Footer />
        </div>
      </div>
      {/* Mobile Navigation - Visible only on mobile */}
      {showNav && <MobileNav />}
      {!isHomePage && <ChatSidebar />}
      {/* PWA Install Prompt */}
      <InstallPrompt />
    </div>
  )
} 
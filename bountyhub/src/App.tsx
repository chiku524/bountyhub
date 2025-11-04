import { Routes, Route, useLocation } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { WalletProvider } from './contexts/WalletProvider'
import { AuthProvider, useAuth } from './contexts/AuthProvider'
import { SolanaWalletProvider } from './contexts/SolanaWalletProvider'
import Layout from './components/Layout'
import { AnimatedBackground } from './components/AnimatedBackground'
import { Nav } from './components/Nav'
import { HomeNav } from './components/HomeNav'
import { Footer } from './components/Footer'
import { MobileNav } from './components/MobileNav'
import { PageMetadata } from './components/PageMetadata'
import { useBountyNotifications } from './hooks/useBountyNotifications'
import ChatSidebar from './components/ChatSidebar'
import { InstallPrompt } from './components/InstallPrompt'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import ProfileActivity from './pages/ProfileActivity'
import ProfilePosts from './pages/ProfilePosts'
import ProfileBookmarks from './pages/ProfileBookmarks'
import Community from './pages/Community'
import Governance from './pages/Governance'
import Admin from './pages/Admin'
import Analytics from './pages/Analytics'
import Wallet from './pages/Wallet'
import Settings from './pages/Settings'
import CreatePost from './pages/CreatePost'
import PostDetail from './pages/PostDetail'
import UserProfile from './pages/UserProfile'
import UserPosts from './pages/UserPosts'
import Transactions from './pages/Transactions'
import RefundRequests from './pages/RefundRequests'
import Docs from './pages/Docs'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import PlatformDocs from './pages/docs/Platform'
import UserGuide from './pages/docs/UserGuide'
import DeveloperGuide from './pages/docs/DeveloperGuide'
import ApiReference from './pages/docs/ApiReference'
import DeploymentGuide from './pages/docs/DeploymentGuide'
import Legal from './pages/docs/Legal'
import RefundSystem from './pages/docs/RefundSystem'
import '@solana/wallet-adapter-react-ui/styles.css'

function AppContent() {
  const location = useLocation()
  const { user } = useAuth()
  const isHomePage = location.pathname === '/'
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'
  const isDocsPage = location.pathname.startsWith('/docs')
  const isLegalPage = isDocsPage || location.pathname === '/privacy' || location.pathname === '/terms'
  
  // Determine which navbar to show
  const isPublicPage = isHomePage || isAuthPage || isLegalPage
  const showAuthenticatedNav = Boolean(user) && !isPublicPage
  
  // Enable bounty notifications polling
  useBountyNotifications()
  
  // Scroll to section handler for HomeNav
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
  
  return (
    <>
      {/* Animated Background - Canvas only, no children */}
      <AnimatedBackground />
      
      {/* Light/Dark mode container - Always flex-col, inner flex-row when authenticated */}
      <div className="relative z-10 min-h-screen w-full bg-white/10 dark:bg-neutral-900/10 transition-colors duration-200 flex flex-col">
        {/* Main content area - flex-row when authenticated (Nav + Layout), flex-col otherwise */}
        <div className={`flex-1 flex ${showAuthenticatedNav ? 'flex-row' : 'flex-col'}`}>
          {/* Dynamic Navbar */}
          {isHomePage ? (
            <HomeNav onScrollTo={scrollToSection} />
          ) : showAuthenticatedNav ? (
            <div className="hidden md:block relative z-20">
              <Nav />
            </div>
          ) : null}
          
          {/* Layout - Page content */}
          <Layout showNav={showAuthenticatedNav}>
            <PageMetadata />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/activity" element={<ProfileActivity />} />
              <Route path="/profile/posts" element={<ProfilePosts />} />
              <Route path="/profile/bookmarks" element={<ProfileBookmarks />} />
              <Route path="/community" element={<Community />} />
              <Route path="/governance" element={<Governance />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/posts/create" element={<CreatePost />} />
              <Route path="/posts/:postId" element={<PostDetail />} />
              <Route path="/users/:username" element={<UserProfile />} />
              <Route path="/users/:username/posts" element={<UserPosts />} />
              <Route path="/:username" element={<UserProfile />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/refund-requests" element={<RefundRequests />} />
              <Route path="/docs" element={<Docs />} />
              <Route path="/docs/platform" element={<PlatformDocs />} />
              <Route path="/docs/user-guide" element={<UserGuide />} />
              <Route path="/docs/developer-guide" element={<DeveloperGuide />} />
              <Route path="/docs/api-reference" element={<ApiReference />} />
              <Route path="/docs/deployment-guide" element={<DeploymentGuide />} />
              <Route path="/docs/legal" element={<Legal />} />
              <Route path="/docs/refund-system" element={<RefundSystem />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </Layout>
        </div>
        
        {/* Footer - Show on every page, full width below content */}
        <Footer />
        
        {/* Mobile Navigation - Only for authenticated pages */}
        {showAuthenticatedNav && <MobileNav />}
        
        {/* Chat Sidebar - Only for authenticated pages */}
        {!isPublicPage && <ChatSidebar />}
        
        {/* PWA Install Prompt */}
        <InstallPrompt />
      </div>
    </>
  )
}

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <SolanaWalletProvider>
          <WalletProvider>
            <AppContent />
          </WalletProvider>
        </SolanaWalletProvider>
      </AuthProvider>
    </HelmetProvider>
  )
}

export default App 
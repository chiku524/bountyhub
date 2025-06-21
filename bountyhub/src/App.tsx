import { Routes, Route } from 'react-router-dom'
import { WalletProvider } from './contexts/WalletProvider'
import { AuthProvider } from './contexts/AuthProvider'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import Community from './pages/Community'
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

function App() {
  return (
    <AuthProvider>
      <WalletProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/community" element={<Community />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/posts/create" element={<CreatePost />} />
            <Route path="/posts/:postId" element={<PostDetail />} />
            <Route path="/:username" element={<UserProfile />} />
            <Route path="/:username/posts" element={<UserPosts />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/refund-requests" element={<RefundRequests />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
          </Routes>
        </Layout>
      </WalletProvider>
    </AuthProvider>
  )
}

export default App 
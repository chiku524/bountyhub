export interface PageMetadata {
  title: string
  description: string
  keywords?: string
  ogImage?: string
  ogType?: string
}

export const DEFAULT_METADATA: PageMetadata = {
  title: 'bountyhub - Decentralized Bounty Platform',
  description: 'The decentralized bounty platform where questions meet rewards. Ask questions, offer bounties, and earn cryptocurrency rewards on Solana.',
  keywords: 'bounty, cryptocurrency, solana, blockchain, rewards, questions, answers, BBUX, decentralized',
  ogImage: 'https://bountyhub.tech/og-image.jpg',
  ogType: 'website'
}

export const PAGE_METADATA: Record<string, PageMetadata> = {
  // Home page
  '/': {
    title: 'bountyhub - Decentralized Bounty Platform',
    description: 'The decentralized bounty platform where questions meet rewards. Ask questions, offer bounties, and earn cryptocurrency rewards on Solana.',
    keywords: 'bounty, cryptocurrency, solana, blockchain, rewards, questions, answers, BBUX, decentralized'
  },

  // Authentication pages
  '/login': {
    title: 'Login - bountyhub',
    description: 'Sign in to your bountyhub account to access bounties, earn rewards, and participate in the community.',
    keywords: 'login, sign in, bountyhub, account, authentication'
  },

  '/signup': {
    title: 'Sign Up - bountyhub',
    description: 'Create your bountyhub account to start earning cryptocurrency rewards by answering questions and completing bounties.',
    keywords: 'sign up, register, bountyhub, account, cryptocurrency, rewards'
  },

  // Community and posts
  '/community': {
    title: 'Community - bountyhub',
    description: 'Browse active bounties, ask questions, and find opportunities to earn cryptocurrency rewards in the bountyhub community.',
    keywords: 'community, bounties, questions, cryptocurrency, rewards, BBUX'
  },

  '/posts/create': {
    title: 'Create Bounty - bountyhub',
    description: 'Create a new bounty with cryptocurrency rewards. Post your question and offer BBUX tokens to get quality answers.',
    keywords: 'create bounty, post question, cryptocurrency rewards, BBUX tokens'
  },

  // User pages
  '/profile': {
    title: 'My Profile - bountyhub',
    description: 'Manage your bountyhub profile, view your reputation, and track your earnings from completed bounties.',
    keywords: 'profile, reputation, earnings, bountyhub, user dashboard'
  },

  '/settings': {
    title: 'Settings - bountyhub',
    description: 'Customize your bountyhub account settings, update your profile, and manage your preferences.',
    keywords: 'settings, profile, preferences, bountyhub, account'
  },

  // Wallet and transactions
  '/wallet': {
    title: 'Wallet - bountyhub',
    description: 'Manage your BBUX tokens, view transaction history, and handle deposits and withdrawals on the bountyhub platform.',
    keywords: 'wallet, BBUX, tokens, transactions, cryptocurrency, solana'
  },

  '/transactions': {
    title: 'Transaction History - bountyhub',
    description: 'View your complete transaction history, including bounty rewards, deposits, and withdrawals on the bountyhub platform.',
    keywords: 'transactions, history, bounty rewards, BBUX, cryptocurrency'
  },

  // Governance
  '/governance': {
    title: 'Governance - bountyhub',
    description: 'Participate in bountyhub platform governance. Vote on proposals and help shape the future of the decentralized bounty ecosystem.',
    keywords: 'governance, voting, proposals, decentralized, bountyhub, community'
  },

  // Download desktop app
  '/download': {
    title: 'Download Desktop App - bountyhub',
    description: 'Download BountyHub for Windows, macOS, or Linux. Native desktop app built with Tauri — lightweight and always connected to bountyhub.tech.',
    keywords: 'download, desktop app, Windows, macOS, Linux, Tauri, bountyhub'
  },

  // Documentation (single /docs page with hash sections)
  '/docs': {
    title: 'Documentation - bountyhub',
    description: 'Comprehensive documentation for the bountyhub platform. Learn how to use the platform, integrate with APIs, and understand the ecosystem.',
    keywords: 'documentation, API, integration, bountyhub, developer guide, user guide'
  },

  // Legal pages
  '/privacy': {
    title: 'Privacy Policy - bountyhub',
    description: 'bountyhub privacy policy. Learn how we collect, use, and protect your personal information.',
    keywords: 'privacy policy, data protection, bountyhub, legal'
  },

  '/terms': {
    title: 'Terms of Service - bountyhub',
    description: 'bountyhub terms of service. Read the terms and conditions for using our decentralized bounty platform.',
    keywords: 'terms of service, legal, bountyhub, conditions'
  },

  // Admin
  '/admin': {
    title: 'Admin Dashboard - bountyhub',
    description: 'Administrative dashboard for bountyhub platform management and moderation.',
    keywords: 'admin, dashboard, moderation, bountyhub, management'
  },

  // Refund requests
  '/refund-requests': {
    title: 'Refund Requests - bountyhub',
    description: 'Manage and process refund requests for bounties on the bountyhub platform.',
    keywords: 'refund requests, bounty refunds, processing, bountyhub'
  }
}

export function getPageMetadata(pathname: string): PageMetadata {
  // Remove query parameters and hash
  const cleanPath = pathname.split('?')[0].split('#')[0]
  
  // Check for exact match first
  if (PAGE_METADATA[cleanPath]) {
    return PAGE_METADATA[cleanPath]
  }

  // Check for dynamic routes
  if (cleanPath.startsWith('/posts/') && cleanPath !== '/posts/create') {
    return {
      title: 'Bounty Details - bountyhub',
      description: 'View bounty details, answers, and participate in the discussion. Earn rewards by providing quality answers.',
      keywords: 'bounty details, answers, discussion, rewards, bountyhub'
    }
  }

  if (cleanPath.startsWith('/users/')) {
    return {
      title: 'User Profile - bountyhub',
      description: 'View user profile, reputation, and bounty history on the bountyhub platform.',
      keywords: 'user profile, reputation, bounty history, bountyhub'
    }
  }

  if (cleanPath.startsWith('/docs/')) {
    return {
      title: 'Documentation - bountyhub',
      description: 'bountyhub documentation and guides for users and developers.',
      keywords: 'documentation, guides, bountyhub, help'
    }
  }

  // Default fallback
  return DEFAULT_METADATA
}

export function formatPageTitle(title: string): string {
  return title.includes('bountyhub') ? title : `${title} - bountyhub`
} 
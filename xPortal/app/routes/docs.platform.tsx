import { json, type LoaderFunction } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import { Layout } from '~/components/Layout';
import { FiArrowLeft, FiDownload, FiExternalLink } from 'react-icons/fi';

interface LoaderData {
  title: string;
  description: string;
}

export const loader: LoaderFunction = async (): Promise<Response> => {
  return json<LoaderData>({
    title: "Platform Documentation",
    description: "Complete overview of portal.ask platform features, architecture, and functionality"
  });
};

export default function PlatformDocsPage() {
  const data = useLoaderData<typeof loader>();
  const { title, description } = data as LoaderData;

  return (
    <Layout>
      <div className="w-auto max-w-6xl mx-auto mt-4 px-4 ml-24 pb-16">
        {/* Header */}
        <div className="mb-8 mt-16">
          <Link 
            to="/docs" 
            className="inline-flex items-center text-violet-400 hover:text-violet-300 transition-colors mb-4"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back to Documentation
          </Link>
          <h1 className="text-4xl font-bold text-white mb-4">{title}</h1>
          <p className="text-gray-400 text-lg max-w-3xl">{description}</p>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-violet max-w-none">
          <div className="bg-neutral-800/60 rounded-lg border border-violet-500/20 p-8">
            <h2>Overview</h2>
            <p>
              portal.ask is a decentralized knowledge-sharing platform built on the Solana blockchain. 
              It combines traditional Q&A functionality with blockchain-powered bounties, reputation systems, 
              and virtual currency to create an incentivized learning environment.
            </p>

            <h3>Key Concepts</h3>
            <ul>
              <li><strong>Knowledge Sharing</strong>: Users can ask questions, provide answers, and share insights</li>
              <li><strong>Bounty System</strong>: Question creators can offer rewards for accepted answers</li>
              <li><strong>Reputation System</strong>: Users earn reputation points for quality contributions</li>
              <li><strong>Integrity System</strong>: Community-driven rating system to maintain quality</li>
              <li><strong>Virtual Wallet</strong>: In-platform currency management for bounties and rewards</li>
            </ul>

            <h3>Technology Stack</h3>
            <ul>
              <li><strong>Frontend</strong>: React 18, Remix 2.8, TypeScript</li>
              <li><strong>Backend</strong>: Node.js, Express</li>
              <li><strong>Database</strong>: Cloudflare D1 with Drizzle ORM</li>
              <li><strong>Blockchain</strong>: Solana (Web3.js, Anchor Framework)</li>
              <li><strong>Styling</strong>: Tailwind CSS</li>
              <li><strong>Media</strong>: Cloudinary for file uploads</li>
              <li><strong>PDF Generation</strong>: Puppeteer</li>
            </ul>

            <h2>Features</h2>

            <h3>1. User Authentication & Profiles</h3>
            <h4>Registration & Login</h4>
            <ul>
              <li>Email-based authentication</li>
              <li>Username uniqueness validation</li>
              <li>Password security with bcrypt</li>
              <li>Session management with JWT</li>
            </ul>

            <h4>Profile Management</h4>
            <ul>
              <li>Customizable profile pictures</li>
              <li>Bio and personal information</li>
              <li>Social media links</li>
              <li>Reputation score display</li>
              <li>Activity history</li>
            </ul>

            <h3>2. Content Creation & Management</h3>
            <h4>Posts (Questions)</h4>
            <ul>
              <li>Rich text editor with markdown support</li>
              <li>Code block syntax highlighting</li>
              <li>Media uploads (images, videos, screen recordings)</li>
              <li>Tags and categorization</li>
              <li>Draft saving and editing</li>
            </ul>

            <h4>Answers</h4>
            <ul>
              <li>Rich text responses</li>
              <li>Code examples with syntax highlighting</li>
              <li>Media attachments</li>
              <li>Voting system</li>
              <li>Acceptance by question author</li>
            </ul>

            <h3>3. Bounty System</h3>
            <h4>Creating Bounties</h4>
            <ul>
              <li>Attach rewards to questions</li>
              <li>Set bounty amounts in PORTAL tokens</li>
              <li>Optional expiration dates</li>
              <li>Automatic escrow of funds</li>
              <li><strong>5% governance fee</strong> for community rewards</li>
            </ul>

            <h4>Claiming Bounties</h4>
            <ul>
              <li>Question author accepts answers</li>
              <li>Automatic payout to answer author</li>
              <li>Transaction history tracking</li>
              <li>Dispute resolution system</li>
            </ul>

            <h4>Refund System</h4>
            <ul>
              <li><strong>Time-based restrictions</strong>: 24-hour lock period after first answer</li>
              <li><strong>Community approval</strong>: All refunds require community voting</li>
              <li><strong>Governance rewards</strong>: 5% of bounty amount distributed to voters</li>
              <li><strong>Penalty system</strong>: 20% penalty for refunding with helpful answers</li>
              <li><strong>Integrity impact</strong>: Refunding with helpful answers reduces integrity score</li>
            </ul>

            <h4>Refund Process</h4>
            <ol>
              <li><strong>Request Creation</strong>: User submits refund request with reason</li>
              <li><strong>Time Validation</strong>: System checks if 24 hours have passed since first answer</li>
              <li><strong>Community Voting</strong>: 48-hour voting window with minimum vote requirements</li>
              <li><strong>Approval Criteria</strong>: 60% approval rate with minimum votes (3-7 depending on answers)</li>
              <li><strong>Processing</strong>: If approved, refund minus penalties distributed</li>
              <li><strong>Rewards</strong>: Governance participants receive tokens and reputation points</li>
            </ol>

            <h4>Governance Participation</h4>
            <ul>
              <li><strong>Voting Rewards</strong>: Earn tokens proportional to bounty amount</li>
              <li><strong>Reputation Points</strong>: +5 points for each governance participation</li>
              <li><strong>Vote Requirements</strong>: Cannot vote on own requests or multiple times</li>
              <li><strong>Transparency</strong>: All votes and reasons are publicly visible</li>
            </ul>

            <h3>4. Reputation System</h3>
            <h4>Earning Points</h4>
            <ul>
              <li><strong>Post Creation</strong>: +10 points</li>
              <li><strong>Answer Creation</strong>: +5 points</li>
              <li><strong>Answer Acceptance</strong>: +15 points</li>
              <li><strong>Upvotes Received</strong>: +2 points</li>
              <li><strong>Downvotes Received</strong>: -1 point</li>
              <li><strong>Quality Upvotes</strong>: +5 points</li>
              <li><strong>Quality Downvotes</strong>: -2 points</li>
            </ul>

            <h4>Reputation Levels</h4>
            <ul>
              <li><strong>Beginner</strong>: 0-99 points</li>
              <li><strong>Contributor</strong>: 100-499 points</li>
              <li><strong>Expert</strong>: 500-999 points</li>
              <li><strong>Master</strong>: 1000+ points</li>
            </ul>

            <h3>5. Integrity System</h3>
            <h4>User Ratings</h4>
            <ul>
              <li>1-10 rating scale</li>
              <li>Context-based ratings</li>
              <li>Rating categories:
                <ul>
                  <li>Bounty Rejection</li>
                  <li>Answer Quality</li>
                  <li>Communication</li>
                  <li>Spam</li>
                  <li>Harassment</li>
                  <li>General Behavior</li>
                </ul>
              </li>
            </ul>

            <h3>6. Virtual Wallet System</h3>
            <h4>Wallet Features</h4>
            <ul>
              <li>Virtual balance tracking</li>
              <li>Transaction history</li>
              <li>Deposit/withdrawal capabilities</li>
              <li>Bounty management</li>
              <li>Earnings tracking</li>
            </ul>

            <h4>Transaction Types</h4>
            <ul>
              <li><strong>DEPOSIT</strong>: Add funds to wallet</li>
              <li><strong>WITHDRAWAL</strong>: Remove funds from wallet</li>
              <li><strong>BOUNTY_CREATED</strong>: Create new bounty</li>
              <li><strong>BOUNTY_CLAIMED</strong>: Win bounty reward</li>
              <li><strong>BOUNTY_REFUNDED</strong>: Get bounty refund</li>
              <li><strong>COMPENSATION</strong>: Receive governance rewards or penalty distributions</li>
            </ul>

            <h3>7. Voting System</h3>
            <h4>Content Voting</h4>
            <ul>
              <li>Upvote/downvote posts</li>
              <li>Upvote/downvote answers</li>
              <li>Upvote/downvote comments</li>
              <li>Quality voting for posts</li>
            </ul>

            <h3>8. Media Management</h3>
            <h4>Upload Support</h4>
            <ul>
              <li>Images (JPG, PNG, GIF)</li>
              <li>Videos (MP4, WebM)</li>
              <li>Screen recordings</li>
              <li>File size limits</li>
              <li>Format validation</li>
            </ul>

            <h3>9. Search & Discovery</h3>
            <h4>Content Discovery</h4>
            <ul>
              <li>Community feed</li>
              <li>Trending posts</li>
              <li>Bounty highlights</li>
              <li>User activity feeds</li>
              <li>Tag-based filtering</li>
            </ul>

            <h2>Architecture</h2>

            <h3>System Components</h3>
            <pre className="bg-neutral-900 p-4 rounded-lg text-sm overflow-x-auto">
{`┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Blockchain    │
│   (Remix/React) │◄──►│   (Node.js)     │◄──►│   (Solana)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Cloudinary    │    │   MongoDB       │    │   Virtual       │
│   (Media)       │    │   (Database)    │    │   Wallet        │
└─────────────────┘    └─────────────────┘    └─────────────────┘`}
            </pre>

            <h3>Key Design Principles</h3>
            <ul>
              <li><strong>Server-Side Rendering</strong>: Remix provides SSR for better SEO and performance</li>
              <li><strong>Type Safety</strong>: TypeScript throughout the application</li>
              <li><strong>Component-Based</strong>: Reusable React components</li>
              <li><strong>API-First</strong>: RESTful API design</li>
              <li><strong>Blockchain-Native</strong>: Solana integration for decentralized features</li>
              <li><strong>Scalable</strong>: Modular architecture for easy extension</li>
            </ul>

            <h2>Support & Resources</h2>

            <h3>Documentation</h3>
            <ul>
              <li><a href="/docs/user-guide" className="text-violet-400 hover:text-violet-300">User Guide</a> - Complete user documentation</li>
              <li><a href="/docs/developer-guide" className="text-violet-400 hover:text-violet-300">Developer Guide</a> - Technical documentation</li>
              <li><a href="/docs/api-reference" className="text-violet-400 hover:text-violet-300">API Reference</a> - API documentation</li>
              <li><a href="/docs/deployment-guide" className="text-violet-400 hover:text-violet-300">Deployment Guide</a> - Production deployment</li>
            </ul>

            <h3>Community</h3>
            <ul>
              <li><a href="https://discord.gg/zvB9gwhq" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">Discord Server</a> - Join our community</li>
              <li><a href="https://github.com/portal" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">GitHub Repository</a> - Source code</li>
              <li><a href="https://x.com/portal_ask" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">X (Twitter)</a> - Latest updates</li>
            </ul>

            <h3>Contact</h3>
            <ul>
              <li><strong>Email</strong>: <a href="mailto:bountybucks524@gmail.com" className="text-violet-400 hover:text-violet-300">bountybucks524@gmail.com</a></li>
              <li><strong>Platform</strong>: <a href="https://portal.ask" className="text-violet-400 hover:text-violet-300">portal.ask</a></li>
              <li><strong>Support</strong>: Available through Discord and email</li>
            </ul>

            <h2>Version History</h2>

            <h3>v1.0.0 (Current)</h3>
            <ul>
              <li>Initial platform release</li>
              <li>Core Q&A functionality</li>
              <li>Bounty system with 5% governance fee</li>
              <li>Time-based refund restrictions (24-hour lock period)</li>
              <li>Community governance system for refund approval</li>
              <li>Reputation and integrity systems</li>
              <li>Virtual wallet with governance rewards</li>
              <li>Media uploads</li>
              <li>PDF generation for legal documents</li>
            </ul>

            <h3>Planned Features</h3>
            <ul>
              <li>Mobile application</li>
              <li>Advanced search functionality</li>
              <li>AI-powered content moderation</li>
              <li>Multi-language support</li>
              <li>Advanced analytics dashboard</li>
              <li>Community governance tools</li>
            </ul>

            <div className="mt-8 p-6 bg-violet-500/10 rounded-lg border border-violet-500/30">
              <h3 className="text-violet-300 mb-4">Download Full Documentation</h3>
              <p className="text-gray-400 mb-4">
                Get the complete platform documentation as a PDF for offline reading.
              </p>
              <a
                href="/api/docs/platform.pdf"
                className="inline-flex items-center px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
              >
                <FiDownload className="w-4 h-4 mr-2" />
                Download PDF
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 
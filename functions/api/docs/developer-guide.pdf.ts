import { PDFService } from '../../../src/utils/pdf';

export async function onRequest(context: any) {
  try {
    const developerGuideContent = `
      <div class="section">
        <h2>Developer Guide</h2>
        <p>This guide provides technical information for developers who want to integrate with or contribute to bountyhub.</p>
      </div>
      
      <div class="section">
        <h2>Technology Stack</h2>
        <h3>Frontend</h3>
        <ul>
          <li><strong>React 18:</strong> Modern React with hooks and functional components</li>
          <li><strong>TypeScript:</strong> Type-safe JavaScript development</li>
          <li><strong>Tailwind CSS:</strong> Utility-first CSS framework</li>
          <li><strong>Vite:</strong> Fast build tool and development server</li>
        </ul>
        
        <h3>Backend</h3>
        <ul>
          <li><strong>Cloudflare Workers:</strong> Serverless edge computing</li>
          <li><strong>D1 Database:</strong> SQLite-based edge database</li>
          <li><strong>Drizzle ORM:</strong> Type-safe database queries</li>
          <li><strong>Solana Web3.js:</strong> Solana blockchain integration</li>
        </ul>
      </div>
      
      <div class="section">
        <h2>Project Structure</h2>
        <pre><code>bountyhub/
├── src/
│   ├── components/     # Reusable React components
│   ├── pages/         # Page components
│   ├── contexts/      # React contexts
│   ├── hooks/         # Custom React hooks
│   ├── utils/         # Utility functions
│   └── types/         # TypeScript type definitions
├── functions/
│   └── api/           # Cloudflare Workers API endpoints
├── drizzle/
│   ├── schema.ts      # Database schema
│   └── migrations/    # Database migrations
└── public/            # Static assets</code></pre>
      </div>
      
      <div class="section">
        <h2>API Endpoints</h2>
        <h3>Authentication</h3>
        <ul>
          <li><code>POST /api/auth/signup</code> - User registration</li>
          <li><code>POST /api/auth/login</code> - User login</li>
          <li><code>POST /api/auth/logout</code> - User logout</li>
          <li><code>GET /api/auth/me</code> - Get current user</li>
        </ul>
        
        <h3>Posts</h3>
        <ul>
          <li><code>GET /api/posts</code> - List posts with pagination</li>
          <li><code>POST /api/posts</code> - Create new post</li>
          <li><code>GET /api/posts/[id]</code> - Get specific post</li>
          <li><code>PUT /api/posts/[id]</code> - Update post</li>
          <li><code>DELETE /api/posts/[id]</code> - Delete post</li>
        </ul>
        
        <h3>Wallet</h3>
        <ul>
          <li><code>GET /api/wallet</code> - Get wallet balance</li>
          <li><code>POST /api/wallet/deposit</code> - Deposit funds</li>
          <li><code>POST /api/wallet/withdraw</code> - Withdraw funds</li>
        </ul>
      </div>
      
      <div class="section">
        <h2>Database Schema</h2>
        <p>The platform uses D1 database with the following main tables:</p>
        <ul>
          <li><strong>users:</strong> User accounts and profiles</li>
          <li><strong>posts:</strong> Questions and answers</li>
          <li><strong>tags:</strong> Content categorization</li>
          <li><strong>bounties:</strong> Reward system</li>
          <li><strong>votes:</strong> Community voting</li>
          <li><strong>transactions:</strong> Financial records</li>
        </ul>
      </div>
      
      <div class="section">
        <h2>Solana Integration</h2>
        <p>The platform integrates with Solana blockchain for:</p>
        <ul>
          <li><strong>Wallet Connection:</strong> Secure wallet authentication</li>
          <li><strong>Token Management:</strong> BBUX token transactions</li>
          <li><strong>Smart Contracts:</strong> Bounty and reward automation</li>
          <li><strong>Transaction Verification:</strong> On-chain transaction validation</li>
        </ul>
      </div>
      
      <div class="section">
        <h2>Development Setup</h2>
        <ol>
          <li>Clone the repository</li>
          <li>Install dependencies: <code>npm install</code></li>
          <li>Set up environment variables</li>
          <li>Run database migrations: <code>npm run db:migrate</code></li>
          <li>Start development server: <code>npm run dev</code></li>
        </ol>
      </div>
      
      <div class="section">
        <h2>Contributing</h2>
        <ul>
          <li>Follow the existing code style and conventions</li>
          <li>Write tests for new features</li>
          <li>Update documentation as needed</li>
          <li>Submit pull requests for review</li>
        </ul>
      </div>
    `;

    const pdfBuffer = await PDFService.createSimplePDF(
      "Developer Guide - bountyhub",
      developerGuideContent,
      {
        format: 'A4',
        margin: {
          top: '1in',
          right: '1in',
          bottom: '1in',
          left: '1in'
        }
      },
      context.env.HTML2PDF_API_KEY
    );

    return new Response(pdfBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=developer-guide.pdf",
      },
    });
  } catch (error) {
    console.error("Error generating developer guide PDF:", error);
    return new Response(JSON.stringify({ error: "Failed to generate PDF" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
} 
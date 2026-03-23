import { PDFService } from '../../../src/utils/pdf';

export async function onRequest(context: any) {
  try {
    const platformContent = `
      <div class="section">
        <h2>Platform Overview</h2>
        <p>bountyhub is a decentralized Q&A platform built on Solana blockchain technology. It enables users to ask questions, provide answers, and earn rewards through a bounty system.</p>
      </div>
      
      <div class="section">
        <h2>Key Features</h2>
        <ul>
          <li><strong>Bounty System:</strong> Users can attach bounties to questions using BBUX tokens</li>
          <li><strong>Decentralized:</strong> Built on Solana blockchain for transparency and security</li>
          <li><strong>Community-Driven:</strong> Users vote on answers and maintain content quality</li>
          <li><strong>Wallet Integration:</strong> Seamless Solana wallet connection for transactions</li>
        </ul>
      </div>
      
      <div class="section">
        <h2>Technology Stack</h2>
        <ul>
          <li><strong>Frontend:</strong> React with TypeScript and Tailwind CSS</li>
          <li><strong>Backend:</strong> Cloudflare Workers with D1 database</li>
          <li><strong>Blockchain:</strong> Solana with Anchor framework</li>
          <li><strong>Authentication:</strong> Session-based with secure token management</li>
        </ul>
      </div>
      
      <div class="section">
        <h2>Architecture</h2>
        <p>The platform follows a modern web architecture with:</p>
        <ul>
          <li>Serverless functions for API endpoints</li>
          <li>Edge computing for global performance</li>
          <li>Decentralized storage for content</li>
          <li>Smart contracts for bounty management</li>
        </ul>
      </div>
    `;

    const pdfBuffer = await PDFService.createSimplePDF(
      "Platform Documentation - bountyhub",
      platformContent,
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

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=platform-documentation.pdf",
      },
    });
  } catch (error) {
    console.error('Platform PDF: Error generating PDF:', error)
    return new Response(JSON.stringify({
      error: 'Failed to generate PDF',
      details: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
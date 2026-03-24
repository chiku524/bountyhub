import { PDFService } from '../../../src/utils/pdf';

export async function onRequest(context: any) {
  try {
    const deploymentGuideContent = `
      <div class="section">
        <h2>Deployment Guide</h2>
        <p>Complete guide for deploying bountyhub to production environments.</p>
      </div>
      
      <div class="section">
        <h2>Prerequisites</h2>
        <ul>
          <li><strong>Node.js 18+:</strong> Latest LTS version</li>
          <li><strong>npm or yarn:</strong> Package manager</li>
          <li><strong>Cloudflare account:</strong> For Workers and D1 database</li>
          <li><strong>Solana wallet:</strong> For blockchain integration</li>
          <li><strong>Git:</strong> Version control</li>
        </ul>
      </div>
      
      <div class="section">
        <h2>Environment Setup</h2>
        <h3>1. Clone Repository</h3>
        <pre><code>git clone https://github.com/your-org/bountyhub.git
cd bountyhub</code></pre>
        
        <h3>2. Install Dependencies</h3>
        <pre><code>npm install</code></pre>
        
        <h3>3. Environment Variables</h3>
        <p>Create a <code>.env</code> file with the following variables:</p>
        <pre><code># Database
DATABASE_URL="your-d1-database-url"

# Authentication
SESSION_SECRET="your-session-secret"

# Solana
SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
SOLANA_PROGRAM_ID="your-program-id"

# PDF Generation
HTML2PDF_API_KEY="your-html2pdf-api-key"

# Cloudflare
CLOUDFLARE_ACCOUNT_ID="your-account-id"
CLOUDFLARE_API_TOKEN="your-api-token"</code></pre>
      </div>
      
      <div class="section">
        <h2>Database Setup</h2>
        <h3>1. Create D1 Database</h3>
        <pre><code>npx wrangler d1 create bountyhub-db</code></pre>
        
        <h3>2. Update wrangler.toml</h3>
        <p>Add the database binding to your <code>wrangler.toml</code>:</p>
        <pre><code>[[d1_databases]]
binding = "DB"
database_name = "bountyhub-db"
database_id = "your-database-id"</code></pre>
        
        <h3>3. Run Migrations</h3>
        <pre><code>npm run db:migrate</code></pre>
      </div>
      
      <div class="section">
        <h2>Solana Integration</h2>
        <h3>1. Deploy Smart Contracts</h3>
        <pre><code>cd ../xPortal/programs/governance
anchor build
anchor deploy</code></pre>
        
        <h3>2. Update Program IDs</h3>
        <p>Update the program IDs in your configuration files after deployment.</p>
        
        <h3>3. Configure RPC Endpoints</h3>
        <p>Set up your preferred Solana RPC provider for production use.</p>
      </div>
      
      <div class="section">
        <h2>Cloudflare Workers Deployment</h2>
        <h3>1. Configure Wrangler</h3>
        <pre><code>npx wrangler login</code></pre>
        
        <h3>2. Update wrangler.toml</h3>
        <p>Configure your production settings:</p>
        <pre><code>name = "bountyhub"
main = "functions/index.ts"
compatibility_date = "2025-01-01"

[env.production]
name = "bountyhub-prod"

[env.staging]
name = "bountyhub-staging"</code></pre>
        
        <h3>3. Deploy to Production</h3>
        <pre><code>npm run deploy:prod</code></pre>
        
        <h3>4. Deploy to Staging</h3>
        <pre><code>npm run deploy:staging</code></pre>
      </div>
      
      <div class="section">
        <h2>Frontend Deployment</h2>
        <h3>1. Build for Production</h3>
        <pre><code>npm run build</code></pre>
        
        <h3>2. Deploy to Cloudflare Pages</h3>
        <pre><code>npx wrangler pages deploy dist</code></pre>
        
        <h3>3. Configure Custom Domain</h3>
        <p>Set up your custom domain in Cloudflare Pages dashboard.</p>
      </div>
      
      <div class="section">
        <h2>Monitoring and Logs</h2>
        <h3>1. Cloudflare Analytics</h3>
        <ul>
          <li>Enable Web Analytics in Cloudflare dashboard</li>
          <li>Monitor request volumes and performance</li>
          <li>Set up alerts for errors</li>
        </ul>
        
        <h3>2. Application Logs</h3>
        <pre><code>npx wrangler tail</code></pre>
        
        <h3>3. Database Monitoring</h3>
        <ul>
          <li>Monitor D1 database performance</li>
          <li>Track query execution times</li>
          <li>Set up backup schedules</li>
        </ul>
      </div>
      
      <div class="section">
        <h2>Security Considerations</h2>
        <ul>
          <li><strong>HTTPS Only:</strong> All traffic should use HTTPS</li>
          <li><strong>Rate Limiting:</strong> Implement API rate limiting</li>
          <li><strong>Input Validation:</strong> Validate all user inputs</li>
          <li><strong>SQL Injection:</strong> Use parameterized queries</li>
          <li><strong>XSS Protection:</strong> Sanitize user-generated content</li>
          <li><strong>CSRF Protection:</strong> Implement CSRF tokens</li>
        </ul>
      </div>
      
      <div class="section">
        <h2>Performance Optimization</h2>
        <ul>
          <li><strong>Caching:</strong> Implement appropriate caching strategies</li>
          <li><strong>CDN:</strong> Use Cloudflare's global CDN</li>
          <li><strong>Image Optimization:</strong> Optimize images and media</li>
          <li><strong>Code Splitting:</strong> Implement lazy loading</li>
          <li><strong>Database Indexing:</strong> Optimize database queries</li>
        </ul>
      </div>
      
      <div class="section">
        <h2>Backup and Recovery</h2>
        <h3>1. Database Backups</h3>
        <pre><code>npx wrangler d1 export bountyhub-db --output=backup.sql</code></pre>
        
        <h3>2. Configuration Backups</h3>
        <p>Regularly backup your configuration files and environment variables.</p>
        
        <h3>3. Disaster Recovery Plan</h3>
        <ul>
          <li>Document recovery procedures</li>
          <li>Test backup restoration</li>
          <li>Maintain multiple backup locations</li>
        </ul>
      </div>
    `;

    const pdfBuffer = await PDFService.createSimplePDF(
      "Deployment Guide - bountyhub",
      deploymentGuideContent,
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
        "Content-Disposition": "attachment; filename=deployment-guide.pdf",
      },
    });
  } catch (error) {
    console.error("Error generating deployment guide PDF:", error);
    return new Response(JSON.stringify({ error: "Failed to generate PDF" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
} 
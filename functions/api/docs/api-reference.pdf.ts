import { PDFService } from '../../../src/utils/pdf';

export async function onRequest(context: any) {
  try {
    const apiReferenceContent = `
      <div class="section">
        <h2>API Reference</h2>
        <p>Complete API documentation for bountyhub platform integration.</p>
      </div>
      
      <div class="section">
        <h2>Authentication</h2>
        <p>All API requests require authentication via session cookies or API tokens.</p>
        
        <h3>POST /api/auth/signup</h3>
        <p>Register a new user account.</p>
        <pre><code>{
  "username": "string",
  "email": "string",
  "password": "string"
}</code></pre>
        
        <h3>POST /api/auth/login</h3>
        <p>Authenticate user and create session.</p>
        <pre><code>{
  "email": "string",
  "password": "string"
}</code></pre>
        
        <h3>POST /api/auth/logout</h3>
        <p>End user session.</p>
        
        <h3>GET /api/auth/me</h3>
        <p>Get current authenticated user information.</p>
      </div>
      
      <div class="section">
        <h2>Posts</h2>
        <p>Manage questions and answers on the platform.</p>
        
        <h3>GET /api/posts</h3>
        <p>List posts with pagination and filtering.</p>
        <p><strong>Query Parameters:</strong></p>
        <ul>
          <li><code>page</code> - Page number (default: 1)</li>
          <li><code>limit</code> - Items per page (default: 10)</li>
          <li><code>sort</code> - Sort order (newest, oldest, votes)</li>
          <li><code>tags</code> - Filter by tags (comma-separated)</li>
          <li><code>search</code> - Search in title and content</li>
        </ul>
        
        <h3>POST /api/posts</h3>
        <p>Create a new post (question).</p>
        <pre><code>{
  "title": "string",
  "content": "string",
  "tags": ["string"],
  "bountyAmount": number
}</code></pre>
        
        <h3>GET /api/posts/[id]</h3>
        <p>Get specific post with answers and comments.</p>
        
        <h3>PUT /api/posts/[id]</h3>
        <p>Update existing post.</p>
        
        <h3>DELETE /api/posts/[id]</h3>
        <p>Delete post (author only).</p>
        
        <h3>POST /api/posts/[id]/vote</h3>
        <p>Vote on a post.</p>
        <pre><code>{
  "vote": 1 | -1
}</code></pre>
      </div>
      
      <div class="section">
        <h2>Answers</h2>
        <p>Manage answers to questions.</p>
        
        <h3>POST /api/posts/[id]/answers</h3>
        <p>Add answer to a question.</p>
        <pre><code>{
  "content": "string"
}</code></pre>
        
        <h3>POST /api/posts/[id]/answers/[answerId]/vote</h3>
        <p>Vote on an answer.</p>
        
        <h3>POST /api/posts/[id]/answers/[answerId]/accept</h3>
        <p>Accept an answer and award bounty (question author only).</p>
      </div>
      
      <div class="section">
        <h2>Comments</h2>
        <p>Manage comments on posts and answers.</p>
        
        <h3>POST /api/posts/[id]/comments</h3>
        <p>Add comment to a post.</p>
        
        <h3>POST /api/posts/[id]/comments/[commentId]/vote</h3>
        <p>Vote on a comment.</p>
      </div>
      
      <div class="section">
        <h2>Wallet</h2>
        <p>Manage user wallet and transactions.</p>
        
        <h3>GET /api/wallet</h3>
        <p>Get wallet balance and transaction history.</p>
        
        <h3>POST /api/wallet/deposit</h3>
        <p>Initiate deposit transaction.</p>
        <pre><code>{
  "amount": number,
  "method": "direct" | "wallet"
}</code></pre>
        
        <h3>POST /api/wallet/withdraw</h3>
        <p>Initiate withdrawal transaction.</p>
        <pre><code>{
  "amount": number,
  "address": "string"
}</code></pre>
        
        <h3>POST /api/wallet/confirm-deposit</h3>
        <p>Confirm deposit transaction.</p>
      </div>
      
      <div class="section">
        <h2>Tags</h2>
        <p>Manage content tags.</p>
        
        <h3>GET /api/tags</h3>
        <p>Get all available tags.</p>
        
        <h3>POST /api/tags</h3>
        <p>Create new tag (admin only).</p>
      </div>
      
      <div class="section">
        <h2>User Profiles</h2>
        <p>Manage user profiles and activity.</p>
        
        <h3>GET /api/users/[username]</h3>
        <p>Get user profile information.</p>
        
        <h3>GET /api/users/[username]/posts</h3>
        <p>Get posts by specific user.</p>
        
        <h3>PUT /api/profile</h3>
        <p>Update current user profile.</p>
        
        <h3>POST /api/profile/picture</h3>
        <p>Upload profile picture.</p>
      </div>
      
      <div class="section">
        <h2>Error Responses</h2>
        <p>All API endpoints return consistent error responses:</p>
        <pre><code>{
  "error": "string",
  "message": "string",
  "status": number
}</code></pre>
        
        <h3>Common Status Codes</h3>
        <ul>
          <li><strong>200:</strong> Success</li>
          <li><strong>201:</strong> Created</li>
          <li><strong>400:</strong> Bad Request</li>
          <li><strong>401:</strong> Unauthorized</li>
          <li><strong>403:</strong> Forbidden</li>
          <li><strong>404:</strong> Not Found</li>
          <li><strong>500:</strong> Internal Server Error</li>
        </ul>
      </div>
    `;

    const pdfBuffer = await PDFService.createSimplePDF(
      "API Reference - bountyhub",
      apiReferenceContent,
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
        "Content-Disposition": "attachment; filename=api-reference.pdf",
      },
    });
  } catch (error) {
    console.error("Error generating API reference PDF:", error);
    return new Response(JSON.stringify({ error: "Failed to generate PDF" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
} 
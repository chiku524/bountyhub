import { PDFService } from '../../../src/utils/pdf';

export async function onRequest(context: any) {
  try {
    const refundSystemContent = `
      <div class="section">
        <h2>Refund System Documentation</h2>
        <p>Comprehensive guide to the refund system on bountyhub platform.</p>
      </div>
      
      <div class="section">
        <h2>Overview</h2>
        <p>The refund system on bountyhub provides users with a mechanism to request refunds for bounties that have been attached to questions but may not have received satisfactory answers or where the bounty was awarded inappropriately.</p>
      </div>
      
      <div class="section">
        <h2>When Refunds Can Be Requested</h2>
        <ul>
          <li><strong>No Answers Received:</strong> When a question with a bounty receives no answers within a reasonable timeframe</li>
          <li><strong>Inappropriate Answer Accepted:</strong> When the accepted answer doesn't properly address the question</li>
          <li><strong>Platform Issues:</strong> When technical problems prevent proper functioning</li>
          <li><strong>Duplicate Questions:</strong> When the same question was already answered elsewhere</li>
          <li><strong>Violation of Terms:</strong> When the question or answer violates platform guidelines</li>
        </ul>
      </div>
      
      <div class="section">
        <h2>Refund Request Process</h2>
        <h3>1. Initiating a Refund Request</h3>
        <ul>
          <li>Navigate to the question page where the bounty was attached</li>
          <li>Click on the "Request Refund" button</li>
          <li>Fill out the refund request form with detailed reasoning</li>
          <li>Provide evidence or explanation supporting the refund request</li>
        </ul>
        
        <h3>2. Community Voting</h3>
        <ul>
          <li>Refund requests are made public to the community</li>
          <li>Other users can vote on whether the refund should be granted</li>
          <li>Voting period typically lasts 7 days</li>
          <li>Minimum participation threshold must be met for the vote to be valid</li>
        </ul>
        
        <h3>3. Review Process</h3>
        <ul>
          <li>Platform moderators review the request and community votes</li>
          <li>Additional investigation may be conducted if needed</li>
          <li>Final decision is made based on community consensus and platform policies</li>
        </ul>
      </div>
      
      <div class="section">
        <h2>Voting System</h2>
        <h3>Vote Types</h3>
        <ul>
          <li><strong>Approve Refund:</strong> Vote in favor of granting the refund</li>
          <li><strong>Deny Refund:</strong> Vote against granting the refund</li>
          <li><strong>Abstain:</strong> Choose not to vote on the request</li>
        </ul>
        
        <h3>Voting Requirements</h3>
        <ul>
          <li>Users must have a minimum reputation score to vote</li>
          <li>One vote per user per refund request</li>
          <li>Votes cannot be changed once submitted</li>
          <li>Minimum participation threshold: 10 votes for small bounties, 25 for large bounties</li>
        </ul>
        
        <h3>Decision Criteria</h3>
        <ul>
          <li><strong>Simple Majority:</strong> 51% of votes must approve for refund to be granted</li>
          <li><strong>Super Majority:</strong> 67% approval required for refunds over 1000 BBUX</li>
          <li><strong>Moderator Override:</strong> Platform moderators can override community decision in exceptional cases</li>
        </ul>
      </div>
      
      <div class="section">
        <h2>Refund Processing</h2>
        <h3>Approved Refunds</h3>
        <ul>
          <li>Bounty amount is returned to the original poster's wallet</li>
          <li>Transaction is recorded in the blockchain</li>
          <li>Refund notification is sent to the user</li>
          <li>Question status is updated to reflect the refund</li>
        </ul>
        
        <h3>Denied Refunds</h3>
        <ul>
          <li>Bounty remains with the accepted answer</li>
          <li>Request is marked as denied</li>
          <li>User receives notification explaining the decision</li>
          <li>No further refund requests can be made for the same bounty</li>
        </ul>
      </div>
      
      <div class="section">
        <h2>User Responsibilities</h2>
        <h3>Requesting Users</h3>
        <ul>
          <li>Provide clear, detailed reasoning for the refund request</li>
          <li>Include relevant evidence or documentation</li>
          <li>Respond to community questions and concerns</li>
          <li>Accept the final decision gracefully</li>
        </ul>
        
        <h3>Voting Users</h3>
        <ul>
          <li>Review the request and evidence carefully</li>
          <li>Vote based on platform policies and fairness</li>
          <li>Provide constructive feedback when possible</li>
          <li>Respect the voting process and outcomes</li>
        </ul>
      </div>
      
      <div class="section">
        <h2>Platform Policies</h2>
        <h3>Abuse Prevention</h3>
        <ul>
          <li>Users cannot request refunds for their own accepted answers</li>
          <li>Multiple frivolous refund requests may result in account restrictions</li>
          <li>Attempting to manipulate the voting process is strictly prohibited</li>
          <li>False or misleading information in refund requests may result in penalties</li>
        </ul>
        
        <h3>Appeals Process</h3>
        <ul>
          <li>Users can appeal denied refund requests</li>
          <li>Appeals must include new evidence or information</li>
          <li>Appeals are reviewed by platform moderators</li>
          <li>Final decisions on appeals are binding</li>
        </ul>
      </div>
      
      <div class="section">
        <h2>Technical Implementation</h2>
        <h3>Smart Contract Integration</h3>
        <ul>
          <li>Refund requests are recorded on the Solana blockchain</li>
          <li>Voting results are stored immutably</li>
          <li>Refund transactions are executed automatically upon approval</li>
          <li>All refund activities are transparent and verifiable</li>
        </ul>
        
        <h3>Database Schema</h3>
        <ul>
          <li><strong>refund_requests:</strong> Stores refund request details</li>
          <li><strong>refund_votes:</strong> Records individual votes</li>
          <li><strong>refund_decisions:</strong> Final decisions and outcomes</li>
          <li><strong>refund_transactions:</strong> Blockchain transaction records</li>
        </ul>
      </div>
      
      <div class="section">
        <h2>Best Practices</h2>
        <ul>
          <li><strong>Be Specific:</strong> Provide detailed reasoning for refund requests</li>
          <li><strong>Include Evidence:</strong> Support your request with relevant information</li>
          <li><strong>Be Patient:</strong> Allow time for community review and voting</li>
          <li><strong>Respect Decisions:</strong> Accept outcomes even if they don't go your way</li>
          <li><strong>Follow Guidelines:</strong> Adhere to platform policies and community standards</li>
        </ul>
      </div>
    `;

    const pdfBuffer = await PDFService.createSimplePDF(
      "Refund System Documentation - bountyhub",
      refundSystemContent,
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
        "Content-Disposition": "attachment; filename=refund-system.pdf",
      },
    });
  } catch (error) {
    console.error("Error generating refund system PDF:", error);
    return new Response(JSON.stringify({ error: "Failed to generate PDF" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
} 
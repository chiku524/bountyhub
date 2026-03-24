import { PDFService } from '../../../src/utils/pdf';

export async function onRequest(context: any) {
  try {
    const userGuideContent = `
      <div class="section">
        <h2>Getting Started</h2>
        <p>Welcome to bountyhub! This guide will help you get started with using our decentralized Q&A platform.</p>
      </div>
      
      <div class="section">
        <h2>Creating an Account</h2>
        <ol>
          <li>Click the "Sign Up" button in the top navigation</li>
          <li>Enter your desired username and email address</li>
          <li>Create a strong password</li>
          <li>Verify your email address</li>
          <li>Connect your Solana wallet to start earning rewards</li>
        </ol>
      </div>
      
      <div class="section">
        <h2>Asking Questions</h2>
        <ul>
          <li><strong>Create a Post:</strong> Click "Create Post" to ask a new question</li>
          <li><strong>Add Bounty:</strong> Optionally attach BBUX tokens as a bounty for the best answer</li>
          <li><strong>Use Tags:</strong> Add relevant tags to help others find your question</li>
          <li><strong>Be Specific:</strong> Provide clear, detailed questions for better answers</li>
        </ul>
      </div>
      
      <div class="section">
        <h2>Answering Questions</h2>
        <ul>
          <li><strong>Browse Questions:</strong> Use the search and filter options to find questions</li>
          <li><strong>Provide Quality Answers:</strong> Write detailed, helpful responses</li>
          <li><strong>Use Code Blocks:</strong> Format code properly for better readability</li>
          <li><strong>Vote on Other Answers:</strong> Help maintain content quality</li>
        </ul>
      </div>
      
      <div class="section">
        <h2>Bounty System</h2>
        <p>The bounty system allows users to reward the best answers:</p>
        <ul>
          <li><strong>Setting Bounties:</strong> Attach BBUX tokens when creating a question</li>
          <li><strong>Accepting Answers:</strong> Choose the best answer to award the bounty</li>
          <li><strong>Earning Rewards:</strong> Receive BBUX tokens for accepted answers</li>
          <li><strong>Voting:</strong> Community votes help determine the best answers</li>
        </ul>
      </div>
      
      <div class="section">
        <h2>Wallet Management</h2>
        <ul>
          <li><strong>Connect Wallet:</strong> Link your Solana wallet to receive rewards</li>
          <li><strong>Deposit Funds:</strong> Add BBUX tokens to your account</li>
          <li><strong>Withdraw Earnings:</strong> Transfer earned tokens to your wallet</li>
          <li><strong>View Transactions:</strong> Track all your financial activity</li>
        </ul>
      </div>
      
      <div class="section">
        <h2>Community Guidelines</h2>
        <ul>
          <li><strong>Be Respectful:</strong> Treat other users with courtesy</li>
          <li><strong>Provide Value:</strong> Share knowledge and help others</li>
          <li><strong>Follow Rules:</strong> Adhere to platform guidelines</li>
          <li><strong>Report Issues:</strong> Flag inappropriate content</li>
        </ul>
      </div>
    `;

    const pdfBuffer = await PDFService.createSimplePDF(
      "User Guide - bountyhub",
      userGuideContent,
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
        "Content-Disposition": "attachment; filename=user-guide.pdf",
      },
    });
  } catch (error) {
    console.error("Error generating user guide PDF:", error);
    return new Response(JSON.stringify({ error: "Failed to generate PDF" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
} 
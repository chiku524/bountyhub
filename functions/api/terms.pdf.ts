import { PDFService } from '../../src/utils/pdf';

export async function onRequest(context: any) {
  try {
    const termsContent = `
      <div class="section">
        <h2>Terms of Service</h2>
        <p>Last updated: ${new Date().toLocaleDateString()}</p>
        <p>Welcome to bountyhub. By accessing and using this platform, you agree to be bound by these Terms of Service.</p>
      </div>
      
      <div class="section">
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using bountyhub, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform.</p>
      </div>
      
      <div class="section">
        <h2>2. Description of Service</h2>
        <p>bountyhub is a decentralized Q&A platform built on Solana blockchain technology. The platform allows users to:</p>
        <ul>
          <li>Ask questions and provide answers</li>
          <li>Earn rewards through a bounty system</li>
          <li>Participate in community voting</li>
          <li>Manage digital assets through integrated wallets</li>
        </ul>
      </div>
      
      <div class="section">
        <h2>3. User Accounts</h2>
        <h3>3.1 Account Creation</h3>
        <p>To use certain features of bountyhub, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.</p>
        
        <h3>3.2 Account Security</h3>
        <p>You are responsible for safeguarding the password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.</p>
        
        <h3>3.3 Account Termination</h3>
        <p>We reserve the right to terminate or suspend your account at any time for violations of these Terms of Service.</p>
      </div>
      
      <div class="section">
        <h2>4. User Conduct</h2>
        <p>You agree not to use bountyhub to:</p>
        <ul>
          <li>Violate any applicable laws or regulations</li>
          <li>Infringe upon the rights of others</li>
          <li>Post content that is harmful, offensive, or inappropriate</li>
          <li>Attempt to gain unauthorized access to the platform</li>
          <li>Interfere with the proper functioning of the service</li>
          <li>Engage in spam or other disruptive activities</li>
        </ul>
      </div>
      
      <div class="section">
        <h2>5. Content and Intellectual Property</h2>
        <h3>5.1 User Content</h3>
        <p>You retain ownership of content you post on bountyhub. By posting content, you grant us a worldwide, non-exclusive license to use, display, and distribute your content on the platform.</p>
        
        <h3>5.2 Platform Content</h3>
        <p>The platform, including its design, text, graphics, and software, is owned by bountyhub and is protected by intellectual property laws.</p>
      </div>
      
      <div class="section">
        <h2>6. Bounty System</h2>
        <h3>6.1 Bounty Creation</h3>
        <p>Users may attach bounties to questions using BBUX tokens. By creating a bounty, you agree to award the specified amount to the best answer as determined by community voting or your selection.</p>
        
        <h3>6.2 Bounty Awards</h3>
        <p>Bounties are awarded through smart contracts on the Solana blockchain. Once awarded, transactions are irreversible and subject to blockchain confirmation times.</p>
        
        <h3>6.3 Disputes</h3>
        <p>Disputes regarding bounty awards may be resolved through community voting or platform moderation. Our decisions regarding disputes are final.</p>
      </div>
      
      <div class="section">
        <h2>7. Wallet Integration</h2>
        <h3>7.1 Wallet Connection</h3>
        <p>bountyhub integrates with Solana wallets for transaction management. You are responsible for the security of your wallet and private keys.</p>
        
        <h3>7.2 Transaction Fees</h3>
        <p>Blockchain transactions may incur network fees. These fees are separate from platform fees and are determined by the Solana network.</p>
        
        <h3>7.3 Transaction Risks</h3>
        <p>Cryptocurrency transactions carry inherent risks. We are not responsible for losses due to network issues, wallet security, or market volatility.</p>
      </div>
      
      <div class="section">
        <h2>8. Privacy and Data Protection</h2>
        <p>Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms of Service by reference.</p>
      </div>
      
      <div class="section">
        <h2>9. Disclaimers</h2>
        <p>bountyhub is provided "as is" without warranties of any kind. We disclaim all warranties, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, and non-infringement.</p>
      </div>
      
      <div class="section">
        <h2>10. Limitation of Liability</h2>
        <p>In no event shall bountyhub be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the platform.</p>
      </div>
      
      <div class="section">
        <h2>11. Indemnification</h2>
        <p>You agree to indemnify and hold harmless bountyhub from any claims, damages, or expenses arising from your use of the platform or violation of these Terms of Service.</p>
      </div>
      
      <div class="section">
        <h2>12. Modifications</h2>
        <p>We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting. Your continued use of the platform constitutes acceptance of the modified terms.</p>
      </div>
      
      <div class="section">
        <h2>13. Governing Law</h2>
        <p>These Terms of Service shall be governed by and construed in accordance with the laws of the jurisdiction in which bountyhub operates, without regard to conflict of law principles.</p>
      </div>
      
      <div class="section">
        <h2>14. Contact Information</h2>
        <p>If you have any questions about these Terms of Service, please contact us through the platform's support channels.</p>
      </div>
    `;

    const pdfBuffer = await PDFService.createSimplePDF(
      "Terms of Service - bountyhub",
      termsContent,
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
        "Content-Disposition": "attachment; filename=terms-of-service.pdf",
      },
    });
  } catch (error) {
    console.error("Error generating terms PDF:", error);
    return new Response(JSON.stringify({ error: "Failed to generate PDF" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
} 
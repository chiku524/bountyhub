import { PDFService } from '../../src/utils/pdf';

export async function onRequest(context: any) {
  try {
    const privacyContent = `
      <div class="section">
        <h2>Privacy Policy</h2>
        <p>Last updated: ${new Date().toLocaleDateString()}</p>
        <p>Welcome to bountyhub ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information.</p>
      </div>
      
      <div class="section">
        <h2>1. Information We Collect</h2>
        <h3>1.1 Personal Information</h3>
        <ul>
          <li>Username and email address when you create an account</li>
          <li>Profile information you choose to provide</li>
          <li>Wallet addresses for Solana blockchain integration</li>
          <li>Content you post, including questions, answers, and comments</li>
        </ul>
        
        <h3>1.2 Usage Information</h3>
        <ul>
          <li>IP address and browser information</li>
          <li>Pages visited and time spent on the platform</li>
          <li>Search queries and interactions with content</li>
          <li>Transaction history and wallet activity</li>
        </ul>
        
        <h3>1.3 Technical Information</h3>
        <ul>
          <li>Device information and operating system</li>
          <li>Cookies and similar tracking technologies</li>
          <li>Error logs and performance data</li>
        </ul>
      </div>
      
      <div class="section">
        <h2>2. How We Use Your Information</h2>
        <ul>
          <li><strong>Provide Services:</strong> To operate and maintain the platform</li>
          <li><strong>Process Transactions:</strong> To handle bounty payments and withdrawals</li>
          <li><strong>Improve Platform:</strong> To analyze usage patterns and enhance functionality</li>
          <li><strong>Communicate:</strong> To send notifications and updates</li>
          <li><strong>Ensure Security:</strong> To prevent fraud and abuse</li>
          <li><strong>Comply with Law:</strong> To meet legal obligations</li>
        </ul>
      </div>
      
      <div class="section">
        <h2>3. Information Sharing</h2>
        <h3>3.1 Public Information</h3>
        <p>The following information is publicly visible:</p>
        <ul>
          <li>Username and profile information</li>
          <li>Questions, answers, and comments you post</li>
          <li>Voting activity and reputation scores</li>
          <li>Transaction amounts (but not wallet addresses)</li>
        </ul>
        
        <h3>3.2 Limited Sharing</h3>
        <p>We may share your information in these limited circumstances:</p>
        <ul>
          <li>With your explicit consent</li>
          <li>To comply with legal requirements</li>
          <li>To protect our rights and safety</li>
          <li>With service providers who assist in platform operation</li>
        </ul>
      </div>
      
      <div class="section">
        <h2>4. Data Security</h2>
        <ul>
          <li><strong>Encryption:</strong> All data is encrypted in transit and at rest</li>
          <li><strong>Access Controls:</strong> Strict access controls limit who can view your data</li>
          <li><strong>Regular Audits:</strong> We conduct regular security assessments</li>
          <li><strong>Incident Response:</strong> We have procedures for handling security incidents</li>
        </ul>
      </div>
      
      <div class="section">
        <h2>5. Your Rights</h2>
        <ul>
          <li><strong>Access:</strong> Request a copy of your personal data</li>
          <li><strong>Correction:</strong> Update or correct your information</li>
          <li><strong>Deletion:</strong> Request deletion of your account and data</li>
          <li><strong>Portability:</strong> Export your data in a standard format</li>
          <li><strong>Objection:</strong> Object to certain types of processing</li>
        </ul>
      </div>
      
      <div class="section">
        <h2>6. Cookies and Tracking</h2>
        <p>We use cookies and similar technologies to:</p>
        <ul>
          <li>Maintain your login session</li>
          <li>Remember your preferences</li>
          <li>Analyze platform usage</li>
          <li>Improve user experience</li>
        </ul>
        <p>You can control cookie settings through your browser preferences.</p>
      </div>
      
      <div class="section">
        <h2>7. Third-Party Services</h2>
        <p>We may use third-party services for:</p>
        <ul>
          <li>Analytics and performance monitoring</li>
          <li>Payment processing</li>
          <li>Email delivery</li>
          <li>Cloud infrastructure</li>
        </ul>
        <p>These services have their own privacy policies.</p>
      </div>
      
      <div class="section">
        <h2>8. Data Retention</h2>
        <ul>
          <li><strong>Account Data:</strong> Retained while your account is active</li>
          <li><strong>Content:</strong> May be retained even after account deletion for platform integrity</li>
          <li><strong>Transaction Records:</strong> Retained for legal and audit purposes</li>
          <li><strong>Logs:</strong> Retained for security and debugging purposes</li>
        </ul>
      </div>
      
      <div class="section">
        <h2>9. International Transfers</h2>
        <p>Your data may be processed in countries other than your own. We ensure appropriate safeguards are in place for international data transfers.</p>
      </div>
      
      <div class="section">
        <h2>10. Children's Privacy</h2>
        <p>Our platform is not intended for children under 13. We do not knowingly collect personal information from children under 13.</p>
      </div>
      
      <div class="section">
        <h2>11. Changes to This Policy</h2>
        <p>We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on our platform.</p>
      </div>
      
      <div class="section">
        <h2>12. Contact Us</h2>
        <p>If you have questions about this privacy policy or our data practices, please contact us through the platform's support channels.</p>
      </div>
    `;

    const pdfBuffer = await PDFService.createSimplePDF(
      "Privacy Policy - bountyhub",
      privacyContent,
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
        "Content-Disposition": "attachment; filename=privacy-policy.pdf",
      },
    });
  } catch (error) {
    console.error("Error generating privacy PDF:", error);
    return new Response(JSON.stringify({ error: "Failed to generate PDF" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
} 
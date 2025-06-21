import { json } from "@remix-run/cloudflare";
import { createSimplePDF } from "~/utils/pdf.server";

export async function loader() {
  try {
    const privacyPolicyContent = `
      <div class="section">
        <h2>1. Introduction</h2>
        <p>Welcome to portal.ask ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information.</p>
      </div>
    `;

    const pdfBuffer = await createSimplePDF(
      "Privacy Policy - portal.ask",
      privacyPolicyContent,
      {
        format: 'A4',
        margin: {
          top: '1in',
          right: '1in',
          bottom: '1in',
          left: '1in'
        }
      }
    );

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=privacy-policy.pdf",
      },
    });
  } catch (error) {
    console.error("Error generating privacy PDF:", error);
    return json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}

export default function PrivacyPDF() {
  return null;
}


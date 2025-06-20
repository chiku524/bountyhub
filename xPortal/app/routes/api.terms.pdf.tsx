import { json } from "@remix-run/cloudflare";
import { createSimplePDF } from "~/utils/pdf.server";

export async function loader() {
  try {
    const termsContent = `
      <div class="section">
        <h2>1. Terms of Service</h2>
        <p>Welcome to portal.ask. These Terms of Service govern your use of our platform.</p>
      </div>
    `;

    const pdfBuffer = await createSimplePDF(
      "Terms of Service - portal.ask",
      termsContent,
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
        "Content-Disposition": "inline; filename=terms-of-service.pdf",
      },
    });
  } catch (error) {
    console.error("Error generating terms PDF:", error);
    return json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}


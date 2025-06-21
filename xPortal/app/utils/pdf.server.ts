import { renderToString } from 'react-dom/server';
import React from 'react';
import { createDb } from './db.server';
import { getUser } from './auth.server';
import { type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { eq } from 'drizzle-orm';
import { posts } from '../../drizzle/schema';

export interface PDFOptions {
  format?: 'A4' | 'Letter' | 'Legal';
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  printBackground?: boolean;
  displayHeaderFooter?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
}

export class PDFService {
  private static readonly API_URL = 'https://api.html2pdf.app/v1/generate';

  static async generatePDF(
    htmlContent: string,
    options: PDFOptions = {},
    env?: any
  ): Promise<Uint8Array> {
    const apiKey = env?.HTML2PDF_API_KEY;
    
    if (!apiKey) {
      throw new Error('HTML2PDF_API_KEY environment variable is required for PDF generation');
    }
    
    const requestBody = {
      html: htmlContent,
      format: options.format || 'A4',
      margin: {
        top: options.margin?.top || '1in',
        right: options.margin?.right || '1in',
        bottom: options.margin?.bottom || '1in',
        left: options.margin?.left || '1in'
      },
      printBackground: options.printBackground !== false,
      displayHeaderFooter: options.displayHeaderFooter || false,
      headerTemplate: options.headerTemplate || '',
      footerTemplate: options.footerTemplate || ''
    };

    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`PDF generation failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const pdfArrayBuffer = await response.arrayBuffer();
      return new Uint8Array(pdfArrayBuffer);
    } catch (error) {
      console.error('PDF generation error:', error);
      throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async generatePDFFromReactComponent(
    component: React.ReactElement,
    options: PDFOptions = {},
    env?: any
  ): Promise<Uint8Array> {
    const htmlString = renderToString(component);
    // Create a complete HTML document
    const fullHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Document</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 20px;
            }
            h1, h2, h3, h4, h5, h6 {
              color: #000;
              margin-top: 0;
              page-break-after: avoid;
            }
            p, li {
              color: #333;
              page-break-inside: avoid;
            }
            ul, ol {
              margin: 0;
              padding-left: 20px;
            }
            .page-break {
              page-break-before: always;
            }
            @media print {
              body {
                background: white !important;
                color: black !important;
              }
            }
          </style>
        </head>
        <body>
          ${htmlString}
        </body>
      </html>
    `;
    return this.generatePDF(fullHTML, options, env);
  }

  // Check if PDF generation is available
  static isAvailable(): boolean {
    return true; // Always available since we use a cloud API
  }
}

// Helper function to create a simple PDF from text content
export async function createSimplePDF(
  title: string,
  content: string,
  options: PDFOptions = {},
  env?: any
): Promise<Uint8Array> {
  return PDFService.generatePDF(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          h1 {
            color: #000;
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
            margin-bottom: 30px;
          }
          h2 {
            color: #000;
            margin-top: 30px;
            margin-bottom: 15px;
            page-break-after: avoid;
          }
          h3 {
            color: #000;
            margin-top: 25px;
            margin-bottom: 10px;
          }
          p, li {
            color: #333;
            page-break-inside: avoid;
            margin-bottom: 10px;
          }
          ul, ol {
            margin: 0;
            padding-left: 20px;
          }
          .section {
            margin-bottom: 30px;
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="content">
          ${content}
        </div>
      </body>
    </html>
  `, options, env);
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const typedContext = context as { env: { DB: D1Database; SESSION_SECRET?: string } };
  const db = createDb(typedContext.env.DB);
  const user = await getUser(request, db, typedContext.env);
  
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  // Get user's posts for PDF generation
  const userPosts = await db.query.posts.findMany({
    where: eq(posts.authorId, user.id),
    with: {
      author: true,
      tags: true,
      bounty: true,
    },
  });

  try {
    // Generate PDF content
    const pdfContent = generatePDFContent(userPosts);
    
    // Generate PDF using the new service
    const pdfBuffer = await createSimplePDF(
      `Posts by ${user.username}`,
      pdfContent,
      {
        format: 'A4',
        margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' },
        printBackground: true
      },
      typedContext.env
    );

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="user-posts-${user.username}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Response('Failed to generate PDF', { status: 500 });
  }
}

function generatePDFContent(posts: unknown[]): string {
  if (!posts || posts.length === 0) {
    return '<h2>No posts found</h2><p>This user has not created any posts yet.</p>';
  }

  const postsHtml = posts.map((post: unknown) => {
    const p = post as { 
      title: string; 
      content: string; 
      createdAt: string;
      tags?: Array<{ name: string; color: string }>;
      bounty?: { amount: number; status: string } | null;
    };
    
    const tagsHtml = p.tags && p.tags.length > 0 
      ? `<p><strong>Tags:</strong> ${p.tags.map(tag => `<span style="color: ${tag.color}">${tag.name}</span>`).join(', ')}</p>`
      : '';
    
    const bountyHtml = p.bounty 
      ? `<p><strong>Bounty:</strong> ${p.bounty.amount} BBUX (${p.bounty.status})</p>`
      : '';
    
    return `
      <div class="section">
        <h3>${p.title}</h3>
        <p><strong>Created:</strong> ${new Date(p.createdAt).toLocaleDateString()}</p>
        ${tagsHtml}
        ${bountyHtml}
        <div class="content">
          ${p.content}
        </div>
      </div>
      <hr style="margin: 20px 0;">
    `;
  }).join('');

  return `
    <h1>Posts by User</h1>
    <p><strong>Total Posts:</strong> ${posts.length}</p>
    <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
    <hr style="margin: 20px 0;">
    ${postsHtml}
  `;
} 
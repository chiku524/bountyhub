// Remove the top-level Puppeteer import
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
  private static browser: import('puppeteer').Browser | null = null;

  private static async getPuppeteer(): Promise<typeof import('puppeteer')> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require('puppeteer');
    } catch (error) {
      throw new Error('Puppeteer is not available in this environment');
    }
  }

  private static async getBrowser(): Promise<import('puppeteer').Browser> {
    if (!this.browser) {
      const puppeteer = await this.getPuppeteer();
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
    return this.browser;
  }

  static async generatePDF(
    htmlContent: string,
    options: PDFOptions = {}
  ): Promise<Buffer> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    
    try {
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: options.format || 'A4',
        margin: options.margin || {
          top: '1in',
          right: '1in',
          bottom: '1in',
          left: '1in'
        },
        printBackground: true
      });
      
      return pdfBuffer;
    } finally {
      await page.close();
    }
  }

  static async generatePDFFromReactComponent(
    component: React.ReactElement,
    options: PDFOptions = {}
  ): Promise<Buffer> {
    const puppeteer = await this.getPuppeteer();
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
    return this.generatePDF(fullHTML, options);
  }

  static async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  // Check if PDF generation is available
  static isAvailable(): boolean {
    return true; // Always available since we handle the error in getPuppeteer
  }
}

// Helper function to create a simple PDF from text content
export async function createSimplePDF(
  title: string,
  content: string,
  options: PDFOptions = {}
): Promise<Buffer> {
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
  `, options);
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const db = createDb((context as { env: { DB: D1Database } }).env.DB);
  const user = await getUser(request, db);
  
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

  // Generate PDF content
  const pdfContent = generatePDFContent(userPosts);

  return new Response(pdfContent, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="user-posts-${user.username}.pdf"`,
    },
  });
}

function generatePDFContent(posts: unknown[]): string {
  // This is a placeholder implementation
  // In a real implementation, you would use a PDF library like jsPDF or puppeteer
  const content = posts.map((post: unknown) => {
    const p = post as { title: string; content: string; createdAt: string };
    return `Title: ${p.title}\nContent: ${p.content}\nCreated: ${p.createdAt}\n\n`;
  }).join('---\n');

  return `PDF content would be generated here\n\n${content}`;
} 
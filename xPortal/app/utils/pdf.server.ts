// Conditional import for puppeteer - will be undefined in Workers environment
let puppeteer: any = null;
try {
  puppeteer = require('puppeteer');
} catch (error) {
  // Puppeteer not available in Workers environment
  console.warn('Puppeteer not available in current environment');
}

import { renderToString } from 'react-dom/server';
import React from 'react';

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
  private static browser: any = null;

  private static async getBrowser(): Promise<any> {
    if (!puppeteer) {
      throw new Error('Puppeteer is not available in this environment');
    }
    
    if (!this.browser) {
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
    if (!puppeteer) {
      throw new Error('PDF generation is not available in this environment');
    }

    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      // Set the HTML content
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0'
      });

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: options.format || 'A4',
        margin: options.margin || {
          top: '1in',
          right: '1in',
          bottom: '1in',
          left: '1in'
        },
        printBackground: options.printBackground ?? true,
        displayHeaderFooter: options.displayHeaderFooter ?? false,
        headerTemplate: options.headerTemplate,
        footerTemplate: options.footerTemplate
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await page.close();
    }
  }

  static async generatePDFFromReactComponent(
    component: React.ReactElement,
    options: PDFOptions = {}
  ): Promise<Buffer> {
    if (!puppeteer) {
      throw new Error('PDF generation is not available in this environment');
    }

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
    return puppeteer !== null;
  }
}

// Helper function to create a simple PDF from text content
export async function createSimplePDF(
  title: string,
  content: string,
  options: PDFOptions = {}
): Promise<Buffer> {
  if (!puppeteer) {
    throw new Error('PDF generation is not available in this environment');
  }

  const htmlContent = `
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
          .contact-info {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
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
        <h1>${title}</h1>
        <div class="content">
          ${content}
        </div>
      </body>
    </html>
  `;

  return PDFService.generatePDF(htmlContent, options);
} 
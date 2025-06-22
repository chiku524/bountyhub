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
    apiKey?: string
  ): Promise<Uint8Array> {
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

    console.log('PDF Service: Starting PDF generation with API key:', apiKey ? 'Present' : 'Missing');
    console.log('PDF Service: Request body:', JSON.stringify(requestBody, null, 2));

    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('PDF Service: Response status:', response.status);
      console.log('PDF Service: Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('PDF Service: Error response:', errorText);
        throw new Error(`PDF generation failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const pdfArrayBuffer = await response.arrayBuffer();
      console.log('PDF Service: PDF generated successfully, size:', pdfArrayBuffer.byteLength, 'bytes');
      return new Uint8Array(pdfArrayBuffer);
    } catch (error) {
      console.error('PDF Service: Generation error:', error);
      throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Helper function to create a simple PDF from text content
  static async createSimplePDF(
    title: string,
    content: string,
    options: PDFOptions = {},
    apiKey?: string
  ): Promise<Uint8Array> {
    console.log('PDF Service: Creating simple PDF with title:', title);
    console.log('PDF Service: Content length:', content.length, 'characters');
    
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
            code {
              background-color: #f4f4f4;
              padding: 2px 4px;
              border-radius: 3px;
              font-family: 'Courier New', monospace;
            }
            pre {
              background-color: #f4f4f4;
              padding: 15px;
              border-radius: 5px;
              overflow-x: auto;
              margin: 15px 0;
            }
            .highlight {
              background-color: #fff3cd;
              padding: 10px;
              border-left: 4px solid #ffc107;
              margin: 15px 0;
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

    return this.generatePDF(htmlContent, options, apiKey);
  }
} 
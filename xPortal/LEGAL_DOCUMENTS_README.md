# Legal Documents - Privacy Policy & Terms of Service

This document describes the privacy policy and terms of service functionality implemented in portal.ask.

## Overview

The application now includes comprehensive privacy policy and terms of service pages with PDF download capabilities. These documents are essential for legal compliance and user transparency.

## Features

### 1. Privacy Policy (`/privacy`)
- **Route**: `/privacy`
- **PDF Download**: `/api/privacy.pdf`
- **Content**: Comprehensive privacy policy covering data collection, usage, sharing, and user rights
- **Features**:
  - Viewable online with proper formatting
  - Downloadable as PDF
  - Print-friendly version
  - Responsive design

### 2. Terms of Service (`/terms`)
- **Route**: `/terms`
- **PDF Download**: `/api/terms.pdf`
- **Content**: Complete terms of service covering user conduct, intellectual property, and legal obligations
- **Features**:
  - Viewable online with proper formatting
  - Downloadable as PDF
  - Print-friendly version
  - Responsive design

## Technical Implementation

### PDF Generation
- **Library**: Puppeteer for server-side PDF generation
- **Utility**: `app/utils/pdf.server.ts`
- **API Routes**: 
  - `app/routes/api.privacy.pdf.tsx`
  - `app/routes/api.terms.pdf.tsx`

### Styling
- **Print Styles**: Enhanced CSS for PDF generation and printing
- **Responsive Design**: Works on all device sizes
- **Brand Consistency**: Matches portal.ask design system

### Navigation
- **Footer Links**: Both documents are accessible from the footer
- **Public Access**: Documents are publicly accessible (no authentication required)
- **SEO Friendly**: Proper meta tags and structure

## Content Sections

### Privacy Policy
1. Introduction
2. Information We Collect
   - Personal Information
   - Usage Information
   - Blockchain Data
3. How We Use Your Information
4. Information Sharing and Disclosure
5. Data Security
6. Your Rights and Choices
7. Cookies and Tracking
8. Third-Party Services
9. Children's Privacy
10. International Data Transfers
11. Changes to This Policy
12. Contact Us
13. Governing Law

### Terms of Service
1. Acceptance of Terms
2. Description of Service
3. User Accounts and Registration
4. User Conduct and Responsibilities
5. Virtual Currency and Transactions
6. Intellectual Property Rights
7. Privacy and Data Protection
8. Disclaimers and Limitations
9. Indemnification
10. Termination
11. Governing Law and Disputes
12. Changes to Terms
13. Severability
14. Entire Agreement
15. Contact Information

## Usage

### For Users
1. **View Online**: Visit `/privacy` or `/terms`
2. **Download PDF**: Click "Download PDF" button
3. **Print**: Click "Print" button or use browser print function

### For Developers
1. **Update Content**: Modify the content in the respective route files
2. **Regenerate PDFs**: The PDFs are generated dynamically from the content
3. **Customize Styling**: Update the CSS in `tailwind.css` for print styles

## Legal Considerations

### Important Notes
- **Review Required**: These documents should be reviewed by legal professionals
- **Jurisdiction**: Update governing law section based on your jurisdiction
- **Contact Information**: Ensure contact details are current
- **Regular Updates**: Review and update documents regularly

### Compliance
- **GDPR**: Privacy policy includes GDPR-compliant sections
- **COPPA**: Terms include age restrictions for children
- **Blockchain**: Special considerations for blockchain data
- **International**: Addresses international data transfers

## Maintenance

### Regular Tasks
1. **Content Review**: Quarterly review of both documents
2. **Contact Updates**: Keep contact information current
3. **Legal Review**: Annual legal review by professionals
4. **Version Tracking**: Track document versions and changes

### Update Process
1. Modify content in route files
2. Test PDF generation
3. Update "Last updated" date
4. Notify users of changes (if required)
5. Archive previous versions

## Dependencies

### Required Packages
```json
{
  "puppeteer": "^latest",
  "html-pdf-node": "^latest"
}
```

### Installation
```bash
npm install puppeteer html-pdf-node
```

## Troubleshooting

### Common Issues
1. **PDF Generation Fails**: Check Puppeteer installation and browser dependencies
2. **Print Styles Not Working**: Ensure CSS is properly loaded
3. **Content Not Updating**: Clear cache and restart development server

### Performance
- PDF generation may take a few seconds on first request
- Consider caching generated PDFs for production
- Monitor server resources during PDF generation

## Future Enhancements

### Potential Improvements
1. **Version Control**: Track document versions and changes
2. **User Acceptance**: Track when users accept terms
3. **Multi-language**: Support for multiple languages
4. **Digital Signatures**: Add digital signature capabilities
5. **Automated Updates**: Automated notification of changes

### Integration Ideas
1. **User Registration**: Require acceptance during signup
2. **Email Notifications**: Notify users of policy changes
3. **Analytics**: Track document views and downloads
4. **A/B Testing**: Test different policy versions

## Support

For technical issues or questions about the legal documents:
- **Email**: bountybucks524@gmail.com
- **Platform**: portal.ask
- **Documentation**: This README file

---

**Note**: This documentation is for technical implementation only. Legal advice should be sought for the actual content and compliance requirements of your privacy policy and terms of service. 
// Script to convert logo.svg to PNG and ICO formats
// Requires: npm install sharp (or use cloudconvert if preferred)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Note: This script requires the 'sharp' package for image conversion
// If sharp is not available, use cloudconvert.com or another service

const logoPath = path.join(__dirname, '../public/logo.svg');
const outputDir = path.join(__dirname, '../public');

async function convertLogo() {
  try {
    // Check if sharp is available
    let sharp;
    try {
      sharp = (await import('sharp')).default;
    } catch (e) {
      console.log('⚠️  sharp package not found. Please install it:');
      console.log('   npm install --save-dev sharp');
      console.log('\n📝 Alternative: Use cloudconvert.com to convert logo.svg to:');
      console.log('   - logo.png (256x256)');
      console.log('   - logo-light.png (256x256) - same as logo.png');
      console.log('   - logo-dark.png (256x256) - same as logo.png');
      console.log('   - favicon.ico (32x32)');
      console.log('\nThen replace the existing files in /public directory.');
      return;
    }

    // Read SVG
    const svgBuffer = fs.readFileSync(logoPath);
    
    // Convert to PNG (256x256)
    const png256 = await sharp(svgBuffer)
      .resize(256, 256)
      .png()
      .toBuffer();
    
    // Convert to ICO (32x32)
    const ico32 = await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toBuffer();
    
    // Write files
    fs.writeFileSync(path.join(outputDir, 'logo.png'), png256);
    fs.writeFileSync(path.join(outputDir, 'logo-light.png'), png256);
    fs.writeFileSync(path.join(outputDir, 'logo-dark.png'), png256);
    fs.writeFileSync(path.join(outputDir, 'favicon.ico'), ico32);
    
    console.log('✅ Logo conversion complete!');
    console.log('   - logo.png (256x256)');
    console.log('   - logo-light.png (256x256)');
    console.log('   - logo-dark.png (256x256)');
    console.log('   - favicon.ico (32x32)');
  } catch (error) {
    console.error('❌ Error converting logo:', error);
    console.log('\n📝 Alternative: Use cloudconvert.com to convert logo.svg');
  }
}

convertLogo();


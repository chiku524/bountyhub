#!/usr/bin/env node
/**
 * Generate brand raster images from public/*.svg (logo, og-image, social banners).
 * Run: node scripts/generate-brand-images.js
 * Requires: sharp (npm i -D sharp)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const publicDir = path.join(root, 'public');

async function main() {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.warn('Install sharp: npm i -D sharp');
    process.exit(1);
  }

  const outputs = [];

  // Logo: multiple sizes for web, PWA, etc. (normalize line endings for sharp)
  const logoPath = path.join(publicDir, 'logo.svg');
  if (fs.existsSync(logoPath)) {
    const logoSvg = fs.readFileSync(logoPath, 'utf8').replace(/\r\n/g, '\n');
    const logoBuf = Buffer.from(logoSvg, 'utf8');
    for (const size of [192, 512, 1024]) {
      const name = `logo-${size}.png`;
      await sharp(logoBuf).resize(size, size).png().toFile(path.join(publicDir, name));
      outputs.push(name);
    }
    const jpgName = 'logo-1024.jpg';
    await sharp(logoBuf).resize(1024, 1024).jpeg({ quality: 92 }).toFile(path.join(publicDir, jpgName));
    outputs.push(jpgName);
    // iOS / Safari “Add to Home Screen” (recommended 180×180)
    await sharp(logoBuf).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
    outputs.push('apple-touch-icon.png');
    await sharp(logoBuf).resize(32, 32).png().toFile(path.join(publicDir, 'favicon-32.png'));
    outputs.push('favicon-32.png');
  }

  // OG / social share (1200x630) - read as UTF-8 buffer to avoid encoding issues
  const ogPath = path.join(publicDir, 'og-image.svg');
  if (fs.existsSync(ogPath)) {
    const ogSvg = fs.readFileSync(ogPath, 'utf8').replace(/\r\n/g, '\n');
    const ogBuf = Buffer.from(ogSvg, 'utf8');
    await sharp(ogBuf).resize(1200, 630).png().toFile(path.join(publicDir, 'og-image.png'));
    await sharp(ogBuf).resize(1200, 630).jpeg({ quality: 90 }).toFile(path.join(publicDir, 'og-image.jpg'));
    outputs.push('og-image.png', 'og-image.jpg');
  }

  // Social banner (1500x500)
  const bannerPath = path.join(publicDir, 'social-banner.svg');
  if (fs.existsSync(bannerPath)) {
    const bannerSvg = fs.readFileSync(bannerPath, 'utf8').replace(/\r\n/g, '\n');
    const bannerBuf = Buffer.from(bannerSvg, 'utf8');
    await sharp(bannerBuf).resize(1500, 500).png().toFile(path.join(publicDir, 'social-banner.png'));
    await sharp(bannerBuf).resize(1500, 500).jpeg({ quality: 90 }).toFile(path.join(publicDir, 'social-banner.jpg'));
    outputs.push('social-banner.png', 'social-banner.jpg');
  }

  // Social square (1080x1080)
  const squarePath = path.join(publicDir, 'social-square.svg');
  if (fs.existsSync(squarePath)) {
    const squareSvg = fs.readFileSync(squarePath, 'utf8').replace(/\r\n/g, '\n');
    const squareBuf = Buffer.from(squareSvg, 'utf8');
    await sharp(squareBuf).resize(1080, 1080).png().toFile(path.join(publicDir, 'social-square.png'));
    await sharp(squareBuf).resize(1080, 1080).jpeg({ quality: 90 }).toFile(path.join(publicDir, 'social-square.jpg'));
    outputs.push('social-square.png', 'social-square.jpg');
  }

  console.log('Generated brand images in public/:', outputs.join(', '));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

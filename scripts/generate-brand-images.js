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

/** Pull defs inner HTML + body from logo.svg for embedding in marketing SVGs. */
function parseLogoForEmbed(logoSvg) {
  const d = logoSvg.match(/<defs>\s*([\s\S]*?)\s*<\/defs>/);
  const b = logoSvg.match(/<\/defs>\s*([\s\S]*?)\s*<\/svg>/);
  if (!d || !b) return null;
  return { defs: d[1].trim(), body: b[1].trim() };
}

function prefixLogoIds(fragment, prefix) {
  return fragment.replace(/\blx-/g, `${prefix}-`);
}

function indentBlock(text, spaces) {
  const pad = ' '.repeat(spaces);
  return text
    .split('\n')
    .map((line) => (line.trim() ? pad + line : line))
    .join('\n');
}

function rebuildMarketingDefs(tpl, logoDefsIndented, includeAccent) {
  const bgMatch = tpl.match(/<linearGradient id="bg"[\s\S]*?<\/linearGradient>/);
  if (!bgMatch) return null;
  let accent = '';
  if (includeAccent) {
    const a = tpl.match(/<linearGradient id="accent"[\s\S]*?<\/linearGradient>/);
    if (a) accent = `\n    ${a[0]}`;
  }
  return `<defs>\n    ${bgMatch[0]}${accent}\n${logoDefsIndented}\n  </defs>`;
}

/**
 * Keep favicon.svg and marketing SVGs aligned with public/logo.svg (single source of truth).
 */
function syncSvgAssetsFromLogo(logoSvgRaw) {
  const logoSvg = logoSvgRaw.replace(/\r\n/g, '\n');
  const parts = parseLogoForEmbed(logoSvg);
  if (!parts) {
    console.warn('syncSvgAssetsFromLogo: could not parse logo.svg');
    return;
  }

  const faviconPath = path.join(publicDir, 'favicon.svg');
  const faviconSvg = logoSvg.replace(/width="64" height="64"/, 'width="32" height="32"');
  fs.writeFileSync(faviconPath, faviconSvg, 'utf8');

  const templates = [
    {
      file: 'og-image.svg',
      idPrefix: 'oglx',
      includeAccent: false,
      gRe: /<g transform="translate\(420, 100\) scale\(5\.625\)">[\s\S]*?<\/g>/,
    },
    {
      file: 'social-square.svg',
      idPrefix: 'sqlx',
      includeAccent: true,
      gRe: /<g transform="translate\(358, 280\) scale\(5\.7\)">[\s\S]*?<\/g>/,
    },
    {
      file: 'social-banner.svg',
      idPrefix: 'bnlx',
      includeAccent: true,
      gRe: /<g transform="translate\(120, 125\) scale\(3\.9\)">[\s\S]*?<\/g>/,
    },
  ];

  for (const { file, idPrefix, includeAccent, gRe } of templates) {
    const p = path.join(publicDir, file);
    if (!fs.existsSync(p)) continue;
    let tpl = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
    const newDefsInner = indentBlock(prefixLogoIds(parts.defs, idPrefix), 4);
    const defsSection = rebuildMarketingDefs(tpl, newDefsInner, includeAccent);
    if (!defsSection) continue;
    tpl = tpl.replace(/<defs>[\s\S]*?<\/defs>/, defsSection);
    const transformMatch = tpl.match(gRe);
    if (!transformMatch) continue;
    const innerTransform = transformMatch[0].match(/transform="([^"]+)"/)?.[1];
    if (!innerTransform) continue;
    const newG = `<g transform="${innerTransform}">\n${indentBlock(prefixLogoIds(parts.body, idPrefix), 4)}\n  </g>`;
    tpl = tpl.replace(gRe, newG);
    fs.writeFileSync(p, tpl, 'utf8');
  }
}

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
    syncSvgAssetsFromLogo(logoSvg);
    outputs.push('favicon.svg');
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

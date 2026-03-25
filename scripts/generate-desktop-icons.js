#!/usr/bin/env node
/**
 * Generate Tauri desktop app icons from public/logo.svg (`tauri icon` → icon.ico, icon.icns,
 * PNG sizes, Windows Appx assets, tray `icon.png`, etc.). Invoked by `npm run desktop:icons`
 * and at the start of `npm run desktop:build` so installers and shortcuts always match the web logo.
 * Requires: sharp (devDependency)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const logoPath = path.join(root, 'public', 'logo.svg');
const outDir = path.join(root, 'src-tauri', 'icons');
const sourcePng = path.join(outDir, '1024x1024.png');

async function main() {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.warn('Install sharp (npm i -D sharp) and re-run, or export logo to PNG and run: npm run tauri icon path/to/logo.png');
    return;
  }
  if (!fs.existsSync(logoPath)) {
    console.warn('public/logo.svg not found.');
    return;
  }
  fs.mkdirSync(outDir, { recursive: true });
  await sharp(logoPath).resize(1024, 1024).png().toFile(sourcePng);
  console.log('Generated 1024x1024.png from logo.svg.');
  execSync(`npx tauri icon "${sourcePng}"`, { cwd: root, stdio: 'inherit' });
  console.log('Tauri icons written to src-tauri/icons');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

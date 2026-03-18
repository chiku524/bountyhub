#!/usr/bin/env node
/**
 * Create patches/wry with wry 0.24.11 source + one-line fix for Linux:
 * add "use webkit2gtk::SettingsExt;" so the trait is in scope.
 * Run before desktop build so [patch.crates-io] in src-tauri/Cargo.toml can resolve.
 * (.cjs for CommonJS under package.json "type": "module")
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WRY_VERSION = '0.24.11';
const ROOT = path.resolve(__dirname, '..');
const PATCHES_DIR = path.join(ROOT, 'patches');
const WRY_DIR = path.join(PATCHES_DIR, 'wry');
const MOD_RS = path.join(WRY_DIR, 'src', 'webview', 'webkitgtk', 'mod.rs');

if (fs.existsSync(WRY_DIR)) {
  console.log('patches/wry already exists, skipping');
  process.exit(0);
}

console.log('Downloading wry', WRY_VERSION, '...');
const tarballUrl = `https://static.crates.io/crates/wry/wry-${WRY_VERSION}.crate`;
const tarballPath = path.join(PATCHES_DIR, 'wry.tar.gz');
fs.mkdirSync(PATCHES_DIR, { recursive: true });

execSync(`curl -sL "${tarballUrl}" -o "${tarballPath}"`, { stdio: 'inherit', cwd: ROOT });
execSync(`tar xzf "${tarballPath}" -C "${PATCHES_DIR}"`, { stdio: 'inherit', cwd: ROOT });
const extracted = path.join(PATCHES_DIR, `wry-${WRY_VERSION}`);
if (fs.existsSync(extracted)) {
  fs.renameSync(extracted, WRY_DIR);
} else {
  const dirs = fs.readdirSync(PATCHES_DIR).filter((d) => d.startsWith('wry'));
  if (dirs.length !== 1) throw new Error('Expected one wry-* directory in patches/');
  fs.renameSync(path.join(PATCHES_DIR, dirs[0]), WRY_DIR);
}
fs.unlinkSync(tarballPath);

let content = fs.readFileSync(MOD_RS, 'utf8');
if (content.includes('SettingsExt')) {
  console.log('SettingsExt already present');
} else {
  // Insert after the first "use webkit2gtk" line so SettingsExt is in scope for settings.* calls
  const newContent = content.replace(
    /^(use webkit2gtk[^;]+;)/m,
    '$1\nuse webkit2gtk::SettingsExt;'
  );
  if (newContent === content) {
    content = content.replace(/^(\s*)(use [^\n]+;)/m, '$1$2\n$1use webkit2gtk::SettingsExt;');
  } else {
    content = newContent;
  }
  fs.writeFileSync(MOD_RS, content);
  console.log('Patched', MOD_RS);
}

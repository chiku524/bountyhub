#!/usr/bin/env node
/**
 * Create patches/wry with wry 0.24.11 source + one-line fix for Linux:
 * add "use webkit2gtk::SettingsExt;" so the trait is in scope.
 * Run before desktop build so [patch.crates-io] in src-tauri/Cargo.toml can resolve.
 *
 * Uses Node only for download and extraction so it works on Windows, macOS, and Linux
 * (no reliance on curl/tar which can fail on Windows paths).
 * (.cjs for CommonJS under package.json "type": "module")
 */
const fs = require('fs');
const path = require('path');
const tar = require('tar');

const WRY_VERSION = '0.24.11';
const ROOT = path.resolve(__dirname, '..');
const PATCHES_DIR = path.join(ROOT, 'patches');
const WRY_DIR = path.join(PATCHES_DIR, 'wry');
const MOD_RS = path.join(WRY_DIR, 'src', 'webview', 'webkitgtk', 'mod.rs');

if (fs.existsSync(WRY_DIR)) {
  console.log('patches/wry already exists, skipping');
  process.exit(0);
}

async function main() {
  console.log('Downloading wry', WRY_VERSION, '...');
  const tarballUrl = `https://static.crates.io/crates/wry/wry-${WRY_VERSION}.crate`;
  const tarballPath = path.join(PATCHES_DIR, 'wry.tar.gz');
  fs.mkdirSync(PATCHES_DIR, { recursive: true });

  const res = await fetch(tarballUrl);
  if (!res.ok) {
    throw new Error(`Failed to download wry: ${res.status} ${res.statusText}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(tarballPath, buf);

  await tar.x({
    file: tarballPath,
    cwd: PATCHES_DIR,
  });

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
    const newContent = content.replace(
      /^(use webkit2gtk[^;]+;)/m,
      '$1\nuse webkit2gtk::SettingsExt;'
    );
    if (newContent !== content) {
      content = newContent;
    } else {
      content = content.replace(
        /^(\s*)(use [^\n]+;)/m,
        '$1$2\n$1use webkit2gtk::SettingsExt;'
      );
    }
    fs.writeFileSync(MOD_RS, content);
    console.log('Patched', MOD_RS);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

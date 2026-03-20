#!/usr/bin/env node
/**
 * Set version in package.json and src-tauri/tauri.conf.json from the release tag.
 * Used in desktop-release workflow so the built installer filename matches the tag
 * (e.g. tag v1.1.17 → version 1.1.17 → BountyHub_1.1.17_x64-setup.exe).
 *
 * Usage: node scripts/set-version-from-tag.cjs [tag]
 *   tag: e.g. v1.1.17 or 1.1.17 (leading 'v' is stripped)
 *   If omitted, reads from env VERSION or GITHUB_REF (refs/tags/v1.1.17).
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const packagePath = path.join(root, 'package.json');
const tauriConfPath = path.join(root, 'src-tauri', 'tauri.conf.json');

let raw = process.argv[2] || process.env.VERSION || process.env.GITHUB_REF || '';
if (raw.startsWith('refs/tags/')) raw = raw.slice('refs/tags/'.length);
const version = raw.startsWith('v') ? raw.slice(1) : raw;

if (!version || !/^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?$/.test(version)) {
  console.error('Usage: node scripts/set-version-from-tag.cjs <tag>');
  console.error('Example: node scripts/set-version-from-tag.cjs v1.1.17');
  console.error('Or set env VERSION=1.1.17 or GITHUB_REF=refs/tags/v1.1.17');
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
pkg.version = version;
fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n');
console.log('Set package.json version to', version);

const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf8'));
if (!tauriConf.package) tauriConf.package = {};
tauriConf.package.version = version;
fs.writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + '\n');
console.log('Set tauri.conf.json package.version to', version);

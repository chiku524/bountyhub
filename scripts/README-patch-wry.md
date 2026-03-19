# Patch wry for Linux (webkit2gtk SettingsExt)

## Purpose

Creates `patches/wry` from the [wry](https://crates.io/crates/wry) 0.24.11 crate source and applies a one-line fix required for the Linux build: adding `use webkit2gtk::SettingsExt;` so the trait is in scope. This allows the `[patch.crates-io]` entry in `src-tauri/Cargo.toml` to resolve and the Tauri desktop app to build on Linux.

## Usage

The script runs automatically before every desktop build:

```bash
npm run desktop:build
```

To run only the patch step (e.g. to refresh the patched crate):

```bash
node scripts/patch-wry-linux.cjs
```

If `patches/wry` already exists, the script skips download and extraction and only ensures the source patch is applied.

## Cross-platform behavior

The script uses **only Node.js** for download and extraction so it works the same on **Windows, macOS, and Linux**:

- **Download**: Node’s built-in `fetch()` is used to download the `.crate` file from crates.io. No `curl` or system HTTP client is required.
- **Extract**: The [tar](https://www.npmjs.com/package/tar) npm package (devDependency) is used to unpack the gzipped tarball. No system `tar` or `gzip` is required.

This avoids failures on Windows where:

- System `tar` can misinterpret paths like `C:\...` (e.g. “Cannot connect to C: resolve failed”).
- `curl` may refer to a different implementation or corrupt binary downloads.

CI (e.g. GitHub Actions) and local builds on all three OSes use the same script and behavior.

## Files

- **Script**: `scripts/patch-wry-linux.cjs`
- **Output**: `patches/wry/` (gitignored; created by the script)
- **Patch target**: `patches/wry/src/webview/webkitgtk/mod.rs` (adds `use webkit2gtk::SettingsExt;`)

## Dependencies

- Node.js ≥ 20 (for `fetch` and project engines)
- Dev dependency: `tar` (see `package.json`)

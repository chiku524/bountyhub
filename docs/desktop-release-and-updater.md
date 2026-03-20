# Desktop app: release and auto-update

## Workflow overview

- **File:** `.github/workflows/desktop-release.yml`
- **Trigger:** Push a tag matching `v*` (e.g. `v1.1.0`).
- **What it does:**
  1. Creates a GitHub Release for that tag (with auto-generated release notes).
  2. Builds the Tauri desktop app on **Windows**, **macOS Intel (x86_64)**, **macOS Apple Silicon (aarch64)**, and **Linux**.
  3. Uploads installers and update bundles (`.exe`, `.dmg`, `.AppImage`, `.deb`, `.zip`, `.tar.gz`, `.sig`) to the release.
  4. Generates `latest.json` (Tauri updater manifest) from the release assets and uploads it to the same release.

## Releasing a new version

1. Bump version in `package.json` and `src-tauri/tauri.conf.json` (e.g. `1.1.0`).
2. Commit, then create and push the tag:
   ```bash
   git tag -a v1.1.0 -m "Release v1.1.0"
   git push origin v1.1.0
   ```
3. The workflow runs automatically. When it finishes, the GitHub Release will have:
   - Windows: `.exe`, `.nsis.zip`, `.sig`
   - macOS Intel: `.dmg`, `.app.tar.gz`, `.sig`
   - macOS Apple Silicon: `.dmg`, `.app.tar.gz`, `.sig`
   - Linux: `.AppImage`, `.AppImage.tar.gz`, `.sig`, `.deb`
   - `latest.json` (used by the in-app updater)

## Auto-update (all 3 OS)

The desktop app uses Tauri’s built-in updater:

- **Config:** `src-tauri/tauri.conf.json` → `tauri.updater`
- **Endpoint:** `https://github.com/chiku524/bountyhub/releases/latest/download/latest.json`
- **Behaviour:** The app fetches that URL; if the `version` in the JSON is greater than the installed version, it offers to download and install the update for the current platform (`windows-x86_64`, `darwin-x86_64`, `darwin-aarch64`, or `linux-x86_64`). On Windows, the installer runs in **quiet** mode (no separate installer window); only the in-app frameless overlay shows progress. If the app is installed to a location requiring admin (e.g. `C:\Program Files`), switch `tauri.updater.windows.installMode` to `"passive"` so the installer can request elevation.

So **Windows, macOS (Intel and Apple Silicon), and Linux** all get auto-updates as long as:

- The release was built by the workflow (all four matrix jobs ran).
- `TAURI_PRIVATE_KEY` (and optionally `TAURI_KEY_PASSWORD`) is set in GitHub Actions secrets so builds produce signed `.sig` files.
- `latest.json` was generated and uploaded (done by the workflow).

## Required secrets

- **`TAURI_PRIVATE_KEY`:** Private key used to sign update bundles (e.g. contents of `.tauri/bountyhub.key`). Generate with:  
  `npm run tauri signer generate -- -w .tauri/bountyhub.key`
- **`TAURI_KEY_PASSWORD`:** (Optional) Password for the private key if you set one.

Without `TAURI_PRIVATE_KEY`, the build still runs but no `.sig` files are produced, so `latest.json` will be missing signatures and the in-app updater will not install updates.

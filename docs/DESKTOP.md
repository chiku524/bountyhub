# BountyHub Desktop App (Tauri)

The same BountyHub web app runs as a **desktop application** using [Tauri](https://tauri.app/). Tauri uses your OS webview (WebView2 on Windows, WebKit on macOS/Linux) and a small Rust binary, so the app is much smaller and lighter than an Electron build.

**Production:** The desktop app talks to `https://api.bountyhub.tech` when built for production. Official installers are built by GitHub Actions when you publish a release (see below). Set `VITE_GITHUB_RELEASES_URL` (e.g. `https://github.com/your-org/bountyhub/releases/latest`) in your site env so the [Download](/download) page links to the latest release.

**Download page (private repo):** The Download page fetches release assets via the API at `/api/releases/latest`, which uses a GitHub PAT so private repos work. Set the PAT as a Cloudflare secret: `wrangler secret put GITHUB_PAT` (paste the token when prompted). For local dev, copy `.dev.vars.example` to `.dev.vars` and set `GITHUB_PAT=your_token`. The repo is configured in `wrangler.workers.toml` as `GITHUB_RELEASES_REPO` (default `chiku524/bountyhub`).

## Prerequisites

- **Node.js 20+** (already used for the web app)
- **Rust** – [install from rustup.rs](https://rustup.rs/)
- **Platform:**
  - **Windows:** [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) (usually already installed with Edge)
  - **macOS:** Xcode Command Line Tools (`xcode-select --install`)
  - **Linux:** `webkit2gtk`, `libayatana-appindicator3`, and build tools (see [Tauri 2 prerequisites](https://tauri.app/start/prerequisites/))

## Commands

| Command | Description |
|--------|-------------|
| `npm run desktop` | Start the app in development (Vite dev server + Tauri window) |
| `npm run desktop:build` | Regenerate icons from `public/logo.svg`, then build production installers (.exe, .dmg, .AppImage). Needs `sharp`. |
| `npm run desktop:icons` | Regenerate `src-tauri/icons/*` from `public/logo.svg` only (same as the first step of `desktop:build`) |

## First-time setup

1. Install Rust: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
2. (Optional) Generate app icons: `npm run desktop:icons`. If you skip this, use a 1024×1024 PNG: `npm run tauri icon path/to/logo.png`
3. Run the desktop app: `npm run desktop`

The first `npm run desktop` or `npm run desktop:build` will compile the Rust side (may take a few minutes).

## How it works

- **Development:** Tauri opens a window that loads the Vite dev URL from `src-tauri/tauri.conf.json` (default `http://localhost:5173`). Start the API separately with `npm run dev:api` if you need the backend.
- **Production build:** Runs `npm run build`, then bundles the `dist/` output into a native executable and installer. The app talks to your deployed API (`https://api.bountyhub.tech`) by default.

## Single instance, tray, and shortcuts

There is **no native menu bar** (File / View / Help) — the window is chrome-focused. Use the **tray icon** and keyboard shortcuts instead.

- **Second launch:** If BountyHub is already running, starting it again raises the existing window (localhost `127.0.0.1:45287`).
- **Tray:** Open BountyHub, **Settings…**, **Reload**, **About**, **Check for Updates**, **Log out**, **Quit**.
- **Shortcuts:** **Cmd/Ctrl+,** → Settings (Desktop app tab). **Cmd/Ctrl+Q** → Quit. **Cmd/Ctrl+Shift+I** (dev only) → developer tools.
- **Sidebar:** When signed in, the left sidebar shows your username and a **Log out** button.
- **Settings:** **Settings → Desktop app** shows native/UI versions, **Check for updates**, and release notes.

## Why Tauri instead of Electron?

| | Tauri | Electron |
|--|--------|----------|
| **Size** | ~5–15 MB | ~150–200 MB |
| **Memory** | 50–100 MB | 300–500 MB |
| **Backend** | Rust (small, fast) | Node.js + Chromium |
| **Security** | Smaller attack surface, system webview | Full Chromium bundle |

You can still use **Electron** if you prefer; the same `dist/` build can be loaded in an Electron window. For most cases, Tauri is the modern default.

---

## Signing and auto-updates (one-time)

The app checks for updates on startup and can install them automatically (Tauri’s built-in updater). Signed updates are required for the updater to install new builds.

1. **Generate a key pair** (once):  
   `npm run tauri signer generate -- -w .tauri/bountyhub.key`  
   This creates `.tauri/bountyhub.key` (private) and `.tauri/bountyhub.key.pub` (public).

2. **Set the public key** in `src-tauri/tauri.conf.json`:  
   Replace the `tauri.updater.pubkey` value with the **entire contents** of `.tauri/bountyhub.key.pub`.

3. **Add GitHub Secrets** for CI (so release builds are signed):  
   - `TAURI_PRIVATE_KEY`: full contents of `.tauri/bountyhub.key` (or a path your runner can read).  
   - `TAURI_KEY_PASSWORD`: (optional) password if you used one when generating the key.

4. **Bump version before each release**: update `version` in `src-tauri/tauri.conf.json` and `package.json` to match the release tag (e.g. `1.0.0` for tag `v1.0.0`). The **GitHub Actions workflow** can align these from the tag before building (see below).

---

## Publishing a release

### Recommended: tag push (CI builds everything)

Workflow file: `.github/workflows/desktop-release.yml`  
**Trigger:** Push a tag matching `v*` (e.g. `v1.1.0`).

**What it does:**

1. Creates a GitHub Release for that tag (with auto-generated release notes).
2. Sets `package.json` and `src-tauri/tauri.conf.json` version from the tag via `scripts/set-version-from-tag.cjs` so installer filenames match the release.
3. Builds the Tauri desktop app on **Windows**, **macOS Apple Silicon**, and **Linux** (see workflow matrix for exact runners).
4. Uploads installers and update bundles (`.exe`, `.dmg`, `.AppImage`, `.deb`, `.zip`, `.tar.gz`, `.sig`) to the release.
5. Runs `scripts/generate-update-manifest.js` to produce `latest.json` (Tauri updater manifest) and uploads it to the same release.

**Steps:**

1. Bump version in `package.json` and `src-tauri/tauri.conf.json` if you want them committed in sync (optional; the workflow overwrites from the tag before build).
2. Commit and push to `main` as needed.
3. Create and push the tag:

   ```bash
   git tag -a v1.1.0 -m "Release v1.1.0"
   git push origin v1.1.0
   ```

4. Wait for Actions to finish. The release will include `latest.json` for the in-app updater.

### First release (alternative: CLI)

If you prefer creating the release explicitly once:

```bash
gh release create v1.0.0 --title "BountyHub Desktop v1.0.0" --notes "First release."
```

Or use GitHub: **Releases** → **Draft a new release** → tag `v1.0.0` → **Publish**. If your workflow is tag-driven, push the tag so CI still runs.

### Download page

[bountyhub.tech/download](https://bountyhub.tech/download) links to `https://github.com/chiku524/bountyhub/releases/latest` (or your configured URL). After a release is published, the buttons work.

---

## Auto-update behavior (all platforms)

- **Config:** `src-tauri/tauri.conf.json` → `tauri.updater`
- **Endpoint:** Example: `https://github.com/chiku524/bountyhub/releases/latest/download/latest.json`
- **Behaviour:** The app fetches that URL; if the `version` in the JSON is greater than the installed version, it offers to download and install the update for the current platform (`windows-x86_64`, `darwin-x86_64`, `darwin-aarch64`, or `linux-x86_64`). On Windows, the installer can run in **quiet** mode so only the in-app overlay shows progress. If the app is installed somewhere that needs admin (e.g. `C:\Program Files`), set `tauri.updater.windows.installMode` to `"passive"` so the installer can request elevation.

Auto-updates work when:

- The release was built by the workflow (signed artifacts present).
- `TAURI_PRIVATE_KEY` (and optionally `TAURI_KEY_PASSWORD`) is set in GitHub Actions so `.sig` files and `latest.json` signatures are valid.

Without `TAURI_PRIVATE_KEY`, builds may still run but the updater will not install updates securely.

### Required CI secrets

| Secret | Purpose |
|--------|---------|
| `TAURI_PRIVATE_KEY` | Minisign private key to sign update bundles (e.g. contents of `.tauri/bountyhub.key`). Generate with: `npm run tauri signer generate -- -w .tauri/bountyhub.key` |
| `TAURI_KEY_PASSWORD` | Optional; if the key is password-protected |

---

## Desktop and real-time chat

The desktop app uses the same Vite build as the web app. Real-time chat (WebSocket) uses the same React code as the browser.

- **Dev:** `npm run desktop` with `VITE_API_URL=http://localhost:8788` (and matching `ws://` for chat) if you need a local API.
- **Production:** Set `VITE_API_URL=https://api.bountyhub.tech` in `.env.production` so the desktop app uses production API and `wss://` for chat.

No extra Tauri-specific chat code is required.

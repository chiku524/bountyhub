# BountyHub Desktop App (Tauri)

The same BountyHub web app runs as a **desktop application** using [Tauri](https://tauri.app/). Tauri uses your OS webview (WebView2 on Windows, WebKit on macOS/Linux) and a small Rust binary, so the app is much smaller and lighter than an Electron build.

**Production:** The desktop app talks to `https://api.bountyhub.tech` when built for production. Official installers are built by GitHub Actions when you [publish a Release](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository); set `VITE_GITHUB_RELEASES_URL` (e.g. `https://github.com/your-org/bountyhub/releases/latest`) in your site env so the [Download](/download) page links to the latest release.

**Download page (private repo):** The Download page fetches release assets via the API at `/api/releases/latest`, which uses a GitHub PAT so private repos work. Set the PAT as a Cloudflare secret: `wrangler secret put GITHUB_PAT` (paste the token when prompted). For local dev, copy `.dev.vars.example` to `.dev.vars` and set `GITHUB_PAT=your_token`. The repo is configured in `wrangler.workers.toml` as `GITHUB_RELEASES_REPO` (default `chiku524/bountyhub`).

### Auto-updates

The app checks for updates on startup and can install them automatically (Tauri’s built-in updater).

To enable signed updates (required for the updater to install new versions):

1. **Generate a key pair** (once):  
   `npm run tauri signer generate -- -w .tauri/bountyhub.key`  
   This creates `.tauri/bountyhub.key` (private) and `.tauri/bountyhub.key.pub` (public).

2. **Set the public key** in `src-tauri/tauri.conf.json`:  
   Replace the `tauri.updater.pubkey` value with the **entire contents** of `.tauri/bountyhub.key.pub`.

3. **Add GitHub Secrets** for CI (so release builds are signed):  
   - `TAURI_PRIVATE_KEY`: full contents of `.tauri/bountyhub.key` (or a path your runner can read).  
   - `TAURI_KEY_PASSWORD`: (optional) password if you used one when generating the key.

4. **Bump version before each release**: update `version` in `src-tauri/tauri.conf.json` and `package.json` to match the release tag (e.g. `1.0.0` for tag `v1.0.0`). Then create the release; the workflow will build installers, sign them, and publish `latest.json` so the running app can find and install the update.

## Prerequisites

- **Node.js 20+** (already used for the web app)
- **Rust** – [install from rustup.rs](https://rustup.rs/)
- **Platform:**
  - **Windows:** [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) (usually already installed with Edge)
  - **macOS:** Xcode Command Line Tools (`xcode-select --install`)
  - **Linux:** `webkit2gtk`, `libayatana-appindicator3`, and build tools (see [Tauri prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites))

## Commands

| Command | Description |
|--------|-------------|
| `npm run desktop` | Start the app in development (Vite dev server + Tauri window) |
| `npm run desktop:build` | Build production installers (.exe, .dmg, .AppImage) |
| `npm run desktop:icons` | Generate icons from `public/logo.svg` (optional; needs `sharp`) |

## First-time setup

1. Install Rust: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh`
2. (Optional) Generate app icons: `npm run desktop:icons`. If you skip this, use a 1024×1024 PNG: `npm run tauri icon path/to/logo.png`
3. Run the desktop app: `npm run desktop`

The first `npm run desktop` or `npm run desktop:build` will compile the Rust side (may take a few minutes).

## Single instance & window menu

- **Second launch:** If BountyHub is already running, starting it again does not open a duplicate — the existing app is brought to the foreground (localhost `127.0.0.1:45287`). The tray icon and **File / View / Help** menus remain available; **View → Reload** is a full page reload if the UI gets stuck. **File → About BountyHub** and **Help → About** both open the in-app About dialog.
- **Preferences:** **File → Preferences…** and **Cmd/Ctrl+,** open **Settings** on the **Desktop app** tab (`/settings?tab=desktop`).
- **Developer tools (debug builds only):** **View → Toggle Developer Tools** and **Cmd/Ctrl+Shift+I** (when running `npm run desktop` / Vite dev) open the WebView inspector. These are omitted from release installers.
- **Settings:** In the desktop app, **Settings → Desktop app** shows the native and bundled UI versions, a **Check for updates** action, and a link to release notes.

## How it works

- **Development:** Tauri opens a window that loads the Vite dev URL from `src-tauri/tauri.conf.json` (default `http://localhost:5173`). Start the API separately with `npm run dev:api` if you need the backend.
- **Production build:** Runs `npm run build`, then bundles the `dist/` output into a native executable and installer. The app talks to your deployed API (`https://api.bountyhub.tech`) by default.

## Why Tauri instead of Electron?

| | Tauri | Electron |
|--|--------|----------|
| **Size** | ~5–15 MB | ~150–200 MB |
| **Memory** | 50–100 MB | 300–500 MB |
| **Backend** | Rust (small, fast) | Node.js + Chromium |
| **Security** | Smaller attack surface, system webview | Full Chromium bundle |

You can still use **Electron** if you prefer (e.g. for maximum Node/Chrome compatibility); the same `dist/` build can be loaded in an Electron window. For most cases, Tauri is the modern default.

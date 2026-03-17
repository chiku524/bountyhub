# BountyHub Desktop App (Tauri)

The same BountyHub web app runs as a **desktop application** using [Tauri](https://tauri.app/). Tauri uses your OS webview (WebView2 on Windows, WebKit on macOS/Linux) and a small Rust binary, so the app is much smaller and lighter than an Electron build.

**Production:** The desktop app talks to `https://api.bountyhub.tech` when built for production. Official installers are built by GitHub Actions when you [publish a Release](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository); set `VITE_GITHUB_RELEASES_URL` (e.g. `https://github.com/your-org/bountyhub/releases/latest`) in your site env so the [Download](/download) page links to the latest release.

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

## How it works

- **Development:** Tauri opens a window that loads `http://localhost:3000` (your Vite dev server). Start the API separately with `npm run dev:api` if you need the backend.
- **Production build:** Runs `npm run build`, then bundles the `dist/` output into a native executable and installer. The app talks to your deployed API (`https://api.bountyhub.tech`) by default.

## Why Tauri instead of Electron?

| | Tauri | Electron |
|--|--------|----------|
| **Size** | ~5–15 MB | ~150–200 MB |
| **Memory** | 50–100 MB | 300–500 MB |
| **Backend** | Rust (small, fast) | Node.js + Chromium |
| **Security** | Smaller attack surface, system webview | Full Chromium bundle |

You can still use **Electron** if you prefer (e.g. for maximum Node/Chrome compatibility); the same `dist/` build can be loaded in an Electron window. For most cases, Tauri is the modern default.

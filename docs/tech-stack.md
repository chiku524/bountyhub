# BountyHub Tech Stack

*Last updated: February 2025*

## Current Stack

| Layer        | Technology                    | Notes                    |
|-------------|-------------------------------|--------------------------|
| **Frontend**| React 18, TypeScript, Vite 5  | Route-level code splitting (lazy loading) |
| **Styling** | Tailwind CSS v4               | PostCSS, theme in `src/index.css` |
| **Routing** | react-router-dom 6            |                          |
| **API**     | Hono on Cloudflare Workers    |                          |
| **Database**| Drizzle ORM + Cloudflare D1   | SQLite                   |
| **Validation** | Zod                        |                          |
| **Wallet**  | @solana/wallet-adapter-*      | Phantom, Solflare, etc.  |
| **Lint**    | ESLint 9 (flat config)        | `eslint.config.js`       |

## What’s in place

- **Vite 5 + ESM** – Modern build, path alias
- **Hono + Workers** – Lightweight API
- **Drizzle + D1** – Single data layer, no MongoDB or better-sqlite3 in this repo
- **Tailwind v4** – `@import 'tailwindcss'`, `@theme`, dark mode via class
- **Lazy loading** – Non-critical routes use `React.lazy()` and `<Suspense>`
- **PWA** – Service worker, manifest, install prompt

## Optional next steps

- **React 19** – Upgrade when ready; test wallet adapters and deps
- **Secrets** – Move sensitive values from `wrangler.workers.toml` to Cloudflare Secrets and document in [deployment.md](./deployment.md)

## Documentation

- [Deployment](./deployment.md) – Pages, Workers, DNS, env, troubleshooting
- In-app docs at `/docs` – Platform, User Guide, Developer Guide, API Reference, etc.

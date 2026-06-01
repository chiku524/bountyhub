# BountyHub Essentials

Start here for a concise overview of the project. For deployment steps, see [DEPLOYMENT.md](./DEPLOYMENT.md). For the Tauri desktop app, see [DESKTOP.md](./DESKTOP.md). End-user documentation lives in the app at [/docs](https://bountyhub.tech/docs).

---

## What is BountyHub?

BountyHub is a decentralized Q&A platform where questions meet rewards. Users ask questions with BBUX bounties, provide answers, participate in governance, and optionally connect Solana wallets. The platform includes real-time chat, bug bounty campaigns, GitHub integration, and a native desktop app (Tauri).

**Production:** [bountyhub.tech](https://bountyhub.tech) · **API:** [api.bountyhub.tech](https://api.bountyhub.tech)

---

## Architecture

| Layer | Location | Technology |
|-------|----------|------------|
| Frontend | `src/` | React 19, TypeScript, Vite 8, Tailwind CSS 4, React Router 7 |
| API | `functions/` | Hono 4 on Cloudflare Workers |
| Database | `drizzle/` | Drizzle ORM + Cloudflare D1 (SQLite) |
| Real-time chat | `functions/durable-objects/` | WebSockets via Durable Objects + REST for history |
| Desktop | `src-tauri/` | Tauri 2 (Windows, macOS, Linux) |
| Deploy | — | Cloudflare Pages (frontend) + Workers (API) |

### Project layout

```
src/           React SPA — pages, components, hooks, contexts, utils
functions/     Hono API, Durable Objects, route handlers
drizzle/       Schema and SQL migrations
public/        Static assets, PWA icons, OG images
scripts/       Brand images, desktop icons, CI helpers
docs/          Maintainer documentation (this folder)
src-tauri/     Tauri desktop shell
```

---

## Quick start

**Requirements:** Node.js 20+

```bash
npm install
cp .env.example .env.local   # set VITE_API_URL and optional keys
npm run dev:full             # API (8788) + Vite (5173)
```

| Command | Purpose |
|---------|---------|
| `npm run dev:full` | Frontend + Workers API locally |
| `npm run build` | Production frontend build |
| `npm run typecheck:all` | Typecheck frontend + API |
| `npm run deploy:workers` | Deploy API to Cloudflare Workers |
| `npm run deploy:frontend:local` | Build and deploy Pages manually |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Apply D1 migrations (local) |
| `npm run desktop` | Run Tauri desktop app in dev |

---

## Environment variables

### Frontend (`.env.local` / Cloudflare Pages)

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | API base URL (default prod: `https://api.bountyhub.tech`) |
| `VITE_GIPHY_API_KEY` | GIF search in chat |
| `VITE_CLOUDINARY_CLOUD_NAME` | Media uploads (fallback when R2 unavailable) |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Cloudinary upload preset |
| `VITE_SOLANA_RPC_URL` | Optional custom Solana RPC |

### Workers (`.dev.vars` locally / Cloudflare Secrets in prod)

Copy `.dev.vars.example` to `.dev.vars` for local API development. Sensitive values (session secret, GitHub OAuth, Cloudinary, HTML2PDF, Solana keys, `GITHUB_PAT`) must be set via `wrangler secret put` in production — do not commit secrets.

---

## Tech stack (current)

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS 4, React Router 7 |
| API | Hono 4 on Cloudflare Workers |
| Database | Drizzle ORM + Cloudflare D1 |
| Media | R2 (primary when bound) + Cloudinary fallback |
| Cache / rate limits | Cloudflare KV (`CACHE` binding) |
| Blockchain | Solana Web3.js, wallet adapters |
| Validation | Zod |
| Desktop | Tauri 2 |
| Lint | ESLint 9 (flat config) |

---

## Cloudflare services

| Service | Use |
|---------|-----|
| **D1** | Primary database and sessions |
| **R2** | Media storage (`MEDIA_BUCKET`) — profile pictures, post attachments |
| **KV** | Platform stats cache, auth rate limiting |
| **Durable Objects** | Per-room chat WebSocket hub (`ChatRoomDO`) |

Details for R2/KV setup and bindings: [DEPLOYMENT.md](./DEPLOYMENT.md#cloudflare-services).

---

## Documentation map

| Doc | Audience | Contents |
|-----|----------|----------|
| [ESSENTIALS.md](./ESSENTIALS.md) | Developers (start here) | Overview, architecture, quick start, env vars |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | DevOps / maintainers | Pages + Workers deploy, DNS, troubleshooting, migrations |
| [DESKTOP.md](./DESKTOP.md) | Desktop releases | Tauri build, signing, GitHub Actions, updater |
| [/docs](https://bountyhub.tech/docs) | End users & integrators | Platform features, user guide, API reference, legal |

---

## Brand assets

Raster images are generated from SVGs in `public/`:

```bash
node scripts/generate-brand-images.js
```

Sources: `logo.svg`, `og-image.svg`, `social-banner.svg`, `social-square.svg`

# BountyHub Documentation

Project documentation in one place. For user-facing and developer-facing guides (Platform, User Guide, API Reference, etc.), use the **Docs** section in the app at **[/docs](https://bountyhub.tech/docs)**.

---

## Deployment Guide

### Overview

This project uses a **hybrid deployment strategy**:

- **Cloudflare Pages**: Auto-deploy from GitHub (frontend)
- **Cloudflare Workers**: Manual deployment (API backend)

This is the recommended approach for optimal CI/CD workflow.

### Cloudflare Pages (Frontend) – Auto-Deployment

**Important: GitHub integration limitation**  
Cloudflare Pages does NOT support adding GitHub integration to an existing project. If you already have a Pages project (created via manual deployment), either:

1. **Delete and recreate** (recommended for auto-deployment) – If the project has 100+ deployments, use a cleanup script or Cloudflare API to delete old deployments first. Then delete the project and create a new one, connecting GitHub during creation.
2. **Keep manual deployment** – Continue using `npm run deploy:frontend:local`; no GitHub integration available.

**Setup (one-time) – Create new project with GitHub**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Pages** → **Create application** → **Pages** → **Connect to Git** (only when creating a new project).
2. Connect GitHub, select repo and branch (e.g. `main`).
3. **Build settings**: Build command `npm run build`, output directory `dist`, Node version `20`.
4. **Environment variables** (after creation): Settings → Environment variables → add `VITE_API_URL`, `VITE_CLOUDINARY_*`, `VITE_GIPHY_API_KEY` as needed.

Every push to `main` triggers a new deployment; PRs get preview URLs. Manual deploy if needed: `npm run deploy:frontend:local`.

### Cloudflare Workers (API) – Manual Deployment

```bash
npm run deploy:workers
```

Or: `wrangler deploy --config wrangler.workers.toml`

Deploy when API code, migrations, or config change. Use **Cloudflare Secrets** for sensitive values; do not commit them in `wrangler.workers.toml`.

### Custom Domains & DNS

- **Frontend**: Pages → Custom domains → add `bountyhub.tech` (and optionally `www`).
- **API**: Workers → Triggers → add route for `api.bountyhub.tech/*`; add CNAME (or A) for `api` in DNS, proxied. SSL: Full (strict), auto-provisioned.

### Deployment Workflow

1. Test locally: `npm run dev:full`
2. Commit and push to `main` → Pages auto-deploys
3. If API changed: `npm run deploy:workers`
4. Migrations: `npm run db:generate` then `wrangler d1 migrations apply bountyhub-db --remote`

### Troubleshooting

- **Pages not deploying**: Check GitHub link, build command, output dir, env vars.
- **Build failures**: Run `npm run build` locally; use Node 20.
- **Workers**: `wrangler login`, check `wrangler.workers.toml` and D1 bindings; use `wrangler tail` for logs.
- **CORS**: Ensure `functions/index.ts` allows your frontend origin and `VITE_API_URL` is correct.
- **Cache / “Site can’t be reached”**: The service worker is network-first for navigations. Normal refresh gets fresh HTML. If needed, purge Pages cache in Dashboard → Deployments → Purge cache or Caching → Purge Everything.
- **Social share image (og:image) not showing**: The build runs `scripts/generate-brand-images.js` so `og-image.jpg` is in `dist/` and deployed. After deploying, use [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) or [Twitter Card Validator](https://cards-dev.twitter.com/validator) and use "Scrape Again" to refresh cached previews.

**Summary**: Frontend (Pages) auto-deploys on push to `main`; backend (Workers) manual deploy when API/config changes; migrations applied separately via wrangler; use Cloudflare Secrets, not repo commits.

---

## Tech Stack

*Last updated: March 2025*

### Current Stack

| Layer        | Technology                    | Notes                                    |
|-------------|-------------------------------|------------------------------------------|
| **Frontend**| React 18, TypeScript, Vite 5  | Route-level code splitting (lazy load)   |
| **Styling** | Tailwind CSS v4               | PostCSS, theme in `src/index.css`        |
| **Routing** | react-router-dom 6            |                                          |
| **API**     | Hono on Cloudflare Workers    |                                          |
| **Database**| Drizzle ORM + **Cloudflare D1** | SQLite (primary DB + sessions)          |
| **Media**   | Cloudinary                    | Profile pictures, post images/videos     |
| **Validation** | Zod                        |                                          |
| **Wallet**  | @solana/wallet-adapter-*      | Phantom, Solflare, etc.                  |
| **Lint**    | ESLint 9 (flat config)       | `eslint.config.js`                       |

### Cloudflare services in use

| Service | Status | Use |
|--------|--------|-----|
| **D1** | ✅ In use | Main database and session store (Drizzle ORM, `DB` binding) |
| **R2** | 🔧 Available | Object storage binding added; use to replace Cloudinary when ready |
| **KV** | 🔧 Available | Key-value binding added; use for cache, rate limits, or feature flags |

D1 is already your primary database. R2 and KV are wired in wrangler with placeholder names; create the resources and use them as needed (see below).

### What’s in place

- **Vite 5 + ESM** – Modern build, path alias
- **Hono + Workers** – Lightweight API
- **Drizzle + D1** – Single data layer, sessions in D1
- **Tailwind v4** – `@import 'tailwindcss'`, `@theme`, dark mode via class
- **Lazy loading** – Non-critical routes use `React.lazy()` and `<Suspense>`
- **Desktop app** – Tauri build; [Download](/download) page; full guide (releases, updater, CI): [DESKTOP.md](./DESKTOP.md)

### Adding R2 and KV

**R2** is already bound in `wrangler.workers.toml` as `MEDIA_BUCKET`. Create the bucket before first deploy:

```bash
wrangler r2 bucket create bountyhub-media --config wrangler.workers.toml
```

If you don’t need R2 yet, comment out the `[[r2_buckets]]` block in both wrangler configs.

**KV** is commented out by default. To enable:

1. Create a namespace: `wrangler kv namespace create BOUNTYHUB_CACHE --config wrangler.workers.toml`
2. Copy the returned namespace **id** into `wrangler.workers.toml` and `wrangler.dev.toml` under `[[kv_namespaces]]`, then uncomment the block.

**R2 (backend + frontend)**  
- **Backend**: Profile picture upload uses R2 when `MEDIA_BUCKET` is bound; `POST /api/media/upload` and `GET /api/media/<key>` for generic upload/serve.  
- **Frontend**: Profile picture goes through `/api/profile/picture` (R2 when bound). Post media in `MediaUpload` tries `api.uploadMedia()` (R2) first for files ≤10MB, then falls back to Cloudinary.  

**KV (backend + frontend)**  
- **Backend**: Stats cached in KV (5 min); login/signup rate-limited by IP when `CACHE` is bound.  
- **Frontend**: `api.getPlatformStats()` and auth calls hit these endpoints, so the app benefits from KV cache and rate limiting without extra frontend code.  
- Helpers: `functions/utils/kv.ts` — `getCached`, `setCached`, `checkRateLimit`.

### Optional next steps

- **React 19** – Upgrade when ready; test wallet adapters and deps
- **Secrets** – Move sensitive values from `wrangler.workers.toml` to Cloudflare Secrets and document in deployment section above
- **R2 migration** – Replace Cloudinary with R2 for media to keep everything on Cloudflare

---

## Maintenance scripts

### D1 migration 0016 (“duplicate column name: github_id”)

If the remote D1 already had GitHub columns (e.g. from a partial apply), mark 0016 as applied so later migrations can run:

```bash
npx wrangler d1 execute bountyhub-db --remote --config wrangler.workers.toml --file=scripts/mark-migration-0016-applied.sql
```

Then:

```bash
npx wrangler d1 migrations apply bountyhub-db --config wrangler.workers.toml --remote
```

### Linux desktop build: patched `wry` crate

`npm run desktop:build` runs `scripts/patch-wry-linux.cjs` first. That script creates `patches/wry/` (gitignored) from wry 0.24.11 and applies a one-line fix: `use webkit2gtk::SettingsExt;` so Linux builds compile. It uses Node `fetch` and the `tar` package only—no system `curl`/`tar`, so behavior matches on Windows, macOS, and Linux.

To run only the patch step: `node scripts/patch-wry-linux.cjs`

---

## Chat: real-time strategy (polling vs push)

### Current polling assessment

**What’s already good**

- **Incremental fetch**: Chat UIs use `?after=<timestamp>` so only new messages are requested.
- **Visibility-aware**: Some views pause polling when the tab is hidden.
- **Deduplication**: New messages merge by ID.

**Efficiency issues**

1. **Chat page** – Polling `useEffect` depending on `messages` / `lastMessageId` recreates the interval on every new message; prefer refs and a stable interval.
2. **ChatSidebar** – Avoid `isPolling` in dependency arrays that reset the interval every tick.
3. **Intervals** – Sidebar vs full chat vs post room may use different cadences (e.g. 8s / 3s / 2.5s); consider unifying or backoff when idle.
4. **Logging** – Guard chat polling logs with `import.meta.env.DEV` in production.

### Options for real-time updates

| Approach | Latency | Server load | Complexity | Best for |
|----------|---------|-------------|------------|----------|
| Short polling (current) | 2.5–8s | Higher | Low | MVP, low concurrency |
| Long polling | Near real-time | Medium | Medium | No WebSockets |
| SSE | Near real-time | Lower | Medium | One-way server → client |
| WebSockets | Instant | Lower (at scale) | Higher | Full duplex chat |

Industry standard for chat is **WebSockets** (or a managed equivalent), with REST for history and metadata.

### On Cloudflare

- **WebSockets + Durable Objects** – One DO per room; Worker forwards `wss` to the DO; broadcast after D1 write.
- **SSE** – Possible with streaming Workers; still need a way to wake the stream when new rows exist.
- **Long polling** – Harder on stateless Workers without a notifier.

### Recommendation

- **Short term**: Fix interval churn with refs, reduce logs, optional backoff when no new messages.
- **Long term**: **WebSockets + Durable Objects** for true real-time, REST for history and sends.

# BountyHub Deployment Guide

For project overview and quick start, see [ESSENTIALS.md](./ESSENTIALS.md).

---

## Overview

Hybrid deployment:

- **Cloudflare Pages** — frontend (`dist/`), auto-deploy from GitHub on push to `main`
- **Cloudflare Workers** — API (`functions/index.ts`), manual deploy when backend changes

---

## Cloudflare Pages (frontend)

**GitHub integration limitation:** Cloudflare Pages cannot add GitHub integration to an existing project. If you already have a manually created Pages project, either delete and recreate with Git connected, or keep using `npm run deploy:frontend:local`.

**One-time setup (new project with Git):**

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Pages** → **Create** → **Connect to Git**
2. Select repo and branch (e.g. `main`)
3. Build command: `npm run build` · Output: `dist` · Node: `20`
4. Environment variables: `VITE_API_URL`, `VITE_CLOUDINARY_*`, `VITE_GIPHY_API_KEY` as needed

Every push to `main` triggers a deployment. PRs get preview URLs.

Manual deploy: `npm run deploy:frontend:local`

---

## Cloudflare Workers (API)

```bash
npm run deploy:workers
# or: wrangler deploy --config wrangler.workers.toml
```

Deploy when API code, migrations, wrangler config, or Durable Object bindings change. Use **Cloudflare Secrets** for sensitive values — not committed vars in `wrangler.workers.toml`.

---

## Custom domains & DNS

- **Frontend:** Pages → Custom domains → `bountyhub.tech` (and optionally `www`)
- **API:** Workers → Triggers → route `api.bountyhub.tech/*`; DNS CNAME `api` proxied through Cloudflare. SSL: Full (strict).

---

## Deployment workflow

1. Test locally: `npm run dev:full`
2. Push to `main` → Pages auto-deploys frontend
3. If API changed: `npm run deploy:workers`
4. Migrations: `npm run db:generate` then `wrangler d1 migrations apply bountyhub-db --remote --config wrangler.workers.toml`

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Pages not deploying | Check GitHub link, build command, output dir, env vars |
| Build failures | Run `npm run build` locally; use Node 20 |
| Workers errors | `wrangler login`, verify D1/R2/KV/DO bindings; `wrangler tail` for logs |
| CORS | Ensure `functions/index.ts` allows your frontend origin; verify `VITE_API_URL` |
| Stale cache | Purge Pages cache in Dashboard → Caching → Purge Everything |
| og:image not updating | Build includes `og-image.jpg`; use [Facebook Debugger](https://developers.facebook.com/tools/debug/) to rescrape |

---

## Cloudflare services

### D1

Primary database. Binding: `DB` in `wrangler.workers.toml`. Migrations in `drizzle/migrations/`.

### R2

Bound as `MEDIA_BUCKET`. Create before first use:

```bash
wrangler r2 bucket create bountyhub-media --config wrangler.workers.toml
```

- **Backend:** `POST /api/media/upload`, `GET /api/media/<key>`, profile pictures via `/api/profile/picture`
- **Frontend:** `MediaUpload` tries R2 first (≤10MB), falls back to Cloudinary

### KV

Bound as `CACHE`. Create namespace:

```bash
wrangler kv namespace create BOUNTYHUB_CACHE --config wrangler.workers.toml
```

Add the returned id to `wrangler.workers.toml` and `wrangler.dev.toml`.

- **Backend:** Stats cached 5 min; login/signup rate-limited by IP
- **Helpers:** `functions/utils/kv.ts` — `getCached`, `setCached`, `checkRateLimit`

### Durable Objects (chat)

`ChatRoomDO` handles WebSocket connections per chat room. Worker forwards `GET /api/chat/ws?roomId=…` to the room's Durable Object. REST endpoints persist messages to D1 and broadcast to connected clients.

---

## Maintenance

### D1 migration 0016 (“duplicate column name: github_id”)

If remote D1 already had GitHub columns from a partial apply:

```bash
npx wrangler d1 execute bountyhub-db --remote --config wrangler.workers.toml --file=scripts/mark-migration-0016-applied.sql
npx wrangler d1 migrations apply bountyhub-db --config wrangler.workers.toml --remote
```

### Linux desktop build

`npm run desktop:build` uses Tauri 2 with the Rust toolchain from `src-tauri/Cargo.toml`. No additional Linux patches required.

---

## Real-time chat

Chat uses **WebSockets + Durable Objects** for live delivery, with REST for history and sending:

- `GET /api/chat/ws?roomId=<id>` — WebSocket upgrade
- `GET /api/chat/.../messages?after=<timestamp>` — incremental history fetch
- Frontend: `useChatWebSocket` hook in Chat page, sidebar, and post chat rooms

Polling with `?after=` remains as a fallback when WebSockets are unavailable.

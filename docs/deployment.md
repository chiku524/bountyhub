# Deployment Guide

## Overview

This project uses a **hybrid deployment strategy**:

- **Cloudflare Pages**: Auto-deploy from GitHub (frontend)
- **Cloudflare Workers**: Manual deployment (API backend)

This is the recommended approach for optimal CI/CD workflow.

---

## Cloudflare Pages (Frontend) - Auto-Deployment

### ⚠️ Important: GitHub Integration Limitation

**Cloudflare Pages does NOT support adding GitHub integration to an existing project.**

If you already have a Pages project (created via manual deployment), you have two options:

1. **Delete and recreate** (recommended for auto-deployment)
   - **If project has 100+ deployments**: Use a deployment cleanup script (e.g. Cloudflare API to delete old deployments) — see [Cloudflare known issues](https://developers.cloudflare.com/pages/platform/known-issues/#delete-a-project-with-a-high-amount-of-deployments).
   - Delete the existing Pages project (via Dashboard or API)
   - Create a new project and connect to GitHub during creation

2. **Keep manual deployment**
   - Continue using `npm run deploy:frontend:local` for deployments
   - No GitHub integration available

### Setup (One-time) - Create New Project with GitHub

1. **Create a New Pages Project**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Navigate to **Workers & Pages** → **Pages**
   - Click **Create application** → **Pages** → **Connect to Git**
   - **This option is ONLY available when creating a new project**

2. **Connect to GitHub**
   - Authorize Cloudflare to access your GitHub account
   - Select your repository (e.g. `chiku524/bountyhub`)
   - Select the branch (`main`)

3. **Configure Build Settings** (during project creation)

   - **Root directory**: Leave default (or set if in a monorepo subdirectory)
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node version**: `20` (Node 22 can cause Rollup native module issues)

4. **Set Environment Variables** (after project creation)
   - Go to **Settings** → **Environment variables** → **Production**
   - Add: `VITE_API_URL`, `VITE_CLOUDINARY_*`, `VITE_GIPHY_API_KEY` as needed

### How It Works

- Every push to `main` triggers a new deployment
- PRs get preview URLs
- Rollbacks available from the Dashboard

### Manual Deployment (if needed)

```bash
npm run deploy:frontend:local
```

---

## Cloudflare Workers (API) - Manual Deployment

```bash
npm run deploy:workers
```

Or: `wrangler deploy --config wrangler.workers.toml`

Deploy Workers when API code, migrations, or config change. Use **Cloudflare Secrets** for sensitive values; keep them out of `wrangler.workers.toml` in the repo.

---

## Custom Domains & DNS

- **Frontend**: In Pages → **Custom domains** add `bountyhub.tech` (and optionally `www`).
- **API**: In Workers → **Triggers** add a route for `api.bountyhub.tech/*`; add a CNAME (or A) record for `api` in DNS, proxied.
- **SSL**: Full (strict); certificates are provisioned automatically.

---

## Deployment Workflow

1. **Test locally**: `npm run dev:full`
2. **Commit and push** to `main` → Pages auto-deploys
3. **If API changed**: `npm run deploy:workers`
4. **Migrations**: `npm run db:generate` then `wrangler d1 migrations apply bountyhub-db --remote`

---

## Troubleshooting

- **Pages not deploying**: Check GitHub link, build command, output dir, env vars.
- **Build failures**: Run `npm run build` locally; use Node 20.
- **Workers**: `wrangler login`, check `wrangler.workers.toml` and D1 bindings; use `wrangler tail` for logs.
- **CORS**: Ensure `functions/index.ts` allows your frontend origin and `VITE_API_URL` is correct.

---

## Summary

- **Frontend (Pages)**: Auto-deploy on push to `main`
- **Backend (Workers)**: Manual deploy when API or config changes
- **Database**: Migrations applied separately via wrangler
- **Secrets**: Use Cloudflare Secrets; do not commit to the repo

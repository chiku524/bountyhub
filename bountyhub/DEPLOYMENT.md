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
   - **If project has 100+ deployments**: Use the cleanup script (see below)
   - Delete the existing Pages project (via Dashboard or API)
   - Create a new project and connect to GitHub during creation

2. **Keep manual deployment** (current setup)
   - Continue using `npm run deploy:frontend:local` for deployments
   - No GitHub integration available

### ⚠️ Deleting a Project with 100+ Deployments

If your Pages project has over 100 deployments, you **cannot delete it** until you delete some deployments first. This is a [known Cloudflare limitation](https://developers.cloudflare.com/pages/platform/known-issues/#delete-a-project-with-a-high-amount-of-deployments).

**Solution**: Use the deployment cleanup script in `../cloudflare-cleanup/`:

1. **Get your Cloudflare credentials**:
   - **API Token**: Dashboard → My Profile → API Tokens → Create Token
     - Use **Edit Cloudflare Workers** template or custom: **Account** → **Cloudflare Pages** → **Edit**
   - **Account ID**: Dashboard → Any domain → Right sidebar → Account ID
   - **Project Name**: Your Pages project name (e.g., `bountyhub`)

2. **Run the cleanup script**:
   ```bash
   cd ../cloudflare-cleanup
   npm install
   
   # Set environment variables (replace with your values)
   export CF_API_TOKEN=your_api_token
   export CF_ACCOUNT_ID=your_account_id
   export CF_PAGES_PROJECT_NAME=bountyhub
   
   # Run the script
   npm start
   ```

3. **After cleanup completes**:
   - Go to Cloudflare Dashboard → Workers & Pages → Pages → **bountyhub**
   - Click **Settings** → **General** → **Delete project**
   - Project should now be deletable!

**Note**: The script preserves your **live production deployment** and only deletes old deployments. See `../cloudflare-cleanup/README.md` for detailed instructions.

### Setup (One-time) - Create New Project with GitHub

1. **Create a New Pages Project**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Navigate to **Workers & Pages** → **Pages**
   - Click **Create application** → **Pages** → **Connect to Git**
   - **This option is ONLY available when creating a new project**

2. **Connect to GitHub**
   - Authorize Cloudflare to access your GitHub account
   - Select your repository (e.g., `chiku524/portal` or `chiku524/bountyhub`)
   - Select the branch (`main`)

3. **Configure Build Settings** (during project creation)

   - **Root directory**: `bountyhub` (REQUIRED - project is in a subdirectory)
   - **Build command**: `npm run build` (REQUIRED for static sites)
   - **Build output directory**: `dist` (REQUIRED)
   - **Node version**: `20` (REQUIRED - Node 22 has Rollup native module issues)
   
   **⚠️ Important**: Do NOT use Node 22 - it causes Rollup native dependency errors. Use Node 20 instead.
   
   **Note**: Cloudflare Pages does NOT use a separate "deploy command" for static sites. After the build completes, Pages automatically deploys the `dist/` directory. If you see a "deploy command" field, you are in the **Workers** setup (which is different from Pages).

4. **Set Environment Variables** (after project creation)
   - Go to **Settings** → **Environment variables** → **Production**
   - Add the following variables:
   ```
   VITE_API_URL=https://api.bountyhub.tech
   VITE_CLOUDINARY_CLOUD_NAME=dqobhvk07
   VITE_CLOUDINARY_UPLOAD_PRESET=bountyhub
   VITE_GIPHY_API_KEY=8tPzDynfDBevgXLsAaPztARWyvWzNLPK
   ```

### How It Works

- **Automatic**: Every push to `main` branch triggers a new deployment
- **Preview Deployments**: PRs automatically get preview URLs
- **Build History**: View all deployments in Cloudflare Dashboard
- **Rollbacks**: Easy rollback to previous deployments

### Manual Deployment (if needed)

If you need to manually deploy without pushing to GitHub:
```bash
npm run deploy:frontend:local
```

---

## Cloudflare Workers (API) - Manual Deployment

### GitHub Integration (Optional - Auto-Deploy)

If you want Workers to auto-deploy from GitHub:

1. **Connect GitHub Repository**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Navigate to **Workers & Pages** → **Workers** → **bountyhub-api**
   - Go to **Settings** → **Integrations** → **GitHub**
   - Click **Connect to GitHub** and authorize
   - Select repository and branch (`main`)

2. **Configure Build Settings**
   - **Build command**: `npm run build:api` (OPTIONAL - can leave empty if no build needed)
   - **Deploy command**: `npx wrangler deploy --config wrangler.workers.toml` (REQUIRED)
   - Or use: `npm run deploy:workers`

### Manual Deployment (Current Setup)

```bash
npm run deploy:workers
```

Or directly:
```bash
wrangler deploy --config wrangler.workers.toml
```

### Environment Variables

Workers environment variables are configured in `wrangler.workers.toml`:
- Database bindings
- API keys
- Secrets (should use Cloudflare Secrets for production)

### When to Deploy Workers

Deploy Workers when:
- API code changes
- Database migrations
- Environment variable updates
- Configuration changes

**Note**: Workers deployments are independent of Pages deployments. You can deploy them separately.

---

## Deployment Workflow

### Typical Workflow

1. **Make changes** to frontend/backend code
2. **Test locally**: `npm run dev:full`
3. **Commit and push** to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
4. **Cloudflare Pages auto-deploys** (frontend)
5. **Manually deploy Workers** (if API changed):
   ```bash
   npm run deploy:workers
   ```

### Database Migrations

When schema changes are made:
```bash
# Generate migration
npm run db:generate

# Apply to production
wrangler d1 migrations apply bountyhub-db --remote
```

---

## Build Configuration

### Frontend Build

- **Command**: `npm run build`
- **Output**: `dist/` directory
- **Includes**: 
  - `_headers` (cache control)
  - `_redirects` (SPA routing)
  - All static assets

### Build Artifacts

The build process creates:
- `dist/index.html` - Main HTML file
- `dist/assets/*.js` - JavaScript bundles
- `dist/assets/*.css` - CSS styles
- `dist/_headers` - HTTP headers
- `dist/_redirects` - URL redirects

---

## Troubleshooting

### Pages Not Auto-Deploying

1. Check GitHub integration in Cloudflare Dashboard
2. Verify build settings (command, output directory)
3. Check build logs in Cloudflare Dashboard
4. Ensure environment variables are set

### Build Failures

1. Check build logs in Cloudflare Dashboard
2. Test build locally: `npm run build`
3. Verify Node version matches (18+)
4. Check environment variables are set

### Deployment Not Reflecting Changes

1. Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)
2. Clear Cloudflare cache (Dashboard → Caching → Purge)
3. Verify the correct deployment is live
4. Check browser cache

### Workers Deployment Issues

1. Verify `wrangler.workers.toml` configuration
2. Check authentication: `wrangler login`
3. Verify database bindings
4. Check Workers logs: `wrangler tail`

---

## Best Practices

### ✅ Recommended

- **Pages**: Auto-deploy from GitHub
- **Workers**: Manual deployment for control
- **Environment Variables**: Set in Cloudflare Dashboard
- **Secrets**: Use Cloudflare Secrets for sensitive data
- **Database Migrations**: Run separately before code deployment

### ❌ Avoid

- Don't mix manual and auto-deployments (can cause conflicts)
- Don't commit secrets to repository
- Don't deploy Workers on every commit (only when API changes)
- Don't skip local testing before pushing

---

## Monitoring

### Pages Deployment

- View deployments: Cloudflare Dashboard → Pages → bountyhub
- Build logs: Available in each deployment
- Preview URLs: Automatic for PRs

### Workers Deployment

- View deployments: Cloudflare Dashboard → Workers & Pages → Workers
- Logs: `wrangler tail` or Cloudflare Dashboard
- Analytics: Available in Dashboard

---

## Summary

- **Frontend (Pages)**: Auto-deploy on `git push` ✅
- **Backend (Workers)**: Manual deploy when needed ✅
- **Database**: Migrations run separately ✅
- **Environment**: Variables set in Dashboard ✅

This workflow provides:
- ✅ Fast frontend deployments (automatic)
- ✅ Controlled backend deployments (manual)
- ✅ Preview deployments for PRs
- ✅ Easy rollbacks
- ✅ Clear separation of concerns


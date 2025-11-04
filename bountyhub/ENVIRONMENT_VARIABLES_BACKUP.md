# Environment Variables Backup

**Created:** 2024-11-04  
**Purpose:** Backup of Cloudflare Pages environment variables before project deletion

## ⚠️ IMPORTANT: Keep This File Secure

This file contains sensitive configuration values. **DO NOT commit this file to GitHub** if it contains production secrets.

---

## Cloudflare Pages Environment Variables

These are the **4 environment variables** configured in your Cloudflare Pages project:

### Production Environment Variables

```bash
# API Configuration
VITE_API_URL=https://api.bountyhub.tech

# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=dqobhvk07
VITE_CLOUDINARY_UPLOAD_PRESET=bountyhub

# GIPHY Configuration
VITE_GIPHY_API_KEY=8tPzDynfDBevgXLsAaPztARWyvWzNLPK
```

---

## Where These Values Are Saved

### ✅ Already Documented In:

1. **`DEPLOYMENT.md`** (lines 89-92)
   - Documented for easy reference when recreating the project

2. **`vite.config.ts`** (lines 15-18)
   - Default values are set as fallbacks
   - These are the production defaults used during build

3. **`wrangler.workers.toml`** (lines 32, 38-40)
   - Also stored in Workers configuration

4. **`wrangler.dev.toml`** (lines 30-33)
   - Development environment variables

---

## How to Restore After Project Recreation

When you recreate your Cloudflare Pages project with GitHub integration:

1. Go to **Cloudflare Dashboard** → **Workers & Pages** → **Pages** → **Your Project**
2. Navigate to **Settings** → **Environment variables** → **Production**
3. Add each variable:

```
VITE_API_URL = https://api.bountyhub.tech
VITE_CLOUDINARY_CLOUD_NAME = dqobhvk07
VITE_CLOUDINARY_UPLOAD_PRESET = bountyhub
VITE_GIPHY_API_KEY = 8tPzDynfDBevgXLsAaPztARWyvWzNLPK
```

---

## Additional Configuration (Not in Pages)

These are stored in other locations (Workers, local config):

### Cloudflare Workers Configuration
- Stored in `wrangler.workers.toml`
- Includes database bindings, API keys, and secrets
- **Not affected by Pages project deletion**

### Local Development
- Stored in `wrangler.dev.toml`
- Used for local development only

---

## Verification Checklist

Before deleting the Pages project, verify:

- ✅ All 4 environment variables are documented above
- ✅ Values match what's in Cloudflare Dashboard
- ✅ Values are saved in `DEPLOYMENT.md`
- ✅ Values are in `vite.config.ts` as defaults
- ✅ You have access to recreate the project

---

## Notes

- These are **client-side** environment variables (VITE_ prefix)
- They are baked into the build at build time
- They are **not sensitive** (they're included in the client bundle)
- The GIPHY API key is a public API key (not a secret)
- Cloudinary values are public configuration (not secrets)

---

## After Project Recreation

After recreating the Pages project:

1. ✅ Set the 4 environment variables listed above
2. ✅ Verify the build completes successfully
3. ✅ Test that the deployed site works correctly
4. ✅ Verify API calls work (check browser console)
5. ✅ Verify Cloudinary uploads work
6. ✅ Verify GIPHY GIF search works

---

**Status:** ✅ All environment variables backed up and ready for project deletion


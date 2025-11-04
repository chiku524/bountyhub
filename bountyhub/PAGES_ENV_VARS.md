# Cloudflare Pages Environment Variables

The following environment variables need to be set in the Cloudflare Pages dashboard for the `bountyhub` project:

## Required Environment Variables

Set these in **Cloudflare Dashboard** → **Pages** → **bountyhub** → **Settings** → **Environment variables** → **Production**:

```
VITE_API_URL=https://api.bountyhub.tech
VITE_CLOUDINARY_CLOUD_NAME=dqobhvk07
VITE_CLOUDINARY_UPLOAD_PRESET=bountyhub
VITE_GIPHY_API_KEY=8tPzDynfDBevgXLsAaPztARWyvWzNXPzL
```

## How to Set

1. Go to https://dash.cloudflare.com/
2. Navigate to **Pages** → **bountyhub**
3. Click **Settings** → **Environment variables**
4. Click **Add variable** for the **Production** environment
5. Add each variable above with its value
6. Save changes
7. Trigger a new deployment (or wait for the next build)

## Notes

- These are **build-time** environment variables (prefixed with `VITE_`)
- They are injected during the Vite build process
- After setting these, you may need to trigger a new deployment
- The app will use these values when built for production


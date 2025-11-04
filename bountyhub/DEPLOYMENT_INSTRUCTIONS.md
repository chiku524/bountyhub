# GitHub OAuth Deployment Instructions

## Database Migration

The database migration needs to be run to add GitHub integration fields to the `users` table.

### Option 1: Using Wrangler CLI (Recommended)

```bash
# Run the migration on the remote database
npx wrangler d1 execute bountyhub-db --file=drizzle/migrations/0016_add_github_integration.sql --remote

# When prompted, type 'Y' to proceed
```

**Note:** The database will be temporarily unavailable during the migration.

### Option 2: Using Cloudflare Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** > **D1** > **bountyhub-db**
3. Click on **Console** tab
4. Copy and paste the contents of `drizzle/migrations/0016_add_github_integration.sql`
5. Click **Run** to execute the migration

## Environment Variables

Set the following environment variables in your Cloudflare Workers configuration:

### Option 1: Using Wrangler CLI

```bash
# Set GitHub OAuth environment variables
npx wrangler secret put GITHUB_CLIENT_ID
# Enter your GitHub OAuth Client ID when prompted

npx wrangler secret put GITHUB_CLIENT_SECRET
# Enter your GitHub OAuth Client Secret when prompted

npx wrangler secret put GITHUB_CALLBACK_URL
# Enter your GitHub OAuth Callback URL (e.g., https://api.bountyhub.tech/auth/callback)
```

### Option 2: Using Cloudflare Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** > **bountyhub-api** (or your API worker name)
3. Click on **Settings** > **Variables and Secrets**
4. Under **Environment Variables**, click **Add variable** for each:

   - **Variable name:** `GITHUB_CLIENT_ID`
     **Value:** Your GitHub OAuth Client ID
   
   - **Variable name:** `GITHUB_CLIENT_SECRET`
     **Value:** Your GitHub OAuth Client Secret
     **Encrypt:** Yes (check this box)
   
   - **Variable name:** `GITHUB_CALLBACK_URL`
     **Value:** Your GitHub OAuth Callback URL (e.g., `https://api.bountyhub.tech/auth/callback`)

5. Click **Save** after adding each variable

## GitHub OAuth Application Setup

If you haven't created a GitHub OAuth application yet:

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **OAuth Apps** > **New OAuth App**
3. Fill in the form:
   - **Application name:** bountyhub (or your preferred name)
   - **Homepage URL:** `https://bountyhub.tech` (or your frontend URL)
   - **Authorization callback URL:** `https://api.bountyhub.tech/auth/callback` (your API URL + `/auth/callback`)
4. Click **Register application**
5. Copy the **Client ID** and generate a **Client Secret**
6. Use these values in the environment variables above

## Verification

After setting up:

1. **Test GitHub OAuth Sign Up:**
   - Go to `/signup` page
   - Click "Continue with GitHub"
   - Complete OAuth flow
   - Verify account creation

2. **Test GitHub OAuth Login:**
   - Go to `/login` page
   - Click "Continue with GitHub"
   - Complete OAuth flow
   - Verify login

3. **Test Account Linking:**
   - Log in with regular account
   - Go to `/settings` > **Account** tab
   - Click "Connect GitHub"
   - Complete OAuth flow
   - Verify GitHub connection appears

4. **Test Account Disconnection:**
   - In Settings > Account tab
   - Click "Disconnect GitHub"
   - Enter password when prompted
   - Verify GitHub connection is removed

## Troubleshooting

### Migration fails with "column already exists"
- The migration may have already been run
- Check the database schema to confirm columns exist

### OAuth redirects to wrong URL
- Verify `GITHUB_CALLBACK_URL` matches the callback URL in GitHub OAuth app settings
- Ensure the callback URL is exactly: `https://api.bountyhub.tech/auth/callback`

### "Invalid client" error
- Verify `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are correct
- Ensure Client Secret was generated (not the Client ID copied twice)

### Environment variables not found
- Verify variables are set in the correct environment (production vs. preview)
- Ensure variables are set as secrets (not plain text) for sensitive values
- Restart the worker after setting variables


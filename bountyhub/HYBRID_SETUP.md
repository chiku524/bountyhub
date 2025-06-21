# BountyHub Hybrid Deployment Setup

This guide explains how to set up and deploy BountyHub using a hybrid approach:
- **Frontend**: Cloudflare Pages (React app)
- **Backend**: Cloudflare Workers (Hono API)

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │
│   (Pages)       │◄──►│   (Workers)     │
│   React App     │    │   Hono API      │
│   bountyhub.com │    │   api.bountyhub │
└─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Development

1. **Start both servers simultaneously:**
   ```bash
   npm run dev:full
   ```
   This starts:
   - Frontend: `http://localhost:5173`
   - API: `http://localhost:8788`

2. **Or start them separately:**
   ```bash
   # Terminal 1: API server
   npm run dev:api
   
   # Terminal 2: Frontend server
   npm run dev:frontend
   ```

### Production Deployment

1. **Deploy everything at once:**
   ```bash
   npm run deploy:all
   ```

2. **Or deploy separately:**
   ```bash
   # Deploy API only
   npm run deploy:api
   
   # Deploy frontend only
   npm run deploy:frontend
   ```

3. **Or use the deployment script:**
   ```bash
   chmod +x scripts/deploy.sh
   ./scripts/deploy.sh
   ```

## 📁 Configuration Files

### `wrangler.toml` - Production API (Workers)
- Main entry point: `functions/index.ts`
- D1 database configuration
- Production environment variables

### `wrangler.dev.toml` - Development API (Workers)
- Local development settings
- Development environment variables
- Local D1 database

### `wrangler.pages.toml` - Frontend (Pages)
- Static site configuration
- Build settings
- Frontend environment variables

## 🌐 Domain Setup

### Development
- Frontend: `http://localhost:5173`
- API: `http://localhost:8788`

### Production
- Frontend: `https://bountyhub.pages.dev` (or custom domain)
- API: `https://bountyhub-api.your-subdomain.workers.dev` (or custom domain)

### Custom Domains
1. **Frontend**: Set up in Cloudflare Pages dashboard
   - Domain: `bountyhub.com`
   - CNAME: `bountyhub.pages.dev`

2. **API**: Set up in Cloudflare Workers dashboard
   - Domain: `api.bountyhub.com`
   - Route: `api.bountyhub.com/*`

## 🔧 Environment Variables

### Frontend (Vite)
```env
VITE_API_URL=https://api.bountyhub.tech
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=bountyhub
```

### Backend (Workers)
```env
NODE_ENV=production
SESSION_SECRET=your-secret-key
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
# ... other variables
```

## 📦 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev:full` | Start both frontend and API servers |
| `npm run dev:api` | Start API server only |
| `npm run dev:frontend` | Start frontend server only |
| `npm run build` | Build frontend for production |
| `npm run deploy:all` | Deploy both frontend and API |
| `npm run deploy:api` | Deploy API only |
| `npm run deploy:frontend` | Deploy frontend only |

## 🔍 Troubleshooting

### Common Issues

1. **"No routes found" error**
   - Make sure `functions/index.ts` exists
   - Check that all route files are properly exported

2. **CORS errors**
   - API is configured with CORS middleware
   - Check that frontend is calling the correct API URL

3. **Environment variables not working**
   - Check `wrangler.toml` and `wrangler.pages.toml`
   - Verify variables are set in Cloudflare dashboard

4. **Database connection issues**
   - Ensure D1 database is created and migrated
   - Check database binding in wrangler config

### Debug Commands

```bash
# Check Workers logs
wrangler tail bountyhub-api

# Check Pages deployment
wrangler pages deployment list bountyhub

# Test API locally
curl http://localhost:8788/api/auth/me
```

## 🎯 Benefits of This Setup

1. **Performance**: Static frontend served from edge, API optimized for compute
2. **Scalability**: Each component scales independently
3. **Cost**: Pay only for what you use
4. **Flexibility**: Can deploy frontend and API separately
5. **Developer Experience**: Hot reload for both frontend and API

## 📚 Next Steps

1. Set up custom domains
2. Configure monitoring and logging
3. Set up CI/CD pipeline
4. Add environment-specific configurations
5. Implement caching strategies 

Create a `.env` file in the root directory with the following variables:

```env
# API Configuration
VITE_API_URL=https://api.bountyhub.tech

# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=bountyhub

# Database Configuration
DATABASE_URL=your-database-url
``` 
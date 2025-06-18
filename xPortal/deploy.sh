#!/bin/bash

echo "🚀 Deploying BountyBucks to production..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel..."
    vercel login
fi

# Build the application
echo "🔨 Building application..."
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

# Add custom domain (if not already added)
echo "🌐 Setting up custom domain..."
vercel domains add portal.ask

echo "✅ Deployment complete!"
echo "🌐 Your app is live at: https://portal.ask"
echo "📊 Dashboard: https://vercel.com/dashboard"

# Optional: Set up environment variables
echo "🔧 Setting up environment variables..."
echo "Please configure the following in your Vercel dashboard:"
echo "- DATABASE_URL"
echo "- SESSION_SECRET"
echo "- CLOUDINARY_CLOUD_NAME"
echo "- CLOUDINARY_API_KEY"
echo "- CLOUDINARY_API_SECRET"
echo "- SOLANA_RPC_URL"
echo "- BBUX_TOKEN_MINT" 
#!/bin/bash

# BountyHub Hybrid Deployment Script
# This script deploys both the API (Workers) and Frontend (Pages)

set -e

echo "🚀 Starting BountyHub Hybrid Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the bountyhub directory"
    exit 1
fi

# Step 1: Build the frontend
print_status "Building frontend..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Frontend build failed"
    exit 1
fi

# Step 2: Deploy API (Workers)
print_status "Deploying API to Cloudflare Workers..."
npm run deploy:api

if [ $? -ne 0 ]; then
    print_error "API deployment failed"
    exit 1
fi

# Step 3: Deploy Frontend (Pages)
print_status "Deploying frontend to Cloudflare Pages..."
npm run deploy:frontend

if [ $? -ne 0 ]; then
    print_error "Frontend deployment failed"
    exit 1
fi

print_status "✅ Deployment completed successfully!"
print_status "🌐 Your app should be available at:"
print_status "   - Frontend: https://bountyhub.pages.dev"
print_status "   - API: https://bountyhub-api.your-subdomain.workers.dev"
print_status ""
print_status "📝 Don't forget to:"
print_status "   1. Set up custom domains in Cloudflare dashboard"
print_status "   2. Configure DNS records"
print_status "   3. Update environment variables in production" 
#!/bin/bash

# Build and Deploy Governance Program Script

set -e

echo "🚀 Building and deploying BountyHub Governance Program..."

# Check if Anchor is installed
if ! command -v anchor &> /dev/null; then
    echo "❌ Anchor CLI not found. Please install Anchor first:"
    echo "cargo install --git https://github.com/coral-xyz/anchor avm --locked --force"
    exit 1
fi

# Check if Solana CLI is installed
if ! command -v solana &> /dev/null; then
    echo "❌ Solana CLI not found. Please install Solana CLI first:"
    echo "sh -c \"\$(curl -sSfL https://release.solana.com/stable/install)\""
    exit 1
fi

# Set default cluster to devnet if not specified
if [ -z "$CLUSTER" ]; then
    export CLUSTER="devnet"
fi

echo "📡 Using cluster: $CLUSTER"

# Build the program
echo "🔨 Building governance program..."
anchor build

# Deploy the program
echo "🚀 Deploying governance program to $CLUSTER..."
anchor deploy --provider.cluster $CLUSTER

# Get the program ID
PROGRAM_ID=$(solana address -k target/deploy/governance-keypair.json)
echo "✅ Program deployed with ID: $PROGRAM_ID"

# Update Anchor.toml with the new program ID
echo "📝 Updating Anchor.toml with program ID..."
sed -i.bak "s/governance = \".*\"/governance = \"$PROGRAM_ID\"/" Anchor.toml

# Initialize the governance pool if deployment was successful
if [ $? -eq 0 ]; then
    echo "🎯 Initializing governance pool..."
    
    # Check if Node.js is available
    if command -v node &> /dev/null; then
        # Install dependencies if needed
        if [ ! -d "node_modules" ]; then
            echo "📦 Installing dependencies..."
            npm install
        fi
        
        # Run the deployment script
        echo "🔧 Running governance initialization..."
        npx ts-node scripts/deploy-governance.ts
    else
        echo "⚠️  Node.js not found. Please install Node.js to initialize the governance pool."
        echo "You can manually run: npx ts-node scripts/deploy-governance.ts"
    fi
else
    echo "❌ Deployment failed!"
    exit 1
fi

echo "🎉 Governance program deployment completed successfully!"
echo ""
echo "📋 Summary:"
echo "   Program ID: $PROGRAM_ID"
echo "   Cluster: $CLUSTER"
echo "   Status: Deployed and initialized"
echo ""
echo "🔗 Next steps:"
echo "   1. Update your frontend configuration with the new program ID"
echo "   2. Test the governance functionality"
echo "   3. Create your first governance proposal" 
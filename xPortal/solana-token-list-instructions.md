# Solana Token List Submission Instructions for BountyBucks (BBUX)

## Overview
This guide will help you submit your BountyBucks token to the official Solana Token List, making it appear as "verified" in wallets and DEXs.

## Prerequisites
- GitHub account
- Your token logo in PNG format (256x256 pixels recommended)

## Step 1: Prepare Your Logo
1. Convert your SVG logo to PNG format (256x256 pixels)
2. Save it as `logo.png`
3. The logo should be placed in: `assets/mainnet/8TxxzfEUbQcMTmsC5z1SS9TuLNzbL2iBVTLvb5JaKR6M/logo.png`

## Step 2: Fork the Token List Repository
1. Go to: https://github.com/solana-labs/token-list
2. Click "Fork" in the top right corner
3. This creates your own copy of the repository

## Step 3: Add Your Token Entry
1. In your forked repository, navigate to `src/tokens/solana.tokenlist.json`
2. Add the following entry to the `tokens` array (insert it in alphabetical order by symbol):

```json
{
  "chainId": 101,
  "address": "8TxxzfEUbQcMTmsC5z1SS9TuLNzbL2iBVTLvb5JaKR6M",
  "symbol": "BBUX",
  "name": "BountyBucks",
  "decimals": 9,
  "logoURI": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/8TxxzfEUbQcMTmsC5z1SS9TuLNzbL2iBVTLvb5JaKR6M/logo.png",
  "tags": [
    "bounty",
    "defi",
    "staking",
    "governance",
    "developer-tools",
    "freelance",
    "rewards"
  ],
  "extensions": {
    "website": "https://bountybucks.vercel.app/",
    "twitter": "https://twitter.com/BountyBucks524",
    "discord": "https://discord.gg/9uwHxMP9mz",
    "email": "bountybucks524@gmail.com",
    "github": "https://github.com/your-username/bountybucks",
    "whitepaper": "https://bountybucks.vercel.app/whitepaper.pdf"
  }
}
```

## Step 4: Add Your Logo
1. Create the directory: `assets/mainnet/8TxxzfEUbQcMTmsC5z1SS9TuLNzbL2iBVTLvb5JaKR6M/`
2. Upload your `logo.png` file to this directory
3. The logo should be 256x256 pixels in PNG format

## Step 5: Commit and Push Changes
1. Add a descriptive commit message: "Add BountyBucks (BBUX) token"
2. Push your changes to your forked repository

## Step 6: Create Pull Request
1. Go to your forked repository on GitHub
2. Click "Compare & pull request"
3. Set the title: "Add BountyBucks (BBUX) token"
4. Add description:
   ```
   Add BountyBucks (BBUX) token to the Solana Token List
   
   - Token Address: 8TxxzfEUbQcMTmsC5z1SS9TuLNzbL2iBVTLvb5JaKR6M
   - Symbol: BBUX
   - Name: BountyBucks
   - Decimals: 9
   - Website: https://bountybucks.vercel.app/
   
   BountyBucks is the native token for Portal's decentralized bounty platform.
   ```
5. Click "Create pull request"

## Step 7: Wait for Review
- The Solana team will review your submission
- This typically takes 1-3 business days
- They may request changes or approve it

## Step 8: After Approval
Once approved and merged:
- Your token will appear as "verified" in wallets (Phantom, Solflare, etc.)
- It will show up on DEXs like Raydium and Orca
- Users can easily find and trade your token

## Important Notes
- Make sure your token metadata is properly set on-chain before submission
- The logo must be accessible via the provided URL
- All links in the extensions should be working
- Keep your GitHub repository updated with any changes

## Troubleshooting
If your PR is rejected:
- Check that all URLs are accessible
- Ensure the logo is the correct format and size
- Verify that your token metadata is properly set on-chain
- Make any requested changes and resubmit 
# BountyBucks Token List Submission Guide

## Current Status
- ✅ Token deployed on mainnet: `8TxxzfEUbQcMTmsC5z1SS9TuLNzbL2iBVTLvb5JaKR6M`
- ✅ Metaplex Core metadata: `5DDyJCwrp5q5B3XKmhyu49UmUtYpczBgXwDmT8yP15HD`
- ✅ CLMM pool on Raydium
- ✅ Logo hosted at: `https://bountybucks.vercel.app/logo.png`
- ✅ Metadata hosted at: `https://bountybucks.vercel.app/bountybucks-core-metadata.json`

## Priority 1: Jupiter Token List (Most Important)

### Method 1: Direct Submission
1. Go to: https://token.jup.ag/
2. Look for "Add Token" or "Submit Token" button
3. Fill out the form with your details

### Method 2: GitHub Repository
1. Go to: https://github.com/jup-ag/token-list
2. Fork the repository
3. Add your token entry to their token list JSON
4. Submit a pull request

### Token Entry for Jupiter:
```json
{
  "address": "8TxxzfEUbQcMTmsC5z1SS9TuLNzbL2iBVTLvb5JaKR6M",
  "chainId": 101,
  "decimals": 9,
  "name": "BountyBucks",
  "symbol": "BBUX",
  "logoURI": "https://bountybucks.vercel.app/logo.png",
  "tags": ["bounty", "defi", "staking", "governance", "developer-tools"],
  "extensions": {
    "website": "https://bountybucks.vercel.app/",
    "twitter": "https://twitter.com/BountyBucks524",
    "discord": "https://discord.gg/9uwHxMP9mz",
    "email": "bountybucks524@gmail.com"
  }
}
```

## Priority 2: Raydium Token List

Since you have a CLMM pool on Raydium:
1. Go to: https://raydium.io/
2. Look for token submission process
3. Submit your token details
4. Reference your existing CLMM pool

## Priority 3: Other DEX Token Lists

### Orca Token List
1. Go to: https://orca.so/
2. Look for token submission
3. Submit your token details

### Birdeye Token List
1. Go to: https://birdeye.so/
2. Look for token submission process
3. Submit your token details

## Priority 4: Wallet Token Lists

### Phantom Wallet
- Phantom automatically pulls from Jupiter's token list
- Once on Jupiter, should appear in Phantom

### Solflare Wallet
- Similar to Phantom, pulls from major token lists
- Jupiter integration should cover this

## What to Expect After Submission

### Timeline:
- **Jupiter:** 24-48 hours for review
- **Raydium:** 1-3 business days
- **Other DEXs:** 1-7 days

### Results:
- ✅ Logo appears in wallets
- ✅ Token name/symbol shows properly
- ✅ Metadata displays in DEXs
- ✅ Appears in search results
- ✅ Shows up on aggregators

## Troubleshooting

### If logo doesn't appear:
1. Check that `https://bountybucks.vercel.app/logo.png` is accessible
2. Ensure logo is 256x256 PNG format
3. Wait 24-48 hours for propagation

### If metadata doesn't show:
1. Verify `https://bountybucks.vercel.app/bountybucks-core-metadata.json` is accessible
2. Check that Metaplex Core asset is properly linked
3. Wait for token list updates

### If token doesn't appear in search:
1. Make sure it's approved in Jupiter token list
2. Check that CLMM pool has sufficient liquidity
3. Wait for aggregator indexing

## Verification Steps

After submission, verify your token appears on:
1. **Jupiter:** https://jup.ag/ (search for BBUX)
2. **Raydium:** https://raydium.io/ (check your pool)
3. **Birdeye:** https://birdeye.so/ (search for BBUX)
4. **Phantom Wallet:** Add token by address
5. **Solflare Wallet:** Add token by address

## Contact Information for Submissions

- **Email:** bountybucks524@gmail.com
- **Twitter:** https://twitter.com/BountyBucks524
- **Discord:** https://discord.gg/9uwHxMP9mz
- **Website:** https://bountybucks.vercel.app/

## Next Steps After Token Lists

1. **Monitor trading activity** on your CLMM pool
2. **Add more liquidity** as demand grows
3. **Create additional trading pairs** (BBUX/USDC)
4. **Market your token** to your community
5. **Consider governance features** for your platform 
# Governance Program Deployment Guide

## Overview

This guide will walk you through deploying the Portal Governance Program to Solana mainnet. The governance program handles:

- **5% fee collection** from bounty creation
- **Community voting** on governance proposals
- **Reward distribution** to voters
- **Proposal management** with 7-day voting periods
- **Emergency withdrawal** capabilities

## Prerequisites

### 1. Development Environment
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"

# Install Anchor CLI
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

### 2. Platform Wallet
- Ensure `wallet-info.json` exists with sufficient SOL (≥0.1 SOL)
- Wallet should be on mainnet-beta

### 3. BountyBucks Token
- BountyBucks token must be deployed first
- Token mint address should be in `bounty-bucks-info.json`

## Deployment Steps

### Step 1: Build the Program

```bash
# Navigate to governance program directory
cd programs/governance-program

# Build the program
anchor build

# Verify build was successful
ls target/deploy/
```

### Step 2: Update Program ID

After building, Anchor will generate a new program ID. Update the following files:

1. **Update `lib.rs`**:
```rust
declare_id!("NEW_PROGRAM_ID_HERE");
```

2. **Update `Anchor.toml`**:
```toml
[programs.mainnet-beta]
governance_program = "NEW_PROGRAM_ID_HERE"
```

3. **Update `governance-client.ts`**:
```typescript
const GOVERNANCE_PROGRAM_ID = new PublicKey('NEW_PROGRAM_ID_HERE');
```

### Step 3: Deploy to Mainnet

```bash
# Set to mainnet
solana config set --url https://api.mainnet-beta.solana.com

# Deploy program
anchor deploy --provider.cluster mainnet-beta

# Note the deployment signature
```

### Step 4: Initialize Governance Pool

```bash
# Run the deployment script
node deploy-governance-program.cjs
```

This will:
- Create the governance pool account
- Create the governance pool token account
- Initialize the pool with 5% fee rate
- Save deployment info to `governance-deployment.json`

### Step 5: Verify Deployment

```bash
# Check program account
solana account NEW_PROGRAM_ID_HERE

# Check governance pool
solana account GOVERNANCE_POOL_ADDRESS

# Check governance pool token account
solana account GOVERNANCE_POOL_TOKEN_ACCOUNT
```

## Integration with Portal Platform

### 1. Update Environment Variables

Add to your `.env` file:
```env
GOVERNANCE_PROGRAM_ID=NEW_PROGRAM_ID_HERE
GOVERNANCE_POOL_ADDRESS=GOVERNANCE_POOL_ADDRESS
GOVERNANCE_POOL_TOKEN_ACCOUNT=GOVERNANCE_POOL_TOKEN_ACCOUNT
```

### 2. Update Bounty Creation Flow

Modify `app/routes/posts.create.tsx` to collect governance fees:

```typescript
// After bounty creation, collect governance fee
if (hasBounty && bountyAmount) {
  const governanceFee = bountyAmount * 0.05; // 5%
  
  // Call governance program to collect fee
  await governanceClient.collectGovernanceFee(
    userPublicKey,
    userTokenAccount,
    governanceFee
  );
}
```

### 3. Update Refund System

Modify `app/utils/refund-system.server.ts` to use governance pool:

```typescript
// Instead of calculating from bounty amount, use governance pool
const governancePool = await governanceClient.getGovernancePool();
const totalRewardPool = governancePool.totalFeesCollected * 0.1; // Use 10% of collected fees
```

## Testing

### 1. Devnet Testing

```bash
# Deploy to devnet first
solana config set --url https://api.devnet.solana.com
anchor deploy --provider.cluster devnet

# Test governance functionality
npm run test:governance
```

### 2. Test Scenarios

- [ ] Create bounty and verify fee collection
- [ ] Create governance proposal
- [ ] Vote on proposal
- [ ] Execute approved proposal
- [ ] Distribute voter rewards
- [ ] Emergency withdrawal

## Security Considerations

### 1. Access Control
- Only platform authority can initialize governance pool
- Only proposal creators can execute their proposals
- Users cannot vote on their own proposals

### 2. Rate Limiting
- Maximum 10 votes per 24 hours per user
- Minimum 3 votes required for proposal execution
- 60% approval threshold for proposals

### 3. Emergency Procedures
- Emergency withdrawal capability for critical situations
- Proposal expiration after 7 days
- Automatic rejection of expired proposals

## Cost Breakdown

### Deployment Costs
- **Program Account Rent**: ~0.002 SOL (~$0.20)
- **Governance Pool Account**: ~0.002 SOL (~$0.20)
- **Token Account Rent**: ~0.002 SOL (~$0.20)
- **Transaction Fees**: ~0.000005 SOL per transaction
- **Total Deployment**: ~0.006 SOL (~$0.60)

### Ongoing Costs
- **Annual Rent**: ~0.006 SOL (~$0.60)
- **Transaction Fees**: Variable based on usage
- **Estimated Monthly**: $5-50

## Monitoring

### 1. Key Metrics
- Total fees collected
- Total rewards distributed
- Number of active proposals
- Voting participation rate
- Governance pool balance

### 2. Alerts
- Low governance pool balance
- High number of failed transactions
- Unusual voting patterns
- Emergency withdrawal attempts

## Post-Deployment Checklist

- [ ] Program deployed successfully
- [ ] Governance pool initialized
- [ ] Token account created
- [ ] Environment variables updated
- [ ] Platform integration complete
- [ ] Testing completed
- [ ] Monitoring setup
- [ ] Documentation updated
- [ ] Community announcement

## Troubleshooting

### Common Issues

1. **Insufficient SOL Balance**
   ```bash
   # Check balance
   solana balance
   
   # Add SOL if needed
   solana airdrop 1 --url mainnet-beta
   ```

2. **Program Deployment Fails**
   ```bash
   # Check RPC connection
   solana cluster-version
   
   # Try different RPC endpoint
   export SOLANA_RPC_URL=https://solana-api.projectserum.com
   ```

3. **Token Account Creation Fails**
   ```bash
   # Verify token mint exists
   spl-token display SUPPLY --url mainnet-beta
   
   # Create token account manually if needed
   spl-token create-account TOKEN_MINT
   ```

## Support

For deployment issues:
- **Solana Discord**: #dev-support
- **Anchor Discord**: #general
- **Portal Discord**: nKc#6469

## Next Steps

After successful deployment:

1. **Community Governance**: Set up community voting mechanisms
2. **Proposal Templates**: Create standard proposal templates
3. **Governance UI**: Build governance dashboard
4. **Analytics**: Implement governance analytics
5. **Documentation**: Update user documentation

---

**Remember**: Always test on devnet first and ensure all security measures are in place before mainnet deployment. 
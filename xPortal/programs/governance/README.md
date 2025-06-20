# Governance Program

A Solana-based governance program for the BountyHub platform that allows community members to participate in platform governance through proposals and voting.

## Features

### Core Functionality

1. **Governance Pool Management**
   - Initialize a governance pool with configurable fee rates
   - Collect governance fees from bounty creation
   - Track total fees collected and rewards distributed

2. **Proposal System**
   - Create governance proposals with different types:
     - **RewardDistribution**: Distribute rewards to community members
     - **FeeRateChange**: Modify governance fee rates
     - **EmergencyWithdraw**: Emergency fund withdrawal
   - Proposals have a 7-day voting period
   - Support for optional amounts and recipients

3. **Voting Mechanism**
   - One vote per user per proposal
   - Yes/No voting system
   - Vote tracking and counting
   - Prevention of double voting

4. **Proposal Execution**
   - Automatic execution after voting period ends
   - Execution based on majority vote (yes > no)
   - Automatic token transfers for approved proposals

5. **Reward Distribution**
   - Distribute rewards to voters
   - Equal distribution among all voters
   - Track total rewards distributed

## Program Structure

### Accounts

- **GovernancePool**: Main governance pool account
- **Proposal**: Individual proposal accounts
- **VoteRecord**: Records of individual votes
- **Token Accounts**: Associated token accounts for fund management

### Instructions

1. `initialize_governance_pool`: Initialize the governance pool
2. `collect_governance_fee`: Collect fees from bounty creation
3. `create_proposal`: Create a new governance proposal
4. `vote_on_proposal`: Vote on an active proposal
5. `execute_proposal`: Execute a proposal after voting period
6. `distribute_voter_rewards`: Distribute rewards to voters

## Setup and Deployment

### Prerequisites

- Solana CLI tools
- Anchor Framework
- Node.js and npm/yarn

### Installation

1. Install Anchor:
```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
```

2. Install dependencies:
```bash
cd xPortal
npm install
```

### Building

```bash
anchor build
```

### Testing

```bash
anchor test
```

### Deployment

1. Set up your Solana wallet:
```bash
solana-keygen new
```

2. Configure your cluster (devnet/mainnet):
```bash
solana config set --url devnet
```

3. Deploy the program:
```bash
anchor deploy
```

4. Initialize the governance pool:
```bash
ts-node scripts/deploy-governance.ts
```

## Usage Examples

### Initialize Governance Pool

```typescript
import { GovernanceClient } from './app/utils/governance-client';

const client = new GovernanceClient(connection, wallet);
await client.initializeGovernancePool(500); // 5% fee rate
```

### Create a Proposal

```typescript
await client.createProposal(
  "Increase Community Rewards",
  "Proposal to increase the reward pool for active community members",
  "RewardDistribution",
  1000, // 1000 tokens
  recipientAddress
);
```

### Vote on a Proposal

```typescript
await client.voteOnProposal(proposalAddress, true); // Yes vote
```

### Execute a Proposal

```typescript
await client.executeProposal(proposalAddress);
```

## Configuration

### Fee Rates

- Fee rates are specified in basis points (1/10000)
- Default fee rate: 500 basis points (5%)
- Maximum fee rate: 1000 basis points (10%)

### Voting Period

- Default voting period: 7 days
- Proposals automatically expire after the voting period
- Execution can only happen after expiration

### Token Decimals

- All token amounts are handled with 9 decimal places
- The program automatically converts between UI amounts and lamports

## Security Features

1. **Access Control**: Only authorized users can create proposals
2. **Vote Prevention**: Users cannot vote multiple times on the same proposal
3. **Time-based Execution**: Proposals can only be executed after expiration
4. **Majority Voting**: Proposals require more yes votes than no votes to pass
5. **Token Safety**: All token transfers are validated and secure

## Integration with BountyHub

The governance program integrates with the BountyHub platform through:

1. **Fee Collection**: Automatic fee collection when bounties are created
2. **Community Rewards**: Distribution of collected fees to active community members
3. **Platform Governance**: Community-driven decisions about platform parameters
4. **Emergency Controls**: Emergency withdrawal capabilities for platform safety

## Development

### Adding New Proposal Types

1. Add the new type to the `ProposalType` enum in `lib.rs`
2. Implement the execution logic in the `execute_proposal` function
3. Update the client-side code to handle the new type
4. Add tests for the new functionality

### Modifying Fee Structures

1. Update the `governance_fee_rate` field in the `GovernancePool` account
2. Modify the fee calculation logic in `collect_governance_fee`
3. Update client-side fee handling

### Extending Voting Mechanisms

1. Add new vote types to the `VoteRecord` account
2. Implement weighted voting or quadratic voting
3. Update the vote counting logic

## Troubleshooting

### Common Issues

1. **Account Not Found**: Ensure the governance pool is initialized
2. **Insufficient Funds**: Check token account balances
3. **Proposal Expired**: Verify voting period hasn't ended
4. **Already Voted**: Users can only vote once per proposal

### Debug Commands

```bash
# Check governance pool status
anchor run get-governance-pool

# List active proposals
anchor run get-active-proposals

# Check proposal details
anchor run get-proposal <proposal-address>
```

## License

This program is part of the BountyHub platform and is licensed under the MIT License. 
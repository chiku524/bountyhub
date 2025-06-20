import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import bountyBucksInfo from '../../bounty-bucks-info.json';
import { 
  Program, 
  AnchorProvider, 
  web3, 
  BN
} from '@coral-xyz/anchor';
import { GovernanceProgram as GovernanceIDL } from '../types/governance_program';

// Governance program ID
const GOVERNANCE_PROGRAM_ID = new PublicKey('GovPool111111111111111111111111111111111111');

// Token mint
const TOKEN_MINT = new PublicKey(bountyBucksInfo.mint);

interface Wallet {
  publicKey: PublicKey;
  signTransaction: (transaction: unknown) => Promise<unknown>;
  signAllTransactions: (transactions: unknown[]) => Promise<unknown[]>;
}

interface GovernancePool {
  authority: PublicKey;
  feeRate: number;
  totalFeesCollected: number;
  proposalCounter: number;
}

interface Proposal {
  governancePool: PublicKey;
  authority: PublicKey;
  title: string;
  description: string;
  proposalType: string;
  amount?: number;
  recipient?: PublicKey;
  status: 'Active' | 'Executed' | 'Rejected';
  yesVotes: number;
  noVotes: number;
  createdAt: number;
  executedAt?: number;
}

export class GovernanceClient {
  private connection: Connection;
  private program: Program<typeof GovernanceIDL>;
  private provider: AnchorProvider;

  constructor(connection: Connection, wallet: Wallet) {
    this.connection = connection;
    this.provider = new AnchorProvider(connection, wallet, {
      commitment: 'confirmed',
      preflightCommitment: 'confirmed',
    });
    this.program = new Program(GovernanceIDL, GOVERNANCE_PROGRAM_ID, this.provider);
  }

  /**
   * Get governance pool address
   */
  static getGovernancePoolAddress(): PublicKey {
    const [governancePool] = PublicKey.findProgramAddressSync(
      [Buffer.from('governance_pool')],
      GOVERNANCE_PROGRAM_ID
    );
    return governancePool;
  }

  /**
   * Get governance pool token account address
   */
  static async getGovernancePoolTokenAddress(): Promise<PublicKey> {
    const governancePool = this.getGovernancePoolAddress();
    const [governancePoolTokenAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('governance_pool_token'),
        governancePool.toBuffer(),
      ],
      GOVERNANCE_PROGRAM_ID
    );
    return governancePoolTokenAccount;
  }

  /**
   * Get proposal address
   */
  static getProposalAddress(governancePool: PublicKey, proposalCounter: number): PublicKey {
    const [proposal] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('proposal'),
        governancePool.toBuffer(),
        new BN(proposalCounter).toArrayLike(Buffer, 'le', 8)
      ],
      GOVERNANCE_PROGRAM_ID
    );
    return proposal;
  }

  /**
   * Get vote record address
   */
  static getVoteRecordAddress(proposal: PublicKey, voter: PublicKey): PublicKey {
    const [voteRecord] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('vote'),
        proposal.toBuffer(),
        voter.toBuffer()
      ],
      GOVERNANCE_PROGRAM_ID
    );
    return voteRecord;
  }

  /**
   * Initialize governance pool
   */
  async initializeGovernancePool(feeRate: number = 500): Promise<string> {
    const governancePool = GovernanceClient.getGovernancePoolAddress();
    const governancePoolTokenAccount = await GovernanceClient.getGovernancePoolTokenAddress();

    const tx = await this.program.methods
      .initializeGovernancePool(new BN(feeRate))
      .accounts({
        governancePool,
        governancePoolTokenAccount,
        authority: this.provider.wallet.publicKey,
        mint: TOKEN_MINT,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    return tx;
  }

  /**
   * Collect governance fee from bounty creation
   */
  async collectGovernanceFee(
    bountyCreator: PublicKey,
    bountyCreatorTokenAccount: PublicKey,
    bountyAmount: number
  ): Promise<string> {
    const governancePool = GovernanceClient.getGovernancePoolAddress();
    const governancePoolTokenAccount = await GovernanceClient.getGovernancePoolTokenAddress();

    const tx = await this.program.methods
      .collectGovernanceFee(new BN(bountyAmount * Math.pow(10, 9))) // Convert to lamports
      .accounts({
        governancePool,
        governancePoolTokenAccount,
        bountyCreator,
        bountyCreatorTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    return tx;
  }

  /**
   * Create a governance proposal
   */
  async createProposal(
    title: string,
    description: string,
    proposalType: 'RewardDistribution' | 'FeeRateChange' | 'EmergencyWithdraw',
    amount?: number,
    recipient?: PublicKey
  ): Promise<string> {
    const governancePool = GovernanceClient.getGovernancePoolAddress();
    
    // Get next proposal counter (this would need to be tracked)
    const proposalCounter = 1; // This should be fetched from on-chain state
    const proposal = GovernanceClient.getProposalAddress(governancePool, proposalCounter);

    const tx = await this.program.methods
      .createProposal(
        title,
        description,
        { [proposalType]: {} },
        amount ? new BN(amount * Math.pow(10, 9)) : null,
        recipient || null
      )
      .accounts({
        proposal,
        governancePool,
        authority: this.provider.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
        proposalCounter: new PublicKey(proposalCounter), // This should be a proper counter account
      })
      .rpc();

    return tx;
  }

  /**
   * Vote on a governance proposal
   */
  async voteOnProposal(proposal: PublicKey, vote: boolean): Promise<string> {
    const voteRecord = GovernanceClient.getVoteRecordAddress(proposal, this.provider.wallet.publicKey);

    const tx = await this.program.methods
      .voteOnProposal(vote)
      .accounts({
        proposal,
        voteRecord,
        voter: this.provider.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    return tx;
  }

  /**
   * Execute a governance proposal
   */
  async executeProposal(
    proposal: PublicKey,
    recipientTokenAccount?: PublicKey
  ): Promise<string> {
    const governancePool = GovernanceClient.getGovernancePoolAddress();
    const governancePoolTokenAccount = await GovernanceClient.getGovernancePoolTokenAddress();

    const tx = await (this.program as Program<typeof GovernanceIDL>).methods
      .executeProposal()
      .accounts({
        proposal,
        governancePool,
        governancePoolTokenAccount,
        recipientTokenAccount: recipientTokenAccount || governancePoolTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    return tx;
  }

  /**
   * Distribute rewards to voters
   */
  async distributeVoterRewards(
    totalRewardAmount: number,
    voterAddresses: PublicKey[]
  ): Promise<string> {
    const governancePool = GovernanceClient.getGovernancePoolAddress();
    const governancePoolTokenAccount = await GovernanceClient.getGovernancePoolTokenAddress();

    // Get token accounts for voters
    const voterTokenAccounts = await Promise.all(
      voterAddresses.map(async (voter) => {
        return await getAssociatedTokenAddress(TOKEN_MINT, voter);
      })
    );

    const tx = await (this.program as Program<typeof GovernanceIDL>).methods
      .distributeVoterRewards(
        new BN(totalRewardAmount * Math.pow(10, 9)),
        voterAddresses
      )
      .accounts({
        governancePool,
        governancePoolTokenAccount,
        voterTokenAccounts: voterTokenAccounts,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    return tx;
  }

  /**
   * Get governance pool data
   */
  async getGovernancePool(): Promise<GovernancePool> {
    const governancePool = GovernanceClient.getGovernancePoolAddress();
    const account = await this.program.account.governancePool.fetch(governancePool);
    return account as GovernancePool;
  }

  /**
   * Get proposal data
   */
  async getProposal(proposalAddress: PublicKey): Promise<Proposal> {
    const account = await this.program.account.proposal.fetch(proposalAddress);
    return account as Proposal;
  }

  /**
   * Get all active proposals
   */
  async getActiveProposals(): Promise<Proposal[]> {
    const governancePool = GovernanceClient.getGovernancePoolAddress();
    const proposals = await this.program.account.proposal.all([
      {
        memcmp: {
          offset: 8, // Skip discriminator
          bytes: governancePool.toBase58(),
        },
      },
    ]);
    return proposals.map(p => p.account as Proposal);
  }

  /**
   * Get governance pool token balance
   */
  async getGovernancePoolBalance(): Promise<number> {
    try {
      const governancePoolTokenAccount = await GovernanceClient.getGovernancePoolTokenAddress();
      const accountInfo = await this.connection.getTokenAccountBalance(governancePoolTokenAccount);
      return accountInfo.value.uiAmount || 0;
    } catch (error) {
      console.error('Error fetching governance pool balance:', error);
      return 0;
    }
  }
} 
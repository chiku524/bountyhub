import { Connection, PublicKey, Transaction, Keypair } from '@solana/web3.js';
import { 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  TOKEN_PROGRAM_ID 
} from '@solana/spl-token';
import { 
  Program, 
  AnchorProvider, 
  web3, 
  utils, 
  BN 
} from '@coral-xyz/anchor';
import { GovernanceProgram as GovernanceIDL } from '../types/governance_program';
import bountyBucksInfo from '../../bounty-bucks-info.json';

// Governance program ID
const GOVERNANCE_PROGRAM_ID = new PublicKey('GovPool111111111111111111111111111111111111');

// Token mint
const TOKEN_MINT = new PublicKey(bountyBucksInfo.mint);

export class GovernanceClient {
  private connection: Connection;
  private program: Program<any>;
  private provider: AnchorProvider;

  constructor(connection: Connection, wallet: any) {
    this.connection = connection;
    this.provider = new AnchorProvider(connection, wallet, {
      commitment: 'confirmed',
      preflightCommitment: 'confirmed',
    });
    this.program = new (Program as any)(GovernanceIDL as any, GOVERNANCE_PROGRAM_ID, this.provider);
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

    const tx = await (this.program as any).methods
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

    const tx = await (this.program as any).methods
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

    const tx = await (this.program as any).methods
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

    const tx = await (this.program as any).methods
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

    const tx = await (this.program as any).methods
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

    const tx = await (this.program as any).methods
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
  async getGovernancePool(): Promise<any> {
    try {
      const governancePool = GovernanceClient.getGovernancePoolAddress();
      const account = await (this.program as any).account['governancePool'].fetch(governancePool);
      return {
        authority: account.authority.toString(),
        governanceFeeRate: account.governanceFeeRate.toNumber(),
        totalFeesCollected: account.totalFeesCollected.toNumber(),
        totalRewardsDistributed: account.totalRewardsDistributed.toNumber(),
        bump: account.bump,
      };
    } catch (error) {
      console.error('Error fetching governance pool:', error);
      return null;
    }
  }

  /**
   * Get proposal data
   */
  async getProposal(proposalAddress: PublicKey): Promise<any> {
    try {
      const account = await (this.program as any).account['proposal'].fetch(proposalAddress);
      return {
        authority: account.authority.toString(),
        governancePool: account.governancePool.toString(),
        title: account.title,
        description: account.description,
        proposalType: account.proposalType,
        amount: account.amount?.toNumber(),
        recipient: account.recipient?.toString(),
        status: account.status,
        yesVotes: account.yesVotes.toNumber(),
        noVotes: account.noVotes.toNumber(),
        totalVotes: account.totalVotes.toNumber(),
        createdAt: account.createdAt.toNumber(),
        expiresAt: account.expiresAt.toNumber(),
        bump: account.bump,
      };
    } catch (error) {
      console.error('Error fetching proposal:', error);
      return null;
    }
  }

  /**
   * Get all active proposals
   */
  async getActiveProposals(): Promise<any[]> {
    try {
      const governancePool = GovernanceClient.getGovernancePoolAddress();
      
      // This would need to be implemented with proper indexing
      // For now, we'll return an empty array
      // In a real implementation, you'd query for all proposals associated with the governance pool
      
      return [];
    } catch (error) {
      console.error('Error fetching active proposals:', error);
      return [];
    }
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
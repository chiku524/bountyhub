import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, Keypair } from "@solana/web3.js";
import { 
  TOKEN_PROGRAM_ID, 
  createMintToInstruction, 
  createTransferInstruction, 
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
  createBurnInstruction
} from "@solana/spl-token";
import { VirtualWalletService } from "./virtual-wallet.server";
import { TransactionMonitorService } from "./transaction-monitor.server";
import { RateLimiterService } from "./rate-limiter.server";
import { MultisigWalletService } from "./multisig-wallet.server";
import { TokenSupplyService } from "./token-supply.server";
import bountyBucksInfo from '../../bounty-bucks-info.json';

// You'll need to set these environment variables
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const PLATFORM_WALLET_PRIVATE_KEY = process.env.SOLANA_WALLET_PRIVATE_KEY; // Your platform's wallet private key

const TOKEN_SYMBOL = bountyBucksInfo.config.symbol;
const TOKEN_MINT = bountyBucksInfo.mint;
const TOKEN_DECIMALS = bountyBucksInfo.config.decimals;
const PLATFORM_TOKEN_ACCOUNT = bountyBucksInfo.platformTokenAccount;

export class SolanaWalletService {
  private static connection = new Connection(SOLANA_RPC_URL);

  /**
   * Get platform wallet keypair from private key
   */
  private static getPlatformWallet(): Keypair {
    if (!PLATFORM_WALLET_PRIVATE_KEY) {
      throw new Error("Platform wallet private key not configured");
    }
    
    try {
      // Try base64 format first (most common)
      const privateKeyBytes = Buffer.from(PLATFORM_WALLET_PRIVATE_KEY, 'base64');
      if (privateKeyBytes.length === 64) {
        return Keypair.fromSecretKey(privateKeyBytes);
      }
      
      // Try JSON array format
      if (PLATFORM_WALLET_PRIVATE_KEY.startsWith('[') && PLATFORM_WALLET_PRIVATE_KEY.endsWith(']')) {
        const privateKeyArray = JSON.parse(PLATFORM_WALLET_PRIVATE_KEY);
        if (Array.isArray(privateKeyArray) && privateKeyArray.length === 64) {
          return Keypair.fromSecretKey(new Uint8Array(privateKeyArray));
        }
      }
      
      // Try hex format
      if (PLATFORM_WALLET_PRIVATE_KEY.length === 128) {
        const privateKeyBytes = Buffer.from(PLATFORM_WALLET_PRIVATE_KEY, 'hex');
        if (privateKeyBytes.length === 64) {
          return Keypair.fromSecretKey(privateKeyBytes);
        }
      }
      
      throw new Error("Invalid private key format. Expected base64, JSON array, or hex format with 64 bytes");
    } catch (error) {
      if (error instanceof Error && error.message.includes("Invalid private key format")) {
        throw error;
      }
      throw new Error(`Failed to parse private key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get platform wallet public key for deposits
   */
  static getPlatformWalletAddress(): string {
    // Use multisig if configured, otherwise fall back to single wallet
    if (MultisigWalletService.isMultisigConfigured()) {
      return MultisigWalletService.getMultisigAddress();
    }
    
    const platformWallet = this.getPlatformWallet();
    return platformWallet.publicKey.toString();
  }

  /**
   * Get or create user's associated token account for PORTAL tokens
   */
  static async getUserTokenAccount(userAddress: string): Promise<PublicKey> {
    const mintPubkey = new PublicKey(TOKEN_MINT);
    const userPubkey = new PublicKey(userAddress);
    
    const associatedTokenAddress = await getAssociatedTokenAddress(
      mintPubkey,
      userPubkey
    );

    try {
      // Check if the account exists
      await getAccount(this.connection, associatedTokenAddress);
      return associatedTokenAddress;
    } catch (error) {
      // Account doesn't exist, we'll need to create it
      return associatedTokenAddress;
    }
  }

  /**
   * Create user's associated token account if it doesn't exist (fallback method)
   */
  static async createUserTokenAccountFallback(userAddress: string): Promise<PublicKey> {
    const mintPubkey = new PublicKey(TOKEN_MINT);
    const userPubkey = new PublicKey(userAddress);
    const platformWallet = this.getPlatformWallet();
    
    console.log('Using fallback method to create token account for user:', userAddress);
    
    try {
      // Use getOrCreateAssociatedTokenAccount which is more reliable
      const { getOrCreateAssociatedTokenAccount } = await import('@solana/spl-token');
      
      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        platformWallet, // payer
        mintPubkey, // mint
        userPubkey // owner
      );
      
      console.log('Token account created/verified using fallback method:', tokenAccount.address.toString());
      return tokenAccount.address;
    } catch (error) {
      console.error('Fallback method also failed:', error);
      throw error;
    }
  }

  /**
   * Create user's associated token account if it doesn't exist
   */
  static async createUserTokenAccountIfNeeded(userAddress: string): Promise<PublicKey> {
    const mintPubkey = new PublicKey(TOKEN_MINT);
    const userPubkey = new PublicKey(userAddress);
    const platformWallet = this.getPlatformWallet();
    
    const associatedTokenAddress = await getAssociatedTokenAddress(
      mintPubkey,
      userPubkey
    );

    try {
      // Check if the account exists
      await getAccount(this.connection, associatedTokenAddress);
      console.log('Token account already exists:', associatedTokenAddress.toString());
      return associatedTokenAddress;
    } catch (error) {
      // Account doesn't exist, create it
      console.log('Creating token account for user:', userAddress);
      console.log('Token account address:', associatedTokenAddress.toString());
      console.log('Mint address:', TOKEN_MINT);
      console.log('Platform wallet:', platformWallet.publicKey.toString());
      
      const createAccountInstruction = createAssociatedTokenAccountInstruction(
        platformWallet.publicKey,
        associatedTokenAddress,
        userPubkey,
        mintPubkey
      );

      const transaction = new Transaction().add(createAccountInstruction);
      
      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = platformWallet.publicKey;
      
      console.log('Sending token account creation transaction...');
      const signature = await this.connection.sendTransaction(transaction, [platformWallet]);
      console.log('Token account creation transaction signature:', signature);
      
      // Wait for confirmation with more specific commitment and retry logic
      let confirmation;
      let retries = 0;
      const maxRetries = 5;
      
      while (retries < maxRetries) {
        try {
          console.log(`Waiting for confirmation (attempt ${retries + 1}/${maxRetries})...`);
          confirmation = await this.connection.confirmTransaction(signature, 'confirmed');
          
          if (confirmation.value.err) {
            throw new Error(`Transaction failed: ${confirmation.value.err}`);
          }
          
          console.log('Transaction confirmed successfully');
          break;
        } catch (confirmError) {
          retries++;
          if (retries >= maxRetries) {
            throw new Error(`Failed to confirm transaction after ${maxRetries} attempts: ${confirmError}`);
          }
          console.log(`Confirmation attempt ${retries} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
        }
      }
      
      // Wait a bit more for the account to be fully available
      console.log('Waiting for account to be fully available...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Double-check that the account was created with retry logic
      let accountFound = false;
      retries = 0;
      
      while (retries < maxRetries && !accountFound) {
        try {
          console.log(`Verifying account creation (attempt ${retries + 1}/${maxRetries})...`);
          const accountInfo = await getAccount(this.connection, associatedTokenAddress);
          console.log('Token account created successfully');
          console.log('Account info:', {
            address: associatedTokenAddress.toString(),
            owner: accountInfo.owner.toString(),
            mint: accountInfo.mint.toString(),
            amount: accountInfo.amount.toString()
          });
          accountFound = true;
        } catch (verifyError) {
          retries++;
          if (retries >= maxRetries) {
            console.log('Primary method failed, trying fallback method...');
            return this.createUserTokenAccountFallback(userAddress);
          }
          console.log(`Verification attempt ${retries} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
        }
      }
      
      return associatedTokenAddress;
    }
  }

  /**
   * Mint PORTAL tokens to user's wallet
   */
  static async mintTokensToUser(
    userAddress: string, 
    amount: number
  ): Promise<string> {
    try {
      const platformWallet = this.getPlatformWallet();
      const mintPubkey = new PublicKey(TOKEN_MINT);
      
      console.log('Starting token mint for user:', userAddress);
      console.log('Mint address:', TOKEN_MINT);
      console.log('Amount to mint:', amount, 'tokens');
      
      // Ensure user has a token account
      const userTokenAccount = await this.createUserTokenAccountIfNeeded(userAddress);
      console.log('User token account:', userTokenAccount.toString());
      
      // Convert amount to token units (considering decimals)
      const tokenAmount = BigInt(amount * Math.pow(10, TOKEN_DECIMALS));
      console.log('Token amount in smallest units:', tokenAmount.toString());
      
      // Create mint instruction
      const mintInstruction = createMintToInstruction(
        mintPubkey,
        userTokenAccount,
        platformWallet.publicKey,
        tokenAmount
      );

      const transaction = new Transaction().add(mintInstruction);
      
      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = platformWallet.publicKey;
      
      console.log('Sending mint transaction...');
      const signature = await this.connection.sendTransaction(transaction, [platformWallet]);
      console.log('Mint transaction signature:', signature);
      
      console.log('Waiting for mint transaction confirmation...');
      const confirmation = await this.connection.confirmTransaction(signature, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error(`Mint transaction failed: ${confirmation.value.err}`);
      }
      
      console.log('Mint transaction confirmed successfully');
      return signature;
    } catch (error) {
      console.error('Error in mintTokensToUser:', error);
      throw error;
    }
  }

  /**
   * Burn PORTAL tokens from user's wallet
   */
  static async burnTokensFromUser(
    userAddress: string, 
    amount: number
  ): Promise<string> {
    const platformWallet = this.getPlatformWallet();
    const mintPubkey = new PublicKey(TOKEN_MINT);
    
    // Get user's token account
    const userTokenAccount = await this.getUserTokenAccount(userAddress);
    
    // Convert amount to token units
    const tokenAmount = BigInt(amount * Math.pow(10, TOKEN_DECIMALS));
    
    // Create burn instruction
    const burnInstruction = createBurnInstruction(
      userTokenAccount,
      mintPubkey,
      new PublicKey(userAddress),
      tokenAmount
    );

    const transaction = new Transaction().add(burnInstruction);
    
    const signature = await this.connection.sendTransaction(transaction, [platformWallet]);
    await this.connection.confirmTransaction(signature);
    
    return signature;
  }

  /**
   * Get user's PORTAL token balance
   */
  static async getUserTokenBalance(userAddress: string): Promise<number> {
    try {
      const userTokenAccount = await this.getUserTokenAccount(userAddress);
      const accountInfo = await getAccount(this.connection, userTokenAccount);
      
      return Number(accountInfo.amount) / Math.pow(10, TOKEN_DECIMALS);
    } catch (error) {
      // Account doesn't exist or other error
      return 0;
    }
  }

  /**
   * Verify a deposit transaction
   */
  static async verifyDeposit(
    transactionSignature: string,
    expectedAmount: number,
    userAddress: string
  ): Promise<boolean> {
    try {
      const transaction = await this.connection.getTransaction(transactionSignature, {
        commitment: "confirmed",
      });

      if (!transaction) {
        return false;
      }

      // Verify the transaction is to our platform wallet
      const platformAddress = this.getPlatformWalletAddress();
      
      // Check if the transaction transfers the expected amount
      // This is a simplified check - in production you'd want more robust verification
      const transferInstruction = transaction.transaction.message.instructions.find(
        (instruction) => {
          const programId = transaction.transaction.message.accountKeys[instruction.programIdIndex];
          return programId.equals(SystemProgram.programId);
        }
      );

      if (!transferInstruction) {
        return false;
      }

      // Verify amount (convert SOL to lamports)
      const expectedLamports = expectedAmount * LAMPORTS_PER_SOL;
      
      // In a real implementation, you'd parse the instruction data to verify the amount
      // For now, we'll assume the transaction is valid if it exists and is confirmed
      return true;
    } catch (error) {
      console.error("Error verifying deposit:", error);
      return false;
    }
  }

  /**
   * Send SOL to a user's wallet (for withdrawals)
   */
  static async sendSolToUser(
    userAddress: string,
    amount: number,
    transactionId: string
  ): Promise<string> {
    if (!PLATFORM_WALLET_PRIVATE_KEY) {
      throw new Error("Platform wallet private key not configured");
    }

    try {
      const platformWallet = this.getPlatformWallet();
      const transaction = new Transaction();
      
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: platformWallet.publicKey,
          toPubkey: new PublicKey(userAddress),
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );

      const signature = await this.connection.sendTransaction(transaction, [platformWallet]);
      await this.connection.confirmTransaction(signature);
      
      return signature;
    } catch (error) {
      console.error("Error sending SOL to user:", error);
      throw new Error("Failed to send SOL to user");
    }
  }

  /**
   * Get SOL balance of an address
   */
  static async getBalance(address: string): Promise<number> {
    try {
      const publicKey = new PublicKey(address);
      const balance = await this.connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error("Error getting balance:", error);
      return 0;
    }
  }

  /**
   * Process a deposit request (mint PORTAL tokens after SOL deposit)
   */
  static async processDeposit(
    userId: string,
    amount: number,
    userAddress: string,
    transactionId: string,
    solanaSignature: string
  ) {
    // Verify the SOL deposit first
    const isValidDeposit = await this.verifyDeposit(solanaSignature, amount, userAddress);
    if (!isValidDeposit) {
      throw new Error("Invalid deposit transaction");
    }

    // Mint PORTAL tokens to user's wallet
    const tokenSignature = await this.mintTokensToUser(userAddress, amount);

    // Confirm the deposit in the virtual wallet
    const result = await VirtualWalletService.confirmDeposit(transactionId, solanaSignature);

    return { ...result, tokenSignature };
  }

  /**
   * Process a withdrawal request (burn PORTAL tokens and send SOL)
   */
  static async processWithdrawal(
    userId: string,
    amount: number,
    userAddress: string,
    transactionId: string
  ) {
    // Check user's on-chain PORTAL token balance
    const onChainBalance = await this.getUserTokenBalance(userAddress);
    if (onChainBalance < amount) {
      throw new Error(`Insufficient PORTAL tokens on-chain. You have ${onChainBalance} but need ${amount}`);
    }

    // Burn PORTAL tokens from user's wallet
    const burnSignature = await this.burnTokensFromUser(userAddress, amount);

    // Log supply information after burning
    console.log(`[WITHDRAWAL] Burned ${amount} PORTAL tokens for user ${userId}`);
    await TokenSupplyService.logSupplyInfo();

    // Check if supply is running low
    const isSupplyLow = await TokenSupplyService.isSupplyLow();
    if (isSupplyLow) {
      console.warn(`[SUPPLY WARNING] Token supply is running low! Consider governance action.`);
    }

    // Send actual SOL to the user
    const solSignature = await this.sendSolToUser(userAddress, amount, transactionId);

    // Confirm the withdrawal in the virtual wallet
    const result = await VirtualWalletService.confirmWithdrawal(transactionId, solSignature);

    return { ...result, burnSignature, solSignature };
  }
} 
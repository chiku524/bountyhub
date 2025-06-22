import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, sendAndConfirmTransaction, Keypair, clusterApiUrl } from '@solana/web3.js'
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferInstruction, getAccount, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token'
import bountyBucksInfo from '../../bounty-bucks-info.json'

const BBUX_MINT = new PublicKey(bountyBucksInfo.mint)

// Platform wallet configuration
const PLATFORM_WALLET_ADDRESS = 'e6EdfgpEdo48zUKFC18cADxTqgbt68JE8uDjAgdCzkp'
const PLATFORM_WALLET_PRIVATE_KEY = 'xZK9zb3WUAHoLmrFrPq6pWxbPQWkgxyeAgDb/3dblw0JgGjCG2FTsm+zbVDykC0Ufc8IAnvgqH9H01s52bmRiQ=='

export class SolanaService {
  // Use devnet for testing
  private static connection = new Connection(clusterApiUrl('devnet'))
  // Use mainnet for BBUX token queries
  private static mainnetConnection = new Connection(clusterApiUrl('mainnet-beta'))

  static getPlatformWalletAddress(): string {
    return PLATFORM_WALLET_ADDRESS
  }

  static getPlatformWalletKeypair(): Keypair {
    try {
      // Decode base64 private key using browser-compatible method
      const privateKeyString = atob(PLATFORM_WALLET_PRIVATE_KEY)
      const privateKeyBytes = new Uint8Array(privateKeyString.length)
      for (let i = 0; i < privateKeyString.length; i++) {
        privateKeyBytes[i] = privateKeyString.charCodeAt(i)
      }
      return Keypair.fromSecretKey(privateKeyBytes)
    } catch (error) {
      console.error('Error loading platform wallet keypair:', error)
      throw new Error('Failed to load platform wallet')
    }
  }

  static isValidSolanaAddress(address: string): boolean {
    try {
      new PublicKey(address)
      return true
    } catch {
      return false
    }
  }

  static async getBalance(address: string): Promise<number> {
    try {
      const publicKey = new PublicKey(address)
      const balance = await this.connection.getBalance(publicKey)
      return balance / LAMPORTS_PER_SOL
    } catch (error) {
      console.error('Error getting balance:', error)
      return 0
    }
  }

  /**
   * Get BBUX token balance for a user
   */
  static async getBBUXBalance(userAddress: string): Promise<number> {
    try {
      const userPublicKey = new PublicKey(userAddress)
      const tokenAccountAddress = await getAssociatedTokenAddress(
        BBUX_MINT,
        userPublicKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
      
      const tokenAccount = await getAccount(this.mainnetConnection, tokenAccountAddress)
      return Number(tokenAccount.amount) / Math.pow(10, 9) // BBUX has 9 decimals
    } catch (error: any) {
      // Handle specific error cases
      if (error.message?.includes('TokenAccountNotFoundError') || 
          error.message?.includes('Account does not exist')) {
        // User doesn't have a BBUX token account yet - this is normal for new users
        console.log(`User ${userAddress} doesn't have a BBUX token account yet`)
        return 0
      }
      
      console.error('Error getting BBUX balance:', error)
      return 0
    }
  }

  /**
   * Send BBUX tokens from platform to user
   */
  static async sendBBUXToUser(
    userAddress: string,
    amount: number
  ): Promise<{ success: boolean; signature?: string; error?: string }> {
    try {
      if (!this.isValidSolanaAddress(userAddress)) {
        return { success: false, error: 'Invalid user address' }
      }

      const platformKeypair = this.getPlatformWalletKeypair()
      const userPublicKey = new PublicKey(userAddress)
      const platformPublicKey = platformKeypair.publicKey
      
      // Get or create user's token account
      const userTokenAccount = await getAssociatedTokenAddress(
        BBUX_MINT,
        userPublicKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
      
      // Check if user has token account, if not create it
      let createAccountInstruction = null
      try {
        await getAccount(this.connection, userTokenAccount)
      } catch {
        // Token account doesn't exist, create it
        createAccountInstruction = createAssociatedTokenAccountInstruction(
          platformPublicKey,
          userTokenAccount,
          userPublicKey,
          BBUX_MINT,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      }

      // Create transfer instruction
      const transferInstruction = createTransferInstruction(
        platformPublicKey,
        userTokenAccount,
        platformPublicKey,
        BigInt(amount * Math.pow(10, 9)) // Convert to token units
      )

      // Build transaction
      const transaction = new Transaction()
      if (createAccountInstruction) {
        transaction.add(createAccountInstruction)
      }
      transaction.add(transferInstruction)

      // Sign and send transaction
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [platformKeypair]
      )

      return { success: true, signature }
    } catch (error) {
      console.error('Error sending BBUX:', error)
      return { success: false, error: 'Failed to send BBUX' }
    }
  }

  /**
   * Send BBUX tokens from user to platform (for burning)
   */
  static async sendBBUXFromUser(
    userAddress: string,
    amount: number,
    userKeypair: any
  ): Promise<{ success: boolean; signature?: string; error?: string }> {
    try {
      if (!this.isValidSolanaAddress(userAddress)) {
        return { success: false, error: 'Invalid user address' }
      }

      const userPublicKey = new PublicKey(userAddress)
      const platformPublicKey = new PublicKey(PLATFORM_WALLET_ADDRESS)
      
      // Get user's token account
      const userTokenAccount = await getAssociatedTokenAddress(
        BBUX_MINT,
        userPublicKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
      
      // Get or create platform's token account
      const platformTokenAccount = await getAssociatedTokenAddress(
        BBUX_MINT,
        platformPublicKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
      
      // Check if platform has token account, if not create it
      let createAccountInstruction = null
      try {
        await getAccount(this.connection, platformTokenAccount)
      } catch {
        // Platform token account doesn't exist, create it
        createAccountInstruction = createAssociatedTokenAccountInstruction(
          userPublicKey,
          platformTokenAccount,
          platformPublicKey,
          BBUX_MINT,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      }

      // Create transfer instruction
      const transferInstruction = createTransferInstruction(
        userTokenAccount,
        platformTokenAccount,
        userPublicKey,
        BigInt(amount * Math.pow(10, 9)) // Convert to token units
      )

      // Build transaction
      const transaction = new Transaction()
      if (createAccountInstruction) {
        transaction.add(createAccountInstruction)
      }
      transaction.add(transferInstruction)

      // Sign and send transaction
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [userKeypair]
      )

      return { success: true, signature }
    } catch (error) {
      console.error('Error sending BBUX from user:', error)
      return { success: false, error: 'Failed to send BBUX from user' }
    }
  }

  /**
   * Send SOL from platform wallet to user
   */
  static async sendSolToUser(
    userAddress: string,
    amount: number
  ): Promise<{ success: boolean; signature?: string; error?: string }> {
    try {
      if (!this.isValidSolanaAddress(userAddress)) {
        return { success: false, error: 'Invalid user address' }
      }

      const platformKeypair = this.getPlatformWalletKeypair()
      const userPublicKey = new PublicKey(userAddress)
      const platformPublicKey = platformKeypair.publicKey

      // Check platform wallet balance
      const platformBalance = await this.getBalance(platformPublicKey.toString())
      if (platformBalance < amount) {
        return { success: false, error: 'Insufficient platform wallet balance' }
      }

      // Create transfer transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: platformPublicKey,
          toPubkey: userPublicKey,
          lamports: amount * LAMPORTS_PER_SOL
        })
      )

      // Sign and send transaction
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [platformKeypair]
      )

      return { success: true, signature }
    } catch (error) {
      console.error('Error sending SOL:', error)
      return { success: false, error: 'Failed to send SOL' }
    }
  }

  /**
   * Verify a Solana transaction
   */
  static async verifyTransaction(signature: string): Promise<{ success: boolean; error?: string }> {
    try {
      const transaction = await this.connection.getTransaction(signature, {
        commitment: 'confirmed'
      })
      
      if (!transaction) {
        return { success: false, error: 'Transaction not found' }
      }

      // Verify transaction is confirmed
      if (transaction.meta?.err) {
        return { success: false, error: 'Transaction failed' }
      }

      return { success: true }
    } catch (error) {
      console.error('Error verifying transaction:', error)
      return { success: false, error: 'Failed to verify transaction' }
    }
  }

  /**
   * Create a direct deposit transaction for user to sign
   */
  static async createDirectDepositTransaction(
    userAddress: string,
    amount: number
  ): Promise<{ success: boolean; transaction?: any; error?: string }> {
    try {
      if (!this.isValidSolanaAddress(userAddress)) {
        return { success: false, error: 'Invalid user address' }
      }

      const userPublicKey = new PublicKey(userAddress)
      const platformPublicKey = new PublicKey(PLATFORM_WALLET_ADDRESS)

      // Create transfer transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: userPublicKey,
          toPubkey: platformPublicKey,
          lamports: amount * LAMPORTS_PER_SOL
        })
      )

      // Set recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = userPublicKey

      return { success: true, transaction }
    } catch (error) {
      console.error('Error creating direct deposit transaction:', error)
      return { success: false, error: 'Failed to create transaction' }
    }
  }

  /**
   * Generate a new Solana wallet address
   * This is used during user registration
   */
  // static generateWalletAddress(): string {
  //   const keypair = Keypair.generate()
  //   return keypair.publicKey.toString()
  // }
} 
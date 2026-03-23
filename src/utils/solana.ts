import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, sendAndConfirmTransaction, Keypair } from '@solana/web3.js'
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferInstruction, getAccount, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token'
import bountyBucksInfo from '../../bounty-bucks-info.json'
import * as bs58 from 'bs58'

const BBUX_MINT = new PublicKey(bountyBucksInfo.mint)

// Platform wallet configuration
const PLATFORM_WALLET_ADDRESS = 'e6EdfgpEdo48zUKFC18cADxTqgbt68JE8uDjAgdCzkp'
const PLATFORM_WALLET_PRIVATE_KEY = 'xZK9zb3WUAHoLmrFrPq6pWxbPQWkgxyeAgDb/3dblw0JgGjCG2FTsm+zbVDykC0Ufc8IAnvgqH9H01s52bmRiQ=='

// Load platform wallet keypair
let platformKeypair: Keypair | null = null

export const loadPlatformWallet = async (): Promise<Keypair> => {
  if (platformKeypair) {
    return platformKeypair
  }

  try {
    // Type guard for import.meta.env (Vite-specific, not available in Workers)
    const privateKeyString = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_PLATFORM_PRIVATE_KEY) as string | undefined
    if (!privateKeyString) {
      throw new Error('Platform private key not configured')
    }

    const privateKeyBytes = bs58.decode(privateKeyString)
    platformKeypair = Keypair.fromSecretKey(privateKeyBytes)
    return platformKeypair
  } catch (error) {
    throw new Error(`Failed to load platform wallet: ${error}`)
  }
}

export class SolanaService {
  // Use environment variable or backend endpoint for all connections
  public static getConnection() {
    // Check if we're in a browser environment (frontend)
    if (typeof window !== 'undefined') {
      // Frontend environment - use the proxy endpoint
      try {
        // Type guard for import.meta.env (Vite-specific)
        const rpcUrl = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SOLANA_RPC_URL) || 'https://api.bountyhub.tech/api/wallet/solana-proxy'
        return new Connection(rpcUrl, 'confirmed')
      } catch (_error) {
        // Fallback if import.meta is not available
        const rpcUrl = 'https://api.bountyhub.tech/api/wallet/solana-proxy'
        return new Connection(rpcUrl, 'confirmed')
      }
    } else {
      // Backend environment - should not be called directly
      // Backend endpoints should create their own connections using c.env.SOLANA_RPC_URL
      console.warn('SolanaService.getConnection() called from backend - this should be avoided')
      return new Connection('https://api.mainnet-beta.solana.com', 'confirmed')
    }
  }

  static getPlatformWalletAddress(): string {
    return PLATFORM_WALLET_ADDRESS
  }

  static async loadPlatformWallet(env?: any): Promise<Keypair> {
    if (platformKeypair) {
      return platformKeypair
    }

    try {
      let privateKeyString: string | undefined
      
      // Check if we're in a backend environment with env parameter
      if (env && env.SOLANA_WALLET_PRIVATE_KEY) {
        privateKeyString = env.SOLANA_WALLET_PRIVATE_KEY
      } else if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
        privateKeyString = (import.meta as any).env?.VITE_PLATFORM_PRIVATE_KEY
      }

      if (!privateKeyString) {
        throw new Error('Platform private key not configured')
      }

      let privateKeyBytes: Uint8Array

      if (typeof Buffer !== 'undefined') {
        privateKeyBytes = new Uint8Array(Buffer.from(privateKeyString, 'base64'))
      } else {
        const decodedPrivateKey = atob(privateKeyString)
        privateKeyBytes = new Uint8Array(decodedPrivateKey.length)
        for (let i = 0; i < decodedPrivateKey.length; i++) {
          privateKeyBytes[i] = decodedPrivateKey.charCodeAt(i)
        }
      }

      if (privateKeyBytes.length !== 64) {
        throw new Error(`Invalid private key length: ${privateKeyBytes.length} bytes (expected 64)`)
      }

      try {
        platformKeypair = Keypair.fromSecretKey(privateKeyBytes)
        return platformKeypair
      } catch (keypairError) {
        console.error('Keypair creation failed:', keypairError)
        throw new Error(`Failed to create keypair: ${keypairError}`)
      }
    } catch (error) {
      console.error('Detailed platform wallet loading error:', error)
      throw new Error(`Failed to load platform wallet: ${error}`)
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
      const balance = await this.getConnection().getBalance(publicKey)
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
      
      const tokenAccount = await getAccount(this.getConnection(), tokenAccountAddress)
      return Number(tokenAccount.amount) / Math.pow(10, 9) // BBUX has 9 decimals
    } catch (error: any) {
      // Handle specific error cases
      if (error.message?.includes('TokenAccountNotFoundError') ||
          error.message?.includes('Account does not exist')) {
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

      const platformKeypair = await this.loadPlatformWallet()
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
        await getAccount(this.getConnection(), userTokenAccount)
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
        this.getConnection(),
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
        await getAccount(this.getConnection(), platformTokenAccount)
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
        this.getConnection(),
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
    amount: number,
    env?: any
  ): Promise<{ success: boolean; signature?: string; error?: string }> {
    try {
      if (!this.isValidSolanaAddress(userAddress)) {
        return { success: false, error: 'Invalid user address' }
      }

      const platformKeypair = await this.loadPlatformWallet(env)
      const userPublicKey = new PublicKey(userAddress)
      const platformPublicKey = platformKeypair.publicKey

      // Create connection based on environment
      let connection: Connection
      if (env && env.SOLANA_RPC_URL) {
        // Backend environment
        connection = new Connection(env.SOLANA_RPC_URL, 'confirmed')
      } else {
        // Frontend environment
        connection = this.getConnection()
      }

      // Check platform wallet balance
      const platformBalance = await connection.getBalance(platformPublicKey)
      const platformBalanceInSol = platformBalance / LAMPORTS_PER_SOL

      if (platformBalanceInSol < amount) {
        return { success: false, error: `Insufficient platform wallet balance. Available: ${platformBalanceInSol} SOL, Required: ${amount} SOL` }
      }

      const { blockhash } = await connection.getLatestBlockhash('finalized')

      // Create transfer transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: platformPublicKey,
          toPubkey: userPublicKey,
          lamports: amount * LAMPORTS_PER_SOL
        })
      )

      // Set recent blockhash and fee payer
      transaction.recentBlockhash = blockhash
      transaction.feePayer = platformPublicKey

      transaction.sign(platformKeypair)

      // Send the transaction (don't wait for confirmation)
      const signature = await connection.sendRawTransaction(transaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed'
      })

      try {
        const confirmation = await connection.confirmTransaction(signature, 'confirmed')
        
        if (confirmation.value.err) {
          console.error('Transaction failed:', confirmation.value.err)
          return { success: false, error: `Transaction failed: ${confirmation.value.err}` }
        }

        return { success: true, signature }
      } catch (confirmationError: any) {
        console.warn('Confirmation timed out or failed, waiting 5 seconds before checking transaction status directly...', confirmationError.message)
        
        // Wait 5 seconds before checking transaction status
        await new Promise(resolve => setTimeout(resolve, 5000))
        
        // Fallback: check transaction status directly
        try {
          const transaction = await connection.getTransaction(signature, {
            commitment: 'confirmed'
          })
          
          if (!transaction) {
            return { success: false, error: 'Transaction not found - may still be processing' }
          }

          if (transaction.meta?.err) {
            console.error('Transaction failed:', transaction.meta.err)
            return { success: false, error: `Transaction failed: ${transaction.meta.err}` }
          }

          return { success: true, signature }
        } catch (verificationError: any) {
          console.error('Failed to verify transaction:', verificationError)
          return { success: false, error: `Confirmation failed and verification failed: ${verificationError.message}` }
        }
      }
    } catch (error: any) {
      console.error('Error sending SOL:', error)
      const errorMessage = error.message || 'Unknown error occurred'
      return { success: false, error: `Failed to send SOL: ${errorMessage}` }
    }
  }

  /**
   * Verify a Solana transaction
   */
  static async verifyTransaction(signature: string): Promise<{ success: boolean; error?: string }> {
    try {
      const transaction = await this.getConnection().getTransaction(signature, {
        commitment: 'confirmed'
      })

      if (!transaction) {
        return { success: false, error: 'Transaction not found' }
      }

      if (transaction.meta?.err) {
        return { success: false, error: 'Transaction failed' }
      }

      return { success: true }
    } catch (error: any) {
      console.error('Error verifying transaction:', error)
      return { success: false, error: `Failed to verify transaction: ${error.message}` }
    }
  }

  /**
   * Process a direct deposit by creating and sending the transaction
   */
  static async processDirectDeposit(
    userAddress: string,
    amount: number
  ): Promise<{ success: boolean; signature?: string; error?: string }> {
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
      const { blockhash } = await this.getConnection().getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = userPublicKey

      // Note: This method can't actually send the transaction without the user's private key
      // For now, we'll just create the transaction and return success
      // In a real implementation, the user would need to sign this transaction on the frontend
      
      return { success: true, signature: 'pending_user_signature' }
    } catch (error) {
      console.error('Error processing direct deposit:', error)
      return { success: false, error: 'Failed to process deposit' }
    }
  }

  /**
   * Get transaction details including sender and receiver addresses
   */
  static async getTransactionDetails(signature: string): Promise<{ success: boolean; fromAddress?: string; toAddress?: string; amount?: number; error?: string }> {
    try {
      const transaction = await this.getConnection().getTransaction(signature, {
        commitment: 'confirmed'
      })

      if (!transaction) {
        return { success: false, error: 'Transaction not found' }
      }

      if (transaction.meta?.err) {
        return { success: false, error: 'Transaction failed' }
      }

      // Extract transfer details from SystemProgram transfer instruction
      const instructions = transaction.transaction.message.instructions
      for (const instruction of instructions) {
        const programId = transaction.transaction.message.accountKeys[instruction.programIdIndex].toString()
        if (programId === '11111111111111111111111111111111') { // SystemProgram
          const accounts = instruction.accounts
          if (accounts.length >= 2) {
            const fromAddress = transaction.transaction.message.accountKeys[accounts[0]].toString()
            const toAddress = transaction.transaction.message.accountKeys[accounts[1]].toString()
            
            // Calculate amount from balance changes
            let amount = 0
            if (transaction.meta && transaction.meta.preBalances && transaction.meta.postBalances) {
              const preBalance = transaction.meta.preBalances[accounts[0]]
              const postBalance = transaction.meta.postBalances[accounts[0]]
              if (preBalance !== undefined && postBalance !== undefined) {
                amount = (preBalance - postBalance) / LAMPORTS_PER_SOL
              }
            }
            
            return { 
              success: true, 
              fromAddress, 
              toAddress, 
              amount 
            }
          }
        }
      }

      return { success: false, error: 'No transfer instruction found' }
    } catch (error: any) {
      console.error('Error getting transaction details:', error)
      return { success: false, error: `Failed to get transaction details: ${error.message}` }
    }
  }

  /**
   * Test platform wallet functionality
   */
  static async testPlatformWallet(env?: any): Promise<{ success: boolean; error?: string; balance?: number; address?: string }> {
    try {
      const keypair = await this.loadPlatformWallet(env)
      const address = keypair.publicKey.toString()

      let connection: Connection
      if (env && env.SOLANA_RPC_URL) {
        connection = new Connection(env.SOLANA_RPC_URL, 'confirmed')
      } else {
        connection = this.getConnection()
      }

      const balance = await connection.getBalance(keypair.publicKey)
      const balanceInSol = balance / LAMPORTS_PER_SOL

      return { 
        success: true, 
        balance: balanceInSol, 
        address 
      }
    } catch (error: any) {
      console.error('Platform wallet test failed:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      return { 
        success: false, 
        error: `Platform wallet test failed: ${error.message}` 
      }
    }
  }

  static getPlatformWalletKeypair(): Keypair {
    try {
      // Decode base64 private key using environment-appropriate method
      let privateKeyBytes: Uint8Array
      
      // Use Buffer in Node.js/Cloudflare Workers environment, atob in browser
      if (typeof Buffer !== 'undefined') {
        // Node.js/Cloudflare Workers environment
        privateKeyBytes = new Uint8Array(Buffer.from(PLATFORM_WALLET_PRIVATE_KEY, 'base64'))
      } else {
        // Browser environment
        const privateKeyString = atob(PLATFORM_WALLET_PRIVATE_KEY)
        privateKeyBytes = new Uint8Array(privateKeyString.length)
        for (let i = 0; i < privateKeyString.length; i++) {
          privateKeyBytes[i] = privateKeyString.charCodeAt(i)
        }
      }
      
      const keypair = Keypair.fromSecretKey(privateKeyBytes)
      return keypair
    } catch (error) {
      throw new Error(`Failed to load platform wallet: ${error}`)
    }
  }
} 
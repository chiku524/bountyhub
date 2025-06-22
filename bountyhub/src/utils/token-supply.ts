import { virtualWallets, walletTransactions } from '../../drizzle/schema'
import { SolanaService } from './solana'
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js'
import { getMint } from '@solana/spl-token'
import bountyBucksInfo from '../../bounty-bucks-info.json'

const BBUX_MINT = new PublicKey(bountyBucksInfo.mint)

export class TokenSupplyService {
  // Use mainnet for live data
  private static connection = new Connection(clusterApiUrl('mainnet-beta'))

  static async getSupplyStats(db: any) {
    try {
      // Get real BBUX token supply from blockchain
      const mintInfo = await getMint(this.connection, BBUX_MINT)
      const totalSupply = Number(mintInfo.supply) / Math.pow(10, mintInfo.decimals)
      
      // Get all wallets (excluding system wallets)
      const wallets = await db.select().from(virtualWallets)
      
      // Calculate current supply from virtual wallets (this represents tokens in the platform)
      const currentSupply = wallets
        .filter((wallet: any) => wallet.userId !== 'system' && wallet.userId !== 'platform')
        .reduce((sum: number, wallet: any) => sum + wallet.balance, 0)
      
      // Get all transactions
      const transactions = await db.select().from(walletTransactions)
      
      // Calculate total deposited and withdrawn
      const totalDeposited = transactions
        .filter((tx: any) => tx.type === 'DEPOSIT' && tx.status === 'COMPLETED')
        .reduce((sum: number, tx: any) => sum + tx.amount, 0)
      
      const totalWithdrawn = transactions
        .filter((tx: any) => tx.type === 'WITHDRAW' && tx.status === 'COMPLETED')
        .reduce((sum: number, tx: any) => sum + tx.amount, 0)
      
      // Calculate burned amount (system transactions representing burned tokens)
      const burnedAmount = transactions
        .filter((tx: any) => 
          tx.userId === 'system' && 
          tx.type === 'BOUNTY_EARNED' && 
          tx.status === 'COMPLETED'
        )
        .reduce((sum: number, tx: any) => sum + tx.amount, 0)
      
      // Calculate burn percentage based on total supply
      const burnPercentage = totalSupply > 0 ? (burnedAmount / totalSupply) * 100 : 0
      
      return {
        initialSupply: totalSupply, // Real total supply from blockchain
        currentSupply: currentSupply, // Virtual tokens in platform wallets
        burnedAmount: burnedAmount,
        burnPercentage: burnPercentage,
        totalDeposited: totalDeposited,
        totalWithdrawn: totalWithdrawn
      }
    } catch (error) {
      console.error('Error getting supply stats:', error)
      return {
        initialSupply: 0,
        currentSupply: 0,
        burnedAmount: 0,
        burnPercentage: 0,
        totalDeposited: 0,
        totalWithdrawn: 0
      }
    }
  }

  /**
   * Get real BBUX token balance from blockchain for a user
   */
  static async getUserBBUXBalance(userAddress: string): Promise<number> {
    try {
      return await SolanaService.getBBUXBalance(userAddress)
    } catch (error) {
      console.error('Error getting user BBUX balance:', error)
      return 0
    }
  }

  /**
   * Get total BBUX supply from blockchain
   */
  static async getTotalBBUXSupply(): Promise<number> {
    try {
      const mintInfo = await getMint(this.connection, BBUX_MINT)
      return Number(mintInfo.supply) / Math.pow(10, mintInfo.decimals)
    } catch (error) {
      console.error('Error getting total BBUX supply:', error)
      return 0
    }
  }

  /**
   * Get circulating supply (total supply minus burned tokens)
   */
  static async getCirculatingSupply(): Promise<number> {
    try {
      const totalSupply = await this.getTotalBBUXSupply()
      // For now, return total supply as we don't have access to DB here
      // In a real implementation, you'd query for actual burned tokens
      return totalSupply
    } catch (error) {
      console.error('Error getting circulating supply:', error)
      return 0
    }
  }
} 
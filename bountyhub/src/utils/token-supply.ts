import { createDb } from './db'
import { virtualWallets, walletTransactions } from '../../drizzle/schema'
import { eq } from 'drizzle-orm'

export class TokenSupplyService {
  static async getSupplyStats(db: any) {
    try {
      // Get all wallets
      const wallets = await db.select().from(virtualWallets)
      
      // Calculate current supply (sum of all balances)
      const currentSupply = wallets.reduce((sum: number, wallet: any) => sum + wallet.balance, 0)
      
      // Get all transactions
      const transactions = await db.select().from(walletTransactions)
      
      // Calculate total deposited and withdrawn
      const totalDeposited = transactions
        .filter((tx: any) => tx.type === 'DEPOSIT' && tx.status === 'COMPLETED')
        .reduce((sum: number, tx: any) => sum + tx.amount, 0)
      
      const totalWithdrawn = transactions
        .filter((tx: any) => tx.type === 'WITHDRAW' && tx.status === 'COMPLETED')
        .reduce((sum: number, tx: any) => sum + tx.amount, 0)
      
      // Calculate burned amount (deposited - current supply)
      const burnedAmount = totalDeposited - currentSupply
      
      // Calculate burn percentage
      const burnPercentage = totalDeposited > 0 ? (burnedAmount / totalDeposited) * 100 : 0
      
      return {
        initialSupply: totalDeposited,
        currentSupply: currentSupply,
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
} 
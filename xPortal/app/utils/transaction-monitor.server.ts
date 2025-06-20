import { SolanaWalletService } from "./solana-wallet.server";
import { MultisigWalletService } from "./multisig-wallet.server";
import { getWalletDetails } from "./virtual-wallet.server";
import type { Db } from "./db.server";
import { eq, asc } from "drizzle-orm";
import { walletTransactions } from "../../drizzle/schema";

export interface TransactionAlert {
  type: 'LARGE_DEPOSIT' | 'LARGE_WITHDRAWAL' | 'SUSPICIOUS_ACTIVITY' | 'LOW_BALANCE';
  message: string;
  amount?: number;
  userId?: string;
  transactionId?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface TransactionMonitorConfig {
  checkInterval: number; // milliseconds
  maxRetries: number;
  retryDelay: number; // milliseconds
}

export interface PendingTransaction {
  id: string;
  userId: string;
  type: string;
  amount: number;
  status: string;
  createdAt: Date;
  retryCount: number;
}

export class TransactionMonitorService {
  private static config: TransactionMonitorConfig = {
    checkInterval: 30000, // 30 seconds
    maxRetries: 3,
    retryDelay: 60000, // 1 minute
  };

  static setConfig(config: Partial<TransactionMonitorConfig>) {
    this.config = { ...this.config, ...config };
  }

  static async startMonitoring(db: Db) {
    console.log('Starting transaction monitoring...');
    
    // Start the monitoring loop
    setInterval(async () => {
      await this.processPendingTransactions(db);
    }, this.config.checkInterval);
  }

  static async processPendingTransactions(db: Db) {
    try {
      console.log('Processing pending transactions...');
      
      // Get all pending transactions
      const pendingTransactions = await this.getPendingTransactions(db);
      
      for (const transaction of pendingTransactions) {
        await this.processTransaction(db, transaction);
      }
    } catch (error) {
      console.error('Error processing pending transactions:', error);
    }
  }

  static async getPendingTransactions(db: Db): Promise<PendingTransaction[]> {
    try {
      const transactions = await db.query.walletTransactions.findMany({
        where: eq(walletTransactions.status, 'PENDING'),
        orderBy: [asc(walletTransactions.createdAt)]
      });

      return transactions.map(tx => ({
        id: tx.id,
        userId: tx.userId,
        type: tx.type,
        amount: tx.amount,
        status: tx.status,
        createdAt: tx.createdAt,
        retryCount: 0, // This would need to be tracked separately
      }));
    } catch (error) {
      console.error('Error getting pending transactions:', error);
      return [];
    }
  }

  static async processTransaction(db: Db, transaction: PendingTransaction) {
    try {
      console.log(`Processing transaction ${transaction.id}...`);
      
      // Check if transaction has exceeded max retries
      if (transaction.retryCount >= this.config.maxRetries) {
        await this.markTransactionFailed(db, transaction.id);
        return;
      }

      // Process based on transaction type
      switch (transaction.type) {
        case 'DEPOSIT':
          await this.processDepositTransaction(db, transaction);
          break;
        case 'WITHDRAW':
          await this.processWithdrawalTransaction(db, transaction);
          break;
        default:
          console.log(`Unknown transaction type: ${transaction.type}`);
      }
    } catch (error) {
      console.error(`Error processing transaction ${transaction.id}:`, error);
      await this.incrementRetryCount(db, transaction.id);
    }
  }

  static async processDepositTransaction(db: Db, transaction: PendingTransaction) {
    // For deposits, we might want to verify the Solana transaction
    // This would involve checking if the transaction is confirmed on-chain
    console.log(`Processing deposit transaction ${transaction.id}`);
    
    // For now, we'll just mark it as completed
    // In a real implementation, you'd verify the Solana transaction
    await this.markTransactionCompleted(db, transaction.id);
  }

  static async processWithdrawalTransaction(db: Db, transaction: PendingTransaction) {
    console.log(`Processing withdrawal transaction ${transaction.id}`);
    
    // For withdrawals, we might want to check if the Solana transaction was successful
    // This would involve checking the Solana network for the transaction status
    
    // For now, we'll just mark it as completed
    // In a real implementation, you'd verify the Solana transaction
    await this.markTransactionCompleted(db, transaction.id);
  }

  static async markTransactionCompleted(db: Db, transactionId: string) {
    try {
      await db.update(walletTransactions)
        .set({ status: 'COMPLETED' })
        .where(eq(walletTransactions.id, transactionId))
        .run();
      
      console.log(`Transaction ${transactionId} marked as completed`);
    } catch (error) {
      console.error(`Error marking transaction ${transactionId} as completed:`, error);
    }
  }

  static async markTransactionFailed(db: Db, transactionId: string) {
    try {
      await db.update(walletTransactions)
        .set({ status: 'FAILED' })
        .where(eq(walletTransactions.id, transactionId))
        .run();
      
      console.log(`Transaction ${transactionId} marked as failed`);
    } catch (error) {
      console.error(`Error marking transaction ${transactionId} as failed:`, error);
    }
  }

  static async incrementRetryCount(db: Db, transactionId: string) {
    try {
      // Note: This would require adding a retryCount field to the schema
      // For now, we'll just log the retry
      console.log(`Incrementing retry count for transaction ${transactionId}`);
    } catch (error) {
      console.error(`Error incrementing retry count for transaction ${transactionId}:`, error);
    }
  }

  static async getTransactionStats(db: Db, userId: string) {
    try {
      const walletData = await getWalletDetails(db, userId);
      
      if (!walletData.wallet) {
        return null;
      }
      
      return {
        totalTransactions: walletData.transactions.length,
        pendingTransactions: walletData.transactions.filter(tx => tx.status === 'PENDING').length,
        completedTransactions: walletData.transactions.filter(tx => tx.status === 'COMPLETED').length,
        failedTransactions: walletData.transactions.filter(tx => tx.status === 'FAILED').length,
        walletBalance: walletData.wallet.balance,
      };
    } catch (error) {
      console.error('Error getting transaction stats:', error);
      return null;
    }
  }

  // Thresholds for alerts
  private static readonly LARGE_DEPOSIT_THRESHOLD = 10; // SOL
  private static readonly LARGE_WITHDRAWAL_THRESHOLD = 5; // SOL
  private static readonly LOW_BALANCE_THRESHOLD = 1; // SOL
  private static readonly SUSPICIOUS_AMOUNT_THRESHOLD = 100; // SOL

  /**
   * Monitor a deposit transaction
   */
  static async monitorDeposit(
    userId: string, 
    amount: number, 
    transactionId: string
  ): Promise<TransactionAlert[]> {
    const alerts: TransactionAlert[] = [];

    // Check for large deposits
    if (amount > this.LARGE_DEPOSIT_THRESHOLD) {
      alerts.push({
        type: 'LARGE_DEPOSIT',
        message: `Large deposit detected: ${amount} SOL from user ${userId}`,
        amount,
        userId,
        transactionId,
        severity: amount > this.SUSPICIOUS_AMOUNT_THRESHOLD ? 'CRITICAL' : 'HIGH'
      });
    }

    // Check platform balance
    const platformBalance = await this.getPlatformBalance();
    if (platformBalance < this.LOW_BALANCE_THRESHOLD) {
      alerts.push({
        type: 'LOW_BALANCE',
        message: `Platform balance is low: ${platformBalance} SOL`,
        amount: platformBalance,
        severity: 'HIGH'
      });
    }

    // Log the transaction
    this.logTransaction({
      type: 'DEPOSIT',
      userId,
      amount,
      transactionId,
      timestamp: new Date(),
      status: 'PENDING'
    });

    return alerts;
  }

  /**
   * Monitor a withdrawal transaction
   */
  static async monitorWithdrawal(
    db: Db,
    userId: string, 
    amount: number, 
    transactionId: string
  ): Promise<TransactionAlert[]> {
    const alerts: TransactionAlert[] = [];

    // Check for large withdrawals
    if (amount > this.LARGE_WITHDRAWAL_THRESHOLD) {
      alerts.push({
        type: 'LARGE_WITHDRAWAL',
        message: `Large withdrawal detected: ${amount} SOL to user ${userId}`,
        amount,
        userId,
        transactionId,
        severity: amount > this.SUSPICIOUS_AMOUNT_THRESHOLD ? 'CRITICAL' : 'HIGH'
      });
    }

    // Check if user has sufficient balance
    const userBalance = await this.getUserBalance(db, userId);
    if (userBalance < amount) {
      alerts.push({
        type: 'SUSPICIOUS_ACTIVITY',
        message: `Insufficient balance withdrawal attempt: ${amount} SOL requested, ${userBalance} SOL available`,
        amount,
        userId,
        transactionId,
        severity: 'CRITICAL'
      });
    }

    // Log the transaction
    this.logTransaction({
      type: 'WITHDRAWAL',
      userId,
      amount,
      transactionId,
      timestamp: new Date(),
      status: 'PENDING'
    });

    return alerts;
  }

  /**
   * Get platform wallet balance
   */
  private static async getPlatformBalance(): Promise<number> {
    try {
      if (MultisigWalletService.isMultisigConfigured()) {
        return await MultisigWalletService.getMultisigBalance();
      } else {
        return await SolanaWalletService.getBalance(SolanaWalletService.getPlatformWalletAddress());
      }
    } catch (error) {
      console.error("Error getting platform balance:", error);
      return 0;
    }
  }

  /**
   * Get user's virtual wallet balance
   */
  private static async getUserBalance(db: Db, userId: string): Promise<number> {
    try {
      const walletData = await getWalletDetails(db, userId);
      return walletData.wallet?.balance || 0;
    } catch (error) {
      console.error('Error getting user balance:', error);
      return 0;
    }
  }

  /**
   * Log transaction for audit purposes (console logging for now)
   */
  private static logTransaction(data: {
    type: string;
    userId: string;
    amount: number;
    transactionId: string;
    timestamp: Date;
    status: string;
  }) {
    console.log(`[TRANSACTION LOG] ${data.type}: User ${data.userId}, Amount: ${data.amount} SOL, Status: ${data.status}, Time: ${data.timestamp.toISOString()}`);
  }

  /**
   * Send alerts (placeholder for integration with alerting service)
   */
  static async sendAlerts(alerts: TransactionAlert[]): Promise<void> {
    for (const alert of alerts) {
      console.log(`[ALERT] ${alert.severity}: ${alert.message}`);
      
      // TODO: Integrate with your preferred alerting service
      // Examples: Slack, Discord, Email, SMS, etc.
      
      if (alert.severity === 'CRITICAL') {
        // Immediate action required
        await this.handleCriticalAlert(alert);
      }
    }
  }

  /**
   * Handle critical alerts
   */
  private static async handleCriticalAlert(alert: TransactionAlert): Promise<void> {
    // TODO: Implement critical alert handling
    // Examples: Pause transactions, notify admins, etc.
    console.log(`[CRITICAL ALERT HANDLED] ${alert.message}`);
  }
} 
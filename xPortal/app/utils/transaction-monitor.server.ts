import { SolanaWalletService } from "./solana-wallet.server";
import { MultisigWalletService } from "./multisig-wallet.server";

export interface TransactionAlert {
  type: 'LARGE_DEPOSIT' | 'LARGE_WITHDRAWAL' | 'SUSPICIOUS_ACTIVITY' | 'LOW_BALANCE';
  message: string;
  amount?: number;
  userId?: string;
  transactionId?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export class TransactionMonitorService {
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
    const userBalance = await this.getUserBalance(userId);
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
  private static async getUserBalance(userId: string): Promise<number> {
    try {
      const { VirtualWalletService } = await import("./virtual-wallet.server");
      const walletData = await VirtualWalletService.getWalletDetails(userId);
      return walletData.wallet.balance;
    } catch (error) {
      console.error("Error getting user balance:", error);
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
import { prisma } from "./db.server";
import portalTokenInfo from '../../portal-token-info';
const TOKEN_SYMBOL = portalTokenInfo.config.symbol;

export class VirtualWalletService {
  /**
   * Get or create a virtual wallet for a user
   */
  static async getOrCreateWallet(userId: string) {
    let wallet = await prisma.virtualWallet.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            username: true,
            email: true,
          },
        },
      },
    });

    if (!wallet) {
      wallet = await prisma.virtualWallet.create({
        data: {
          userId,
          balance: 0,
          totalDeposited: 0,
          totalWithdrawn: 0,
          totalEarned: 0,
          totalSpent: 0,
        },
        include: {
          user: {
            select: {
              username: true,
              email: true,
            },
          },
        },
      });
    }

    return wallet;
  }

  /**
   * Get wallet balance and transaction history (limited for wallet page)
   */
  static async getWalletDetails(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);
    
    const transactions = await prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5, // Show only 5 most recent transactions on wallet page
      include: {
        bounty: {
          select: {
            id: true,
            amount: true,
            status: true,
            post: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    return {
      wallet,
      transactions,
    };
  }

  /**
   * Get all transactions for a user (for transactions page)
   */
  static async getAllTransactions(userId: string, page: number = 1, limit: number = 50) {
    const wallet = await this.getOrCreateWallet(userId);
    
    const skip = (page - 1) * limit;
    
    const [transactions, totalCount] = await Promise.all([
      prisma.walletTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
        include: {
          bounty: {
            select: {
              id: true,
              amount: true,
              status: true,
              post: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      }),
      prisma.walletTransaction.count({
        where: { userId },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      transactions,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Expire old pending transactions
   */
  static async expirePendingTransactions() {
    const EXPIRATION_HOURS = 24; // 24 hours
    const expirationDate = new Date(Date.now() - EXPIRATION_HOURS * 60 * 60 * 1000);

    // Find expired pending transactions
    const expiredTransactions = await prisma.walletTransaction.findMany({
      where: {
        status: "PENDING",
        createdAt: {
          lt: expirationDate,
        },
      },
      include: {
        wallet: true,
      },
    });

    const results = [];

    for (const transaction of expiredTransactions) {
      try {
        if (transaction.type === "DEPOSIT") {
          // For expired deposits, just mark as cancelled (no funds were deducted)
          await prisma.walletTransaction.update({
            where: { id: transaction.id },
            data: {
              status: "CANCELLED",
              description: `${transaction.description} (Expired)`,
            },
          });
          results.push({
            id: transaction.id,
            type: "DEPOSIT",
            action: "CANCELLED",
            reason: "Expired",
          });
        } else if (transaction.type === "WITHDRAW") {
          // For expired withdrawals, return the funds to the user's virtual wallet
          await prisma.$transaction(async (tx) => {
            // Update transaction status
            await tx.walletTransaction.update({
              where: { id: transaction.id },
              data: {
                status: "CANCELLED",
                description: `${transaction.description} (Expired - Funds Returned)`,
              },
            });

            // Return funds to virtual wallet
            await tx.virtualWallet.update({
              where: { id: transaction.walletId },
              data: {
                balance: {
                  increment: transaction.amount,
                },
                totalWithdrawn: {
                  decrement: transaction.amount,
                },
              },
            });
          });

          results.push({
            id: transaction.id,
            type: "WITHDRAW",
            action: "FUNDS_RETURNED",
            reason: "Expired",
            amount: transaction.amount,
          });
        }
      } catch (error: unknown) {
        console.error(`Error expiring transaction ${transaction.id}:`, error);
        results.push({
          id: transaction.id,
          type: transaction.type,
          action: "ERROR",
          reason: (error as Error).message,
        });
      }
    }

    return results;
  }

  /**
   * Get pending transactions for a user
   */
  static async getPendingTransactions(userId: string) {
    return await prisma.walletTransaction.findMany({
      where: {
        userId,
        status: "PENDING",
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Cancel a pending transaction (user-initiated)
   */
  static async cancelPendingTransaction(transactionId: string, userId: string) {
    const transaction = await prisma.walletTransaction.findFirst({
      where: {
        id: transactionId,
        userId,
        status: "PENDING",
      },
      include: {
        wallet: true,
      },
    });

    if (!transaction) {
      throw new Error("Transaction not found or not pending");
    }

    if (transaction.type === "DEPOSIT") {
      // For deposits, just mark as cancelled
      await prisma.walletTransaction.update({
        where: { id: transactionId },
        data: {
          status: "CANCELLED",
          description: `${transaction.description} (Cancelled by user)`,
        },
      });
    } else if (transaction.type === "WITHDRAW") {
      // For withdrawals, return funds to virtual wallet
      await prisma.$transaction(async (tx) => {
        await tx.walletTransaction.update({
          where: { id: transactionId },
          data: {
            status: "CANCELLED",
            description: `${transaction.description} (Cancelled by user - Funds Returned)`,
          },
        });

        await tx.virtualWallet.update({
          where: { id: transaction.walletId },
          data: {
            balance: {
              increment: transaction.amount,
            },
            totalWithdrawn: {
              decrement: transaction.amount,
            },
          },
        });
      });
    }

    return transaction;
  }

  /**
   * Get transaction statistics for a user
   */
  static async getTransactionStats(userId: string) {
    const stats = await prisma.walletTransaction.groupBy({
      by: ['status'],
      where: { userId },
      _count: {
        status: true,
      },
    });

    const pendingCount = stats.find(s => s.status === 'PENDING')?._count.status || 0;
    const completedCount = stats.find(s => s.status === 'COMPLETED')?._count.status || 0;
    const cancelledCount = stats.find(s => s.status === 'CANCELLED')?._count.status || 0;

    return {
      pending: pendingCount,
      completed: completedCount,
      cancelled: cancelledCount,
      total: pendingCount + completedCount + cancelledCount,
    };
  }

  /**
   * Create a deposit transaction (virtual - user will need to send actual SOL)
   */
  static async createDepositRequest(userId: string, amount: number) {
    const wallet = await this.getOrCreateWallet(userId);

    const transaction = await prisma.walletTransaction.create({
      data: {
        userId,
        walletId: wallet.id,
        type: "DEPOSIT" as any,
        amount,
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance, // Will be updated when deposit is confirmed
        description: `Deposit request for ${amount} ${TOKEN_SYMBOL}`,
        status: "PENDING" as any,
      },
    });

    return transaction;
  }

  /**
   * Confirm a deposit (called after user sends actual SOL)
   */
  static async confirmDeposit(transactionId: string, solanaSignature: string) {
    const transaction = await prisma.walletTransaction.findUnique({
      where: { id: transactionId },
      include: { wallet: true },
    });

    if (!transaction || transaction.type !== "DEPOSIT") {
      throw new Error("Invalid transaction");
    }

    if (transaction.status !== "PENDING") {
      throw new Error("Transaction already processed");
    }

    // Update wallet balance
    const updatedWallet = await prisma.virtualWallet.update({
      where: { id: transaction.walletId },
      data: {
        balance: transaction.wallet.balance + transaction.amount,
        totalDeposited: transaction.wallet.totalDeposited + transaction.amount,
      },
    });

    // Update transaction
    const updatedTransaction = await prisma.walletTransaction.update({
      where: { id: transactionId },
      data: {
        status: "COMPLETED" as any,
        balanceAfter: updatedWallet.balance,
        solanaSignature,
      },
    });

    return { wallet: updatedWallet, transaction: updatedTransaction };
  }

  /**
   * Create a withdrawal request
   */
  static async createWithdrawalRequest(userId: string, amount: number) {
    const wallet = await this.getOrCreateWallet(userId);

    if (wallet.balance < amount) {
      throw new Error("Insufficient balance");
    }

    const transaction = await prisma.walletTransaction.create({
      data: {
        userId,
        walletId: wallet.id,
        type: "WITHDRAW" as any,
        amount,
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance - amount,
        description: `Withdrawal request for ${amount} ${TOKEN_SYMBOL}`,
        status: "PENDING" as any,
      },
    });

    // Immediately deduct from virtual balance
    await prisma.virtualWallet.update({
      where: { id: wallet.id },
      data: {
        balance: wallet.balance - amount,
        totalWithdrawn: wallet.totalWithdrawn + amount,
      },
    });

    return transaction;
  }

  /**
   * Confirm a withdrawal (after sending actual SOL to user)
   */
  static async confirmWithdrawal(transactionId: string, solanaSignature: string) {
    const transaction = await prisma.walletTransaction.update({
      where: { id: transactionId },
      data: {
        status: "COMPLETED" as any,
        solanaSignature,
      },
    });

    return transaction;
  }

  /**
   * Create a bounty (deduct from virtual balance)
   */
  static async createBounty(userId: string, amount: number, bountyId: string) {
    const wallet = await this.getOrCreateWallet(userId);

    if (wallet.balance < amount) {
      throw new Error("Insufficient balance to create bounty");
    }

    const transaction = await prisma.walletTransaction.create({
      data: {
        userId,
        walletId: wallet.id,
        type: "BOUNTY_CREATED" as any,
        amount,
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance - amount,
        description: `Created bounty for ${amount} ${TOKEN_SYMBOL}`,
        status: "COMPLETED" as any,
        bountyId,
      },
    });

    // Deduct from virtual balance
    await prisma.virtualWallet.update({
      where: { id: wallet.id },
      data: {
        balance: wallet.balance - amount,
        totalSpent: wallet.totalSpent + amount,
      },
    });

    return transaction;
  }

  /**
   * Claim a bounty (add to winner's virtual balance)
   */
  static async claimBounty(userId: string, amount: number, bountyId: string) {
    const wallet = await this.getOrCreateWallet(userId);

    const transaction = await prisma.walletTransaction.create({
      data: {
        userId,
        walletId: wallet.id,
        type: "BOUNTY_CLAIMED" as any,
        amount,
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance + amount,
        description: `Won bounty for ${amount} ${TOKEN_SYMBOL}`,
        status: "COMPLETED" as any,
        bountyId,
      },
    });

    // Add to virtual balance
    await prisma.virtualWallet.update({
      where: { id: wallet.id },
      data: {
        balance: wallet.balance + amount,
        totalEarned: wallet.totalEarned + amount,
      },
    });

    return transaction;
  }

  /**
   * Refund a bounty (return to creator's virtual balance)
   */
  static async refundBounty(userId: string, amount: number, bountyId: string) {
    const wallet = await this.getOrCreateWallet(userId);

    const transaction = await prisma.walletTransaction.create({
      data: {
        userId,
        walletId: wallet.id,
        type: "BOUNTY_REFUNDED" as any,
        amount,
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance + amount,
        description: `Bounty refunded for ${amount} ${TOKEN_SYMBOL}`,
        status: "COMPLETED" as any,
        bountyId,
      },
    });

    // Add back to virtual balance
    await prisma.virtualWallet.update({
      where: { id: wallet.id },
      data: {
        balance: wallet.balance + amount,
        totalSpent: wallet.totalSpent - amount, // Reduce total spent since it was refunded
      },
    });

    return transaction;
  }

  /**
   * Get a specific transaction by ID
   */
  static async getTransaction(transactionId: string) {
    const transaction = await prisma.walletTransaction.findUnique({
      where: { id: transactionId },
      include: { wallet: true },
    });

    return transaction;
  }
} 
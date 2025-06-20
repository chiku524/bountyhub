import bountyBucksInfo from '../../bounty-bucks-info.json';
import { eq, and, desc, sql } from 'drizzle-orm';
import { virtualWallets, walletTransactions, bounties } from '../../drizzle/schema';
import type { Db } from './db.server';

const TOKEN_SYMBOL = bountyBucksInfo.symbol;

export interface VirtualWallet {
  id: string;
  userId: string;
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalEarned: number;
  totalSpent: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  walletId: string;
  type: 'DEPOSIT' | 'WITHDRAW' | 'BOUNTY_CREATED' | 'BOUNTY_CLAIMED' | 'BOUNTY_REFUNDED' | 'BOUNTY_EARNED' | 'COMPENSATION';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  solanaSignature?: string | null;
  bountyId?: string | null;
  metadata?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function getVirtualWallet(db: Db, userId: string): Promise<VirtualWallet | null> {
  try {
    const wallet = await db.query.virtualWallets.findFirst({
      where: eq(virtualWallets.userId, userId)
    });
    return wallet || null;
  } catch (error) {
    console.error('Error getting virtual wallet:', error);
    return null;
  }
}

export async function createVirtualWallet(db: Db, userId: string): Promise<VirtualWallet | null> {
  try {
    const [wallet] = await db.insert(virtualWallets).values({
      id: crypto.randomUUID(),
      userId,
      balance: 0,
      totalDeposited: 0,
      totalWithdrawn: 0,
      totalEarned: 0,
      totalSpent: 0,
    }).returning().all();
    return wallet;
  } catch (error) {
    console.error('Error creating virtual wallet:', error);
    return null;
  }
}

export async function updateWalletBalance(
  db: Db,
  userId: string,
  amount: number,
  transactionType: WalletTransaction['type'],
  description: string,
  metadata?: any
): Promise<boolean> {
  try {
    const wallet = await getVirtualWallet(db, userId);
    if (!wallet) {
      console.error('Wallet not found for user:', userId);
      return false;
    }

    const balanceBefore = wallet.balance;
    let balanceAfter = balanceBefore;

    // Calculate new balance based on transaction type
    switch (transactionType) {
      case 'DEPOSIT':
        balanceAfter = balanceBefore + amount;
        break;
      case 'WITHDRAW':
        if (balanceBefore < amount) {
          console.error('Insufficient balance for withdrawal');
          return false;
        }
        balanceAfter = balanceBefore - amount;
        break;
      case 'BOUNTY_CREATED':
        if (balanceBefore < amount) {
          console.error('Insufficient balance for bounty creation');
          return false;
        }
        balanceAfter = balanceBefore - amount;
        break;
      case 'BOUNTY_CLAIMED':
      case 'BOUNTY_EARNED':
      case 'COMPENSATION':
        balanceAfter = balanceBefore + amount;
        break;
      case 'BOUNTY_REFUNDED':
        balanceAfter = balanceBefore + amount;
        break;
      default:
        console.error('Invalid transaction type:', transactionType);
        return false;
    }

    // Update wallet balance
    await db.update(virtualWallets)
      .set({
        balance: balanceAfter,
        totalDeposited: transactionType === 'DEPOSIT' ? wallet.totalDeposited + amount : wallet.totalDeposited,
        totalWithdrawn: transactionType === 'WITHDRAW' ? wallet.totalWithdrawn + amount : wallet.totalWithdrawn,
        totalEarned: ['BOUNTY_CLAIMED', 'BOUNTY_EARNED', 'COMPENSATION'].includes(transactionType) ? wallet.totalEarned + amount : wallet.totalEarned,
        totalSpent: ['BOUNTY_CREATED', 'WITHDRAW'].includes(transactionType) ? wallet.totalSpent + amount : wallet.totalSpent,
      })
      .where(eq(virtualWallets.userId, userId))
      .run();

    // Create transaction record
    await db.insert(walletTransactions).values({
      id: crypto.randomUUID(),
      userId,
      walletId: wallet.id,
      type: transactionType,
      amount,
      balanceBefore,
      balanceAfter,
      description,
      status: 'COMPLETED',
      metadata: metadata ? JSON.stringify(metadata) : undefined,
    }).run();

    return true;
  } catch (error) {
    console.error('Error updating wallet balance:', error);
    return false;
  }
}

export async function getWalletTransactions(
  db: Db,
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<WalletTransaction[]> {
  try {
    const transactions = await db.query.walletTransactions.findMany({
      where: eq(walletTransactions.userId, userId),
      orderBy: [desc(walletTransactions.createdAt)],
      limit,
      offset,
    });
    return transactions;
  } catch (error) {
    console.error('Error getting wallet transactions:', error);
    return [];
  }
}

export async function getTransactionById(db: Db, transactionId: string): Promise<WalletTransaction | null> {
  try {
    const transaction = await db.query.walletTransactions.findFirst({
      where: eq(walletTransactions.id, transactionId)
    });
    return transaction || null;
  } catch (error) {
    console.error('Error getting transaction by ID:', error);
    return null;
  }
}

export async function cancelTransaction(db: Db, transactionId: string): Promise<boolean> {
  try {
    const transaction = await getTransactionById(db, transactionId);
    if (!transaction || transaction.status !== 'PENDING') {
      return false;
    }

    // Reverse the transaction
    const reverseAmount = transaction.amount;
    const reverseType = transaction.type === 'DEPOSIT' ? 'WITHDRAW' : 
                       transaction.type === 'WITHDRAW' ? 'DEPOSIT' : 
                       transaction.type;

    const success = await updateWalletBalance(
      db,
      transaction.userId,
      reverseAmount,
      reverseType as WalletTransaction['type'],
      `Cancelled: ${transaction.description}`
    );

    if (success) {
      await db.update(walletTransactions)
        .set({ status: 'CANCELLED' })
        .where(eq(walletTransactions.id, transactionId))
        .run();
    }

    return success;
  } catch (error) {
    console.error('Error cancelling transaction:', error);
    return false;
  }
}

export async function getWalletDetails(db: Db, userId: string) {
  const wallet = await getVirtualWallet(db, userId);
  const transactions = await getWalletTransactions(db, userId, 5);
  return { wallet, transactions };
}

export async function getAllTransactions(db: Db, userId: string, page: number = 1, limit: number = 50) {
  const wallet = await getVirtualWallet(db, userId);
  const offset = (page - 1) * limit;
  const [transactions, totalCountResult] = await Promise.all([
    getWalletTransactions(db, userId, limit, offset),
    db.select({ count: sql`count(*)` }).from(walletTransactions).where(eq(walletTransactions.userId, userId)).get(),
  ]);
  
  const totalCount = totalCountResult?.count as number || 0;
  return { transactions, totalCount, wallet };
}

export async function getPendingTransactions(db: Db, userId: string) {
  return await db.query.walletTransactions.findMany({
    where: and(
      eq(walletTransactions.userId, userId),
      eq(walletTransactions.status, 'PENDING')
    ),
    orderBy: [desc(walletTransactions.createdAt)],
  });
}

export async function createDepositRequest(db: Db, userId: string, amount: number) {
  const wallet = await getVirtualWallet(db, userId);
  if (!wallet) throw new Error('Wallet not found');
  
  const [transaction] = await db.insert(walletTransactions).values({
    id: crypto.randomUUID(),
    userId,
    walletId: wallet.id,
    type: 'DEPOSIT',
    amount,
    balanceBefore: wallet.balance,
    balanceAfter: wallet.balance,
    description: `Deposit request for ${amount} tokens`,
    status: 'PENDING',
  }).returning().all();
  
  return transaction;
}

export async function confirmDeposit(db: Db, transactionId: string, solanaSignature: string) {
  const transaction = await getTransactionById(db, transactionId);

  if (!transaction || transaction.type !== 'DEPOSIT') {
    throw new Error('Invalid transaction');
  }

  if (transaction.status !== 'PENDING') {
    throw new Error('Transaction already processed');
  }

  // Update transaction status
  await db.update(walletTransactions).set({
    status: 'COMPLETED',
    solanaSignature,
  }).where(eq(walletTransactions.id, transactionId)).run();

  // Update wallet balance
  const wallet = await getVirtualWallet(db, transaction.userId);
  if (!wallet) throw new Error('Wallet not found');
  
  await db.update(virtualWallets).set({
    balance: wallet.balance + transaction.amount,
    totalDeposited: wallet.totalDeposited + transaction.amount,
  }).where(eq(virtualWallets.id, wallet.id)).run();
  
  return await getTransactionById(db, transactionId);
}

export async function createWithdrawalRequest(db: Db, userId: string, amount: number, metadata?: any) {
  const wallet = await getVirtualWallet(db, userId);

  if (!wallet || wallet.balance < amount) {
    throw new Error("Insufficient balance");
  }

  const [transaction] = await db.insert(walletTransactions).values({
    id: crypto.randomUUID(),
    userId,
    walletId: wallet.id,
    type: 'WITHDRAW',
    amount,
    balanceBefore: wallet.balance,
    balanceAfter: wallet.balance - amount,
    description: `Withdrawal request for ${amount} tokens`,
    status: 'PENDING',
    metadata: metadata ? JSON.stringify(metadata) : null,
  }).returning().all();

  return transaction;
}

export async function confirmWithdrawal(db: Db, transactionId: string, solanaSignature: string) {
  const transaction = await getTransactionById(db, transactionId);

  if (!transaction || transaction.type !== 'WITHDRAW') {
    throw new Error('Invalid transaction');
  }

  if (transaction.status !== 'PENDING') {
    throw new Error('Transaction already processed');
  }

  // Update transaction status
  await db.update(walletTransactions).set({
    status: 'COMPLETED',
    solanaSignature,
  }).where(eq(walletTransactions.id, transactionId)).run();

  return await getTransactionById(db, transactionId);
}

export async function createBounty(db: Db, userId: string, amount: number, bountyId: string) {
  const wallet = await getVirtualWallet(db, userId);

  if (!wallet || wallet.balance < amount) {
    throw new Error("Insufficient balance to create bounty");
  }

  const [transaction] = await db.insert(walletTransactions).values({
    id: crypto.randomUUID(),
    userId,
    walletId: wallet.id,
    type: 'BOUNTY_CREATED',
    amount,
    balanceBefore: wallet.balance,
    balanceAfter: wallet.balance - amount,
    description: `Bounty created for ${amount} tokens`,
    status: 'COMPLETED',
    bountyId,
  }).returning().all();

  return transaction;
}

export async function claimBounty(db: Db, userId: string, amount: number, bountyId: string) {
  const wallet = await getVirtualWallet(db, userId);

  const [transaction] = await db.insert(walletTransactions).values({
    id: crypto.randomUUID(),
    userId,
    walletId: wallet?.id || '',
    type: 'BOUNTY_CLAIMED',
    amount,
    balanceBefore: wallet?.balance || 0,
    balanceAfter: (wallet?.balance || 0) + amount,
    description: `Bounty claimed for ${amount} tokens`,
    status: 'COMPLETED',
    bountyId,
  }).returning().all();

  return transaction;
}

export async function refundBounty(db: Db, userId: string, amount: number, bountyId: string) {
  const wallet = await getVirtualWallet(db, userId);

  const [transaction] = await db.insert(walletTransactions).values({
    id: crypto.randomUUID(),
    userId,
    walletId: wallet?.id || '',
    type: 'BOUNTY_REFUNDED',
    amount,
    balanceBefore: wallet?.balance || 0,
    balanceAfter: (wallet?.balance || 0) + amount,
    description: `Bounty refunded for ${amount} tokens`,
    status: 'COMPLETED',
    bountyId,
  }).returning().all();

  return transaction;
}

export async function addCompensation(db: Db, userId: string, amount: number, reason: string) {
  const wallet = await getVirtualWallet(db, userId);

  const [transaction] = await db.insert(walletTransactions).values({
    id: crypto.randomUUID(),
    userId,
    walletId: wallet?.id || '',
    type: 'COMPENSATION',
    amount,
    balanceBefore: wallet?.balance || 0,
    balanceAfter: (wallet?.balance || 0) + amount,
    description: `Compensation: ${reason}`,
    status: 'COMPLETED',
  }).returning().all();

  return transaction;
} 
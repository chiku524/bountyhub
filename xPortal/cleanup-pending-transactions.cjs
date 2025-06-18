const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function cleanupPendingTransactions() {
  console.log('Starting cleanup of expired pending transactions...');
  
  try {
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

    console.log(`Found ${expiredTransactions.length} expired pending transactions`);

    const results = [];

    for (const transaction of expiredTransactions) {
      try {
        console.log(`Processing transaction ${transaction.id} (${transaction.type})`);
        
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
          console.log(`✓ Cancelled deposit transaction ${transaction.id}`);
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
          console.log(`✓ Returned funds for withdrawal transaction ${transaction.id} (${transaction.amount} tokens)`);
        }
      } catch (error) {
        console.error(`✗ Error processing transaction ${transaction.id}:`, error);
        results.push({
          id: transaction.id,
          type: transaction.type,
          action: "ERROR",
          reason: error.message,
        });
      }
    }

    console.log('\n=== CLEANUP SUMMARY ===');
    console.log(`Total expired transactions: ${expiredTransactions.length}`);
    console.log(`Successfully processed: ${results.filter(r => r.action !== 'ERROR').length}`);
    console.log(`Errors: ${results.filter(r => r.action === 'ERROR').length}`);
    
    const cancelled = results.filter(r => r.action === 'CANCELLED').length;
    const fundsReturned = results.filter(r => r.action === 'FUNDS_RETURNED').length;
    
    if (cancelled > 0) {
      console.log(`Cancelled deposits: ${cancelled}`);
    }
    if (fundsReturned > 0) {
      console.log(`Withdrawals with funds returned: ${fundsReturned}`);
    }

    return results;
  } catch (error) {
    console.error('Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run cleanup if this script is executed directly
if (require.main === module) {
  cleanupPendingTransactions()
    .then(() => {
      console.log('Cleanup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Cleanup failed:', error);
      process.exit(1);
    });
}

module.exports = { cleanupPendingTransactions }; 
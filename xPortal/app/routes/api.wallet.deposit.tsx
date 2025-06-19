import { json, type ActionFunctionArgs } from "@remix-run/node";
import { VirtualWalletService } from "~/utils/virtual-wallet.server";
import { SolanaWalletService } from "~/utils/solana-wallet.server";
import { TransactionMonitorService } from "~/utils/transaction-monitor.server";
import { RateLimiterService } from "~/utils/rate-limiter.server";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/prisma.server";
import { z } from "zod";
import bountyBucksInfo from '../../bounty-bucks-info.json';

const TOKEN_SYMBOL = bountyBucksInfo.config.symbol;

const depositSchema = z.object({
  amount: z.number().positive().max(1000), // Max 1000 SOL per deposit
});

const confirmDepositSchema = z.object({
  transactionId: z.string(),
  solanaSignature: z.string(),
});

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    // Rate limiting check
    const rateLimitResult = await RateLimiterService.checkRateLimit(request, 'deposit');
    if (!rateLimitResult.allowed) {
      return json({ 
        error: "Rate limit exceeded. Please try again later.",
        resetTime: rateLimitResult.resetTime 
      }, { status: 429 });
    }

    const formData = await request.formData();
    const action = formData.get("action") as string;

    // Fetch the user's stored Solana address
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.solanaAddress) {
      return json({ error: "User Solana address not found" }, { status: 400 });
    }

    if (action === "confirm") {
      // Confirm deposit with Solana transaction signature
      const transactionId = formData.get("transactionId") as string;
      const solanaSignature = formData.get("solanaSignature") as string;

      const validatedData = confirmDepositSchema.parse({ transactionId, solanaSignature });

      // Get the original deposit transaction to get amount
      const originalTransaction = await VirtualWalletService.getTransaction(validatedData.transactionId);
      if (!originalTransaction || originalTransaction.type !== "DEPOSIT") {
        return json({ error: "Invalid transaction" }, { status: 400 });
      }

      // Monitor the transaction for security
      const alerts = await TransactionMonitorService.monitorDeposit(
        userId, 
        originalTransaction.amount, 
        validatedData.transactionId
      );
      
      // Send alerts if any
      if (alerts.length > 0) {
        await TransactionMonitorService.sendAlerts(alerts);
      }

      // Process the deposit with on-chain SPL token minting
      const result = await SolanaWalletService.processDeposit(
        userId,
        originalTransaction.amount,
        user.solanaAddress,
        validatedData.transactionId,
        validatedData.solanaSignature
      );

      return json({
        success: true,
        result,
        message: `Successfully deposited ${originalTransaction.amount} SOL and received ${originalTransaction.amount} ${TOKEN_SYMBOL} tokens.`,
      });
    } else {
      // Create initial deposit request
      const amount = parseFloat(formData.get("amount") as string);
      const validatedData = depositSchema.parse({ amount });

      // Monitor the transaction for security
      const alerts = await TransactionMonitorService.monitorDeposit(
        userId, 
        validatedData.amount, 
        'pending'
      );
      
      // Send alerts if any
      if (alerts.length > 0) {
        await TransactionMonitorService.sendAlerts(alerts);
      }

      // Create deposit request
      const transaction = await VirtualWalletService.createDepositRequest(
        userId,
        validatedData.amount
      );

      return json({
        success: true,
        transaction,
        platformAddress: SolanaWalletService.getPlatformWalletAddress(),
        message: `Please send ${validatedData.amount} SOL to the platform address. After confirmation, you will receive ${validatedData.amount} ${TOKEN_SYMBOL} tokens in your wallet.`,
        instructions: [
          `Send exactly ${validatedData.amount} SOL to the platform address below`,
          `Copy the transaction signature from your wallet`,
          `Use the confirmation form to submit the signature`,
          `You will receive ${validatedData.amount} ${TOKEN_SYMBOL} tokens in your wallet`,
        ],
        rateLimit: {
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime
        }
      });
    }
  } catch (error) {
    console.error("Deposit request error:", error);
    
    if (error instanceof z.ZodError) {
      return json({ error: "Invalid input data", details: error.errors }, { status: 400 });
    }

    return json({ error: "Failed to process deposit request" }, { status: 500 });
  }
} 
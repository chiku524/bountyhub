import { json, type ActionFunction } from "@remix-run/node";
import { requireUserId } from "../utils/auth.server";
import { SolanaWalletService } from "../utils/solana-wallet.server";
import { VirtualWalletService } from "../utils/virtual-wallet.server";
import { SolanaAddressService } from "../utils/solana-address.server";

const PLATFORM_FEE_PERCENTAGE = 0.03; // 3% platform fee

export const action: ActionFunction = async ({ request }) => {
  try {
    const userId = await requireUserId(request);
    const formData = await request.formData();
    const requestedAmount = parseFloat(formData.get("amount") as string);
    const destination = formData.get("destination") as string;

    if (!requestedAmount || requestedAmount <= 0) {
      return json({ error: "Invalid withdrawal amount." }, { status: 400 });
    }
    if (!destination || !SolanaAddressService.isValidSolanaAddress(destination)) {
      return json({ error: "Invalid Solana address." }, { status: 400 });
    }

    // Calculate platform fee and net amount
    const platformFee = requestedAmount * PLATFORM_FEE_PERCENTAGE;
    const netAmount = requestedAmount - platformFee;

    // Check virtual wallet balance (user pays the full amount including fee)
    const wallet = await VirtualWalletService.getOrCreateWallet(userId);
    if (wallet.balance < requestedAmount) {
      return json({ error: "Insufficient virtual wallet balance." }, { status: 400 });
    }

    // Create withdrawal request (deducts full amount from virtual wallet)
    const transaction = await VirtualWalletService.createWithdrawalRequest(userId, requestedAmount);

    // Process withdrawal: burns tokens and sends SOL (net amount to user, fee to platform)
    const result = await SolanaWalletService.processWithdrawalWithFee(
      userId,
      netAmount,
      platformFee,
      destination,
      transaction.id
    );

    return json({ 
      success: true, 
      ...result,
      platformFee,
      netAmount,
      totalAmount: requestedAmount
    });
  } catch (error: unknown) {
    console.error("Withdraw error:", error);
    return json({ error: (error as Error).message || "Withdrawal failed." }, { status: 500 });
  }
}; 
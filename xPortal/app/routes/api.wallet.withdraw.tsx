import { json, type ActionFunction } from "@remix-run/node";
import { requireUserId } from "../utils/auth.server";
import { SolanaWalletService } from "../utils/solana-wallet.server";
import { VirtualWalletService } from "../utils/virtual-wallet.server";
import { SolanaAddressService } from "../utils/solana-address.server";

export const action: ActionFunction = async ({ request }) => {
  try {
    const userId = await requireUserId(request);
    const formData = await request.formData();
    const amount = parseFloat(formData.get("amount") as string);
    const destination = formData.get("destination") as string;

    if (!amount || amount <= 0) {
      return json({ error: "Invalid withdrawal amount." }, { status: 400 });
    }
    if (!destination || !SolanaAddressService.isValidSolanaAddress(destination)) {
      return json({ error: "Invalid Solana address." }, { status: 400 });
    }

    // Check virtual wallet balance
    const wallet = await VirtualWalletService.getOrCreateWallet(userId);
    if (wallet.balance < amount) {
      return json({ error: "Insufficient virtual wallet balance." }, { status: 400 });
    }

    // Create withdrawal request (deducts from virtual wallet)
    const transaction = await VirtualWalletService.createWithdrawalRequest(userId, amount);

    // Process withdrawal: burns tokens and sends SOL
    const result = await SolanaWalletService.processWithdrawal(
      userId,
      amount,
      destination,
      transaction.id
    );

    return json({ success: true, ...result });
  } catch (error: unknown) {
    console.error("Withdraw error:", error);
    return json({ error: (error as Error).message || "Withdrawal failed." }, { status: 500 });
  }
}; 
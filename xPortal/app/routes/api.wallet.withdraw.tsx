import { json, type ActionFunctionArgs } from "@remix-run/cloudflare";
import { requireUserId } from "../utils/auth.server";
import { createDb } from "../utils/db.server";
import { getVirtualWallet, createVirtualWallet, createWithdrawalRequest } from "../utils/virtual-wallet.server";
import { z } from "zod";

const withdrawSchema = z.object({
  amount: z.string().transform((val) => parseFloat(val)).refine((val) => !isNaN(val) && val > 0, {
    message: "Amount must be a positive number"
  }),
  solanaAddress: z.string().min(1, "Solana address is required"),
});

export async function action({ request, context }: ActionFunctionArgs) {
  try {
    const userId = await requireUserId(request);
    const formData = await request.formData();
    
    const validation = withdrawSchema.safeParse({
      amount: formData.get("amount"),
      solanaAddress: formData.get("solanaAddress"),
    });

    if (!validation.success) {
      return json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const { amount, solanaAddress } = validation.data;
    const db = createDb((context as any).env.DB);

    // Get or create user's wallet
    let wallet = await getVirtualWallet(db, userId);
    if (!wallet) {
      wallet = await createVirtualWallet(db, userId);
    }
    
    if (!wallet) {
      return json({ error: "Failed to create wallet" }, { status: 500 });
    }

    // Check if user has sufficient balance
    if (wallet.balance < amount) {
      return json({ error: "Insufficient balance" }, { status: 400 });
    }

    // Create withdrawal request
    const transaction = await createWithdrawalRequest(db, userId, amount, {
      solanaAddress,
      type: 'withdrawal'
    });

    return json({
      success: true,
      transaction,
      message: `Withdrawal request created for ${amount} tokens`
    });
  } catch (error) {
    console.error("Withdrawal error:", error);
    return json({ error: "Failed to process withdrawal" }, { status: 500 });
  }
} 
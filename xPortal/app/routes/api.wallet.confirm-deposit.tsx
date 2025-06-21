import { json, type ActionFunctionArgs } from "@remix-run/cloudflare";
import { createDb } from "~/utils/db.server";
import { confirmDeposit } from "~/utils/virtual-wallet.server";
import { z } from "zod";

const confirmDepositSchema = z.object({
  transactionId: z.string().min(1, "Transaction ID is required"),
  solanaSignature: z.string().min(1, "Solana signature is required"),
});

export async function action({ request, context }: ActionFunctionArgs) {
  try {
    // const userId = await requireUserId(request); // Removed unused variable
    const formData = await request.formData();
    
    const validation = confirmDepositSchema.safeParse({
      transactionId: formData.get("transactionId"),
      solanaSignature: formData.get("solanaSignature"),
    });

    if (!validation.success) {
      return json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const { transactionId, solanaSignature } = validation.data;
    const db = createDb((context as { env: { DB: D1Database } }).env.DB);

    // Confirm the deposit
    const result = await confirmDeposit(db, transactionId, solanaSignature);

    return json({
      success: true,
      transaction: result,
      message: "Deposit confirmed successfully"
    });
  } catch (error) {
    console.error("Confirm deposit error:", error);
    return json({ error: "Failed to confirm deposit" }, { status: 500 });
  }
}

export default function WalletConfirmDeposit() {
  return null;
}


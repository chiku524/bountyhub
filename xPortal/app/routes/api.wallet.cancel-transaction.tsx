import { json, type ActionFunction } from "@remix-run/node";
import { requireUserId } from "../utils/auth.server";
import { VirtualWalletService } from "../utils/virtual-wallet.server";

export const action: ActionFunction = async ({ request }) => {
  try {
    const userId = await requireUserId(request);
    const formData = await request.formData();
    const transactionId = formData.get("transactionId") as string;

    if (!transactionId) {
      return json({ error: "Transaction ID is required." }, { status: 400 });
    }

    // Cancel the pending transaction
    const result = await VirtualWalletService.cancelPendingTransaction(transactionId, userId);

    return json({ 
      success: true, 
      message: "Transaction cancelled successfully",
      transaction: result 
    });
  } catch (error: unknown) {
    console.error("Cancel transaction error:", error);
    return json({ 
      error: (error as Error).message || "Failed to cancel transaction." 
    }, { status: 500 });
  }
}; 
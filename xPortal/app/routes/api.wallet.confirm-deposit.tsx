import { json, type ActionFunctionArgs } from "@remix-run/node";
import { VirtualWalletService } from "~/utils/virtual-wallet.server";
import { SolanaWalletService } from "~/utils/solana-wallet.server";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/prisma.server";
import { z } from "zod";

const confirmDepositSchema = z.object({
  transactionId: z.string(),
  transactionSignature: z.string(),
  amount: z.number().positive(),
});

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    const transactionId = formData.get("transactionId") as string;
    const transactionSignature = formData.get("transactionSignature") as string;
    const amount = parseFloat(formData.get("amount") as string);

    const validatedData = confirmDepositSchema.parse({
      transactionId,
      transactionSignature,
      amount,
    });

    // Get the user's stored Solana address
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.solanaAddress) {
      return json({ error: "User Solana address not found" }, { status: 400 });
    }

    // Process the deposit
    const result = await SolanaWalletService.processDeposit(
      userId,
      validatedData.amount,
      user.solanaAddress,
      validatedData.transactionId,
      validatedData.transactionSignature
    );

    return json({
      success: true,
      result,
      message: `Successfully deposited ${validatedData.amount} SOL to your virtual wallet.`,
    });
  } catch (error) {
    console.error("Confirm deposit error:", error);
    
    if (error instanceof z.ZodError) {
      return json({ error: "Invalid input data", details: error.errors }, { status: 400 });
    }

    if (error instanceof Error && error.message === "Invalid deposit transaction") {
      return json({ error: "Invalid deposit transaction" }, { status: 400 });
    }

    return json({ error: "Failed to confirm deposit" }, { status: 500 });
  }
} 
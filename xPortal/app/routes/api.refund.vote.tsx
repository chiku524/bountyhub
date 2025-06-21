import { json, type ActionFunctionArgs } from "@remix-run/cloudflare";
import { voteOnRefundRequest } from "~/utils/refund-system.server";
import { requireUserId } from "~/utils/auth.server";
import { z } from "zod";
import { createDb } from "~/utils/db.server";

const refundVoteSchema = z.object({
  refundRequestId: z.string(),
  vote: z.boolean(),
  reason: z.string().min(20, "Must provide at least 20 characters of reasoning"),
});

export async function action({ request, context }: ActionFunctionArgs) {
  const userId = await requireUserId(request);

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    const refundRequestId = formData.get("refundRequestId") as string;
    const vote = formData.get("vote") === "true";
    const reason = (formData.get("reason") as string) || undefined;

    const validatedData = refundVoteSchema.parse({ refundRequestId, vote, reason });

    // Vote on refund request
    const db = createDb((context as { env: { DB: D1Database } }).env.DB);
    const voteRecord = await voteOnRefundRequest(
      db,
      validatedData.refundRequestId,
      userId,
      validatedData.vote,
      validatedData.reason
    );

    return json({
      success: true,
      vote: voteRecord,
      message: `Vote ${validatedData.vote ? 'approved' : 'rejected'} successfully. You'll receive ${voteRecord.rewardAmount.toFixed(4)} tokens when the final decision is reached.`,
    });
  } catch (error) {
    console.error("Refund vote error:", error);
    
    if (error instanceof z.ZodError) {
      return json({ error: "Invalid input data", details: error.errors }, { status: 400 });
    }

    if (error instanceof Error) {
      return json({ error: error.message }, { status: 400 });
    }

    return json({ error: "Failed to vote on refund request" }, { status: 500 });
  }
}

export default function RefundVote() {
  return null;
}


import { json, type ActionFunctionArgs } from "@remix-run/cloudflare";
import { getUser } from "~/utils/auth.server";
import { createDb } from "~/utils/db.server";
import { createRefundRequest } from "~/utils/refund-system.server";
import { z } from "zod";

const schema = z.object({
  bountyId: z.string(),
  reason: z.string().min(5)
});

export async function action({ request, context }: ActionFunctionArgs) {
  const typedContext = context as { env: { DB: D1Database; SESSION_SECRET?: string } };
  const db = createDb(typedContext.env.DB)
  const user = await getUser(request, db, typedContext.env);
  if (!user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const bountyId = form.get("bountyId") as string;
  const reason = form.get("reason") as string;

  const parseResult = schema.safeParse({ bountyId, reason });
  if (!parseResult.success) {
    return json({ error: "Invalid input", details: parseResult.error.flatten() }, { status: 400 });
  }

  try {
    const refundRequest = await createRefundRequest(db, bountyId, user.id, reason);
    return json({ success: true, refundRequest });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Failed to create refund request" }, { status: 500 });
  }
}

export default function RefundRequest() {
  return null;
}


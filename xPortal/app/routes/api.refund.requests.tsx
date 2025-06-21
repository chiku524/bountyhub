import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { getUser } from "~/utils/auth.server";
import { createDb } from "~/utils/db.server";
import { refundRequests } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const typedContext = context as { env: { DB: D1Database; SESSION_SECRET?: string } };
  const db = createDb(typedContext.env.DB)
  const user = await getUser(request, db, typedContext.env);
  if (!user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userRefundRequests = await db.query.refundRequests.findMany({
      where: eq(refundRequests.requesterId, user.id),
      orderBy: [refundRequests.createdAt]
    });
    
    return json({ refundRequests: userRefundRequests });
  } catch (error) {
    return json({ error: "Failed to fetch refund requests" }, { status: 500 });
  }
}

export default function RefundRequests() {
  return null;
}


import { json, type ActionFunctionArgs } from "@remix-run/cloudflare";
import { getUser } from "../utils/auth.server";
import { cancelTransaction } from "../utils/virtual-wallet.server";
import { createDb } from "../utils/db.server";

export async function action({ request, context }: ActionFunctionArgs) {
  const db = createDb((context as { env: { DB: D1Database } }).env.DB);
  const user = await getUser(request, db);
  if (!user) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const form = await request.formData();
  const transactionId = form.get('transactionId') as string;

  if (!transactionId) {
    return json({ success: false, error: 'Transaction ID required' }, { status: 400 });
  }

  try {
    const success = await cancelTransaction(db, transactionId);
    if (success) {
      return json({ success: true, message: 'Transaction cancelled successfully' });
    } else {
      return json({ success: false, error: 'Failed to cancel transaction' }, { status: 400 });
    }
  } catch (error) {
    return json({ success: false, error: 'Failed to cancel transaction' }, { status: 500 });
  }
}


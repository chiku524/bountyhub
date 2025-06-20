import { createDepositRequest, confirmDeposit } from "~/utils/virtual-wallet.server";
import { getUser } from "~/utils/auth.server";
import { createDb } from "~/utils/db.server";
import { json, type ActionFunctionArgs } from "@remix-run/cloudflare";

export async function action({ request, context }: ActionFunctionArgs) {
  const db = createDb((context as { env: { DB: D1Database } }).env.DB);
  const user = await getUser(request, db);
  if (!user) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const form = await request.formData();
  const amount = parseFloat(form.get('amount') as string);
  const action = form.get('action') as string;

  if (action === 'confirm') {
    const transactionId = form.get('transactionId') as string;
    const solanaSignature = form.get('solanaSignature') as string;
    
    if (!solanaSignature) {
      return json({ success: false, error: 'Solana signature required' }, { status: 400 });
    }
    
    try {
      const result = await confirmDeposit(db, transactionId, solanaSignature);
      return json({ success: true, transaction: result });
    } catch (error) {
      return json({ success: false, error: error instanceof Error ? error.message : 'Failed to confirm deposit' }, { status: 400 });
    }
  }

  if (!amount || amount <= 0) {
    return json({ success: false, error: 'Invalid amount' }, { status: 400 });
  }

  try {
    const result = await createDepositRequest(db, user.id, amount);
    return json({ success: true, transaction: result });
  } catch (error) {
    return json({ success: false, error: error instanceof Error ? error.message : 'Failed to create deposit request' }, { status: 500 });
  }
}


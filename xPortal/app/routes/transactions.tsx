import { json, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData, Link } from "@remix-run/react";
import { getUser } from "~/utils/auth.server";
import { createDb } from "~/utils/db.server";
import { Layout } from "~/components/Layout";

const TOKEN_SYMBOL = 'BBUX';

export const meta: MetaFunction = () => {
  return [
    { title: "Transactions - portal.ask" },
    { name: "description", content: "View your portal.ask transaction history" },
  ];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const typedContext = context as { env: { DB: D1Database; SESSION_SECRET?: string } };
  const db = createDb(typedContext.env.DB);
  const user = await getUser(request, db, typedContext.env);
  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  // For now, return empty transactions until we implement the transaction service
  const transactions: unknown[] = [];

  return json({ user, transactions });
}

export default function TransactionsPage() {
  const { transactions } = useLoaderData<typeof loader>();

  const formatAmount = (amount: number) => {
    return `${amount} ${TOKEN_SYMBOL}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-400';
      case 'COMPLETED':
        return 'text-green-400';
      case 'FAILED':
        return 'text-red-400';
      case 'CANCELLED':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pending';
      case 'COMPLETED':
        return 'Completed';
      case 'FAILED':
        return 'Failed';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            to="/wallet"
            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors mb-4 inline-block"
          >
            ← Back to Wallet
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Transaction History</h1>
          <p className="text-gray-300 mb-4">
            View your transaction history and manage your account&apos;s financial activities.
          </p>
        </div>
        
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium">No Transactions</p>
              <p className="text-sm">You haven&apos;t made any transactions yet</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="bg-neutral-800/80 rounded-lg p-6 border-2 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{transaction.type}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
                    {getStatusText(transaction.status)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-white font-semibold">{formatAmount(transaction.amount)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Date:</span>
                    <span className="text-white">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </span>
                  </div>
                  
                  {transaction.description && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Description:</span>
                      <span className="text-white text-sm">{transaction.description}</span>
                    </div>
                  )}
                  
                  {transaction.solanaSignature && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Transaction:</span>
                      <span className="text-white text-sm">
                        {transaction.solanaSignature.slice(0, 8)}...{transaction.solanaSignature.slice(-8)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
} 
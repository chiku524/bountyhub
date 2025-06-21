import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { getUser } from '~/utils/auth.server';
import { Layout } from '~/components/Layout';
import { RefundRequestsList } from '~/components/RefundRequestsList';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request, undefined, typedContext.env);
  
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  return json({ user });
};

export default function RefundRequestsPage() {
  return (
    <Layout>
      <div className="w-auto max-w-8xl mx-auto mt-4 px-4 pb-16">
        <div className="mb-6 flex justify-between items-center mt-16">
          <div>
            <h1 className="text-2xl font-bold text-white">Refund Requests</h1>
            <p className="text-gray-400 text-sm mt-1">
              Help the community by voting on refund requests. Earn tokens for participating in governance (5% fee)!
            </p>
          </div>
        </div>

        <div className="bg-neutral-900/50 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">How it works</h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-neutral-800 p-4 rounded-lg">
              <h3 className="font-medium text-indigo-400 mb-2">1. Review Requests</h3>
              <p className="text-gray-300">Read the refund reason and check if the bounty has helpful answers.</p>
            </div>
            <div className="bg-neutral-800 p-4 rounded-lg">
              <h3 className="font-medium text-indigo-400 mb-2">2. Vote Wisely</h3>
              <p className="text-gray-300">Approve legitimate refunds, reject attempts to get free help.</p>
            </div>
            <div className="bg-neutral-800 p-4 rounded-lg">
              <h3 className="font-medium text-indigo-400 mb-2">3. Earn Rewards</h3>
              <p className="text-gray-300">Get tokens (5% of bounty) and reputation points for participating in governance.</p>
            </div>
          </div>
        </div>

        <RefundRequestsList refundRequests={[]} />
      </div>
    </Layout>
  );
} 
import { LoaderFunction, json } from '@remix-run/node';
import { requireUserId } from '~/utils/auth.server';
import { prisma } from '~/utils/prisma.server';
import { useLoaderData, Link } from '@remix-run/react';
import { Nav } from '../components/nav';

interface LoaderData {
  reputationHistory: {
    id: string;
    points: number;
    action: string;
    createdAt: Date;
  }[];
}

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      reputationHistory: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  return json<LoaderData>({ reputationHistory: user?.reputationHistory || [] });
};

export default function ProfileActivity() {
  const { reputationHistory } = useLoaderData<LoaderData>();
  return (
    <div className="h-screen w-full bg-neutral-900/95 flex flex-row">
      <Nav />
      <div className="flex-1 overflow-y-auto">
        <div className="w-auto max-w-3xl mx-auto mt-4 px-4 ml-24 pb-16">
          <div className="mb-6 flex justify-between items-center mt-16">
            <h1 className="text-2xl font-bold text-white">All Activity</h1>
            <Link to="/profile" className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors border-2 border-violet-500/50 shadow-md">Back to Profile</Link>
          </div>
          <div className="space-y-4">
            {reputationHistory.length === 0 ? (
              <div className="text-gray-400 text-center">No activity yet.</div>
            ) : (
              reputationHistory.map((history) => (
                <div key={history.id} className="flex items-center justify-between p-4 bg-neutral-700/50 rounded-lg border border-violet-500/30">
                  <div>
                    <p className="text-sm font-medium text-violet-300">{history.action}</p>
                  </div>
                  <div className="flex items-center">
                    <span className={`text-sm font-medium ${history.points > 0 ? 'text-green-400' : 'text-red-400'}`}>{history.points > 0 ? '+' : ''}{history.points}</span>
                    <span className="text-sm text-gray-400 ml-2">{new Date(history.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
import { useLoaderData, Link } from '@remix-run/react';
import { json, LoaderFunction } from '@remix-run/node';
import { prisma } from '~/utils/prisma.server';
import { Nav } from '../components/nav';

export const loader: LoaderFunction = async ({ params }) => {
  const { username } = params;

  if (!username) {
    return json({ error: 'Username is required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      profile: true,
      posts: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user) {
    return json({ error: 'User not found' }, { status: 404 });
  }

  return json({ user });
};

export default function UserProfile() {
  const { user } = useLoaderData<typeof loader>();

  if (!user) {
    return (
      <div className="h-screen w-full bg-neutral-900 flex flex-row">
        <Nav />
        <div className='flex flex-col justify-center items-center w-full h-full'>
          <h1 className="text-white text-2xl">User not found</h1>
          <Link to="/community" className="mt-4 text-indigo-400 hover:text-indigo-300">Go to Community</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-neutral-900/95 flex flex-row">
      <Nav />
      <div className="flex-1 overflow-y-auto">
        <div className="w-auto max-w-8xl mx-auto mt-4 px-4 ml-24 pb-16">
          <div className="mb-6 flex justify-between items-center mt-16">
            <h1 className="text-2xl font-bold text-white drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]">{user.username}'s Profile</h1>
          </div>

          <div className="bg-neutral-800/80 rounded-lg p-6 shadow-lg border-2 border-violet-500 neon-glow">
            <div className="flex items-start space-x-6">
              <img
                src={user.profile?.profilePicture || '/default-avatar.svg'}
                alt={user.username}
                className="w-32 h-32 rounded-full border-4 border-violet-500 shadow-lg neon-glow"
              />
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-white mb-4">Profile Information</h2>
                <div className="space-y-2">
                  <div className="text-white/90"><span className="font-bold text-violet-400">Name:</span> {user.profile?.firstName || ''} {user.profile?.lastName || ''}</div>
                  <div className="text-white/90"><span className="font-bold text-violet-400">Bio:</span> {user.profile?.bio || 'No bio set.'}</div>
                  <div className="text-white/90"><span className="font-bold text-violet-400">Location:</span> {user.profile?.location || 'Unknown'}</div>
                  <div className="text-white/90"><span className="font-bold text-violet-400">Website:</span> {user.profile?.website ? <a href={user.profile.website} className="underline text-indigo-300 hover:text-indigo-400" target="_blank" rel="noopener noreferrer">{user.profile.website}</a> : 'Not set'}</div>
                  <div className="text-white/90"><span className="font-bold text-violet-400">Twitter:</span> {user.profile?.twitter ? <a href={`https://twitter.com/${user.profile.twitter}`} className="underline text-indigo-300 hover:text-indigo-400" target="_blank" rel="noopener noreferrer">@{user.profile.twitter}</a> : 'Not set'}</div>
                  <div className="text-white/90"><span className="font-bold text-violet-400">GitHub:</span> {user.profile?.github ? <a href={`https://github.com/${user.profile.github}`} className="underline text-indigo-300 hover:text-indigo-400" target="_blank" rel="noopener noreferrer">{user.profile.github}</a> : 'Not set'}</div>
                  <div className="text-white/90"><span className="font-bold text-violet-400">LinkedIn:</span> {user.profile?.linkedin ? <a href={user.profile.linkedin} className="underline text-indigo-300 hover:text-indigo-400" target="_blank" rel="noopener noreferrer">{user.profile.linkedin}</a> : 'Not set'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* User Posts Section */}
          <div className="mt-12">
            <h2 className="text-xl font-bold text-white mb-6 drop-shadow-[0_0_6px_rgba(139,92,246,0.7)]">Your Posts</h2>
            {user.posts && user.posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {user.posts.map((post: any) => (
                  <div key={post.id} className="bg-neutral-800/80 rounded-lg p-4 border-2 border-violet-500 neon-glow shadow-md hover:shadow-violet-500/40 transition-shadow">
                    <h3 className="text-lg font-semibold text-violet-300 mb-2 truncate">{post.title}</h3>
                    <p className="text-gray-300 mb-2 line-clamp-3">{post.content.length > 120 ? post.content.substring(0, 120) + '...' : post.content}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                      <Link to={`/posts/${post.id}`} className="text-indigo-400 hover:text-indigo-300 text-xs font-medium underline">View Post</Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400">No posts yet.</div>
            )}
          </div>

          <style>{`
            .neon-glow {
              box-shadow: 0 0 8px 1px #8b5cf6, 0 0 16px 2px #a78bfa;
            }
          `}</style>
        </div>
      </div>
    </div>
  );
} 
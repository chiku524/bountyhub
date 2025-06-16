// app/routes/profile.tsx
import { Form, useLoaderData, Link } from "@remix-run/react"
import { LoaderFunction, json } from '@remix-run/node'
import { getUser } from '~/utils/auth.server'
import { Nav } from '../components/nav'
import { prisma } from '~/utils/prisma.server'
import { requireUserId } from '~/utils/auth.server'
import { ProfilePictureUpload } from '~/components/ProfilePictureUpload'
import { getReputationLevel } from '~/utils/reputationLevel'

interface LoaderData {
  user: {
    id: string;
    username: string;
    email: string;
    createdAt: Date;
    reputationPoints: number;
    profile: {
      bio: string | null;
      location: string | null;
      website: string | null;
      avatarUrl: string | null;
      github: string | null;
      twitter: string | null;
      linkedin: string | null;
      instagram: string | null;
    } | null;
    posts: {
      id: string;
      title: string;
      content: string;
      createdAt: Date;
    }[];
    reputationHistory: {
      id: string;
      points: number;
      action: string;
      description: string;
      createdAt: Date;
    }[];
  };
}

export const loader: LoaderFunction = async ({ request }) => {
    try {
        const userId = await requireUserId(request);
        
        // Get all data in a single query
        const userData = await prisma.user.findUnique({
            where: { id: userId },
            include: { 
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
                reputationHistory: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });

        if (!userData) {
            throw new Response("User not found", { status: 404 });
        }

        return json({ user: userData });
    } catch (error) {
        console.error('Error in profile loader:', error);
        throw new Response("Internal Server Error", { status: 500 });
    }
};

const SocialLinks = ({ profile }: { profile: NonNullable<LoaderData['user']['profile']> }) => {
    const links = [
        { icon: 'github', url: profile.github, label: 'GitHub' },
        { icon: 'twitter', url: profile.twitter, label: 'Twitter' },
        { icon: 'linkedin', url: profile.linkedin, label: 'LinkedIn' },
        { icon: 'instagram', url: profile.instagram, label: 'Instagram' }
    ].filter(link => link.url);

    if (links.length === 0) return null;

    return (
        <div className="flex gap-4 mt-4">
            {links.map(link => (
                <a
                    key={link.icon}
                    href={link.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    title={link.label}
                >
                    <i className={`fab fa-${link.icon} text-xl`}></i>
                </a>
            ))}
        </div>
    );
};

export default function Profile() {
    const { user } = useLoaderData<LoaderData>();
    const reputationLevel = getReputationLevel(user.reputationPoints || 0);
    const recentActivities = user.reputationHistory.slice(0, 5);

    return (
        <div className="h-screen w-full bg-neutral-900/95 flex flex-row">
            <Nav />
            <div className="flex-1 overflow-y-auto">
                <div className="w-auto max-w-8xl mx-auto mt-4 px-4 ml-24 pb-16">
                    <div className="mb-6 flex justify-between items-center mt-16">
                        <h1 className="text-2xl font-bold text-white">Profile</h1>
                        <Link 
                            to="/posts/create" 
                            className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors flex items-center gap-2 border-2 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)]"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Create Post
                        </Link>
                    </div>

                    <div className="bg-neutral-800/80 rounded-lg p-6 border-2 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                        <div className="flex items-start space-x-6">
                            <ProfilePictureUpload 
                                currentPicture={user.profile?.avatarUrl || null}
                                username={user.username}
                            />
                            <div className="flex-1">
                                <h2 className="text-xl font-semibold text-white">{user.username}</h2>
                                <p className="text-gray-400 mt-1">
                                    Member since {new Date(user.createdAt).toLocaleDateString()}
                                </p>
                                <div className="mt-4">
                                    <div className="flex items-center space-x-2">
                                        <div className="bg-violet-500/20 px-3 py-1 rounded-full border border-violet-500/50">
                                            <span className="text-violet-300 font-medium">{reputationLevel}</span>
                                        </div>
                                        <div className="bg-violet-500/20 px-3 py-1 rounded-full border border-violet-500/50">
                                            <span className="text-violet-300 font-medium">{user.reputationPoints || 0} points</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h2 className="text-lg font-semibold text-violet-300 mb-4">Profile Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-neutral-700/50 rounded-lg p-4 border border-violet-500/30">
                                    <label className="block text-sm font-medium text-violet-300">Bio</label>
                                    <p className="mt-1 text-sm text-gray-300">{user.profile?.bio || 'No bio provided'}</p>
                                </div>
                                <div className="bg-neutral-700/50 rounded-lg p-4 border border-violet-500/30">
                                    <label className="block text-sm font-medium text-violet-300">Location</label>
                                    <p className="mt-1 text-sm text-gray-300">{user.profile?.location || 'No location provided'}</p>
                                </div>
                                <div className="bg-neutral-700/50 rounded-lg p-4 border border-violet-500/30">
                                    <label className="block text-sm font-medium text-violet-300">Website</label>
                                    <p className="mt-1 text-sm text-gray-300">
                                        {user.profile?.website ? (
                                            <a href={user.profile.website} target="_blank" rel="noopener noreferrer" 
                                               className="text-violet-400 hover:text-violet-300">
                                                {user.profile.website}
                                            </a>
                                        ) : 'No website provided'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h2 className="text-lg font-semibold text-violet-300 mb-4">Social Links</h2>
                            {user.profile && (
                                <SocialLinks profile={user.profile} />
                            )}
                        </div>

                        <div className="mt-8">
                            <h2 className="text-lg font-semibold text-violet-300 mb-4">Recent Activity</h2>
                            <div className="space-y-4">
                                {recentActivities.map((history) => (
                                    <div key={history.id} className="flex items-center justify-between p-4 bg-neutral-700/50 rounded-lg border border-violet-500/30">
                                        <div>
                                            <p className="text-sm font-medium text-violet-300">{history.action}</p>
                                            <p className="text-sm text-gray-300">{history.description}</p>
                                        </div>
                                        <div className="flex items-center">
                                            <span className={`text-sm font-medium ${history.points > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {history.points > 0 ? '+' : ''}{history.points}
                                            </span>
                                            <span className="text-sm text-gray-400 ml-2">
                                                {new Date(history.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {user.reputationHistory.length > 5 && (
                                <div className="mt-4 text-center">
                                    <Link to="/profile/activity" className="inline-block px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors border border-violet-500/50 shadow-md">
                                        View All Activity
                                    </Link>
                                </div>
                            )}
                        </div>

                        <div className="mt-8">
                            <h2 className="text-lg font-semibold text-violet-300 mb-4">Recent Posts</h2>
                            <div className="space-y-4">
                                {user.posts.map((post) => (
                                    <div key={post.id} className="p-4 bg-neutral-700/50 rounded-lg border border-violet-500/30">
                                        <h3 className="text-lg font-medium text-violet-300">{post.title}</h3>
                                        <p className="mt-1 text-sm text-gray-300">{post.content}</p>
                                        <p className="mt-2 text-sm text-gray-400">
                                            Posted on {new Date(post.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

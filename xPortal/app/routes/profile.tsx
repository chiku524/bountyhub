// app/routes/profile.tsx
import { Form, useLoaderData, Link, Outlet, useLocation } from "@remix-run/react"
import { LoaderFunction, json, redirect } from '@remix-run/node'
import { getUser } from '~/utils/auth.server'
import { Layout } from '../components/Layout'
import { prisma } from '~/utils/prisma.server'
import { requireUserId } from '~/utils/auth.server'
import { ProfilePictureUpload } from '~/components/ProfilePictureUpload'
import { getReputationLevel } from '~/utils/reputationLevel'
import { LoaderFunctionArgs } from '@remix-run/node'
import { AuthNotice } from '~/components/auth-notice'
import { 
    FaGithub, 
    FaTwitter, 
    FaLinkedin, 
    FaInstagram, 
    FaFacebook, 
    FaYoutube, 
    FaTiktok, 
    FaDiscord, 
    FaReddit, 
    FaMedium, 
    FaStackOverflow, 
    FaDev 
} from 'react-icons/fa'
import { FiThumbsUp, FiEdit2 } from 'react-icons/fi'
import IntegrityDisplay from '~/components/IntegrityDisplay'

const DEFAULT_PROFILE_PICTURE = 'https://api.dicebear.com/7.x/initials/svg?seed=';

type Post = {
    id: string;
    title: string;
    content: string;
    createdAt: string | Date;
};

type ReputationHistory = {
    id: string;
    action: string;
    points: number;
    createdAt: string | Date;
};

function truncateContent(content: string | undefined | null): string {
    if (!content) return '';
    return content.length > 100 ? content.substring(0, 100) + '...' : content;
}

function getProfilePicture(profilePicture: string | null, username: string): string {
    if (profilePicture) {
        return profilePicture;
    }
    return `${DEFAULT_PROFILE_PICTURE}${encodeURIComponent(username)}`;
}

interface UserData {
    id: string;
    email: string;
    username: string;
    reputationPoints: number;
    integrityScore: number;
    totalRatings: number;
    createdAt: Date;
    profile?: {
        firstName: string | null;
        lastName: string | null;
        profilePicture: string | null;
        bio: string | null;
        location: string | null;
        website: string | null;
        github: string | null;
        twitter: string | null;
        linkedin: string | null;
        instagram: string | null;
        facebook: string | null;
        youtube: string | null;
        tiktok: string | null;
        discord: string | null;
        reddit: string | null;
        medium: string | null;
        stackoverflow: string | null;
        devto: string | null;
    };
    posts: Array<{
        id: string;
        title: string;
        content: string;
        createdAt: Date;
    }>;
    reputationHistory: Array<{
        id: string;
        points: number;
        action: string;
        createdAt: Date;
    }>;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const userId = await requireUserId(request);
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
        }
    }) as any;

    if (!userData) {
        throw new Response("User not found", { status: 404 });
    }

    return json({ user: userData, isAuthenticated: true });
};

const SocialMediaIcons = ({ profile }: { profile: NonNullable<UserData['profile']> }) => {
    const socialLinks = [
        { icon: FaGithub, url: profile.github, label: 'GitHub', color: 'hover:text-[#333]' },
        { icon: FaTwitter, url: profile.twitter, label: 'Twitter', color: 'hover:text-[#1DA1F2]' },
        { icon: FaLinkedin, url: profile.linkedin, label: 'LinkedIn', color: 'hover:text-[#0077B5]' },
        { icon: FaInstagram, url: profile.instagram, label: 'Instagram', color: 'hover:text-[#E4405F]' },
        { icon: FaFacebook, url: profile.facebook, label: 'Facebook', color: 'hover:text-[#1877F2]' },
        { icon: FaYoutube, url: profile.youtube, label: 'YouTube', color: 'hover:text-[#FF0000]' },
        { icon: FaTiktok, url: profile.tiktok, label: 'TikTok', color: 'hover:text-[#000000]' },
        { icon: FaDiscord, url: profile.discord, label: 'Discord', color: 'hover:text-[#5865F2]' },
        { icon: FaReddit, url: profile.reddit, label: 'Reddit', color: 'hover:text-[#FF4500]' },
        { icon: FaMedium, url: profile.medium, label: 'Medium', color: 'hover:text-[#000000]' },
        { icon: FaStackOverflow, url: profile.stackoverflow, label: 'Stack Overflow', color: 'hover:text-[#F48024]' },
        { icon: FaDev, url: profile.devto, label: 'Dev.to', color: 'hover:text-[#0A0A0A]' }
    ].filter(link => link.url);

    if (socialLinks.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-4">
            {socialLinks.map(({ icon: Icon, url, label, color }) => (
                <a
                    key={label}
                    href={url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-gray-400 ${color} transition-colors p-2 rounded-lg hover:bg-white/10`}
                    title={label}
                >
                    <Icon className="w-6 h-6" />
                </a>
            ))}
        </div>
    );
};

function getActivityDescription(action: string): string {
    const descriptions: { [key: string]: string } = {
        'POST_CREATED': 'Created a new post',
        'POST_UPVOTED': 'Received an upvote on your post',
        'POST_DOWNVOTED': 'Received a downvote on your post',
        'COMMENT_CREATED': 'Added a comment',
        'COMMENT_UPVOTED': 'Received an upvote on your comment',
        'COMMENT_DOWNVOTED': 'Received a downvote on your comment',
        'ANSWER_CREATED': 'Provided an answer',
        'ANSWER_UPVOTED': 'Received an upvote on your answer',
        'ANSWER_DOWNVOTED': 'Received a downvote on your answer',
        'ANSWER_ACCEPTED': 'Your answer was accepted as the best solution',
        'PROFILE_COMPLETED': 'Completed your profile information',
        'DAILY_LOGIN': 'Logged in for the day',
        'WEEKLY_STREAK': 'Maintained a weekly activity streak',
        'MONTHLY_CONTRIBUTOR': 'Active contributor this month',
        'HELPFUL_MEMBER': 'Recognized as a helpful community member',
        'FIRST_POST': 'Created your first post',
        'FIRST_ANSWER': 'Provided your first answer',
        'FIRST_COMMENT': 'Added your first comment',
        'REPUTATION_MILESTONE': 'Reached a reputation milestone',
        'COMMUNITY_ENGAGEMENT': 'Active participation in the community',
        'CREATE_POST': 'Created a new post'
    };
    
    return descriptions[action] || action;
}

export default function Profile() {
    const { user, isAuthenticated } = useLoaderData<{ user: UserData; isAuthenticated?: boolean }>();
    const location = useLocation();
    const isActivityPage = location.pathname === '/profile/activity';

    if (!isAuthenticated) {
        return <AuthNotice />;
    }

    if (!user) {
        return (
            <Layout>
                <div className='flex flex-col justify-center items-center w-full h-full'>
                    <h1 className="text-white text-2xl">User not found</h1>
                    <Link to="/community" className="mt-4 text-indigo-400 hover:text-indigo-300">Go to Community</Link>
                </div>
            </Layout>
        );
    }

    const reputationLevel = getReputationLevel(user.reputationPoints || 0);
    const recentActivities = user.reputationHistory.slice(0, 5);

    return (
        <Layout>
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

                {!isActivityPage ? (
                    <div className="bg-neutral-800/80 rounded-lg p-6 border-2 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                        <div className="flex items-start space-x-6">
                            <ProfilePictureUpload 
                                currentPicture={user.profile?.profilePicture || null}
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
                                <div className="bg-neutral-700/50 rounded-lg p-4 border border-violet-500/30">
                                    <label className="block text-sm font-medium text-violet-300">Social Media</label>
                                    <div className="mt-2">
                                        {user.profile ? (
                                            <SocialMediaIcons profile={user.profile} />
                                        ) : (
                                            <p className="text-sm text-gray-300">No social media links provided</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Integrity Display */}
                        <div className="mt-8">
                            <IntegrityDisplay
                                user={{
                                    id: user.id,
                                    username: user.username,
                                    integrityScore: (user as any).integrityScore || 5.0,
                                    totalRatings: (user as any).totalRatings || 0,
                                }}
                                currentUserId={user.id}
                                canRate={false}
                            />
                        </div>

                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h2 className="text-lg font-semibold text-violet-300 mb-4">Recent Activity</h2>
                                <div className="space-y-2">
                                    {recentActivities.map((history) => (
                                        <div key={history.id} className="flex items-center justify-between p-3 bg-neutral-700/50 rounded-lg border border-violet-500/30">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-violet-500/20 rounded-lg">
                                                    <FiThumbsUp className="w-3.5 h-3.5 text-violet-300" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-violet-300">{getActivityDescription(history.action)}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">
                                                        {new Date(history.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`text-sm font-medium ${history.points > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {history.points > 0 ? '+' : ''}{history.points}
                                            </span>
                                        </div>
                                    ))}
                                    {user.reputationHistory.length > 5 && (
                                        <div className="mt-3 text-center">
                                            <Link to="/profile/activity" className="inline-block px-3 py-1.5 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors border border-violet-500/50 shadow-md">
                                                View All Activity
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold text-violet-300 mb-4">Recent Posts</h2>
                                <div className="space-y-2">
                                    {user.posts.map((post) => (
                                        <div key={post.id} className="p-3 bg-neutral-700/50 rounded-lg border border-violet-500/30">
                                            <Link to={`/posts/${post.id}`} className="block hover:bg-neutral-600/50 rounded-lg p-1.5 -m-1.5 transition-colors">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="p-1.5 bg-violet-500/20 rounded-lg">
                                                        <FiEdit2 className="w-3.5 h-3.5 text-violet-300" />
                                                    </div>
                                                    <h3 className="text-sm font-medium text-violet-300">{post.title}</h3>
                                                </div>
                                                <p className="text-xs text-gray-300 line-clamp-2">{truncateContent(post.content)}</p>
                                                <div className="mt-1 flex items-center justify-between">
                                                    <p className="text-xs text-gray-400">
                                                        {new Date(post.createdAt).toLocaleDateString()}
                                                    </p>
                                                    <span className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                                                        Read more →
                                                    </span>
                                                </div>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <Outlet />
                )}
            </div>
        </Layout>
    );
}

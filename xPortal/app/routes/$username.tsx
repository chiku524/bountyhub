import { LoaderFunction, json } from '@remix-run/node'
import { useLoaderData, Link } from '@remix-run/react'
import { getUser } from '~/utils/auth.server'
import { prisma } from '~/utils/prisma.server'
import { Nav } from '~/components/nav'
import { getReputationLevel } from '~/utils/reputationLevel'
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

function getProfilePicture(profilePicture: string | null, username: string): string {
    if (profilePicture) {
        return profilePicture;
    }
    return `${DEFAULT_PROFILE_PICTURE}${encodeURIComponent(username)}`;
}

function truncateContent(content: string | undefined | null): string {
    if (!content) return '';
    return content.length > 100 ? content.substring(0, 100) + '...' : content;
}

function getActivityDescription(action: string): string {
    const descriptions: { [key: string]: string } = {
        'POST_CREATED': 'Created a new post',
        'POST_UPVOTED': 'Received an upvote on their post',
        'POST_DOWNVOTED': 'Received a downvote on their post',
        'COMMENT_CREATED': 'Added a comment',
        'COMMENT_UPVOTED': 'Received an upvote on their comment',
        'COMMENT_DOWNVOTED': 'Received a downvote on their comment',
        'ANSWER_CREATED': 'Provided an answer',
        'ANSWER_UPVOTED': 'Received an upvote on their answer',
        'ANSWER_DOWNVOTED': 'Received a downvote on their answer',
        'ANSWER_ACCEPTED': 'Their answer was accepted as the best solution',
        'PROFILE_COMPLETED': 'Completed their profile information',
        'DAILY_LOGIN': 'Logged in for the day',
        'WEEKLY_STREAK': 'Maintained a weekly activity streak',
        'MONTHLY_CONTRIBUTOR': 'Active contributor this month',
        'HELPFUL_MEMBER': 'Recognized as a helpful community member',
        'FIRST_POST': 'Created their first post',
        'FIRST_ANSWER': 'Provided their first answer',
        'FIRST_COMMENT': 'Added their first comment',
        'REPUTATION_MILESTONE': 'Reached a reputation milestone',
        'COMMUNITY_ENGAGEMENT': 'Active participation in the community',
        'CREATE_POST': 'Created a new post'
    };
    
    return descriptions[action] || action;
}

const SocialMediaIcons = ({ profile }: { profile: any }) => {
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

interface LoaderData {
    user: {
        id: string;
        username: string;
        email: string;
        reputationPoints: number;
        createdAt: string;
        profilePicture: string;
        integrityScore: number;
        totalRatings: number;
        profile?: {
            firstName: string | null;
            lastName: string | null;
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
            createdAt: string;
            visibilityVotes: number;
            comments: number;
        }>;
        reputationHistory: Array<{
            id: string;
            points: number;
            action: string;
            createdAt: string;
        }>;
    };
    currentUser: {
        id: string;
        username: string;
    } | null;
}

export const loader: LoaderFunction = async ({ params, request }) => {
    const { username } = params;
    const currentUser = await getUser(request);
    
    if (!username) {
        throw new Response('Username is required', { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
        where: { username },
        include: {
            profile: true,
            posts: {
                select: {
                    id: true,
                    title: true,
                    content: true,
                    createdAt: true,
                    visibilityVotes: true,
                    _count: {
                        select: {
                            comments: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 5
            },
            reputationHistory: {
                select: {
                    id: true,
                    points: true,
                    action: true,
                    createdAt: true
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 5
            }
        }
    });

    if (!user) {
        throw new Response('User not found', { status: 404 });
    }

    // Transform the data
    const transformedUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        reputationPoints: user.reputationPoints || 0,
        createdAt: user.createdAt.toISOString(),
        profilePicture: user.profile?.profilePicture || getProfilePicture(null, user.username),
        integrityScore: (user as any).integrityScore || 5.0,
        totalRatings: (user as any).totalRatings || 0,
        profile: user.profile,
        posts: user.posts.map(post => ({
            id: post.id,
            title: post.title,
            content: post.content,
            createdAt: post.createdAt.toISOString(),
            visibilityVotes: post.visibilityVotes,
            comments: post._count.comments
        })),
        reputationHistory: user.reputationHistory.map(history => ({
            id: history.id,
            points: history.points,
            action: history.action,
            createdAt: history.createdAt.toISOString()
        }))
    };

    return json({ 
        user: transformedUser,
        currentUser 
    });
}

export default function UserProfile() {
    const { user, currentUser } = useLoaderData<LoaderData>();
    const reputationLevel = getReputationLevel(user.reputationPoints);

    return (
        <div className="h-screen w-full bg-neutral-900/95 flex flex-row">
            <Nav />
            <div className="flex-1 overflow-y-auto">
                <div className="w-auto max-w-8xl mx-auto mt-4 px-4 ml-24 pb-16">
                    <div className="mb-6 flex justify-between items-center mt-16">
                        <h1 className="text-2xl font-bold text-white">Profile: {user.username}</h1>
                    </div>

                    <div className="bg-neutral-800/80 rounded-lg p-6 border-2 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                        <div className="flex items-start space-x-6">
                            <div className="flex-shrink-0">
                                <img
                                    src={user.profilePicture}
                                    alt={`${user.username}'s profile`}
                                    className="w-24 h-24 rounded-full border-2 border-violet-500/50"
                                />
                            </div>
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
                                            <span className="text-violet-300 font-medium">{user.reputationPoints} points</span>
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

                        <div className="mt-8">
                            <IntegrityDisplay
                                user={{
                                    id: user.id,
                                    username: user.username,
                                    integrityScore: user.integrityScore,
                                    totalRatings: user.totalRatings,
                                }}
                                currentUserId={currentUser?.id}
                                canRate={true}
                            />
                        </div>

                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h2 className="text-lg font-semibold text-violet-300 mb-4">Recent Activity</h2>
                                <div className="space-y-2">
                                    {user.reputationHistory.length > 0 ? (
                                        user.reputationHistory.map((history) => (
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
                                        ))
                                    ) : (
                                        <div className="text-center py-4">
                                            <p className="text-gray-500">No recent activity</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold text-violet-300 mb-4">Recent Posts</h2>
                                <div className="space-y-2">
                                    {user.posts.length > 0 ? (
                                        user.posts.map((post) => (
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
                                                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                                                            <span>👁️ {post.visibilityVotes}</span>
                                                            <span>💬 {post.comments}</span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-4">
                                            <p className="text-gray-500">No posts yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 
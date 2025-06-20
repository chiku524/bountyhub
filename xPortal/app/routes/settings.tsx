// app/routes/profile.tsx
import { json, type LoaderFunctionArgs, type ActionFunctionArgs, type MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData, useActionData, useNavigation, useFetcher } from "@remix-run/react";
import { getUser } from "~/utils/auth.server";
import { editUser } from "~/utils/user.server";
import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { validateUsername } from "~/utils/validators.client";
import { AuthNotice } from "~/components/auth-notice";
import type { Profile, User } from "~/utils/types.server";
import { FiUser, FiLink, FiMail, FiLock, FiSave, FiCheck } from "react-icons/fi";
import { FaUser, FaLock, FaBell, FaPalette, FaGlobe, FaTrash, FaSave, FaTimes, FaCheck, FaEdit, FaEye, FaEyeSlash } from "react-icons/fa";
import { eq } from "drizzle-orm";
import { users, profiles } from "../../drizzle/schema";
import { createDb } from "~/utils/db.server";

type UserData = {
  id: string;
  username: string;
  email: string;
  solanaAddress: string | null;
  createdAt: Date;
  reputationPoints: number;
  integrityScore: number;
  totalRatings: number;
  profile: {
    firstName: string | null;
    lastName: string | null;
    profilePicture: string | null;
    bio: string | null;
    location: string | null;
    website: string | null;
    facebook: string | null;
    twitter: string | null;
    instagram: string | null;
    linkedin: string | null;
    github: string | null;
    youtube: string | null;
    tiktok: string | null;
    discord: string | null;
    reddit: string | null;
    medium: string | null;
    stackoverflow: string | null;
    devto: string | null;
  } | null;
};

interface LoaderData {
  user: UserData;
}

interface ActionData {
    error?: string;
    success?: boolean;
    userData?: UserData;
}

export const meta: MetaFunction = () => {
  return [
    { title: "Settings - portal.ask" },
    { name: "description", content: "Manage your portal.ask account settings" },
  ];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const user = await getUser(request);
  
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  try {
    const db = createDb((context as { env: { DB: D1Database } }).env.DB);

    const userData = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        solanaAddress: users.solanaAddress,
        createdAt: users.createdAt,
        reputationPoints: users.reputationPoints,
        integrityScore: users.integrityScore,
        totalRatings: users.totalRatings,
        profile: {
          firstName: profiles.firstName,
          lastName: profiles.lastName,
          profilePicture: profiles.profilePicture,
          bio: profiles.bio,
          location: profiles.location,
          website: profiles.website,
          facebook: profiles.facebook,
          twitter: profiles.twitter,
          instagram: profiles.instagram,
          linkedin: profiles.linkedin,
          github: profiles.github,
          youtube: profiles.youtube,
          tiktok: profiles.tiktok,
          discord: profiles.discord,
          reddit: profiles.reddit,
          medium: profiles.medium,
          stackoverflow: profiles.stackoverflow,
          devto: profiles.devto,
        },
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(users.id, user.id))
      .limit(1);

    if (!userData.length) {
      throw new Response('User not found', { status: 404 });
    }

    return json({ user: userData[0] });
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw new Response('Failed to fetch user data', { status: 500 });
  }
}

export async function action({ request, context }: ActionFunctionArgs) {
  const user = await getUser(request);
  
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const formData = await request.formData();
  const action = formData.get('action') as string;

  try {
    const db = createDb((context as { env: { DB: D1Database } }).env.DB);

    switch (action) {
      case 'updateProfile': {
        const firstName = formData.get('firstName') as string;
        const lastName = formData.get('lastName') as string;
        const bio = formData.get('bio') as string;
        const location = formData.get('location') as string;
        const website = formData.get('website') as string;
        const facebook = formData.get('facebook') as string;
        const twitter = formData.get('twitter') as string;
        const instagram = formData.get('instagram') as string;
        const linkedin = formData.get('linkedin') as string;
        const github = formData.get('github') as string;
        const youtube = formData.get('youtube') as string;
        const tiktok = formData.get('tiktok') as string;
        const discord = formData.get('discord') as string;
        const reddit = formData.get('reddit') as string;
        const medium = formData.get('medium') as string;
        const stackoverflow = formData.get('stackoverflow') as string;
        const devto = formData.get('devto') as string;

        // Check if profile exists
        const existingProfile = await db
          .select()
          .from(profiles)
          .where(eq(profiles.userId, user.id))
          .limit(1);

        if (existingProfile.length > 0) {
          // Update existing profile
          await db
            .update(profiles)
            .set({
              firstName,
              lastName,
              bio,
              location,
              website,
              facebook,
              twitter,
              instagram,
              linkedin,
              github,
              youtube,
              tiktok,
              discord,
              reddit,
              medium,
              stackoverflow,
              devto,
              updatedAt: new Date(),
            })
            .where(eq(profiles.userId, user.id));
        } else {
          // Create new profile
          await db.insert(profiles).values({
            id: crypto.randomUUID(),
            userId: user.id,
            firstName,
            lastName,
            bio,
            location,
            website,
            facebook,
            twitter,
            instagram,
            linkedin,
            github,
            youtube,
            tiktok,
            discord,
            reddit,
            medium,
            stackoverflow,
            devto,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        return json({ success: true, message: 'Profile updated successfully' });
      }

      default:
        return json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    return json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

export default function Settings() {
    const { userData, isAuthenticated } = useLoaderData<{ userData: UserData; isAuthenticated?: boolean }>();
    const actionData = useActionData<ActionData>();
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState('profile');
    const [showSuccess, setShowSuccess] = useState(false);
    const isSubmitting = navigation.state === "submitting";
    const fetcher = useFetcher<ActionData>();

    // Show success message when submission completes successfully
    useEffect(() => {
        if (fetcher.data?.success) {
            setShowSuccess(true);
            const timer = setTimeout(() => setShowSuccess(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [fetcher.data]);

    if (!isAuthenticated) {
        return <AuthNotice />;
    }

    const tabs = [
        { id: 'profile', label: 'Profile', icon: FiUser },
        { id: 'social', label: 'Social Links', icon: FiLink },
        { id: 'account', label: 'Account', icon: FiMail },
        { id: 'security', label: 'Security', icon: FiLock },
    ];

    return (
        <Layout>
            <div className="w-auto max-w-8xl mx-auto mt-4 px-4 pb-16">
                <div className="mb-6 flex justify-between items-center mt-16">
                    <h1 className="text-2xl font-bold text-white">Settings</h1>
                </div>

                {/* Success Notice */}
                {showSuccess && (
                    <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-2 text-green-400">
                        <FiCheck className="w-5 h-5" />
                        <span>Changes saved successfully!</span>
                    </div>
                )}

                <div className="bg-neutral-800/80 rounded-lg border-2 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                    {/* Tabs */}
                    <div className="flex border-b border-violet-500/30">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                                    activeTab === tab.id
                                        ? 'text-violet-400 border-b-2 border-violet-400'
                                        : 'text-gray-400 hover:text-violet-300'
                                }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        <fetcher.Form method="post" className="space-y-6">
                            <input type="hidden" name="action" value="updateProfile" />

                            {activeTab === 'profile' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-violet-300 mb-2">
                                                First Name
                                            </label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                defaultValue={userData.profile?.firstName || ''}
                                                placeholder="Enter your first name"
                                                className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-violet-300 mb-2">
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                defaultValue={userData.profile?.lastName || ''}
                                                placeholder="Enter your last name"
                                                className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-violet-300 mb-2">
                                            Bio
                                        </label>
                                        <textarea
                                            name="bio"
                                            defaultValue={userData.profile?.bio || ''}
                                            placeholder="Tell us about yourself..."
                                            rows={4}
                                            className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-violet-300 mb-2">
                                            Location
                                        </label>
                                        <input
                                            type="text"
                                            name="location"
                                            defaultValue={userData.profile?.location || ''}
                                            placeholder="City, Country"
                                            className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-violet-300 mb-2">
                                            Website
                                        </label>
                                        <input
                                            type="url"
                                            name="website"
                                            defaultValue={userData.profile?.website || ''}
                                            placeholder="https://your-website.com"
                                            className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'social' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-violet-300 mb-2">
                                            Facebook
                                        </label>
                                        <input
                                            type="text"
                                            name="facebook"
                                            defaultValue={userData.profile?.facebook || ''}
                                            placeholder="facebook.com/username"
                                            className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-violet-300 mb-2">
                                            Twitter
                                        </label>
                                        <input
                                            type="text"
                                            name="twitter"
                                            defaultValue={userData.profile?.twitter || ''}
                                            placeholder="@username"
                                            className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-violet-300 mb-2">
                                            Instagram
                                        </label>
                                        <input
                                            type="text"
                                            name="instagram"
                                            defaultValue={userData.profile?.instagram || ''}
                                            placeholder="@username"
                                            className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-violet-300 mb-2">
                                            LinkedIn
                                        </label>
                                        <input
                                            type="text"
                                            name="linkedin"
                                            defaultValue={userData.profile?.linkedin || ''}
                                            placeholder="linkedin.com/in/username"
                                            className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-violet-300 mb-2">
                                            GitHub
                                        </label>
                                        <input
                                            type="text"
                                            name="github"
                                            defaultValue={userData.profile?.github || ''}
                                            placeholder="github.com/username"
                                            className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-violet-300 mb-2">
                                            YouTube
                                        </label>
                                        <input
                                            type="text"
                                            name="youtube"
                                            defaultValue={userData.profile?.youtube || ''}
                                            placeholder="youtube.com/@username"
                                            className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-violet-300 mb-2">
                                            TikTok
                                        </label>
                                        <input
                                            type="text"
                                            name="tiktok"
                                            defaultValue={userData.profile?.tiktok || ''}
                                            placeholder="@username"
                                            className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-violet-300 mb-2">
                                            Discord
                                        </label>
                                        <input
                                            type="text"
                                            name="discord"
                                            defaultValue={userData.profile?.discord || ''}
                                            placeholder="username#0000"
                                            className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-violet-300 mb-2">
                                            Reddit
                                        </label>
                                        <input
                                            type="text"
                                            name="reddit"
                                            defaultValue={userData.profile?.reddit || ''}
                                            placeholder="u/username"
                                            className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-violet-300 mb-2">
                                            Medium
                                        </label>
                                        <input
                                            type="text"
                                            name="medium"
                                            defaultValue={userData.profile?.medium || ''}
                                            placeholder="medium.com/@username"
                                            className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-violet-300 mb-2">
                                            Stack Overflow
                                        </label>
                                        <input
                                            type="text"
                                            name="stackoverflow"
                                            defaultValue={userData.profile?.stackoverflow || ''}
                                            placeholder="stackoverflow.com/users/username"
                                            className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-violet-300 mb-2">
                                            Dev.to
                                        </label>
                                        <input
                                            type="text"
                                            name="devto"
                                            defaultValue={userData.profile?.devto || ''}
                                            placeholder="dev.to/username"
                                            className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'account' && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-violet-300 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={userData.email}
                                            disabled
                                            placeholder="Your email address"
                                            className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-gray-400 cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-violet-300 mb-2">
                                            Username
                                        </label>
                                        <input
                                            type="text"
                                            value={userData.username}
                                            disabled
                                            placeholder="Your username"
                                            className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-gray-400 cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-violet-300 mb-2">
                                            Current Password
                                        </label>
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            placeholder="Enter your current password"
                                            className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-violet-300 mb-2">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            placeholder="Enter your new password"
                                            className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-violet-300 mb-2">
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            placeholder="Confirm your new password"
                                            className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end pt-6 border-t border-violet-500/30">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 px-6 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FiSave className="w-5 h-5" />
                                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </fetcher.Form>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

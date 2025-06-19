// app/routes/profile.tsx
import { Form, useLoaderData, Link, useActionData, useNavigation, useFetcher } from "@remix-run/react"
import { LoaderFunction, ActionFunction, json, redirect, ActionFunctionArgs, MetaFunction } from '@remix-run/node'
import { logout, getUser } from '~/utils/auth.server'
import { editUser } from '~/utils/user.server'
import { useEffect, useState } from 'react'
import { Layout } from '../components/Layout'
import { prisma } from '~/utils/prisma.server'
import { LoaderFunctionArgs } from '@remix-run/node'
import { requireUserId } from '~/utils/auth.server'
import { validateUsername } from "~/utils/validators.client";
import { AuthNotice } from '~/components/auth-notice';
import type { Profile, User } from '~/utils/types.server';
import { FiUser, FiLink, FiMail, FiLock, FiSave, FiCheck } from 'react-icons/fi';
import { FaUser, FaLock, FaBell, FaPalette, FaGlobe, FaTrash, FaSave, FaTimes, FaCheck, FaEdit, FaEye, FaEyeSlash } from 'react-icons/fa'

type UserData = User;

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

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const userId = await requireUserId(request);
    const userData = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true }
    });

    if (!userData) {
        throw new Response("User not found", { status: 404 });
    }

    return json({ userData, isAuthenticated: true });
};

export const action: ActionFunction = async ({ request }) => {
    const user = await getUser(request);
    if (!user) {
        return redirect('/login');
    }

    const formData = await request.formData();
    const action = formData.get('action');

    if (action === 'updateProfile') {
        const currentUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: { profile: true }
        });

        if (!currentUser) {
            return json({ error: 'User not found' }, { status: 404 });
        }

        // Helper function to get form data with proper handling of empty strings
        const getFormValue = (field: string) => {
            const value = formData.get(field);
            return value === null || value === '' ? null : value.toString();
        };

        const profile = {
            firstName: getFormValue('firstName'),
            lastName: getFormValue('lastName'),
            profilePicture: currentUser.profile?.profilePicture,
            bio: getFormValue('bio'),
            location: getFormValue('location'),
            website: getFormValue('website'),
            // Social Media Links
            facebook: getFormValue('facebook'),
            twitter: getFormValue('twitter'),
            instagram: getFormValue('instagram'),
            linkedin: getFormValue('linkedin'),
            github: getFormValue('github'),
            youtube: getFormValue('youtube'),
            tiktok: getFormValue('tiktok'),
            discord: getFormValue('discord'),
            reddit: getFormValue('reddit'),
            medium: getFormValue('medium'),
            stackoverflow: getFormValue('stackoverflow'),
            devto: getFormValue('devto')
        };

        try {
            const updatedUser = await editUser({ profile }, request);
            return json({ success: true, userData: updatedUser });
        } catch (error) {
            return json({ error: 'Failed to update profile' }, { status: 400 });
        }
    }

    return json({ error: 'Invalid action' }, { status: 400 });
};

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

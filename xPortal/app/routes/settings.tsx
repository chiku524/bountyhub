// app/routes/profile.tsx
import { FormField } from '~/components/form-field'
import { Form, useLoaderData, Link, useActionData, useNavigation, useFetcher } from "@remix-run/react"
import { LoaderFunction, ActionFunction, json, redirect, ActionFunctionArgs } from '@remix-run/node'
import { logout, getUser } from '~/utils/auth.server'
import { editUser } from '~/utils/user.server'
import { useEffect, useState } from 'react'
import { Nav } from '../components/nav'
import { prisma } from '~/utils/prisma.server'
import { LoaderFunctionArgs } from '@remix-run/node'
import { requireUserId } from '~/utils/auth.server'
import { validateName, validateUsername, validateUrl } from "~/utils/validators.server";

interface Profile {
    firstName?: string | null;
    lastName?: string | null;
    profilePicture?: string | null;
    bio?: string | null;
    location?: string | null;
    website?: string | null;
    twitter?: string | null;
    github?: string | null;
    linkedin?: string | null;
    instagram?: string | null;
}

interface UserData {
    id: string;
    email: string;
    username: string;
    profile?: {
        firstName: string | null;
        lastName: string | null;
        profilePicture: string | null;
        bio: string | null;
        location: string | null;
        website: string | null;
        twitter: string | null;
        github: string | null;
        linkedin: string | null;
        instagram: string | null;
    };
}

interface ActionData {
    error?: string;
    success?: boolean;
    userData?: UserData;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const userId = await requireUserId(request);
    const userData = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true }
    });

    if (!userData) {
        throw new Response("User not found", { status: 404 });
    }

    return json({ userData });
};

export const action: ActionFunction = async ({ request }) => {
    const user = await getUser(request);
    if (!user) {
        return redirect('/login');
    }

    const formData = await request.formData();
    const action = formData.get('action');

    if (action === 'updateProfile') {
        // Get the current user data to preserve existing values
        const currentUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: { profile: true }
        });

        if (!currentUser) {
            return json({ error: 'User not found' }, { status: 404 });
        }

        // Get form data, using existing values as fallback
        const profile = {
            firstName: currentUser.profile?.firstName || '',
            lastName: currentUser.profile?.lastName || '',
            profilePicture: currentUser.profile?.profilePicture,
            bio: formData.get('bio') as string || currentUser.profile?.bio || '',
            location: formData.get('location') as string || currentUser.profile?.location || '',
            website: formData.get('website') as string || currentUser.profile?.website || '',
            github: formData.get('github') as string || currentUser.profile?.github || '',
            twitter: formData.get('twitter') as string || currentUser.profile?.twitter || '',
            linkedin: formData.get('linkedin') as string || currentUser.profile?.linkedin || '',
            instagram: formData.get('instagram') as string || currentUser.profile?.instagram || ''
        };

        try {
            await editUser({ profile }, request);
            return json({ success: true });
        } catch (error) {
            console.error('Error updating profile:', error);
            return json({ error: 'Failed to update profile' }, { status: 400 });
        }
    }

    return json({ error: 'Invalid action' }, { status: 400 });
};

export default function Profile() {
    const { userData } = useLoaderData<{ userData: UserData }>();
    const actionData = useActionData<ActionData>();
    const navigation = useNavigation();
    const fetcher = useFetcher();
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editData, setEditData] = useState<string>('');
    const [formError, setFormError] = useState<string>('');
    const [formData, setFormData] = useState({
        github: userData.profile?.github || '',
        twitter: userData.profile?.twitter || '',
        linkedin: userData.profile?.linkedin || '',
        instagram: userData.profile?.instagram || ''
    });

    const isSubmitting = navigation.state === "submitting";

    // Reset form error when modal opens
    useEffect(() => {
        if (editModalOpen) {
            setFormError('');
        }
    }, [editModalOpen]);

    // Handle action data changes
    useEffect(() => {
        if (actionData?.error) {
            setFormError(actionData.error);
        } else if (actionData?.success) {
            setEditModalOpen(false);
            setEditData('');
            setFormError('');
            fetcher.load('/settings');
        }
    }, [actionData, fetcher]);

    const handleEditClick = (dataType: string) => {
        setEditData(dataType);
        setEditModalOpen(true);
        setFormError('');
    };

    const handleModalClose = () => {
        setEditModalOpen(false);
        setEditData('');
        setFormError('');
    };

    const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        formData.append('action', 'updateProfile');
        form.submit();
    };

    return (
        <div className="h-screen w-full bg-neutral-900 flex flex-row">
            <Nav />
            <div className="flex-1 flex items-center justify-center">
                <div className='w-4/5 h-2/3 flex flex-col bg-slate-300 text-slate-800 rounded-lg overflow-y-scroll relative border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-200 [&::-webkit-scrollbar-thumb]:bg-blue-500 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-blue-600'>
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse"></div>
                    <div className="relative">
                        <span className='mx-auto mt-10 font-bold text-xl block text-center'>Profile Settings</span>
                        <hr className='border-b border-slate-700 w-full mt-3 self-center' />
                        
                        {/* Profile Picture Section */}
                        <div className='block mx-10 my-5 bg-gray-100 rounded shadow-custom-slate relative'>
                            <div className='font-bold w-fit bg-gray-100 p-2 rounded border-b border-slate-700'>Profile Picture</div>
                            <div className='flex items-center gap-4 p-4'>
                                <div className='relative w-24 h-24 rounded-full overflow-hidden bg-gray-200'>
                                    {userData.profile?.profilePicture ? (
                                        <img 
                                            src={userData.profile.profilePicture} 
                                            alt="Profile" 
                                            className='w-full h-full object-cover'
                                        />
                                    ) : (
                                        <div className='w-full h-full flex items-center justify-center text-gray-400'>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <Form method="post" encType="multipart/form-data" className="flex-1">
                                    <input
                                        type="file"
                                        name="profilePicture"
                                        accept="image/*"
                                        className="hidden"
                                        id="profilePicture"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const formData = new FormData();
                                                formData.append('profilePicture', file);
                                                formData.append('_action', 'updateProfilePicture');
                                                fetch('/api/upload/profile-picture', {
                                                    method: 'POST',
                                                    body: formData
                                                }).then(response => {
                                                    if (response.ok) {
                                                        window.location.reload();
                                                    }
                                                });
                                            }
                                        }}
                                    />
                                    <label
                                        htmlFor="profilePicture"
                                        className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors cursor-pointer"
                                    >
                                        Upload New Picture
                                    </label>
                                </Form>
                            </div>
                        </div>

                        <div className='block mx-10 my-5 bg-gray-100 rounded shadow-custom-slate relative'>
                            <div className='font-bold w-fit bg-gray-100 p-2 rounded border-b border-slate-700'>Name</div>
                            <div className='bg-gray-100 rounded w-fit p-2'>
                                {userData.profile?.firstName && userData.profile?.lastName ? 
                                    `${userData.profile.firstName} ${userData.profile.lastName}` : 
                                    'Not set'}
                            </div>
                            <span className='text-blue-500 absolute top-0 right-0 m-5 hover:text-blue-600 cursor-pointer' onClick={() => handleEditClick('name')}>Edit</span>
                        </div>
                        <div className='block mx-10 my-5 bg-gray-100 rounded shadow-custom-slate relative'>
                            <div className='font-bold w-fit bg-gray-100 p-2 rounded border-b border-slate-700'>Email</div>
                            <div className='bg-gray-100 rounded w-fit p-2'>{userData.email}</div>
                            <span className='text-blue-500 absolute top-0 right-0 m-5 hover:text-blue-600 cursor-pointer' onClick={() => handleEditClick('email')}>Edit</span>
                        </div>
                        <div className='block mx-10 my-5 bg-gray-100 rounded shadow-custom-slate relative'>
                            <div className='font-bold w-fit bg-gray-100 p-2 rounded border-b border-slate-700'>Bio</div>
                            <div className='bg-gray-100 rounded w-fit p-2'>{userData.profile?.bio || 'Not set'}</div>
                            <span className='text-blue-500 absolute top-0 right-0 m-5 hover:text-blue-600 cursor-pointer' onClick={() => handleEditClick('bio')}>Edit</span>
                        </div>
                        <div className='block mx-10 my-5 bg-gray-100 rounded shadow-custom-slate relative'>
                            <div className='font-bold w-fit bg-gray-100 p-2 rounded border-b border-slate-700'>Username</div>
                            <div className='bg-gray-100 rounded w-fit p-2'>{userData.username ? userData.username : 'Not set'}</div>
                            <span className='text-blue-500 absolute top-0 right-0 m-5 hover:text-blue-600 cursor-pointer' onClick={() => handleEditClick('username')}>Edit</span>
                        </div>
                        <div className='block mx-10 my-5 bg-gray-100 rounded shadow-custom-slate relative'>
                            <div className='font-bold w-fit bg-gray-100 p-2 rounded border-b border-slate-700'>Website</div>
                            <div className='bg-gray-100 rounded w-fit p-2'>{userData.profile?.website || 'Not set'}</div>
                            <span className='text-blue-500 absolute top-0 right-0 m-5 hover:text-blue-600 cursor-pointer' onClick={() => handleEditClick('website')}>Edit</span>
                        </div>
                        <div className='block mx-10 my-5 bg-gray-100 rounded shadow-custom-slate relative'>
                            <div className='font-bold w-fit bg-gray-100 p-2 rounded border-b border-slate-700'>Socials</div>
                            <div className='flex flex-row justify-around gap-5'>
                                <div className='bg-gray-100 rounded w-fit p-2'>{userData.profile?.github ? userData.profile.github : 'Not set'}</div>
                                <div className='bg-gray-100 rounded w-fit p-2'>{userData.profile?.twitter ? userData.profile.twitter : 'Not set'}</div>
                                <div className='bg-gray-100 rounded w-fit p-2'>{userData.profile?.linkedin ? userData.profile.linkedin : 'Not set'}</div>
                                <div className='bg-gray-100 rounded w-fit p-2'>{userData.profile?.instagram ? userData.profile.instagram : 'Not set'}</div>
                            </div>
                            <span className='text-blue-500 absolute top-0 right-0 m-5 hover:text-blue-600 cursor-pointer' onClick={() => handleEditClick('socials')}>Edit</span>
                        </div>
                    </div>
                </div>
            </div>
            
            {editModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[90]">
                    <div className="bg-neutral-800 p-8 rounded-lg w-[500px] border-2 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)] relative">
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-violet-500/10 to-purple-500/10 animate-pulse"></div>
                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold text-white mb-6">
                                {editData === 'name' ? 'Edit Name' :
                                 editData === 'email' ? 'Edit Email' :
                                 editData === 'username' ? 'Edit Username' :
                                 editData === 'website' ? 'Edit Website' :
                                 editData === 'bio' ? 'Edit Bio' :
                                 'Edit Social Links'}
                            </h2>
                            
                            {formError && (
                                <div className="mb-4 p-2 bg-red-500/20 border border-red-500 rounded text-red-200 text-sm">
                                    {formError}
                                </div>
                            )}

                            <Form method="post" className="space-y-4" onSubmit={handleFormSubmit}>
                                <input type="hidden" name="action" value="updateProfile" />
                                {editData === 'bio' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                                        <textarea
                                            name="bio"
                                            defaultValue={userData.profile?.bio || ''}
                                            className="w-full px-4 py-2 bg-neutral-700 border border-violet-500/30 rounded-lg text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors min-h-[100px] resize-y"
                                            placeholder="Tell us about yourself"
                                        />
                                    </div>
                                )}
                                {editData === 'location' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                                        <input
                                            type="text"
                                            name="location"
                                            defaultValue={userData.profile?.location || ''}
                                            className="w-full px-4 py-2 bg-neutral-700 border border-violet-500/30 rounded-lg text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                                            placeholder="Your location"
                                        />
                                    </div>
                                )}
                                {editData === 'website' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
                                        <input
                                            type="url"
                                            name="website"
                                            defaultValue={userData.profile?.website || ''}
                                            className="w-full px-4 py-2 bg-neutral-700 border border-violet-500/30 rounded-lg text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                                            placeholder="https://example.com"
                                        />
                                    </div>
                                )}
                                {editData === 'socials' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">GitHub</label>
                                            <input
                                                type="url"
                                                name="github"
                                                defaultValue={userData.profile?.github || ''}
                                                className="w-full px-4 py-2 bg-neutral-700 border border-violet-500/30 rounded-lg text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                                                placeholder="https://github.com/username"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Twitter</label>
                                            <input
                                                type="url"
                                                name="twitter"
                                                defaultValue={userData.profile?.twitter || ''}
                                                className="w-full px-4 py-2 bg-neutral-700 border border-violet-500/30 rounded-lg text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                                                placeholder="https://twitter.com/username"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">LinkedIn</label>
                                            <input
                                                type="url"
                                                name="linkedin"
                                                defaultValue={userData.profile?.linkedin || ''}
                                                className="w-full px-4 py-2 bg-neutral-700 border border-violet-500/30 rounded-lg text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                                                placeholder="https://linkedin.com/in/username"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Instagram</label>
                                            <input
                                                type="url"
                                                name="instagram"
                                                defaultValue={userData.profile?.instagram || ''}
                                                className="w-full px-4 py-2 bg-neutral-700 border border-violet-500/30 rounded-lg text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                                                placeholder="https://instagram.com/username"
                                            />
                                        </div>
                                    </>
                                )}
                                
                                <div className="flex justify-end gap-4 mt-6">
                                    <button
                                        type="button"
                                        onClick={handleModalClose}
                                        className="px-4 py-2 text-sm font-medium text-gray-300 bg-neutral-700 rounded-lg hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors"
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-violet-500 rounded-lg hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </Form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// app/utils/user.server.ts
import bcrypt from 'bcryptjs'
import type { RegisterForm, User, Post, PostForm } from './types.server'
import { getUser } from './auth.server'
import { prisma } from './prisma.server'
import { initGridFS, getVideo } from './gridfs'
import mongoose from 'mongoose'
import { GridFSBucket } from 'mongodb'
import { addReputationPoints, REPUTATION_POINTS } from './reputation.server'

export const createUser = async (user: RegisterForm) => {
  const { email, password, username } = user
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { username }
      ]
    }
  })

  if (existingUser) {
    return { error: 'User already exists' }
  }

  const newUser = await prisma.user.create({
    data: {
      email,
      username,
      password: await bcrypt.hash(password, 10),
      profile: {
        create: {
          firstName: '',
          lastName: '',
          profilePicture: null,
          bio: '',
          location: '',
          website: '',
          twitter: null,
          github: null,
          linkedin: null
        }
      }
    }
  })

  return { id: newUser.id, email }
}

interface Profile {
    firstName?: string;
    lastName?: string;
    profilePicture?: string | null;
    bio?: string;
    location?: string;
    website?: string;
    twitter?: string | null;
    github?: string | null;
    linkedin?: string | null;
    instagram?: string | null;
}

export const editUser = async (profile: { profile: Profile }, request: Request) => {
    const user = await getUser(request);
    if (!user) {
        throw new Error('User not found');
    }

    // Get current profile data
    const currentUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { profile: true }
    });

    if (!currentUser) {
        throw new Error('User not found');
    }

    // Merge current profile data with new data
    const updatedProfile = {
        firstName: profile.profile.firstName ?? currentUser.profile?.firstName ?? '',
        lastName: profile.profile.lastName ?? currentUser.profile?.lastName ?? '',
        profilePicture: profile.profile.profilePicture ?? currentUser.profile?.profilePicture,
        bio: profile.profile.bio ?? currentUser.profile?.bio ?? '',
        location: profile.profile.location ?? currentUser.profile?.location ?? '',
        website: profile.profile.website ?? currentUser.profile?.website ?? '',
        twitter: profile.profile.twitter ?? currentUser.profile?.twitter,
        github: profile.profile.github ?? currentUser.profile?.github,
        linkedin: profile.profile.linkedin ?? currentUser.profile?.linkedin,
        instagram: profile.profile.instagram ?? currentUser.profile?.instagram
    };

    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
            profile: {
                upsert: {
                    create: updatedProfile,
                    update: updatedProfile
                }
            }
        },
        include: {
            profile: true
        }
    });

    return updatedUser;
};

export const getUserPosts = async (username: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        posts: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!user) {
      return [];
    }

    return user.posts;
  } catch (error) {
    console.error('Error in getUserPosts:', error);
    return [];
  }
}

export const createPost = async (post: PostForm) => {
  try {
    const newPost = await prisma.posts.create({
      data: {
        title: post.title,
        content: post.content,
        authorId: post.authorId,
        blobVideoURL: post.blobVideoURL,
        codeBlocks: {
          create: post.codeBlocks
        }
      }
    });

    // Award reputation points for creating a post
    await addReputationPoints(
      post.authorId,
      REPUTATION_POINTS.POST_CREATED,
      'POST_CREATED',
      newPost.id
    );

    return newPost;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

export async function deletePost(postId: string) {
    try {
        const post = await prisma.posts.findUnique({
            where: { id: postId },
            select: { blobVideoURL: true }
        });

        if (!post) {
            throw new Error('Post not found');
        }

        if (post.blobVideoURL) {
            try {
                await initGridFS();
                const file = await getVideo(post.blobVideoURL);
                if (file) {
                    const bucket = new GridFSBucket(mongoose.connection.db as any, {
                        bucketName: 'videos'
                    });
                    await bucket.delete(file._id);
                }
            } catch (error) {
                console.error('Error deleting video from GridFS:', error);
            }
        }

        await prisma.posts.delete({
            where: { id: postId }
        });

        return { success: true };
    } catch (error) {
        console.error('Error in deletePost:', error);
        throw error;
    }
}
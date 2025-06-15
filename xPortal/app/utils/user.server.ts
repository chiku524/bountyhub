// app/utils/user.server.ts
import bcrypt from 'bcryptjs'
import type { RegisterForm, User, Post, PostForm } from './types.server'
import { getUser } from './auth.server'
import { prisma } from './prisma.server'
import { initGridFS, getVideo } from './gridfs'
import mongoose from 'mongoose'
import { GridFSBucket } from 'mongodb'

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

interface UserUpdate {
  email?: string | undefined;
  profile: {
    firstName?: string | undefined;
    lastName?: string | undefined;
    profession?: string | undefined;
    avatar?: string | undefined;
    username?: string | undefined;
    website?: string | undefined;
    bio?: string | undefined;
    socials: {
      facebook?: string | undefined;
      twitter?: string | undefined;
      instagram?: string | undefined;
      linkedin?: string | undefined;
      github?: string | undefined;
    }
  }
}

export const editUser = async (user: Partial<User>, request: Request) => {
  const userId = await getUser(request);
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const { email, profile } = user;

  const updateData: any = {};
  if (email) updateData.email = email;
  if (user.hasOwnProperty('username') && (user as any).username) updateData.username = (user as any).username;
  
  if (profile) {
    // First check if profile exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: userId.id }
    });

    if (existingProfile) {
      // Update existing profile
      updateData.profile = {
        update: {
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          profilePicture: profile.profilePicture,
          bio: profile.bio || '',
          location: profile.location || '',
          website: profile.website || '',
          twitter: profile.twitter,
          github: profile.github,
          linkedin: profile.linkedin
        }
      };
    } else {
      // Create new profile
      updateData.profile = {
        create: {
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          profilePicture: profile.profilePicture,
          bio: profile.bio || '',
          location: profile.location || '',
          website: profile.website || '',
          twitter: profile.twitter,
          github: profile.github,
          linkedin: profile.linkedin
        }
      };
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId.id },
    data: updateData,
    include: {
      profile: true
    }
  });

  return updatedUser;
}

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

  const newPost = await prisma.posts.create({
    data: {
      authorId: post.author,
      title: post.title,
      content: post.content,
      blobVideoURL: post.blobVideoURL,
    },
  });
  return newPost;
}

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
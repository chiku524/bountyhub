// app/utils/user.server.ts
import bcrypt from 'bcryptjs'
import type { RegisterForm, User } from './types.server'
import { getUser } from './auth.server'
import { prisma } from './prisma.server'

export const createUser = async (user: RegisterForm) => {
  const passwordHash = await bcrypt.hash(user.password, 10)
  const newUser = await prisma.user.create({
    data: {
      email: user.email,
      password: passwordHash,
      profile: {
        firstName: user.firstName,
        lastName: user.lastName,
      },
    },
  })
  return { id: newUser.id, email: user.email }
}

interface UserUpdate {
  email?: string | undefined;
  profile: {
    firstName?: string | undefined;
    lastName?: string | undefined;
    profession?: string | undefined;
    avatar?: string | undefined;
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
  const { email, profile: { firstName, lastName, profession, avatar, website, bio, socials: { facebook, twitter, instagram, linkedin, github }}} = user as UserUpdate;
  

  const updatedUserEmail = await prisma.user.update({
    where: { id: userId?.id },
    data: { 
        email: email || undefined, 
        profile: {
          update: {
            firstName: firstName || undefined,
            lastName: lastName || undefined,
            profession: profession || undefined,
            avatar: avatar || undefined,
            website: website || undefined,
            bio: bio || undefined,
            socials: {
              facebook: facebook || undefined,
              twitter: twitter || undefined,
              instagram: instagram || undefined,
              linkedin: linkedin || undefined,
              github: github || undefined,
            },
          },
        },
    },
  });

  return updatedUserEmail;
}

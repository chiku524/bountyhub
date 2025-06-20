// app/utils/auth.server.ts

import type { RegisterForm, LoginForm } from './types.server'
import bcrypt from 'bcryptjs'
import { redirect, createCookieSessionStorage } from '@remix-run/node'
import { createUser, getUserById, getUserByEmail, getUserByUsername } from './user.server'
import type { Db } from './db.server'

const sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret) {
  throw new Error('SESSION_SECRET must be set')
}

const storage = createCookieSessionStorage({
  cookie: {
    name: 'portal-session',
    secure: process.env.NODE_ENV === 'production' ? true : false,
    secrets: [sessionSecret],
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
})

export interface AuthError {
  error: string;
  fields?: {
    email?: string;
    password?: string;
    username?: string;
  };
}

export async function createUserSession(userId: string, redirectTo: string) {
  const session = await storage.getSession()
  session.set('userId', userId)
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await storage.commitSession(session),
    },
  })
}

export async function register(db: Db, { email, password, username, redirectTo = '/profile' }: RegisterForm): Promise<Response | AuthError> {
  // Check if user exists by email or username
  const existingUserByEmail = await getUserByEmail(db, email);
  const existingUserByUsername = await getUserByUsername(db, username);
  
  if (existingUserByEmail) {
    return { error: 'User already exists with that email' }
  }
  
  if (existingUserByUsername) {
    return { error: 'Username is already taken' }
  }

  const newUser = await createUser(db, { email, password, username })
  if (!newUser) {
    return { error: 'Something went wrong trying to create a new user.' }
  }

  return createUserSession(newUser.id, redirectTo)
}

export async function login(db: Db, { email, password, redirectTo = '/profile' }: LoginForm): Promise<Response | AuthError> {
  const user = await getUserByEmail(db, email);
  
  if (!user) {
    return { error: 'Invalid credentials' }
  }

  const isCorrectPassword = await bcrypt.compare(password, user.password)
  if (!isCorrectPassword) {
    return { error: 'Invalid credentials' }
  }

  return createUserSession(user.id, redirectTo)
}

export async function requireUserId(request: Request, redirectTo: string = new URL(request.url).pathname) {
  const session = await getUserSession(request)
  const userId = session.get('userId')
  if (!userId || typeof userId !== 'string') {
    throw redirect(`/login?redirectTo=${redirectTo}`)
  }
  return userId
}

function getUserSession(request: Request) {
  return storage.getSession(request.headers.get('Cookie'))
}

async function getUserId(request: Request): Promise<string | null> {
  const session = await getUserSession(request)
  const userId = session.get('userId')
  if (!userId || typeof userId !== 'string') return null
  return userId
}

export async function getUser(request: Request, db?: Db) {
  const userId = await getUserId(request)
  if (!userId || typeof userId !== 'string') {
    return null
  }

  try {
    if (db) {
      const user = await getUserById(db, userId)
      return user
    } else {
      // Fallback for backward compatibility - this will need to be updated
      // when all routes are migrated to pass the database context
      return null
    }
  } catch {
    throw logout(request)
  }
}

export async function logout(request: Request) {
  const session = await getUserSession(request)
  return redirect('/login', {
    headers: {
      'Set-Cookie': await storage.destroySession(session),
    },
  })
}
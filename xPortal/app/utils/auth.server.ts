// app/utils/auth.server.ts

import type { RegisterForm, LoginForm } from './types.server'
import bcrypt from 'bcryptjs'
import { redirect, createCookieSessionStorage } from '@remix-run/node'
import { createUser, getUserById, getUserByEmail, getUserByUsername } from './user.server'
import type { Db } from './db.server'

// Define session data type
interface SessionData {
  userId: string;
}

// Lazy initialization of session secret
function getSessionSecret(env: any): string {
  // Check global variable first (for Workers environment)
  if (typeof globalThis !== 'undefined') {
    const global = globalThis as any;
    if (global.SESSION_SECRET) {
      return global.SESSION_SECRET;
    }
  }

  // Check env parameter (for Cloudflare Workers)
  if (env && env.SESSION_SECRET) {
    return env.SESSION_SECRET;
  }

  throw new Error('SESSION_SECRET must be set')
}

// Lazy storage creation
let storageInstance: ReturnType<typeof createCookieSessionStorage<SessionData>> | null = null;

function getStorage(env: any) {
  if (!storageInstance) {
    const sessionSecret = getSessionSecret(env);
    storageInstance = createCookieSessionStorage<SessionData>({
      cookie: {
        name: 'portal-session',
        secure: env?.NODE_ENV === 'production' ? true : false,
        secrets: [sessionSecret],
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true,
      },
    });
  }
  return storageInstance;
}

export interface AuthError {
  error: string;
  fields?: {
    email?: string;
    password?: string;
    username?: string;
  };
}

export async function createUserSession(userId: string, redirectTo: string, env: any) {
  const storage = getStorage(env);
  const session = await storage.getSession()
  session.set('userId', userId)
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await storage.commitSession(session),
    },
  })
}

export async function register(db: Db, { email, password, username, redirectTo = '/profile' }: RegisterForm, env: any): Promise<Response | AuthError> {
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

  return createUserSession(newUser.id, redirectTo, env)
}

export async function login(db: Db, { email, password, redirectTo = '/profile' }: LoginForm, env: any): Promise<Response | AuthError> {
  const user = await getUserByEmail(db, email);
  
  if (!user) {
    return { error: 'Invalid credentials' }
  }

  const isCorrectPassword = await bcrypt.compare(password, user.password)
  if (!isCorrectPassword) {
    return { error: 'Invalid credentials' }
  }

  return createUserSession(user.id, redirectTo, env)
}

export async function requireUserId(request: Request, env: any, redirectTo: string = new URL(request.url).pathname) {
  const session = await getUserSession(request, env)
  const userId = session.get('userId')
  if (!userId || typeof userId !== 'string') {
    throw redirect(`/login?redirectTo=${redirectTo}`)
  }
  return userId
}

function getUserSession(request: Request, env: any) {
  const storage = getStorage(env);
  return storage.getSession(request.headers.get('Cookie'))
}

async function getUserId(request: Request, env: any): Promise<string | null> {
  const session = await getUserSession(request, env)
  const userId = session.get('userId')
  if (!userId || typeof userId !== 'string') return null
  return userId
}

export async function getUser(request: Request, db?: Db, env?: any) {
  const userId = await getUserId(request, env || {})
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
    throw logout(request, env || {})
  }
}

export async function logout(request: Request, env: any) {
  const storage = getStorage(env);
  const session = await getUserSession(request, env)
  return redirect('/login', {
    headers: {
      'Set-Cookie': await storage.destroySession(session),
    },
  })
}
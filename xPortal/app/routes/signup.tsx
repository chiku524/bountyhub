import { json, type ActionFunctionArgs, type LoaderFunctionArgs, MetaFunction, redirect } from '@remix-run/node'
import { Form, useActionData, useSearchParams, Link } from '@remix-run/react'
import { useEffect, useRef } from 'react'
import { register, getUser } from '~/utils/auth.server'
import { createDb } from '~/utils/db.server'
import { Layout } from '~/components/Layout'

export const meta: MetaFunction = () => {
  return [
    { title: 'Sign Up - BountyHub' },
    { name: 'description', content: 'Create your BountyHub account' },
  ]
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const db = createDb((context as any).env.DB)
  const user = await getUser(request, db)
  if (user) return redirect('/profile')
  return json({})
}

export async function action({ request, context }: ActionFunctionArgs) {
  const form = await request.formData()
  const email = form.get('email') as string
  const password = form.get('password') as string
  const username = form.get('username') as string
  const redirectTo = form.get('redirectTo') as string || '/profile'

  if (!email || !password || !username) {
    return json({ error: 'Email, password, and username are required' }, { status: 400 })
  }

  const db = createDb((context as any).env.DB)
  const result = await register(db, { email, password, username, redirectTo })

  if (result instanceof Response) {
    return result
  }

  return json(result, { status: 400 })
}

type ActionData = {
  error?: string;
  fields?: {
    email?: string;
    password?: string;
    username?: string;
  };
};

export default function SignUp() {
  const actionData = useActionData<ActionData>()
  const [searchParams] = useSearchParams()
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const usernameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (actionData?.error) {
      if (actionData.error.includes('password')) {
        passwordRef.current?.focus()
      } else if (actionData.error.includes('email')) {
        emailRef.current?.focus()
      } else {
        usernameRef.current?.focus()
      }
    }
  }, [actionData])

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-neutral-900/95 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              Or{' '}
              <Link
                to="/login"
                className="font-medium text-violet-400 hover:text-violet-300"
              >
                sign in to your existing account
              </Link>
            </p>
          </div>
          <Form method="post" className="mt-8 space-y-6">
            <input
              type="hidden"
              name="redirectTo"
              value={searchParams.get('redirectTo') ?? undefined}
            />
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="username" className="sr-only">
                  Username
                </label>
                <input
                  ref={usernameRef}
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white placeholder-gray-400 rounded-t-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
                  placeholder="Username"
                  defaultValue={actionData?.fields?.username ?? ''}
                  aria-invalid={actionData?.error ? true : undefined}
                  aria-describedby="username-error"
                />
              </div>
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  ref={emailRef}
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  defaultValue={actionData?.fields?.email ?? ''}
                  aria-invalid={actionData?.error ? true : undefined}
                  aria-describedby="email-error"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  ref={passwordRef}
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white placeholder-gray-400 rounded-b-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  aria-invalid={actionData?.error ? true : undefined}
                  aria-describedby="password-error"
                />
              </div>
            </div>

            {actionData?.error ? (
              <div className="rounded-md bg-red-500/10 border border-red-500/20 p-4">
                <div className="text-sm text-red-400">
                  {actionData.error}
                </div>
              </div>
            ) : null}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
              >
                Create account
              </button>
            </div>
          </Form>
        </div>
      </div>
    </Layout>
  )
} 
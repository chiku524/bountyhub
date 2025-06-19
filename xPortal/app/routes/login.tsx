// app/routes/login.tsx
import { useState, useEffect } from 'react'
import { Form, useActionData, useSearchParams, Link, useRouteError, isRouteErrorResponse } from '@remix-run/react'
import { FormField } from '~/components/form-field'
import { ActionFunction, LoaderFunction, redirect, json, MetaFunction } from '@remix-run/node'
import { validateEmail, validatePassword } from '~/utils/validators.client'
import { login, getUser } from '~/utils/auth.server'

export const meta: MetaFunction = () => {
  return [
    { title: "Login - portal.ask" },
    { name: "description", content: "Sign in to your portal.ask account" },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
    const user = await getUser(request);
    
    if (user) {
        const url = new URL(request.url);
        const redirectTo = url.searchParams.get('redirectTo') || '/profile';
        return redirect(redirectTo);
    }
    return null;
}

export const action: ActionFunction = async ({ request }) => {
    // Only process POST requests
    if (request.method !== 'POST') {
        return redirect('/login');
    }
    
    // Check if the request has content
    const contentLength = request.headers.get('content-length');
    if (!contentLength || contentLength === '0') {
        return redirect('/login');
    }
    
    try {
        // Check if the request has form data
        const contentType = request.headers.get('content-type');
        if (!contentType || (!contentType.includes('multipart/form-data') && !contentType.includes('application/x-www-form-urlencoded'))) {
            return redirect('/login');
        }
        
        const form = await request.formData()
        const email = form.get('email')
        const password = form.get('password')
        const redirectTo = form.get('redirectTo')

        if (typeof email !== 'string' || typeof password !== 'string') {
            return json({ error: 'Email and password are required' }, { status: 400 })
        }

        if (typeof redirectTo !== 'string') {
            return json({ error: 'Redirect URL is required' }, { status: 400 })
        }

        const result = await login({ email, password, redirectTo })
        if (result instanceof Response) {
            return result
        }
        return json({ error: result.error }, { status: 400 })
    } catch (error) {
        // Return a redirect instead of throwing an error
        return redirect('/login');
    }
}

export function ErrorBoundary() {
  const error = useRouteError();
  
  return (
    <div className="h-screen w-full bg-neutral-900 flex flex-col items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-neutral-800 rounded-lg shadow-lg border border-red-500/30">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500/10 mb-4">
            <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-600 mb-2">
            Oops! Something went wrong
          </h1>
          <p className="text-gray-400 mb-6">
            {isRouteErrorResponse(error) 
              ? error.status === 404 
                ? "The page you're looking for doesn't exist."
                : "Something went wrong. Please try again."
              : "An unexpected error occurred. Please try again later."}
          </p>
        </div>

        <div className="flex flex-col space-y-3">
          <Link
            to="/login"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors text-center"
          >
            Try Again
          </Link>
          <Link
            to="/"
            className="w-full py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-neutral-700 hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors text-center"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get('redirectTo') || '/profile';
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })
    const actionData = useActionData<typeof action>()
    const [errors, setErrors] = useState(actionData?.errors || {})
    const [formError, setFormError] = useState(actionData?.error || '')

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
        setFormData(form => ({ ...form, [field]: event.target.value }))
        setFormError('')
    }

    useEffect(() => {
        if (actionData?.error) {
            setFormError(actionData.error);
        }
    }, [actionData]);

    return (
        <div className="h-screen w-full bg-neutral-900 flex flex-col items-center justify-center">
            <div className="w-full max-w-md p-8 space-y-8 bg-neutral-800 rounded-lg shadow-lg">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                        Welcome Back
                    </h1>
                    <p className="mt-2 text-gray-400">
                        Sign in to your xPortal account
                    </p>
                </div>

                <Form method="post" className="space-y-6">
                    <input type="hidden" name="redirectTo" value={redirectTo} />

                    <FormField
                        textarea={false}
                        htmlFor="email"
                        label="Email"
                        value={formData.email}
                        onChange={e => handleInputChange(e, 'email')}
                        error={errors.email}
                        type="email"
                    />

                    <FormField
                        textarea={false}
                        htmlFor="password"
                        label="Password"
                        value={formData.password}
                        onChange={e => handleInputChange(e, 'password')}
                        error={errors.password}
                        type="password"
                    />

                    {formError && (
                        <div className="text-red-500 text-sm text-center">
                            {formError}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                        Sign In
                    </button>
                </Form>

                <div className="text-center">
                    <p className="text-gray-400">
                        Don't have an account?{' '}
                        <Link 
                            to={`/signup?redirectTo=${encodeURIComponent(redirectTo)}`}
                            className="text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                            Create one here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

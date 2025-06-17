// app/routes/login.tsx
import { useState, useRef, useEffect } from 'react'
import { Form, useActionData, useSearchParams } from '@remix-run/react'
import { FormField } from '~/components/form-field'
import { ActionFunction, LoaderFunction, redirect, json } from '@remix-run/node'
import { validateEmail, validatePassword, validateUsername } from '~/utils/validators.client'
import { login, register, getUser } from '~/utils/auth.server'

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
    const form = await request.formData()
    const action = form.get('_action')
    const email = form.get('email')
    const password = form.get('password')
    const username = form.get('username')
    const redirectTo = form.get('redirectTo')

    if (typeof action !== 'string') {
        return json({ error: 'Invalid form action', form: action }, { status: 400 })
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
        return json({ error: 'Email and password are required', form: action }, { status: 400 })
    }

    if (typeof redirectTo !== 'string') {
        return json({ error: 'Redirect URL is required', form: action }, { status: 400 })
    }

    switch (action) {
        case 'login': {
            const result = await login({ email, password, redirectTo })
            if (result instanceof Response) {
                return result
            }
            return json({ error: result.error, form: action }, { status: 400 })
        }
        case 'register': {
            if (!username || typeof username !== 'string') {
                return json({ error: 'Username is required', form: action }, { status: 400 })
            }
            
            const result = await register({ 
                email, 
                password, 
                username,
                redirectTo
            });
            if (result instanceof Response) {
                return result
            }
            return json({ error: result.error, form: action }, { status: 400 })
        }
        default:
            return json({ error: 'Invalid form action', form: action }, { status: 400 })
    }
}

export default function Login() {
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get('redirectTo') || '/profile';
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '',
    })
    const [signActive, setSignActive] = useState(true);
    const actionData = useActionData<typeof action>()
    const [errors, setErrors] = useState(actionData?.errors || {})
    const [formError, setFormError] = useState(actionData?.error || '')
    const [isLoading, setIsLoading] = useState(false)

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
        setFormData(form => ({ ...form, [field]: event.target.value }))
        setFormError('')
    }

    useEffect(() => {
        if (actionData?.error) {
            setFormError(actionData.error);
            setIsLoading(false);
        }
    }, [actionData]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setFormError('');

        // Validate fields before submission
        const validationErrors = {
            email: validateEmail(formData.email),
            password: validatePassword(formData.password),
            ...(signActive ? {} : {
                username: validateUsername(formData.username)
            })
        };

        if (Object.values(validationErrors).some(Boolean)) {
            setErrors(validationErrors);
            setIsLoading(false);
            return;
        }

        // If validation passes, submit the form
        event.currentTarget.submit();
    }

    return (
        <div className="h-screen w-full bg-neutral-900 flex flex-col items-center justify-center">
            <div className="w-full max-w-md p-8 space-y-8 bg-neutral-800 rounded-lg shadow-lg">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                        Welcome to xPortal
                    </h1>
                    <p className="mt-2 text-gray-400">
                        {signActive ? 'Sign in to your account' : 'Create a new account'}
                    </p>
                </div>

                <div className="flex justify-center space-x-4 mb-8">
                    <button
                        type="button"
                        onClick={() => setSignActive(true)}
                        className={`px-4 py-2 rounded-md transition-colors ${
                            signActive
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        Sign In
                    </button>
                    <button
                        type="button"
                        onClick={() => setSignActive(false)}
                        className={`px-4 py-2 rounded-md transition-colors ${
                            !signActive
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        Sign Up
                    </button>
                </div>

                <Form method="post" className="space-y-6" onSubmit={handleSubmit}>
                    <input type="hidden" name="redirectTo" value={redirectTo} />
                    <input type="hidden" name="_action" value={signActive ? 'login' : 'register'} />

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

                    {!signActive && (
                        <FormField
                            textarea={false}
                            htmlFor="username"
                            label="Username"
                            value={formData.username}
                            onChange={e => handleInputChange(e, 'username')}
                            error={errors.username}
                        />
                    )}

                    {formError && (
                        <div className="text-red-500 text-sm text-center">
                            {formError}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? 'Loading...' : signActive ? 'Sign In' : 'Sign Up'}
                    </button>
                </Form>
            </div>
        </div>
    );
}

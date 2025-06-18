import { useState, useEffect } from 'react'
import { Form, useActionData, useSearchParams, Link } from '@remix-run/react'
import { FormField } from '~/components/form-field'
import { ActionFunction, LoaderFunction, redirect, json } from '@remix-run/node'
import { validateEmail, validatePassword, validateUsername } from '~/utils/validators.client'
import { register, getUser } from '~/utils/auth.server'

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
    const email = form.get('email')
    const password = form.get('password')
    const username = form.get('username')
    const redirectTo = form.get('redirectTo')

    if (typeof email !== 'string' || typeof password !== 'string' || typeof username !== 'string') {
        return json({ error: 'Email, password, and username are required' }, { status: 400 })
    }

    if (typeof redirectTo !== 'string') {
        return json({ error: 'Redirect URL is required' }, { status: 400 })
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
    return json({ error: result.error }, { status: 400 })
}

export default function Signup() {
    const [searchParams] = useSearchParams();
    const redirectTo = searchParams.get('redirectTo') || '/profile';
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '',
    })
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
            username: validateUsername(formData.username)
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
                        Join xPortal
                    </h1>
                    <p className="mt-2 text-gray-400">
                        Create your account and start exploring
                    </p>
                </div>

                <Form method="post" className="space-y-6" onSubmit={handleSubmit}>
                    <input type="hidden" name="redirectTo" value={redirectTo} />

                    <FormField
                        textarea={false}
                        htmlFor="username"
                        label="Username"
                        value={formData.username}
                        onChange={e => handleInputChange(e, 'username')}
                        error={errors.username}
                        type="text"
                    />

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
                        disabled={isLoading}
                        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </Form>

                <div className="text-center">
                    <p className="text-gray-400">
                        Already have an account?{' '}
                        <Link 
                            to={`/login?redirectTo=${encodeURIComponent(redirectTo)}`}
                            className="text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                            Sign in here
                        </Link>
                    </p>
                </div>

                <div className="text-center text-xs text-gray-500">
                    <p>By creating an account, you agree to our Terms of Service and Privacy Policy.</p>
                </div>
            </div>
        </div>
    );
} 
// app/routes/login.tsx
import { useState, useRef, useEffect } from 'react'
import { Form, useActionData } from '@remix-run/react'
import { Layout } from '~/components/layout'
import { FormField } from '~/components/form-field'
import { ActionFunction, LoaderFunction, redirect } from '@remix-run/node'
import { validateEmail, validateName, validatePassword, validateUsername } from '~/utils/validators.server'
import { login, register, getUser } from '~/utils/auth.server'


export const loader: LoaderFunction = async ({ request }) => {
    // If there's already a user in the session, redirect to the profile page
    return (await getUser(request)) ? redirect('/profile') : null
}

export const action: ActionFunction = async ({ request }) => {
    const form = await request.formData()
    const action = form.get('_action')
    const email = form.get('email')
    const password = form.get('password')
    const username = form.get('username')
    let firstName = form.get('firstName')
    let lastName = form.get('lastName')

    if (typeof action !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
        return { error: `Invalid Form Data`, form: action }
    }

    if (action === 'register' && (typeof firstName !== 'string' || typeof lastName !== 'string')) {
        return { error: `Invalid Form Data`, form: action }
    }

    const errors = {
        email: validateEmail(email),
        password: validatePassword(password),
        ...(action === 'register'
        ? {
            firstName: validateName((firstName as string) || ''),
            lastName: validateName((lastName as string) || ''),
            username: validateUsername((username as string) || ''),
            }
        : {}),
    }

    if (Object.values(errors).some(Boolean))
        return { errors, fields: { email, password, firstName, lastName, username }, form: action }


    switch (action) {
        case 'login': {
            return await login({ email, password })
        }
        case 'register': {
            if (!firstName || !lastName || !email || !password || !username || 
                typeof firstName !== 'string' || 
                typeof lastName !== 'string' ||
                typeof email !== 'string' ||
                typeof password !== 'string' ||
                typeof username !== 'string') {
                throw new Response('All fields are required', { status: 400 });
            }
            
            return await register({ email, password, firstName, lastName, username });
        }
        default:
            return { error: `Invalid Form Data`, form: action }
      }
}


export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        username: '',
    })
    const [signActive, setSignActive] = useState(true);
    const actionData = useActionData<typeof action>()
    const firstLoad = useRef(true)
    const [errors, setErrors] = useState(actionData?.errors || {})
    const [formError, setFormError] = useState(actionData?.error || '')

    // Updates the form data when an input changes
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
        setFormData(form => ({ ...form, [field]: event.target.value }))
    }

    useEffect(() => {
        if (!firstLoad.current) {
          const newState = {
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            username: '',
          }
          setErrors(newState)
          setFormError('')
          setFormData(newState)
        }
    }, [actionData])
    
    useEffect(() => {
        if (!firstLoad.current) {
            setFormError('')
        }
    }, [formData])
    
    useEffect(() => { errors ? firstLoad.current = true : firstLoad.current = false }, [actionData])

    useEffect(() => {
        // console.log('action data', actionData);
        // console.log('first load', firstLoad);
    }, [firstLoad])

  return (
    <Layout backgroundColor="bg-neutral-900">
      <div className="h-full justify-center items-center flex flex-col gap-y-4">
        <h2 className="text-5xl font-extrabold text-yellow-300">Welcome to portal.ask!</h2>
        {signActive ? <p className="font-semibold text-slate-300">Log In To Give Some Praise!</p> : <p className="font-semibold text-slate-300">Sign Up To Give Some Praise!</p>}

        <div className="border-red-700 flex justify-between text-black font-extrabold">
            <div className='shadow-red-500 shadow-sm border-red-500 border-2 rounded bg-red-500 hover:cursor-pointer p-1 m-1' onClick={() => setSignActive(!signActive)}>{!signActive ? 'Sign In' : 'Sign Up'}</div>
            {/* <div className='shadow-yellow-300 shadow-sm border-yellow-300 border-2 rounded bg-yellow-300 hover:cursor-pointer p-1 m-1 display' onClick={() => setSignActive(false)}>Sign Up</div> */}
        </div>
        {
            signActive ? 
            <Form method="POST" className="rounded-2xl bg-gray-200 p-6 w-96 text-base">
                <div className="text-xs font-semibold text-center tracking-wide text-red-500 w-full">{formError}</div>
                <FormField
                    textarea={false}
                    htmlFor="email"
                    label="Email"
                    value={formData.email}
                    onChange={e => handleInputChange(e, 'email')}
                    error={errors?.email}
                />
                <FormField
                    textarea={false}
                    htmlFor="password"
                    type="password"
                    label="Password"
                    value={formData.password}
                    onChange={e => handleInputChange(e, 'password')}
                    error={errors?.password}
                />
                <button className="w-full text-center rounded-xl mt-2 bg-yellow-300 px-3 py-2 text-blue-600 font-semibold hover:bg-yellow-400 hover:cursor-pointer" name='_action' value='login'>Login</button>
            </Form> : 
            <Form method="POST" className="rounded-2xl bg-gray-200 p-6 w-96">
                <div className="text-xs font-semibold text-center tracking-wide text-red-500 w-full">{formError}</div>
                <FormField
                    textarea={false}
                    htmlFor="email"
                    label="Email"
                    value={formData.email}
                    onChange={e => handleInputChange(e, 'email')}
                    error={errors?.email}
                />
                <FormField
                    textarea={false}
                    htmlFor="password"
                    type="password"
                    label="Password"
                    value={formData.password}
                    onChange={e => handleInputChange(e, 'password')}
                    error={errors?.password}
                />
                <FormField
                    textarea={false}
                    htmlFor="firstName"
                    label="First Name"
                    value={formData.firstName}
                    onChange={e => handleInputChange(e, 'firstName')}
                    error={errors?.firstName}
                />
                <FormField
                    textarea={false}
                    htmlFor="lastName"
                    label="Last Name"
                    value={formData.lastName}
                    onChange={e => handleInputChange(e, 'lastName')}
                    error={errors?.lastName}
                />
                <FormField
                    textarea={false}
                    htmlFor="username"
                    label="Username"
                    value={formData.username}
                    onChange={e => handleInputChange(e, 'username')}
                    error={errors?.username}
                />
                <button className="w-full text-center rounded-xl mt-2 bg-red-300 px-3 py-2 text-blue-600 font-semibold hover:bg-red-400 hover:cursor-pointer" name='_action' value='register'>Register</button>
            </Form>
        }
        
      </div>
    </Layout>
  )
}

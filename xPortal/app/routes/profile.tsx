// app/routes/profile.tsx
import { useEffect } from 'react'
import { Form, useLoaderData, Link  } from "@remix-run/react"
import { LoaderFunction, ActionFunction } from '@remix-run/node'
import { logout, getUser } from '~/utils/auth.server'
import { Nav } from '../components/nav'

export const loader: LoaderFunction = async ({ request }) => {
  return await getUser(request);
}

export const action: ActionFunction = async ({ request }) => {
    const form = await request.formData()
    const action = form.get('_action')

    switch (action) {
        case 'logout': {
            return await logout(request);
        }
        default:
            return { error: `Invalid Form Data`, form: action }
    }
}

export default function Profile() {
    const userData = useLoaderData<typeof loader>();
    
    useEffect(() => {
        console.log('user data', userData);
    }, [userData])

  return (
    <div className="h-screen w-full bg-neutral-900 flex flex-row">
      <Nav />
      <div className='flex flex-row flex-wrap w-full h-full pt-32 pl-20 overflow-y-scroll' style={{'msOverflowStyle': 'none', 'scrollbarWidth': 'none'}}>
        <Link to={`/${userData.username}/posts`} className='w-1/4 h-1/3 bg-slate-100 bg-opacity-50 m-10 rounded p-3 border-green-500 border shadow-custom-green flex justify-center items-center hover:cursor-pointer hover:-translate-y-2 duration-100' >
          <div>
            <h1 className='font-bold text-amber-900 drop-shadow-custom'>Posts</h1>
          </div>
        </Link>
        <div className='w-1/4 h-1/3 bg-slate-100 bg-opacity-50 m-10 rounded p-3 border-green-500 border shadow-custom-green flex justify-center items-center hover:cursor-pointer hover:-translate-y-2 duration-100'>
          <h1 className='font-bold text-amber-900 drop-shadow-custom'>Reputation</h1>
        </div>
        <div className='w-1/4 h-1/3 bg-slate-100 bg-opacity-50 m-10 rounded p-3 border-green-500 border shadow-custom-green flex justify-center items-center hover:cursor-pointer hover:-translate-y-2 duration-100'>
          <h1 className='font-bold text-amber-900 drop-shadow-custom'>Responses</h1>
        </div>
        <div className='w-1/4 h-1/3 bg-slate-100 bg-opacity-50 m-10 rounded p-3 border-green-500 border shadow-custom-green flex justify-center items-center hover:cursor-pointer hover:-translate-y-2 duration-100'>

        </div>
        <div className='w-1/4 h-1/3 bg-slate-100 bg-opacity-50 m-10 rounded p-3 border-green-500 border shadow-custom-green flex justify-center items-center hover:cursor-pointer hover:-translate-y-2 duration-100'>
        
        </div>
        <div className='w-1/4 h-1/3 bg-slate-100 bg-opacity-50 m-10 rounded p-3 border-green-500 border shadow-custom-green flex justify-center items-center hover:cursor-pointer hover:-translate-y-2 duration-100'>
        
        </div>
        <div className='w-1/4 h-1/3 bg-slate-100 bg-opacity-50 m-10 rounded p-3 border-green-500 border shadow-custom-green flex justify-center items-center hover:cursor-pointer hover:-translate-y-2 duration-100'>
        
        </div>
        <div className='w-1/4 h-1/3 bg-slate-100 bg-opacity-50 m-10 rounded p-3 border-green-500 border shadow-custom-green flex justify-center items-center hover:cursor-pointer hover:-translate-y-2 duration-100'>
        
        </div>
        <div className='w-1/4 h-1/3 bg-slate-100 bg-opacity-50 m-10 rounded p-3 border-green-500 border shadow-custom-green flex justify-center items-center hover:cursor-pointer hover:-translate-y-2 duration-100'>
        
        </div>
        <div className='w-1/4 h-1/3 bg-slate-100 bg-opacity-50 m-10 rounded p-3 border-green-500 border shadow-custom-green flex justify-center items-center hover:cursor-pointer hover:-translate-y-2 duration-100'>
        
        </div>
      </div>
      <Form method="post" className='h-fit ml-auto justify-self-end m-10 rounded bg-amber-950 bg-opacity-50 p-3 border-violet-700 border shadow-custom hover:cursor-pointer'>
        <button className='' value={'logout'} name='_action'>Logout</button>
      </Form>
    </div>
  )
}

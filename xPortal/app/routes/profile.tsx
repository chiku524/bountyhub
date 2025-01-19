// app/routes/profile.tsx
import { Layout } from '~/components/layout'
import { Form, useLoaderData  } from "@remix-run/react"
import { LoaderFunction, ActionFunction } from '@remix-run/node'
import { logout, getUser } from '~/utils/auth.server'
import { useEffect } from 'react'

export const loader: LoaderFunction = async ({ request }) => {
  return await getUser(request);
}

export const action: ActionFunction = async ({ request }) => {
   return await logout(request);
}

export default function Profile() {
    const userData = useLoaderData<typeof loader>();
    
    useEffect(() => {
        console.log('user data', userData);
    }, [userData])

  return (
    <Layout>
      <div className="h-full flex flex-row gap-y-4">
        <div className='bg-slate-900 fixed left-0 h-full w-52 flex flex-col items-center'>
            <div className='my-10 hover:cursor-pointer'>Logo</div>
            <div className='w-full py-5 flex justify-center items-center mt-36 hover:cursor-pointer hover:bg-indigo-900 hover:bg-opacity-50'><span>Dashboard</span></div>
            <hr className='border-b border-gray-500 w-4/6'/>
            <div className='w-full py-5 flex justify-center items-center hover:cursor-pointer hover:bg-indigo-900 hover:bg-opacity-50'><span>Dashboard</span></div>
            <hr className='border-b border-gray-500 w-4/6'/>
            <div className='w-full py-5 flex justify-center items-center hover:cursor-pointer hover:bg-indigo-900 hover:bg-opacity-50'><span>Dashboard</span></div>
            <hr className='border-b border-gray-500 w-4/6'/>
            <div className='w-full py-5 flex justify-center items-center hover:cursor-pointer hover:bg-indigo-900 hover:bg-opacity-50'><span>Dashboard</span></div>
            <hr className='border-b border-gray-500 w-4/6'/>
            <div className='w-full py-5 flex justify-center items-center hover:cursor-pointer hover:bg-indigo-900 hover:bg-opacity-50'><span>Dashboard</span></div>
        </div>
        <div className='w-full bg-neutral-900'></div>
        <Form method="post" className='h-fit justify-start m-10 rounded bg-indigo-950 p-3 border-violet-700 border shadow-custom hover:cursor-pointer'>
            <button className='' value={'logout'}>Logout</button>
        </Form>
      </div>
    </Layout>
  )
}

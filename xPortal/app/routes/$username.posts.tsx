// app/routes/profile.tsx
import { useEffect, useState } from 'react'
import { Form, useLoaderData, Link  } from "@remix-run/react"
import { FormField } from '~/components/form-field'
import { LoaderFunction, ActionFunction } from '@remix-run/node'
import { logout, getUser } from '~/utils/auth.server'
import { getUserPosts, createPost } from '~/utils/user.server'
import { Nav } from '../components/nav'

export const loader: LoaderFunction = async ({ params }) => {
  const username = params.username;
  if (!username) {
    throw new Response("Username is required", { status: 400 });
  }
  
  return await getUserPosts(username);
}

export const action: ActionFunction = async ({ request }) => {
    const form = await request.formData()
    const action = form.get('_action')

    switch (action) {
        case 'createPost': {
          const title = form.get('title');
          const content = form.get('content');
          
          if (!title || !content || typeof title !== 'string' || typeof content !== 'string') {
              throw new Response('Title and content are required', { status: 400 });
          }

          const user = await getUser(request);
          if (!user) {
              throw new Response('Not authenticated', { status: 401 });
          }
          if (!user.username) {
            throw new Response('User profile is incomplete', { status: 400 });
          }
          
          return await createPost({title, content, author: user.username});
        }
        default:
            return { error: `Invalid Form Data`, form: action }
    }
}

export default function UserPosts() {
  const userData = useLoaderData<typeof loader>();
  const [formData, setFormData] = useState({ title: '', content: '' })

  useEffect(() => {
      // console.log('user data', userData);
  }, [userData])

  
  // Updates the form data when an input changes
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setFormData(form => ({ ...form, [field]: event.target.value }))
  }

  return (
    <div className="h-screen w-full bg-neutral-900 flex flex-row">
      <Nav />
      <div className='h-full w-full flex flex-col'>
        <div className="flex flex-col bg-slate-700 bg-opacity-50 h-fit p-5 rounded border border-amber-950 m-auto shadow-custom-slate">
          <Form method="post" className=''>
            <FormField
                textarea={false}
                htmlFor="title"
                label="Title"
                value={formData.title}
                onChange={e => handleInputChange(e, 'title')}
                // error={errors?.email}
            />
            <FormField
                textarea
                htmlFor="content"
                label="Content"
                value={formData.content}
                onChange={e => handleInputChange(e, 'content')}
                // error={errors?.password}
            />
            <button className="w-full text-center rounded-xl mt-2 bg-yellow-300 px-3 py-2 text-blue-600 font-semibold hover:bg-yellow-400 hover:cursor-pointer" name='_action' value='createPost'>Create</button>
          </Form>
        </div>
        <div className='flex flex-row flex-wrap bg-slate-700 bg-opacity-50 h-fit p-5 rounded border border-amber-950 m-auto shadow-custom-slate mx-10'>
          {userData.map((post:any) => (
            <div key={post.id} className='flex flex-col bg-slate-700 bg-opacity-50 w-1/4 overflow-hidden h-fit p-5 rounded border border-green-700 m-auto shadow-custom-slate'>
              <h1>{post.title}</h1>
              <p>{post.content}</p>
              </div>
          ))}
        </div>
      </div>
      
    </div>
  )
}

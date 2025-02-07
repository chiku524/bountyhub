// app/routes/profile.tsx
import { Layout } from '~/components/layout'
import { FormField } from '~/components/form-field'
import { Form, useLoaderData, Link  } from "@remix-run/react"
import { LoaderFunction, ActionFunction } from '@remix-run/node'
import { logout, getUser } from '~/utils/auth.server'
import { editUser } from '~/utils/user.server'
import { useEffect, useState } from 'react'
import { Nav } from '../components/nav'

interface FormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
  profession: string;
  bio: string;
  website: string;
  linkedin: string;
  github: string;
  twitter: string;
  instagram: string;
  facebook: string;
    // ... other social fields
}

export const loader: LoaderFunction = async ({ request }) => {
  return await getUser(request);
}

export const action: ActionFunction = async ({ request }) => {
    const form = await request.formData()
    const action = form.get('_action')
    const actionData = {
      email: form.get('email'),
      profile: {
        firstName: form.get('firstName'),
        lastName: form.get('lastName'),
        avatar: form.get('avatar'),
        website: form.get('website'),
        username: form.get('username'),
        profession: form.get('profession'),
        bio: form.get('bio'),
        socials: {
          facebook: form.get('facebook'),
          twitter: form.get('twitter'),
          instagram: form.get('instagram'),
          linkedin: form.get('linkedin'),
          github: form.get('github')
        }
      }
    }

    switch (action) {
        case 'logout': {
            return await logout(request);
        }
        case 'update': {

          const updateData = {
            email: actionData.email?.toString() || undefined,
            profile: { 
              firstName: actionData.profile.firstName?.toString() || undefined,
              lastName: actionData.profile.lastName?.toString() || undefined,
              avatar: actionData.profile.avatar?.toString() || undefined,
              website: actionData.profile.website?.toString() || undefined,
              username: actionData.profile.username?.toString() || undefined,
              profession: actionData.profile.profession?.toString() || undefined,
              bio: actionData.profile.bio?.toString() || undefined,
              socials: { 
                facebook: actionData.profile.socials.facebook?.toString() || undefined,
                twitter: actionData.profile.socials.twitter?.toString() || undefined,
                instagram: actionData.profile.socials.instagram?.toString() || undefined,
                linkedin: actionData.profile.socials.linkedin?.toString() || undefined,
                github: actionData.profile.socials.github?.toString() || undefined,
              }
            }
          }

          console.log('action data', actionData);
          // Check if any value in the object is truthy
          return await editUser(updateData, request)
        }
        default:
            return { error: `Invalid Form Data`, form: action }
    }
}

export default function Profile() {
    const userData = useLoaderData<typeof loader>();
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '', firstName: '', lastName: '', profession: '', username: '', bio: '', website: '', linkedin: '', github: '', twitter: '', instagram: '', facebook: ''})
    const [editData, setEditData] = useState<any>('');
    const [socialsClicked, setSocialsClicked] = useState(false);

    // Updates the form data when an input changes
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
      setFormData(form => ({ ...form, [field]: event.target.value }))
      console.log(editData);
    }
    
    // useEffect(() => {
    //     console.log('user data', userData);
    // }, [userData])

    useEffect(() => {
      const handleModalClick = (e: MouseEvent) => {
        const clickbox = document.getElementById('edit-clickbox');
        if (e.target != clickbox) {
          // Clicked inside box

        } else {
          // Clicked outside box
          setEditModalOpen(false);
          setSocialsClicked(false);
        }
      };

      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          setEditModalOpen(false);
          setSocialsClicked(false);
        }
      })
      window.addEventListener('click', handleModalClick);
      return () => window.removeEventListener('click', handleModalClick);
    }, []);

  return (
    <div className="h-screen w-full bg-neutral-900 flex flex-row">
      <Nav />
      <div className='w-4/5 h-2/3 m-auto ml-14 flex flex-col bg-slate-300 text-slate-800 rounded overflow-y-scroll'>
        <span className='mx-auto mt-10 font-bold'>Profile</span>
        <hr className='border-b border-slate-700 w-full mt-3 self-center' />
        <div className='block mx-10 my-5 bg-gray-100 rounded shadow-custom-slate relative'>
          <div className='font-bold w-fit bg-gray-100 p-2 rounded border-b border-slate-700'>Name</div>
          <div className='bg-gray-100 rounded w-fit p-2'>{userData.profile.firstName}&nbsp;{userData.profile.lastName}</div>
          <span className='text-blue-500 absolute top-0 right-0 m-5' onClick={() => {setEditModalOpen(true); setEditData('firstName')}}>Edit</span>
        </div>
        <div className='block mx-10 my-5 bg-gray-100 rounded shadow-custom-slate relative'>
          <div className='font-bold w-fit bg-gray-100 p-2 rounded border-b border-slate-700'>Email</div>
          <div className='bg-gray-100 rounded w-fit p-2'>{userData.email}</div>
          <span className='text-blue-500 absolute top-0 right-0 m-5' onClick={() => {setEditModalOpen(true); setEditData('email')}}>Edit</span>
        </div>
        <div className='block mx-10 my-5 bg-gray-100 rounded shadow-custom-slate relative'>
          <div className='font-bold w-fit bg-gray-100 p-2 rounded border-b border-slate-700'>Profession</div>
          <div className='bg-gray-100 rounded w-fit p-2'>{userData.profile.profession ? userData.profile.profession : 'N/A'}</div>
          <span className='text-blue-500 absolute top-0 right-0 m-5' onClick={() => {setEditModalOpen(true); setEditData('profession')}}>Edit</span>
        </div>
        <div className='block mx-10 my-5 bg-gray-100 rounded shadow-custom-slate relative'>
          <div className='font-bold w-fit bg-gray-100 p-2 rounded border-b border-slate-700'>Bio</div>
          <div className='bg-gray-100 rounded w-fit p-2'>{userData.profile.bio ? userData.profile.bio : 'N/A'}</div>
          <span className='text-blue-500 absolute top-0 right-0 m-5' onClick={() => {setEditModalOpen(true); setEditData('bio')}}>Edit</span>
        </div>
        <div className='block mx-10 my-5 bg-gray-100 rounded shadow-custom-slate relative'>
          <div className='font-bold w-fit bg-gray-100 p-2 rounded border-b border-slate-700'>Username</div>
          <div className='bg-gray-100 rounded w-fit p-2'>{userData.profile.username ? userData.profile.username : 'N/A'}</div>
          <span className='text-blue-500 absolute top-0 right-0 m-5' onClick={() => {setEditModalOpen(true); setEditData('username')}}>Edit</span>
        </div>
        <div className='block mx-10 my-5 bg-gray-100 rounded shadow-custom-slate relative'>
          <div className='font-bold w-fit bg-gray-100 p-2 rounded border-b border-slate-700'>Website</div>
          <div className='bg-gray-100 rounded w-fit p-2'>{userData.profile.website ? userData.profile.website : 'N/A'}</div>
          <span className='text-blue-500 absolute top-0 right-0 m-5' onClick={() => {setEditModalOpen(true); setEditData('website')}}>Edit</span>
        </div>
        <div className='block mx-10 my-5 bg-gray-100 rounded shadow-custom-slate relative'>
          <div className='font-bold w-fit bg-gray-100 p-2 rounded border-b border-slate-700'>Socials</div>
          <div className='flex flex-row justify-around gap-5'>
            <div className='bg-gray-100 rounded w-fit p-2'>{userData.profile.socials.github ? userData.profile.socials.github : 'N/A'}</div>
            <div className='bg-gray-100 rounded w-fit p-2'>{userData.profile.socials.facebook ? userData.profile.socials.facebook : 'N/A'}</div>
            <div className='bg-gray-100 rounded w-fit p-2'>{userData.profile.socials.twitter ? userData.profile.socials.twitter : 'N/A'}</div>
            <div className='bg-gray-100 rounded w-fit p-2'>{userData.profile.socials.instagram ? userData.profile.socials.instagram : 'N/A'}</div>
            <div className='bg-gray-100 rounded w-fit p-2'>{userData.profile.socials.linkedin ? userData.profile.socials.linkedin : 'N/A'}</div>
          </div>
          <span className='text-blue-500 absolute top-0 right-0 m-5' onClick={() => {setEditModalOpen(true); setSocialsClicked(true); setEditData('socials')}}>Edit</span>
        </div>
      </div>
      <Form method="post" className='h-fit ml-auto justify-self-end m-10 rounded bg-amber-950 bg-opacity-50 p-3 border-violet-700 border shadow-custom hover:cursor-pointer'>
          <button className='' value={'logout'} name='_action'>Logout</button>
      </Form>
      {editModalOpen ? (
        <div className='bg-gray-950 bg-opacity-75 w-full h-full flex justify-center items-center absolute top-0 left-0' id='edit-clickbox'>
          {socialsClicked ? 
            <Form method="put" className='h-fit ml-auto m-10 rounded bg-amber-950 bg-opacity-50 p-3 border-violet-700 border shadow-custom hover:cursor-pointer'>
              <FormField 
                htmlFor='github'
                type='text'
                label='github'
                value={formData[editData as keyof FormData]}
                onChange={e => handleInputChange(e, editData['github'])}
                onClick={() => setEditData('socials.github')}
                textarea={false}
              />
              <FormField 
                htmlFor='facebook'
                type='text'
                label='facebook'
                value={formData[editData as keyof FormData]}
                onChange={e => handleInputChange(e, editData['facebook'])}
                onClick={() => setEditData('socials.facebook')}
                textarea={false}
              />
              <FormField 
                htmlFor='twitter'
                type='text'
                label='twitter'
                value={formData[editData as keyof FormData]}
                onChange={e => handleInputChange(e, editData['twitter'])}
                onClick={() => setEditData('socials.twitter')}
                textarea={false}
              />
              <FormField 
                htmlFor='instagram'
                type='text'
                label='instagram'
                value={formData[editData as keyof FormData]}
                onChange={e => handleInputChange(e, editData['instagram'])}
                onClick={() => setEditData('socials.instagram')}
                textarea={false}
              />
              <FormField 
                htmlFor='linkedin'
                type='text'
                label='linkedin'
                value={formData[editData as keyof FormData]}
                onChange={e => handleInputChange(e, editData['linkedin'])}
                onClick={() => setEditData('socials.linkedin')}
                textarea={false}
              />
              <button id='save-button' className='' value='update' name='_action'>Save Changes</button>
            </Form>
          : 
          <Form method="put" className='h-fit ml-auto m-10 rounded bg-amber-950 bg-opacity-50 p-3 border-violet-700 border shadow-custom hover:cursor-pointer'>
            <FormField
                htmlFor={editData}
                type='text'
                label={editData}
                value={formData[editData as keyof FormData]}
                onChange={e => handleInputChange(e, editData)}
                textarea={false}
            />
            <button id='save-button' className='' value='update' name='_action'>Save Changes</button>
          </Form>}
          
        </div>) 
      : null}
    </div>
  )
}

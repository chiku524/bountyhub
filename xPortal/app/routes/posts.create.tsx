// app/routes/profile.tsx
import { useEffect, useState, useRef } from 'react'
import { Form, useLoaderData, Link, useActionData  } from "@remix-run/react"
import { FormField } from '~/components/form-field'
import { LoaderFunction, ActionFunction } from '@remix-run/node'
import { getUser } from '~/utils/auth.server'
import { getUserPosts, createPost } from '~/utils/user.server'
import { Nav } from '../components/nav'
import { validateTitle, validateContent } from '~/utils/validators.server'


export const loader: LoaderFunction = async ({ request: Request }) => {
  
  return await null;
}

export const action: ActionFunction = async ({ request }) => {
    const form = await request.formData()
    const action = form.get('_action')
    console.log(form);

    switch (action) {
        case 'createPost': {
          const title = form.get('title');
          const content = form.get('content');
          const blobVideoURL = form.get('blobVideoURL') as string || null;

          const errors = {
            title: validateTitle((title as string) || ''),
            content: validateContent((content as string) || '')
          }
      
          if (Object.values(errors).some(Boolean))
            return { errors, fields: { title, content }, form: action }
          
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
          
          return await createPost({title, content, blobVideoURL, author: user.username});
        }
        default:
            return { error: `Invalid Form Data`, form: action }
    }
}

export default function Create() {
  const userData = useLoaderData<typeof loader>();
  const [formData, setFormData] = useState({ title: '', content: '', blobVideoURL: '' })

  useEffect(() => {
      console.log('user data', formData);
  }, [formData])

  
  // Updates the form data when an input changes
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setFormData(form => ({ ...form, [field]: event.target.value }))
  }


  const test = async () => {
    let stream;
    let chunks:any = [];
    
    try {
      await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }).then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();

        mediaRecorder.onstop = (e) => {
  
          const clipName = prompt("Enter a name for your video clip");
  
          const clipLabel = document.querySelector("#clip-label");
          const video = document.querySelector("#clip-video");
          const deleteButton = document.querySelector("#clip-delete-button");
          const mainContainer = document.querySelector("#clip-container");
          
          video?.setAttribute("controls", "");
          deleteButton!.textContent = "Delete";
          clipLabel!.textContent = clipName;
  
          const blob = new Blob(chunks, { type: "video" });
          chunks = [];
          const videoURL = URL.createObjectURL(blob);
          setFormData({...formData, blobVideoURL: videoURL});
          video?.setAttribute('src', videoURL);
          mainContainer?.classList.remove('hidden');

          deleteButton!.addEventListener('click', (e) => {
            mainContainer!.classList.add("hidden");
            video?.setAttribute('src', '');
            setFormData({...formData, blobVideoURL: ''});
          })
        };
  
        mediaRecorder.ondataavailable = (e) => {
          chunks.push(e.data);
        };
      });
    } catch (err) {
      console.error("Error accessing media devices.", err);
    }

    return stream;
  }

  return (
    <div className="h-screen w-full bg-neutral-900 flex flex-row">
        <Nav />
        <div className='flex flex-col justify-center items-center w-full h-full overflow-y-scroll' style={{'msOverflowStyle': 'none', 'scrollbarWidth': 'none'}}>
          <div className="flex flex-col bg-slate-700 bg-opacity-50 h-fit p-5 rounded border border-amber-950 m-auto shadow-custom-slate w-3/4">
              <Form method="post" className=''>
                  {/* <div className="text-xs font-semibold text-center tracking-wide text-red-500 w-full">{formError}</div> */}
                  <FormField
                      textarea={false}
                      htmlFor="title"
                      label="Title"
                      value={formData.title}
                      onChange={e => handleInputChange(e, 'title')}
                      // error={errors?.title}
                  />
                  {/* <div className="text-xs font-semibold text-center tracking-wide text-red-500 w-full">{formError}</div> */}
                  <FormField
                      textarea
                      htmlFor="content"
                      label="Content"
                      value={formData.content}
                      onChange={e => handleInputChange(e, 'content')}
                      // error={errors?.content}
                  />
                  <FormField
                      textarea={false}
                      htmlFor="blobVideoURL"
                      label="BlobVideoURL"
                      value={formData.blobVideoURL}
                      onChange={e => handleInputChange(e, 'blobVideoURL')}
                      // error={errors?.content}
                    />
                  <button className="w-full text-center rounded-xl mt-2 bg-yellow-300 px-3 py-2 text-blue-600 font-semibold hover:bg-yellow-400 hover:cursor-pointer" name='_action' value='createPost'>Create</button>
              </Form>
              <button onClick={() => test()}>Start Recording</button>
          </div>
          <div className="flex flex-col bg-slate-700 bg-opacity-50 h-fit p-5 rounded border border-amber-950 m-auto shadow-custom-slate">
             <h2 className='text-center font-bold text-yellow-300 tracking-widest underline'>Clips</h2>
            <article className='hidden' id='clip-container'>
              <p id='clip-label'>

              </p>
              <video id='clip-video' controls className='max-h-40 max-w-72'>
                
              </video>
              <button id='clip-delete-button'>

              </button>
            </article>
          </div>
        </div>
        
    </div>
  )
}

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

    switch (action) {
        case 'createPost': {
          const title = form.get('title');
          const content = form.get('content');

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
          
          return await createPost({title, content, author: user.username});
        }
        default:
            return { error: `Invalid Form Data`, form: action }
    }
}

export default function Create() {
  const userData = useLoaderData<typeof loader>();
  const [formData, setFormData] = useState({ title: '', content: '' })

  useEffect(() => {
      // console.log('user data', userData);
  }, [userData])

  
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
          console.log("data available after MediaRecorder.stop() called.");
  
          const clipName = prompt("Enter a name for your sound clip");
  
          const clipContainer = document.createElement("article");
          const clipLabel = document.createElement("p");
          const audio = document.createElement("audio");
          const deleteButton = document.createElement("button");
          const mainContainer = document.querySelector("body");
  
          clipContainer.classList.add("clip");
          audio.setAttribute("controls", "");
          deleteButton.textContent = "Delete";
          clipLabel.textContent = clipName;
  
          clipContainer.appendChild(audio);
          clipContainer.appendChild(clipLabel);
          clipContainer.appendChild(deleteButton);
          mainContainer?.appendChild(clipContainer);
  
          audio.controls = true;
          const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
          chunks = [];
          const audioURL = URL.createObjectURL(blob);
          audio.src = audioURL;
          console.log("recorder stopped");
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

  const stopRecording = async () => {}

  return (
    <div className="h-screen w-full bg-neutral-900 flex flex-row">
        <Nav />
        <div className="flex flex-col bg-slate-700 bg-opacity-50 h-fit p-5 rounded border border-amber-950 m-auto shadow-custom-slate">
            <Form method="post" className=''>
                {/* <button onClick={stopRecording}>Stop Recording</button> */}
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
                <button className="w-full text-center rounded-xl mt-2 bg-yellow-300 px-3 py-2 text-blue-600 font-semibold hover:bg-yellow-400 hover:cursor-pointer" name='_action' value='createPost'>Create</button>
            </Form>
            <button onClick={() => test()}>Start Recording</button>
        </div>
      
    </div>
  )
}

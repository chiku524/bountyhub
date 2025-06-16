// app/routes/profile.tsx
import { useEffect, useState } from 'react'
import { Form, useLoaderData, Link, useActionData, redirect, useNavigate } from "@remix-run/react"
import { LoaderFunction, ActionFunction, json } from '@remix-run/node'
import { getUser } from '~/utils/auth.server'
import { prisma } from '~/utils/prisma.server'
import { Nav } from '~/components/nav'
import { validateTitle, validateContent } from '~/utils/validators.server'
import type { VideoFile } from '~/types/video'
import type { CodeBlockForm } from '~/utils/types.server'
import VideoUpload from '~/components/VideoUpload'
import { addReputationPoints, REPUTATION_POINTS } from '~/utils/reputation.server'

interface LoaderData {
  user: {
    id: string;
    username: string;
  } | null;
}

interface ActionData {
  errors?: {
    title?: string;
    content?: string;
  };
  fields?: {
    title?: string;
    content?: string;
  };
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  return json<LoaderData>({ user });
}

export const action: ActionFunction = async ({ request }) => {
  const user = await getUser(request);
  if (!user) {
    return redirect('/login');
  }

  const formData = await request.formData();
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const videoFilename = formData.get('videoFilename') as string;
  const codeBlocks = JSON.parse(formData.get('codeBlocks') as string) as CodeBlockForm[];

  const errors: ActionData['errors'] = {};
  const titleError = validateTitle(title);
  const contentError = validateContent(content);

  if (titleError) errors.title = titleError;
  if (contentError) errors.content = contentError;

  if (Object.keys(errors).length > 0) {
    return json<ActionData>({ errors, fields: { title, content } });
  }

  try {
    const post = await prisma.posts.create({
      data: {
        title,
        content,
        authorId: user.id,
        blobVideoURL: videoFilename || null,
        codeBlocks: {
          create: codeBlocks
        }
      },
    });

    // Award reputation points for creating a post
    await addReputationPoints(
      user.id,
      REPUTATION_POINTS.POST_CREATED,
      'POST_CREATED',
      post.id
    );

    return redirect(`/${user.username}/posts`);
  } catch (error) {
    console.error('Error creating post:', error);
    return json<ActionData>({
      errors: { title: 'Failed to create post' },
      fields: { title, content },
    });
  }
}

export default function CreatePost() {
  const { user } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const [videoFile, setVideoFile] = useState<VideoFile | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [codeBlocks, setCodeBlocks] = useState<CodeBlockForm[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const addCodeBlock = () => {
    setCodeBlocks([...codeBlocks, { language: 'javascript', code: '' }]);
  };

  const updateCodeBlock = (index: number, field: keyof CodeBlockForm, value: string) => {
    const newBlocks = [...codeBlocks];
    newBlocks[index] = { ...newBlocks[index], [field]: value };
    setCodeBlocks(newBlocks);
  };

  const removeCodeBlock = (index: number) => {
    setCodeBlocks(codeBlocks.filter((_, i) => i !== index));
  };

  if (!user) {
    return (
      <div className="h-screen w-full bg-neutral-900 flex flex-row">
        <Nav />
        <div className='flex flex-col justify-center items-center w-full h-full'>
          <h1 className="text-white text-2xl">Please log in to create a post</h1>
          <Link to="/login" className="mt-4 text-indigo-400 hover:text-indigo-300">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-neutral-900 flex flex-row">
      <Nav />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-6">Create New Post</h1>
          
          <Form method="post" className="space-y-6 p-8 rounded-lg border-2 border-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.3)] bg-neutral-800/50 backdrop-blur-sm">
            <input type="hidden" name="videoFilename" value={videoFile?.filename || ''} />
            <input type="hidden" name="codeBlocks" value={JSON.stringify(codeBlocks)} />
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Title
              </label>
              <input
                type="text"
                name="title"
                defaultValue={actionData?.fields?.title}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                required
              />
              {actionData?.errors?.title && (
                <p className="text-red-500 text-sm">{actionData.errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Content
              </label>
              <textarea
                name="content"
                defaultValue={actionData?.fields?.content}
                rows={4}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                required
              />
              {actionData?.errors?.content && (
                <p className="text-red-500 text-sm">{actionData.errors.content}</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-300">
                  Code Blocks
                </label>
                <button
                  type="button"
                  onClick={addCodeBlock}
                  className="px-3 py-1 bg-violet-600 text-white rounded-md hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  Add Code Block
                </button>
              </div>
              
              {codeBlocks.map((block, index) => (
                <div key={index} className="space-y-2 p-4 bg-neutral-800/50 rounded-lg border border-neutral-700">
                  <div className="flex justify-between items-center">
                    <select
                      value={block.language}
                      onChange={(e) => updateCodeBlock(index, 'language', e.target.value)}
                      className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                      <option value="csharp">C#</option>
                      <option value="php">PHP</option>
                      <option value="ruby">Ruby</option>
                      <option value="go">Go</option>
                      <option value="rust">Rust</option>
                      <option value="swift">Swift</option>
                      <option value="kotlin">Kotlin</option>
                      <option value="scala">Scala</option>
                      <option value="r">R</option>
                      <option value="matlab">MATLAB</option>
                      <option value="sql">SQL</option>
                      <option value="html">HTML</option>
                      <option value="css">CSS</option>
                      <option value="bash">Bash</option>
                      <option value="powershell">PowerShell</option>
                      <option value="plaintext">Plain Text</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeCodeBlock(index)}
                      className="text-red-500 hover:text-red-600 focus:outline-none"
                    >
                      Remove
                    </button>
                  </div>
                  <textarea
                    value={block.code}
                    onChange={(e) => updateCodeBlock(index, 'code', e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    placeholder="Enter your code here..."
                  />
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Video Upload
              </label>
              <div className="mt-1">
                {isClient ? (
                  <VideoUpload
                    onUploadComplete={(file: VideoFile) => {
                      setVideoFile(file);
                    }}
                    onError={(errorMessage: string) => {
                      console.error('Video upload error:', errorMessage);
                    }}
                  />
                ) : (
                  <div className="w-full max-w-xl mx-auto">
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <p className="mt-2 text-sm text-gray-600">Loading video upload...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {videoFile && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-300 mb-2">Video Preview</h3>
                <div className="relative aspect-video w-full max-w-2xl mx-auto bg-neutral-800 rounded-lg overflow-hidden border border-violet-500/30">
                  <video
                    src={`/api/upload/video?filename=${encodeURIComponent(videoFile.filename)}`}
                    controls
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      console.error('Error loading video preview:', e);
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Create Post
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

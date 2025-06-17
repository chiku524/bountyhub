// app/routes/profile.tsx
import { useEffect, useState } from 'react'
import { Form, useLoaderData, Link, useActionData, redirect, useNavigate } from "@remix-run/react"
import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node'
import { requireUserId } from '~/utils/auth.server'
import { prisma } from '~/utils/prisma.server'
import { Nav } from '~/components/nav'
import { validateTitle, validateContent } from '~/utils/validators.server'
import type { CodeBlockForm } from '~/utils/types.server'
import { addReputationPoints, REPUTATION_POINTS } from '~/utils/reputation.server'
import CodeBlockEditor from '~/components/CodeBlockEditor'
import { MediaUpload } from '~/components/MediaUpload'
import { uploadToCloudinary } from '~/utils/cloudinary.server'

interface LoaderData {
  user: {
    id: string;
    username: string;
  } | null;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return json<LoaderData>({ user });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const codeBlocks = JSON.parse(formData.get("codeBlocks") as string || "[]");
  const mediaData = JSON.parse(formData.get("media") as string || "[]");

  const titleError = validateTitle(title);
  if (titleError) {
    return json({ error: titleError });
  }

  const contentError = validateContent(content);
  if (contentError) {
    return json({ error: contentError });
  }

  try {
    // Upload media to Cloudinary
    const media = await Promise.all(
      mediaData.map(async (item: { type: string; base64Data: string; thumbnailBase64Data?: string; isScreenRecording: boolean }) => {
        const resourceType = item.type === 'VIDEO' ? 'video' : 'image';
        
        // Upload main media
        const uploadResult = await uploadToCloudinary(item.base64Data, {
          resourceType,
          folder: 'portal/posts',
        });

        // Upload thumbnail if it exists
        let thumbnailUrl;
        if (item.thumbnailBase64Data) {
          const thumbnailResult = await uploadToCloudinary(item.thumbnailBase64Data, {
            resourceType: 'image',
            folder: 'portal/posts/thumbnails',
          });
          thumbnailUrl = thumbnailResult.secure_url;
        }

        return {
          type: item.type,
          url: uploadResult.secure_url,
          thumbnailUrl,
          isScreenRecording: item.isScreenRecording,
          cloudinaryId: uploadResult.public_id
        };
      })
    );

    // Create the post with media
    const post = await prisma.posts.create({
      data: {
        title,
        content,
        authorId: userId,
        codeBlocks: {
          create: codeBlocks.map((block: { language: string; code: string; description: string }) => ({
            language: block.language,
            code: block.code
          }))
        },
        media: {
          create: media.map(item => ({
            type: item.type,
            url: item.url,
            thumbnailUrl: item.thumbnailUrl,
            isScreenRecording: item.isScreenRecording,
            cloudinaryId: item.cloudinaryId
          }))
        }
      }
    });

    // Add reputation points for creating a post
    await addReputationPoints(userId, REPUTATION_POINTS.CREATE_POST);

    return json({ id: post.id });
  } catch (error) {
    console.error('Error creating post:', error);
    return json({ error: 'Failed to create post. Please try again.' });
  }
};

export default function CreatePost() {
  const { user } = useLoaderData<LoaderData>();
  const actionData = useActionData<{ error?: string }>();
  const navigate = useNavigate();
  const [codeBlocks, setCodeBlocks] = useState<CodeBlockForm[]>([]);
  const [media, setMedia] = useState<Array<{ type: string; url: string; thumbnailUrl?: string; isScreenRecording: boolean }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMediaUpload = (newMedia: { type: string; url: string; thumbnailUrl?: string; isScreenRecording: boolean }) => {
    setMedia(prev => [...prev, newMedia]);
  };

  const handleMediaRemove = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      // Convert blob URLs to base64
      const mediaWithBase64 = await Promise.all(
        media.map(async (item) => {
          const base64Data = await blobUrlToBase64(item.url);
          const thumbnailBase64Data = item.thumbnailUrl ? await blobUrlToBase64(item.thumbnailUrl) : undefined;
          return {
            type: item.type,
            base64Data,
            thumbnailBase64Data,
            isScreenRecording: item.isScreenRecording
          };
        })
      );

      const formData = new FormData();
      formData.append('title', (document.getElementById('title') as HTMLInputElement).value);
      formData.append('content', (document.getElementById('content') as HTMLTextAreaElement).value);
      formData.append('codeBlocks', JSON.stringify(codeBlocks));
      formData.append('media', JSON.stringify(mediaWithBase64));

      const response = await fetch('/posts/create', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Server response:', text);
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (data.id) {
        navigate(`/posts/${data.id}`);
      } else {
        throw new Error('No post ID returned from server');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      // Show error to user
      const errorMessage = error instanceof Error ? error.message : 'Failed to create post';
      // You might want to set this in state to display to the user
      console.error('Error details:', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to convert blob URL to base64
  const blobUrlToBase64 = async (blobUrl: string): Promise<string> => {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        resolve(base64data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  return (
    <div className="h-screen w-full bg-neutral-900 flex flex-row">
      <Nav />
      <div className="flex-1 overflow-y-auto">
        <div className="w-auto max-w-4xl mx-auto mt-4 px-4 ml-24 pb-16">
          <div className="mb-6 flex justify-between items-center mt-16">
            <h1 className="text-2xl font-bold text-white">Create New Post</h1>
          </div>

          <Form method="post" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-violet-300 mb-2">
                Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                required
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-violet-300 mb-2">
                Content
              </label>
              <textarea
                name="content"
                id="content"
                rows={6}
                className="w-full px-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:ring-violet-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-violet-300 mb-2">
                Media
              </label>
              <MediaUpload
                onMediaUpload={handleMediaUpload}
                onMediaRemove={handleMediaRemove}
                uploadedMedia={media}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-violet-300 mb-2">
                Code Blocks
              </label>
              <CodeBlockEditor
                codeBlocks={codeBlocks}
                onCodeBlocksChange={setCodeBlocks}
              />
            </div>

            {actionData?.error && (
              <div className="text-red-500 text-sm">{actionData.error}</div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 border border-violet-500/30 text-violet-300 rounded-lg hover:bg-violet-500/10 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Post'}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

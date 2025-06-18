// app/routes/profile.tsx
import { useEffect, useState, useRef } from 'react'
import { Form, useLoaderData, Link, useActionData, redirect, useNavigate, useSubmit } from "@remix-run/react"
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
import { VirtualWalletService } from '~/utils/virtual-wallet.server'
import portalTokenInfo from '../../portal-token-info'

const TOKEN_SYMBOL = portalTokenInfo.config.symbol

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
  const hasBounty = formData.get("hasBounty") === "on";
  const bountyAmount = formData.get("bountyAmount") as string;
  const bountyDuration = formData.get("bountyDuration") as string;

  const titleError = validateTitle(title);
  if (titleError) {
    return json({ error: titleError });
  }

  const contentError = validateContent(content);
  if (contentError) {
    return json({ error: contentError });
  }

  // Check if user has sufficient balance for bounty
  if (hasBounty && bountyAmount) {
    const amount = parseFloat(bountyAmount);
    const wallet = await VirtualWalletService.getOrCreateWallet(userId);
    
    if (wallet.balance < amount) {
      return json({ 
        error: `Insufficient balance. You have ${wallet.balance.toFixed(4)} ${TOKEN_SYMBOL} but need ${amount.toFixed(4)} ${TOKEN_SYMBOL} for this bounty. Please deposit more ${TOKEN_SYMBOL} to your wallet.` 
      });
    }
  }

  try {
    // First create the post without media
    const post = await prisma.posts.create({
      data: {
        title,
        content,
        authorId: userId,
        hasBounty: hasBounty,
        codeBlocks: {
          create: codeBlocks.map((block: { language: string; code: string; description: string }) => ({
            language: block.language,
            code: block.code
          }))
        }
      }
    });

    // If there's a bounty, create it and deduct from virtual wallet
    if (hasBounty && bountyAmount && bountyDuration) {
      const amount = parseFloat(bountyAmount);
      
      const bounty = await prisma.bounty.create({
        data: {
          postId: post.id,
          amount: amount,
          expiresAt: new Date(Date.now() + (parseInt(bountyDuration) * 24 * 60 * 60 * 1000)),
          status: 'ACTIVE'
        },
      });

      // Deduct from virtual wallet
      await VirtualWalletService.createBounty(userId, amount, bounty.id);
    }

    // If post creation is successful, upload media to Cloudinary
    if (mediaData.length > 0) {
      try {
        const media = await Promise.all(
          mediaData.map(async (item: { type: string; base64Data: string; thumbnailBase64Data?: string; isScreenRecording: boolean }) => {
            const resourceType = item.type === 'VIDEO' ? 'video' : 'image';
            
            // Upload main media
            const uploadResult = await uploadToCloudinary(item.base64Data, {
              resourceType,
              folder: 'portal/posts',
            });

            // Upload thumbnail if it exists
            let thumbnailUrl: string | undefined;
            if (item.thumbnailBase64Data) {
              const thumbnailResult = await uploadToCloudinary(item.thumbnailBase64Data, {
                resourceType: 'image',
                folder: 'portal/posts/thumbnails',
              });
              thumbnailUrl = thumbnailResult.secure_url;
            }

            // Create media entries in the database
            try {
              const mediaEntry = await prisma.media.create({
                data: {
                  type: item.type,
                  url: uploadResult.secure_url,
                  thumbnailUrl,
                  isScreenRecording: item.isScreenRecording,
                  cloudinaryId: uploadResult.public_id,
                  postId: post.id
                }
              });
              return mediaEntry;
            } catch (error) {
              console.error('Database error creating media entry:', error);
              throw new Error('Failed to create media entry');
            }
          })
        );
      } catch (error) {
        // If media upload fails, delete the post
        await prisma.posts.delete({
          where: { id: post.id }
        });
        console.error('Media upload error:', error);
        throw new Error('Failed to upload media. Please try again.');
      }
    }

    // Add reputation points for creating a post
    await addReputationPoints(userId, REPUTATION_POINTS.CREATE_POST);

    return redirect(`/posts/${post.id}`);
  } catch (error) {
    return json({ 
      error: error instanceof Error ? error.message : 'Failed to create post. Please try again.' 
    });
  }
};

export default function CreatePost() {
  const { user } = useLoaderData<LoaderData>();
  const actionData = useActionData<{ error?: string }>();
  const navigate = useNavigate();
  const submit = useSubmit();
  const [codeBlocks, setCodeBlocks] = useState<CodeBlockForm[]>([]);
  const [media, setMedia] = useState<Array<{ type: string; url: string; thumbnailUrl?: string; isScreenRecording: boolean }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasBounty, setHasBounty] = useState(false);
  const [bountyAmount, setBountyAmount] = useState('');
  const [bountyDuration, setBountyDuration] = useState(7);

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
      
      // Add bounty fields
      formData.append('hasBounty', hasBounty ? 'on' : 'off');
      if (hasBounty) {
        formData.append('bountyAmount', bountyAmount);
        formData.append('bountyDuration', bountyDuration.toString());
      }

      // Use Remix's submit function
      submit(formData, { method: 'post' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create post';
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
      <div className="flex-1 overflow-y-auto ml-20">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6 flex justify-between items-center mt-16">
            <h1 className="text-2xl font-bold text-white">Create New Post</h1>
          </div>

          <Form method="post" onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
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

            <div>
              <label className="block text-sm font-medium text-violet-300 mb-2">
                Bounty
              </label>
              <div className="space-y-4 bg-neutral-700/50 border border-violet-500/30 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hasBounty"
                    name="hasBounty"
                    checked={hasBounty}
                    onChange={(e) => setHasBounty(e.target.checked)}
                    className="rounded border-violet-500/30 bg-neutral-700/50 text-violet-300 focus:ring-violet-500"
                  />
                  <label htmlFor="hasBounty" className="text-violet-300">
                    Add Crypto Bounty
                  </label>
                </div>

                {hasBounty && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-violet-300 mb-1">
                        Bounty Amount
                      </label>
                      <input
                        type="number"
                        name="bountyAmount"
                        value={bountyAmount}
                        onChange={(e) => setBountyAmount(e.target.value)}
                        min="0"
                        step="0.01"
                        required
                        className="w-full rounded-lg border-violet-500/30 bg-neutral-700/50 text-violet-300 focus:ring-violet-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-violet-300 mb-1">
                        Bounty Duration (days)
                      </label>
                      <input
                        type="number"
                        name="bountyDuration"
                        value={bountyDuration}
                        onChange={(e) => setBountyDuration(Number(e.target.value))}
                        min="1"
                        max="30"
                        required
                        className="w-full rounded-lg border-violet-500/30 bg-neutral-700/50 text-violet-300 focus:ring-violet-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {actionData?.error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-2 rounded-lg">
                {actionData.error}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 disabled:opacity-50"
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

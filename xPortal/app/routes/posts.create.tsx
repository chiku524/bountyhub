// app/routes/profile.tsx
import { useEffect, useState, useRef } from 'react'
import { Form, useLoaderData, Link, useActionData, redirect, useNavigate, useSubmit, useRouteError } from "@remix-run/react"
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
import bountyBucksInfo from '../../bounty-bucks-info.json'

const TOKEN_SYMBOL = bountyBucksInfo.config.symbol

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
  try {
    const userId = await requireUserId(request);
    const formData = await request.formData();
    
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const codeBlocksData = formData.get("codeBlocks") as string;
    const mediaData = formData.get("media") as string;
    const hasBounty = formData.get("hasBounty") === "on";
    const bountyAmount = formData.get("bountyAmount") as string;
    const bountyDuration = formData.get("bountyDuration") as string;

    // Validate required fields
    if (!title || !content) {
      return json({ error: "Title and content are required" }, { status: 400 });
    }

    const titleError = validateTitle(title);
    if (titleError) {
      return json({ error: titleError }, { status: 400 });
    }

    const contentError = validateContent(content);
    if (contentError) {
      return json({ error: contentError }, { status: 400 });
    }

    // Parse code blocks and media with error handling
    let codeBlocks = [];
    let mediaDataArray = [];
    
    try {
      codeBlocks = JSON.parse(codeBlocksData || "[]");
    } catch (error) {
      console.error('Failed to parse code blocks:', error);
      return json({ error: "Invalid code blocks data" }, { status: 400 });
    }

    try {
      mediaDataArray = JSON.parse(mediaData || "[]");
    } catch (error) {
      console.error('Failed to parse media data:', error);
      return json({ error: "Invalid media data" }, { status: 400 });
    }

    // Check if user has sufficient balance for bounty
    if (hasBounty && bountyAmount) {
      const amount = parseFloat(bountyAmount);
      if (isNaN(amount) || amount <= 0) {
        return json({ error: "Invalid bounty amount" }, { status: 400 });
      }
      
      const wallet = await VirtualWalletService.getOrCreateWallet(userId);
      
      if (wallet.balance < amount) {
        return json({ 
          error: `Insufficient balance. You have ${wallet.balance.toFixed(4)} ${TOKEN_SYMBOL} but need ${amount.toFixed(4)} ${TOKEN_SYMBOL} for this bounty. Please deposit more ${TOKEN_SYMBOL} to your wallet.` 
        }, { status: 400 });
      }
    }

    // Create the post first
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

    // Create bounty if needed
    if (hasBounty && bountyAmount && bountyDuration) {
      const amount = parseFloat(bountyAmount);
      const duration = parseInt(bountyDuration);
      
      if (isNaN(duration) || duration < 1 || duration > 30) {
        // Delete the post if bounty creation fails
        await prisma.posts.delete({ where: { id: post.id } });
        return json({ error: "Invalid bounty duration (must be 1-30 days)" }, { status: 400 });
      }
      
      const bounty = await prisma.bounty.create({
        data: {
          postId: post.id,
          amount: amount,
          expiresAt: new Date(Date.now() + (duration * 24 * 60 * 60 * 1000)),
          status: 'ACTIVE'
        },
      });

      // Deduct from virtual wallet
      await VirtualWalletService.createBounty(userId, amount, bounty.id);
    }

    // Upload media if any
    if (mediaDataArray.length > 0) {
      try {
        await Promise.all(
          mediaDataArray.map(async (item: { type: string; url: string; thumbnailUrl?: string; isScreenRecording: boolean }) => {
            await prisma.media.create({
              data: {
                type: item.type,
                url: item.url,
                thumbnailUrl: item.thumbnailUrl,
                isScreenRecording: item.isScreenRecording,
                cloudinaryId: '',
                postId: post.id
              }
            });
          })
        );
      } catch (error) {
        // If media creation fails, delete the post and bounty
        console.error('Media creation error:', error);
        await prisma.posts.delete({ where: { id: post.id } });
        return json({ error: 'Failed to create media entries. Please try again.' }, { status: 500 });
      }
    }

    // Add reputation points for creating a post
    await addReputationPoints(userId, REPUTATION_POINTS.CREATE_POST);

    return redirect(`/posts/${post.id}`);
  } catch (error) {
    console.error('Post creation error:', error);
    return json({ 
      error: error instanceof Error ? error.message : 'Failed to create post. Please try again.' 
    }, { status: 500 });
  }
};

export default function CreatePost() {
  const { user } = useLoaderData<LoaderData>();
  const actionData = useActionData<typeof action>();
  const [codeBlocks, setCodeBlocks] = useState<CodeBlockForm[]>([]);
  const [media, setMedia] = useState<Array<{ type: string; url: string; thumbnailUrl?: string; isScreenRecording: boolean }>>([]);
  const [hasBounty, setHasBounty] = useState(false);
  const [bountyAmount, setBountyAmount] = useState('');
  const [bountyDuration, setBountyDuration] = useState(7);
  const [clientError, setClientError] = useState<string | null>(null);

  const handleMediaUpload = (newMedia: { type: string; url: string; thumbnailUrl?: string; isScreenRecording: boolean }) => {
    setMedia(prev => [...prev, newMedia]);
  };

  const handleMediaRemove = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="h-screen w-full bg-neutral-900 flex flex-row">
      <Nav />
      <div className="flex-1 overflow-y-auto ml-20">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6 flex justify-between items-center mt-16">
            <h1 className="text-2xl font-bold text-white">Create New Post</h1>
          </div>

          <Form method="post" className="space-y-6 max-w-4xl mx-auto">
            <input type="hidden" name="codeBlocks" value={JSON.stringify(codeBlocks)} />
            <input type="hidden" name="media" value={JSON.stringify(media)} />
            <input type="hidden" name="hasBounty" value={hasBounty ? 'on' : 'off'} />
            {hasBounty && (
              <>
                <input type="hidden" name="bountyAmount" value={bountyAmount} />
                <input type="hidden" name="bountyDuration" value={bountyDuration.toString()} />
              </>
            )}

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

            {(actionData?.error || clientError) && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-2 rounded-lg">
                {actionData?.error || clientError}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600"
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

export function ErrorBoundary() {
  const error = useRouteError();
  
  return (
    <div className="h-screen w-full bg-neutral-900 flex flex-row">
      <Nav />
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-slate-800 p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Post Creation Failed</h2>
          <p className="text-gray-300 mb-6 text-center">
            {error instanceof Error 
              ? error.message 
              : "An unexpected error occurred while creating your post. Please try again."}
          </p>
          <div className="flex justify-center space-x-4">
            <a
              href="/posts/create"
              className="bg-violet-500 hover:bg-violet-600 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Try Again
            </a>
            <a
              href="/"
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Return Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

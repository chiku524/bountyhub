// app/routes/profile.tsx
import { useEffect, useState, useRef } from 'react'
import { Form, useLoaderData, Link, useActionData, redirect, useNavigate, useSubmit, useRouteError, useNavigation, MetaFunction } from "@remix-run/react"
import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node'
import { requireUserId } from '~/utils/auth.server'
import { Layout } from '~/components/Layout'
import { validateTitle, validateContent } from '~/utils/validators.server'
import type { CodeBlockForm } from '~/utils/types.server'
import { addReputationPoints, REPUTATION_POINTS } from '~/utils/reputation.server'
import CodeBlockEditor from '~/components/CodeBlockEditor'
import { MediaUpload } from '~/components/MediaUpload'
import { uploadToCloudinary } from '~/utils/cloudinary.server'
import { getVirtualWallet, createVirtualWallet, createBounty } from "~/utils/virtual-wallet.server"
import { createDb } from "~/utils/db.server"
import { posts, bounties, tags, users } from "../../drizzle/schema"
import { eq, asc } from "drizzle-orm"
import { z } from "zod"
import TagSelector from '~/components/TagSelector'
import bountyBucksInfo from '../../bounty-bucks-info.json'
import { BountyForm } from '~/components/BountyForm'
import { FiGift, FiDollarSign, FiClock, FiInfo } from 'react-icons/fi'

const TOKEN_SYMBOL = bountyBucksInfo.config.symbol

interface Tag {
  id: string;
  name: string;
  description: string | null;
  color: string;
}

interface LoaderData {
  user: {
    id: string;
    username: string;
  } | null;
  availableTags: Tag[];
}

export const meta: MetaFunction = () => {
  return [
    { title: "Create Post - portal.ask" },
    { name: "description", content: "Create a new question or discussion post on portal.ask" },
  ];
};

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const db = createDb((context as any).env.DB);

  // Fetch user
  const userRows = await db.select({ id: users.id, username: users.username }).from(users).where(eq(users.id, userId)).limit(1);
  const user = userRows[0];
  if (!user) {
    throw new Error('User not found');
  }

  // Fetch available tags
  const availableTags = await db.select({
    id: tags.id,
    name: tags.name,
    description: tags.description,
    color: tags.color,
  }).from(tags).orderBy(asc(tags.name));

  return json<LoaderData>({ user, availableTags });
};

export async function action({ request, context }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const bountyAmount = formData.get("bountyAmount") as string;

  // Validate input
  const postSchema = z.object({
    title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
    content: z.string().min(10, "Content must be at least 10 characters"),
    bountyAmount: z.string().optional(),
  });

  const validation = postSchema.safeParse({ title, content, bountyAmount });
  if (!validation.success) {
    return json({ error: validation.error.errors[0].message }, { status: 400 });
  }

  const db = createDb((context as any).env.DB);

  try {
    // Create the post
    const [post] = await db.insert(posts).values({
      id: crypto.randomUUID(),
      title: validation.data.title,
      content: validation.data.content,
      authorId: userId,
    }).returning().all();

    // If bounty amount is provided, create a bounty
    if (validation.data.bountyAmount && parseFloat(validation.data.bountyAmount) > 0) {
      const amount = parseFloat(validation.data.bountyAmount);
      
      // Get or create user's wallet
      let wallet = await getVirtualWallet(db, userId);
      if (!wallet) {
        wallet = await createVirtualWallet(db, userId);
      }
      
      if (!wallet) {
        return json({ error: "Failed to create wallet" }, { status: 500 });
      }
      
      // Check if user has sufficient balance
      if (wallet.balance < amount) {
        return json({ error: "Insufficient balance to create bounty" }, { status: 400 });
      }

      // Create the bounty
      const [bounty] = await db.insert(bounties).values({
        id: crypto.randomUUID(),
        postId: post.id,
        amount: amount,
        status: 'ACTIVE',
        tokenDecimals: 9,
        refundLockPeriod: 24,
        refundPenalty: 0,
        communityFee: 0.05,
      }).returning().all();

      // Deduct amount from user's wallet
      await createBounty(db, userId, amount, bounty.id);
    }

    return redirect(`/posts/${post.id}`);
  } catch (error) {
    console.error("Error creating post:", error);
    return json({ error: "Failed to create post" }, { status: 500 });
  }
}

export default function CreatePost() {
  const { user, availableTags } = useLoaderData<LoaderData>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [codeBlocks, setCodeBlocks] = useState<CodeBlockForm[]>([]);
  const [media, setMedia] = useState<Array<{ type: string; url: string; thumbnailUrl?: string; isScreenRecording: boolean }>>([]);
  const [hasBounty, setHasBounty] = useState(false);
  const [bountyAmount, setBountyAmount] = useState('');
  const [bountyDuration, setBountyDuration] = useState(7);
  const [clientError, setClientError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleMediaUpload = (newMedia: { type: string; url: string; thumbnailUrl?: string; isScreenRecording: boolean }) => {
    setMedia(prev => [...prev, newMedia]);
  };

  const handleMediaRemove = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Layout>
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
            <TagSelector
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
              availableTags={availableTags}
              error={actionData?.error?.includes('tag') ? actionData.error : undefined}
              required
            />
            {selectedTags.map(tagId => (
              <input key={tagId} type="hidden" name="tags" value={tagId} />
            ))}
          </div>

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
            <label className="block text-sm font-medium text-violet-300 mb-3">
              <div className="flex items-center gap-2">
                <FiGift className="w-4 h-4" />
                Bounty Settings
              </div>
            </label>
            
            <div className="bg-gradient-to-br from-neutral-800/60 to-neutral-900/60 border border-violet-500/20 rounded-xl p-6 backdrop-blur-sm">
              {/* Bounty Toggle */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="hasBounty"
                      checked={hasBounty}
                      onChange={(e) => setHasBounty(e.target.checked)}
                      className="sr-only"
                    />
                    <label
                      htmlFor="hasBounty"
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out cursor-pointer ${
                        hasBounty ? 'bg-violet-500' : 'bg-neutral-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                          hasBounty ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </label>
                  </div>
                  <div>
                    <label htmlFor="hasBounty" className="text-white font-medium cursor-pointer">
                      Add Crypto Bounty
                    </label>
                    <p className="text-gray-400 text-sm">Reward the best answer with tokens</p>
                  </div>
                </div>
                
                {hasBounty && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-violet-500/20 border border-violet-500/30 rounded-full">
                    <FiGift className="w-4 h-4 text-violet-300" />
                    <span className="text-violet-300 text-sm font-medium">Active</span>
                  </div>
                )}
              </div>

              {/* Bounty Configuration */}
              {hasBounty && (
                <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                  {/* Amount Section */}
                  <div className="bg-neutral-700/30 rounded-lg p-4 border border-neutral-600/50">
                    <div className="flex items-center gap-2 mb-3">
                      <FiDollarSign className="w-4 h-4 text-yellow-400" />
                      <label className="text-white font-medium">Bounty Amount</label>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        value={bountyAmount}
                        onChange={(e) => setBountyAmount(e.target.value)}
                        min="0"
                        step="0.01"
                        required
                        placeholder="0.00"
                        className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-600/50 rounded-lg text-white placeholder-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                        {TOKEN_SYMBOL}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      <FiInfo className="w-3 h-3" />
                      <span>5% goes to community governance rewards</span>
                    </div>
                  </div>

                  {/* Duration Section */}
                  <div className="bg-neutral-700/30 rounded-lg p-4 border border-neutral-600/50">
                    <div className="flex items-center gap-2 mb-3">
                      <FiClock className="w-4 h-4 text-blue-400" />
                      <label className="text-white font-medium">Bounty Duration</label>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        value={bountyDuration}
                        onChange={(e) => setBountyDuration(Number(e.target.value))}
                        min="1"
                        max="30"
                        required
                        className="px-4 py-3 bg-neutral-800/50 border border-neutral-600/50 rounded-lg text-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
                      />
                      <div className="flex items-center justify-center px-4 py-3 bg-neutral-800/30 border border-neutral-600/30 rounded-lg text-gray-300 text-sm">
                        days
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      <FiInfo className="w-3 h-3" />
                      <span>Bounty expires after {bountyDuration} days</span>
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/30 rounded-lg p-4">
                    <h4 className="text-violet-300 font-medium mb-2">Bounty Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Amount:</span>
                        <span className="text-white font-medium">
                          {bountyAmount ? `${parseFloat(bountyAmount).toFixed(2)} ${TOKEN_SYMBOL}` : '0.00 SOL'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Duration:</span>
                        <span className="text-white font-medium">{bountyDuration} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Governance Fee:</span>
                        <span className="text-yellow-400 font-medium">
                          {bountyAmount ? `${(parseFloat(bountyAmount) * 0.05).toFixed(3)} ${TOKEN_SYMBOL}` : '0.000 SOL'}
                        </span>
                      </div>
                      <div className="border-t border-violet-500/20 pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Cost:</span>
                          <span className="text-violet-300 font-semibold">
                            {bountyAmount ? `${(parseFloat(bountyAmount) * 1.05).toFixed(3)} ${TOKEN_SYMBOL}` : '0.000 SOL'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Info Card when bounty is disabled */}
              {!hasBounty && (
                <div className="bg-neutral-700/20 rounded-lg p-4 border border-neutral-600/30">
                  <div className="flex items-start gap-3">
                    <FiInfo className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-gray-300 font-medium mb-1">No Bounty Selected</h4>
                      <p className="text-gray-400 text-sm">
                        Enable bounty to reward the best answer with tokens. This will attract more attention to your question and incentivize quality responses.
                      </p>
                    </div>
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
              disabled={isSubmitting}
              className="px-6 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 disabled:bg-violet-500/50 disabled:cursor-not-allowed disabled:hover:bg-violet-500/50 transition-colors"
            >
              {isSubmitting ? "Creating Post..." : "Create Post"}
            </button>
          </div>
        </Form>
      </div>
    </Layout>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  
  return (
    <Layout>
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
    </Layout>
  );
}

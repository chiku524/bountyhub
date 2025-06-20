import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData, useSearchParams, useSubmit } from "@remix-run/react";
import { createDb } from "~/utils/db.server";
import { getUser } from "~/utils/auth.server";
import { eq, desc, and, or, sql } from "drizzle-orm";
import { users, posts, tags, profiles, postTags, comments, bounties, votes } from "../../drizzle/schema";
import { Layout } from "~/components/Layout";
import { FaSearch, FaBookmark } from "react-icons/fa";
import { FiTrendingUp } from "react-icons/fi";
import { useState, useEffect } from "react";
import { Link } from "@remix-run/react";

const DEFAULT_PROFILE_PICTURE = 'https://api.dicebear.com/7.x/initials/svg?seed=';

function getProfilePicture(profilePicture: string | null, username: string): string {
  if (profilePicture) {
    return profilePicture;
  }
  return `${DEFAULT_PROFILE_PICTURE}${encodeURIComponent(username)}`;
}

interface LoaderData {
  user: {
    id: string;
    username: string;
    profilePicture: string | null;
  } | null;
  posts: Array<{
    id: string;
    title: string;
    content: string;
    blobVideoURL: string | null;
    media: {
      id: string;
      type: string;
      url: string;
      thumbnailUrl?: string;
      isScreenRecording: boolean;
    } | null;
    author: {
      id: string;
      username: string;
      profilePicture: string | null;
    };
    createdAt: string;
    visibilityVotes: number;
    userVoted: boolean;
    comments: number;
    hasBounty: boolean;
    bounty: {
      id: string;
      amount: number;
      status: string;
    } | null;
    tags: Array<{
      id: string;
      name: string;
      color: string;
    }>;
  }>;
  availableTags: Array<{
    id: string;
    name: string;
    description: string | null;
    color: string;
  }>;
  totalPosts: number;
  currentPage: number;
  totalPages: number;
  selectedTags: string[];
  searchQuery: string;
}

export const meta = () => {
  return [
    { title: "Community - portal.ask" },
    { name: "description", content: "Explore the portal.ask community and discover questions, answers, and discussions" },
  ];
};

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  try {
    const user = await getUser(request);
    const db = (context as { env: { DB: D1Database } }).env.DB;
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const selectedTags = url.searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const searchQuery = url.searchParams.get('search') || '';
    const perPage = 20;
    const skip = (page - 1) * perPage;

    // Build where clause for tag filtering and search
    const whereConditions: (ReturnType<typeof sql> | ReturnType<typeof or>)[] = [];
    
    if (selectedTags.length > 0) {
      whereConditions.push(sql`EXISTS (
        SELECT 1 FROM post_tags pt 
        JOIN tags t ON pt.tag_id = t.id 
        WHERE pt.post_id = posts.id AND t.name IN (${selectedTags.join(',')})
      )`);
    }
    
    if (searchQuery) {
      whereConditions.push(
        or(
          sql`posts.title LIKE ${`%${searchQuery}%`}`,
          sql`posts.content LIKE ${`%${searchQuery}%`}`
        )
      );
    }

    // Fetch posts with pagination
    const baseQuery = db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        createdAt: posts.createdAt,
        authorId: posts.authorId,
        visibilityVotes: posts.visibilityVotes,
        qualityUpvotes: posts.qualityUpvotes,
        qualityDownvotes: posts.qualityDownvotes,
        hasBounty: posts.hasBounty,
        status: posts.status,
      })
      .from(posts)
      .orderBy(desc(posts.createdAt))
      .limit(perPage)
      .offset(skip);

    const finalQuery = whereConditions.length > 0 
      ? baseQuery.where(and(...whereConditions))
      : baseQuery;

    const postsData = await finalQuery;

    // Fetch related data for each post
    const postsWithData = await Promise.all(
      postsData.map(async (post: {
        id: string;
        title: string;
        content: string;
        createdAt: Date;
        authorId: string;
        visibilityVotes: number;
        qualityUpvotes: number;
        qualityDownvotes: number;
        hasBounty: boolean;
        status: string;
      }) => {
        // Get author info
        const authorArr = await db
          .select({
            id: users.id,
            username: users.username,
          })
          .from(users)
          .where(eq(users.id, post.authorId))
          .limit(1);
        const author = authorArr[0] || { id: '', username: 'Unknown' };

        // Get profile picture
        const profileArr = await db
          .select({
            profilePicture: profiles.profilePicture,
          })
          .from(profiles)
          .where(eq(profiles.userId, post.authorId))
          .limit(1);
        const profilePicture = profileArr[0]?.profilePicture || null;

        // Get tags
        const postTagsArr = await db
          .select({
            tagId: postTags.tagId,
          })
          .from(postTags)
          .where(eq(postTags.postId, post.id));

        const tagNames = await Promise.all(
          postTagsArr.map(async (pt: { tagId: string }) => {
            const tagArr = await db
              .select({
                id: tags.id,
                name: tags.name,
                color: tags.color,
              })
              .from(tags)
              .where(eq(tags.id, pt.tagId))
              .limit(1);
            return tagArr[0] || null;
          })
        );

        // Get comments count
        const commentsCountArr = await db
          .select({ count: sql<number>`count(*)` })
          .from(comments)
          .where(eq(comments.postId, post.id));
        const commentsCount = commentsCountArr[0]?.count || 0;

        // Get bounty info if exists
        let bounty = null;
        if (post.hasBounty) {
          const bountyArr = await db
            .select({
              id: bounties.id,
              amount: bounties.amount,
              status: bounties.status,
            })
            .from(bounties)
            .where(eq(bounties.postId, post.id))
            .limit(1);
          bounty = bountyArr[0] || null;
        }

        return {
          ...post,
          author: {
            id: author.id,
            username: author.username,
            profilePicture,
          },
          tags: tagNames.filter(Boolean),
          comments: commentsCount,
          hasBounty: post.hasBounty,
          bounty,
        };
      })
    );

    // Get total count for pagination
    const totalCountArr = await db
      .select({ count: sql<number>`count(*)` })
      .from(posts);
    const totalCount = totalCountArr[0]?.count || 0;

    return json({
      posts: postsWithData,
      totalPosts: totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / perPage),
      availableTags: [], // TODO: implement tag fetching if needed
      selectedTags,
      searchQuery,
      user,
    });
  } catch (error) {
    console.error('Error loading community posts:', error);
    return json({
      posts: [],
      totalPosts: 0,
      currentPage: 1,
      totalPages: 1,
      availableTags: [],
      selectedTags: [],
      searchQuery: '',
      user: null,
    });
  }
};

export const action = async ({ request, context }: LoaderFunctionArgs) => {
  try {
    const user = await getUser(request);
    if (!user) {
      return json({ error: 'You must be logged in to perform this action' }, { status: 401 });
    }

    const db = createDb((context as unknown as { env: { DB: D1Database } }).env.DB);
    const formData = await request.formData();
    const action = formData.get('action');
    const postIdRaw = formData.get('postId');
    const postId = typeof postIdRaw === 'string' ? postIdRaw : undefined;
    const isVotingRaw = formData.get('isVoting');
    const isVoting = isVotingRaw === 'true';

    if (!postId) {
      return json({ error: 'Post ID is required' }, { status: 400 });
    }

    if (action === 'vote') {
      try {
        // Use a transaction to ensure atomic operations
        const result = await db.transaction(async (tx) => {
          // First, delete any existing vote for this user and post
          await tx.delete(votes).where(and(
            eq(votes.userId, user.id),
            eq(votes.postId, postId),
            eq(votes.voteType, 'POST'),
            eq(votes.isQualityVote, false)
          ));

          if (isVoting) {
            // Create new vote with all required fields set
            await tx.insert(votes).values({
              id: crypto.randomUUID(),
              userId: user.id,
              postId: postId,
              value: 1,
              voteType: 'POST',
              isQualityVote: false,
              commentId: null,
              answerId: null
            });
          }

          // Count visibility votes (only positive votes)
          const visibilityVotesArr = await tx
            .select({ count: sql<number>`count(*)` })
            .from(votes)
            .where(and(
              eq(votes.postId, postId),
              eq(votes.voteType, 'POST'),
              eq(votes.isQualityVote, false),
              eq(votes.value, 1)
            ));
          const visibilityVotes = visibilityVotesArr[0]?.count || 0;

          // Update post with new vote count
          const updatedPostArr = await tx.update(posts).set({
            visibilityVotes
          }).where(eq(posts.id, postId)).returning();

          return {
            post: updatedPostArr[0],
            userVoted: isVoting
          };
        });

        return json({ 
          success: true,
          votes: result.post.visibilityVotes,
          voted: result.userVoted,
          postId: postId
        });
      } catch (error) {
        return json({ 
          error: 'Failed to process vote',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, 500);
      }
    } else if (action === 'delete') {
      // Check if the post exists and belongs to the user
      const postArr = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
      const post = postArr[0];
      if (!post) {
        return json({ error: 'Post not found' }, { status: 404 });
      }
      if (post.authorId !== user.id) {
        return json({ error: 'You can only delete your own posts' }, { status: 403 });
      }
      // Delete the post
      await db.delete(posts).where(eq(posts.id, postId));
      return json({ success: true });
    }
    return json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Action error:', error);
    return json({ 
      error: 'Failed to process action',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
};

export default function Community() {
  const { user, posts: initialPosts, totalPosts, currentPage, totalPages, availableTags, selectedTags, searchQuery } = useLoaderData<LoaderData>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [localPosts, setLocalPosts] = useState<LoaderData['posts']>(initialPosts);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [isSearching, setIsSearching] = useState(false);
  const submit = useSubmit();
  const [bookmarkedPosts, setBookmarkedPosts] = useState<{ [postId: string]: boolean }>({});

  // Update localPosts when posts from loader changes
  useEffect(() => {
    console.log('Setting localPosts from initialPosts:', initialPosts.length);
    setLocalPosts(initialPosts);
  }, [initialPosts]);

  // Update local search query when server search query changes
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
    setIsSearching(false);
  }, [searchQuery]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localSearchQuery !== searchQuery) {
        setIsSearching(true);
        const newParams = new URLSearchParams(searchParams);
        if (localSearchQuery.trim()) {
          newParams.set('search', localSearchQuery);
        } else {
          newParams.delete('search');
        }
        // Reset to page 1 when searching
        newParams.set('page', '1');
        setSearchParams(newParams);
      }
    }, 300); // 300ms debounce delay

    return () => clearTimeout(timeoutId);
  }, [localSearchQuery, searchQuery, searchParams, setSearchParams]);

  // Fetch bookmark status for visible posts when user or posts change
  useEffect(() => {
    if (!user || localPosts.length === 0) return;
    
    const fetchBookmarks = async () => {
      try {
        const postIdsParam = encodeURIComponent(JSON.stringify(localPosts.map(p => p.id)));
        const res = await fetch(`/api/bookmarks-status?postIds=${postIdsParam}`, {
          method: 'GET',
          headers: { 
            'Accept': 'application/json'
          }
        });
        
        if (res.status === 401) {
          return;
        }
        
        if (!res.ok) {
          console.error('Failed to fetch bookmark status:', res.status, res.statusText);
          return;
        }
        
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Response is not JSON:', contentType);
          return;
        }
        
        const data = await res.json();
        setBookmarkedPosts((data as { status: { [postId: string]: boolean } }).status);
      } catch (error) {
        console.error('Error fetching bookmark status:', error);
      }
    };
    
    fetchBookmarks();
  }, [user, localPosts]); // Run when user or posts change

  const handleVote = async (postId: string, voteValue: number) => {
    if (!user) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append('action', 'vote');
      formData.append('postId', postId);
      formData.append('isVoting', (voteValue === 1).toString());

      submit(formData, { method: 'post' });
    } catch (error) {
      console.error('Failed to process vote:', error);
    }
  };

  // Handle bookmark toggle
  const handleBookmark = async (postId: string) => {
    if (!user) return;
    
    // Optimistically update the UI
    setBookmarkedPosts(prev => {
      const newState = { ...prev, [postId]: !prev[postId] };
      return newState;
    });
    
    try {
      const response = await fetch('/api/bookmarks-toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId })
      });
      
      if (!response.ok) {
        console.error('Failed to toggle bookmark:', response.status);
        // Revert the state if the API call failed
        setBookmarkedPosts(prev => ({ ...prev, [postId]: !prev[postId] }));
      }
      // If successful, keep the optimistic update
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      // Revert the state if there was an error
      setBookmarkedPosts(prev => ({ ...prev, [postId]: !prev[postId] }));
    }
  };

  // If there's an error in the loader data, show an error message
  if (!initialPosts || !Array.isArray(initialPosts)) {
    return (
      <Layout>
        <div className="w-auto max-w-8xl mx-auto mt-4 px-4 pb-16">
          <div className="text-red-500 mt-16">
            Failed to load posts. Please try refreshing the page.
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-auto max-w-8xl mx-auto mt-4 px-4 pb-16">
        <div className="mb-6 flex justify-between items-center mt-16">
          <h1 className="text-2xl font-bold text-white">Community Posts</h1>
          <Link 
            to="/posts/create" 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <span>Create Post</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-6 bg-neutral-800/50 rounded-lg p-4 border border-violet-500/30">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isSearching ? 'text-violet-400 animate-pulse' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search posts by title..."
                value={localSearchQuery}
                onChange={(e) => {
                  setLocalSearchQuery(e.target.value);
                }}
                className="w-full pl-10 pr-4 py-2 bg-neutral-700/50 border border-violet-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
              />
            </div>
            {localSearchQuery && (
              <button
                onClick={() => {
                  setLocalSearchQuery('');
                  const newParams = new URLSearchParams(searchParams);
                  newParams.delete('search');
                  newParams.set('page', '1');
                  setSearchParams(newParams);
                }}
                className="px-3 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="mt-2 text-sm text-gray-400">
              Searching for: "{searchQuery}" • {totalPosts} result{totalPosts !== 1 ? 's' : ''} found
              {isSearching && <span className="ml-2 text-violet-400">(searching...)</span>}
            </div>
          )}
        </div>

        {/* Tag Filtering */}
        <div className="mb-6 bg-neutral-800/50 rounded-lg p-4 border border-violet-500/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-violet-300">Filter by Tags</h3>
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSearchParams({})}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => {
                  const newParams = new URLSearchParams(searchParams);
                  const currentTags = newParams.getAll('tags');
                  
                  if (currentTags.includes(tag.id)) {
                    // Remove tag if already selected
                    newParams.delete('tags');
                    currentTags.filter(t => t !== tag.id).forEach(t => newParams.append('tags', t));
                  } else {
                    // Add tag if not selected
                    newParams.append('tags', tag.id);
                  }
                  
                  // Reset to page 1 when filtering
                  newParams.set('page', '1');
                  setSearchParams(newParams);
                }}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedTags.includes(tag.id)
                    ? 'bg-violet-500 text-white shadow-lg'
                    : 'bg-neutral-700/50 text-gray-300 hover:bg-neutral-600/50 border border-violet-500/30'
                }`}
                style={{
                  borderColor: selectedTags.includes(tag.id) ? tag.color : undefined
                }}
              >
                {tag.name}
              </button>
            ))}
          </div>
          
          {selectedTags.length > 0 && (
            <div className="mt-3 text-sm text-gray-400">
              Showing posts with: {selectedTags.map(tagId => {
                const tag = availableTags.find(t => t.id === tagId);
                return tag?.name;
              }).filter(Boolean).join(', ')}
            </div>
          )}
        </div>

        {/* Responsive grid for posts */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {localPosts.length > 0 ? (
            localPosts.map((post: LoaderData['posts'][0]) => (
              <div 
                key={post.id}
                className={`bg-neutral-800/80 rounded-lg p-6 border-2 shadow-lg relative ${
                  post.hasBounty && post.bounty && post.bounty.status === 'ACTIVE'
                    ? 'border-cyan-400/60 shadow-cyan-400/20 shadow-lg'
                    : 'border-violet-500/50 shadow-violet-500/20'
                }`}
              >
                {/* Bounty Badge - Top Right */}
                {post.hasBounty && post.bounty && post.bounty.status === 'ACTIVE' && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className="px-3 py-1 bg-cyan-500/20 text-cyan-300 text-sm font-semibold rounded-full border border-cyan-400/40">
                      💰 {post.bounty.amount} PORTAL
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <img
                      src={post.author.profilePicture || getProfilePicture(null, post.author.username)}
                      alt={`${post.author.username}'s avatar`}
                      className="w-8 h-8 rounded-full"
                    />
                    <Link 
                      to={`/${post.author.username}`}
                      className="font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {post.author.username}
                    </Link>
                    <span className="text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {/* Bookmark Button - Top Right */}
                  {user && (
                    <button
                      onClick={() => handleBookmark(post.id)}
                      className={`p-2 rounded-full transition-colors ${bookmarkedPosts[post.id] ? 'bg-yellow-400/20 text-yellow-400' : 'bg-neutral-700/50 text-gray-400 hover:text-yellow-400'}`}
                      title={bookmarkedPosts[post.id] ? 'Remove Bookmark' : 'Bookmark'}
                    >
                      <FaBookmark className={`w-4 h-4 ${bookmarkedPosts[post.id] ? 'fill-current' : 'fill-none'}`} />
                    </button>
                  )}
                </div>
                
                <div className="group">
                  <Link 
                    to={`/posts/${post.id}`}
                    className="block"
                  >
                    <h2 className="text-xl font-semibold text-white mb-3 group-hover:text-violet-400 transition-colors">
                      {post.title.length > 30 ? post.title.substring(0, 30) + '...' : post.title}
                    </h2>
                    <p className="text-gray-300 mb-4 overflow-hidden truncate max-w-full w-full break-words">
                      {post.content.length > 100 ? post.content.substring(0, 100) + '...' : post.content}
                    </p>
                    
                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {post.tags.map((tag: { id: string; name: string; color: string }) => (
                          <span
                            key={tag.id}
                            className="px-2 py-1 text-xs font-medium rounded-full"
                            style={{
                              backgroundColor: `${tag.color}20`,
                              color: tag.color,
                              border: `1px solid ${tag.color}40`
                            }}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {post.media && (
                      <div className="mb-4">
                        {post.media.type.toLowerCase() === 'image' && (
                          <img
                            src={post.media.url}
                            alt="Post media"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        )}
                        {(post.media.type.toLowerCase() === 'video' || post.media.type.toLowerCase() === 'screen') && (
                          <video
                            src={post.media.url}
                            poster={post.media.thumbnailUrl}
                            controls
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        )}
                      </div>
                    )}
                  </Link>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleVote(post.id, post.userVoted ? 0 : 1)}
                      className={`flex items-center space-x-1 transition-colors ${
                        post.userVoted
                          ? 'text-violet-400'
                          : 'text-gray-400 hover:text-violet-400'
                      }`}
                    >
                      <FiTrendingUp className={`w-5 h-5 ${post.userVoted ? 'fill-current' : 'fill-none'}`} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-400">
              No posts found.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
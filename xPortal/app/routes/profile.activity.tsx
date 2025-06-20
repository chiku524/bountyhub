import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { requireUserId } from '~/utils/auth.server';
import { createDb } from '~/utils/db.server';
import { eq, desc } from 'drizzle-orm';
import { posts, comments, answers, reputationHistory } from '../../drizzle/schema';
import { useLoaderData, Link } from '@remix-run/react';
import { FiMessageSquare, FiThumbsUp, FiCheckCircle, FiEdit2 } from 'react-icons/fi';

interface Activity {
  id: string;
  type: 'post' | 'comment' | 'answer' | 'reputation';
  title?: string;
  content?: string;
  points?: number;
  action?: string;
  createdAt: string | Date;
  referenceId?: string | null;
}

interface LoaderData {
  activities: Activity[];
}

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  try {
    const userId = await requireUserId(request);
    const db = createDb((context as { env: { DB: D1Database } }).env.DB);
    
    // Fetch user activity data
    const [userPosts, userComments, userAnswers, userReputationHistory] = await Promise.all([
      db.select().from(posts).where(eq(posts.authorId, userId)).orderBy(desc(posts.createdAt)).limit(100),
      db.select().from(comments).where(eq(comments.authorId, userId)).orderBy(desc(comments.createdAt)).limit(100),
      db.select().from(answers).where(eq(answers.authorId, userId)).orderBy(desc(answers.createdAt)).limit(100),
      db.select().from(reputationHistory).where(eq(reputationHistory.userId, userId)).orderBy(desc(reputationHistory.createdAt)).limit(100),
    ]);

    // Transform data for the frontend
    const activityItems = [
      ...userPosts.map((post: { id: string; title: string; createdAt: Date }) => ({
        id: post.id,
        type: 'post' as const,
        title: post.title,
        createdAt: post.createdAt.toISOString(),
        action: 'POST_CREATED'
      })),
      ...userComments.map((comment: { id: string; createdAt: Date; post?: { title: string } }) => ({
        id: comment.id,
        type: 'comment' as const,
        title: comment.post?.title || 'Unknown Post',
        createdAt: comment.createdAt.toISOString(),
        action: 'COMMENT_CREATED'
      })),
      ...userAnswers.map((answer: { id: string; createdAt: Date; post?: { title: string } }) => ({
        id: answer.id,
        type: 'answer' as const,
        title: answer.post?.title || 'Unknown Post',
        createdAt: answer.createdAt.toISOString(),
        action: 'ANSWER_CREATED'
      })),
      ...userReputationHistory.map((history: { id: string; action: string; description?: string; createdAt: Date; points: number }) => ({
        id: history.id,
        type: 'reputation' as const,
        title: history.action,
        content: history.description || '',
        createdAt: history.createdAt,
        points: history.points,
        action: history.action,
      })),
    ];

    // Sort by creation date (newest first)
    activityItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return json({ activityItems });
  } catch (error) {
    console.error('Error loading profile activity:', error);
    return json({ activityItems: [] });
  }
};

function getActivityDescription(action: string): string {
    const descriptions: { [key: string]: string } = {
        'POST_CREATED': 'Created a new post',
        'POST_UPVOTED': 'Received an upvote on your post',
        'POST_DOWNVOTED': 'Received a downvote on your post',
        'COMMENT_CREATED': 'Added a comment',
        'COMMENT_UPVOTED': 'Received an upvote on your comment',
        'COMMENT_DOWNVOTED': 'Received a downvote on your comment',
        'ANSWER_CREATED': 'Provided an answer',
        'ANSWER_UPVOTED': 'Received an upvote on your answer',
        'ANSWER_DOWNVOTED': 'Received a downvote on your answer',
        'ANSWER_ACCEPTED': 'Your answer was accepted as the best solution',
        'PROFILE_COMPLETED': 'Completed your profile information',
        'DAILY_LOGIN': 'Logged in for the day',
        'WEEKLY_STREAK': 'Maintained a weekly activity streak',
        'MONTHLY_CONTRIBUTOR': 'Active contributor this month',
        'HELPFUL_MEMBER': 'Recognized as a helpful community member',
        'FIRST_POST': 'Created your first post',
        'FIRST_ANSWER': 'Provided your first answer',
        'FIRST_COMMENT': 'Added your first comment',
        'REPUTATION_MILESTONE': 'Reached a reputation milestone',
        'COMMUNITY_ENGAGEMENT': 'Active participation in the community',
        'CREATE_POST': 'Created a new post'
    };
    
    return descriptions[action] || action;
}

export default function ProfileActivity() {
  const { activities } = useLoaderData<LoaderData>();

  return (
    <div className="bg-neutral-800/80 rounded-lg p-6 border-2 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)] mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Activity History</h2>
        <Link to="/profile" className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors border-2 border-violet-500/50 shadow-md">Back to Profile</Link>
      </div>
      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-gray-400 text-center">No activity yet.</div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="bg-neutral-700/50 rounded-lg border border-violet-500/30 p-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-violet-500/20 rounded-lg">
                  {activity.type === 'post' && <FiEdit2 className="w-5 h-5 text-violet-300" />}
                  {activity.type === 'comment' && <FiMessageSquare className="w-5 h-5 text-violet-300" />}
                  {activity.type === 'answer' && <FiCheckCircle className="w-5 h-5 text-violet-300" />}
                  {activity.type === 'reputation' && <FiThumbsUp className="w-5 h-5 text-violet-300" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-violet-300">
                        {activity.type === 'post' && activity.title}
                        {activity.type === 'comment' && 'Comment on: ' + activity.title}
                        {activity.type === 'answer' && 'Answer to: ' + activity.title}
                        {activity.type === 'reputation' && getActivityDescription(activity.action || '')}
                      </h3>
                      {(activity.type === 'post' || activity.type === 'comment' || activity.type === 'answer') && (
                        <p className="mt-2 text-gray-300 line-clamp-2">{activity.content}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="text-sm text-gray-400">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                      {activity.type === 'reputation' && activity.points && (
                        <p className={`text-sm font-medium ${activity.points > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {activity.points > 0 ? '+' : ''}{activity.points} points
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 
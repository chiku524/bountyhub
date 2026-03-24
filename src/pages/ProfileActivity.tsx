import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'
import type { ReputationHistory } from '../types'
import { FiThumbsUp, FiArrowLeft } from 'react-icons/fi'
import { LoadingSpinner } from '../components/LoadingSpinner'

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
  }
  
  return descriptions[action] || action
}

export default function ProfileActivity() {
  const [reputationHistory, setReputationHistory] = useState<ReputationHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadActivityData()
  }, [])

  const loadActivityData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const userData = await api.getProfile()
      setReputationHistory(userData.reputationHistory || [])
      
    } catch (err: any) {
      console.error('Activity error:', err)
      setError(err.message || 'Failed to load activity data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900">
        <div className="w-auto max-w-8xl mx-auto mt-4 px-4 pb-16">
          <div className="mb-6 flex justify-between items-center mt-16">
            <h1 className="text-2xl font-bold text-white">All Activity</h1>
          </div>
          <div className="bg-neutral-800/80 rounded-lg p-6 border-2 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="md" />
              <span className="ml-3 text-gray-300">Loading activity...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-900">
        <div className="w-auto max-w-8xl mx-auto mt-4 px-4 pb-16">
          <div className="mb-6 flex justify-between items-center mt-16">
            <h1 className="text-2xl font-bold text-white">All Activity</h1>
          </div>
          <div className="bg-neutral-800/80 rounded-lg p-6 border-2 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            <div className="text-center">
              <p className="text-red-400">{error}</p>
              <Link to="/profile" className="mt-4 inline-block text-violet-400 hover:text-violet-300">
                Back to Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-900">
      <div className="w-auto max-w-8xl mx-auto mt-4 px-4 pb-16">
        <div className="mb-6 flex justify-between items-center mt-16">
          <div className="flex items-center gap-4">
            <Link 
              to="/profile" 
              className="p-2 bg-violet-500/20 text-violet-300 rounded-lg hover:bg-violet-500/30 transition-colors border border-violet-500/50"
            >
              <FiArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-white">All Activity</h1>
          </div>
        </div>

        <div className="bg-neutral-800/80 rounded-lg p-6 border-2 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
          {reputationHistory.length > 0 ? (
            <div className="space-y-3">
              {reputationHistory.map((history) => (
                <div key={history.id} className="flex items-center justify-between p-4 bg-neutral-700/50 rounded-lg border border-violet-500/30 hover:bg-neutral-600/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-violet-500/20 rounded-lg">
                      <FiThumbsUp className="w-4 h-4 text-violet-300" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-violet-300">{getActivityDescription(history.action)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(history.createdAt).toLocaleDateString()} at {new Date(history.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                    history.points > 0 
                      ? 'text-green-400 bg-green-500/20 border border-green-500/30' 
                      : 'text-red-400 bg-red-500/20 border border-red-500/30'
                  }`}>
                    {history.points > 0 ? '+' : ''}{history.points}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 text-lg">No activity yet</p>
              <p className="text-sm text-gray-500 mt-2">Start participating in the community to see your activity here</p>
              <Link 
                to="/community" 
                className="mt-4 inline-block px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
              >
                Explore Community
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
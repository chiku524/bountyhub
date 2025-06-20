import { useState } from 'react';
import { Form, Link } from '@remix-run/react';
import { FiThumbsUp, FiThumbsDown, FiCheck } from 'react-icons/fi';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    username: string;
  };
}

interface Answer {
  id: string;
  content: string;
  createdAt: string;
  author: {
    username: string;
  };
  isAccepted?: boolean;
}

interface PostInteractionsProps {
  isAuthor: boolean;
  initialQualityUpvotes: number;
  initialQualityDownvotes: number;
  initialVisibilityVotes: number;
  userQualityVote: number;
  userVisibilityVote: boolean;
  comments: Comment[];
  answers: Answer[];
  onQualityVote: (value: number) => Promise<void>;
  onVisibilityVote: (isVoting: boolean) => Promise<void>;
  onComment: (content: string) => Promise<void>;
  onAnswer: (content: string) => Promise<void>;
  onAcceptAnswer: (answerId: string) => Promise<void>;
}

export default function PostInteractions({
  isAuthor,
  initialQualityUpvotes,
  initialQualityDownvotes,
  initialVisibilityVotes,
  userQualityVote,
  userVisibilityVote,
  comments,
  answers,
  onQualityVote,
  onVisibilityVote,
  onComment,
  onAnswer,
  onAcceptAnswer,
}: PostInteractionsProps) {
  const [qualityUpvotes, setQualityUpvotes] = useState(initialQualityUpvotes);
  const [qualityDownvotes, setQualityDownvotes] = useState(initialQualityDownvotes);
  const [visibilityVotes, setVisibilityVotes] = useState(initialVisibilityVotes);
  const [currentQualityVote, setCurrentQualityVote] = useState(userQualityVote);
  const [currentVisibilityVote, setCurrentVisibilityVote] = useState(userVisibilityVote);
  const [commentContent, setCommentContent] = useState('');
  const [answerContent, setAnswerContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQualityVote = async (value: number) => {
    try {
      await onQualityVote(value);
      if (currentQualityVote === value) {
        // If clicking the same vote button, remove the vote
        setCurrentQualityVote(0);
        if (value === 1) {
          setQualityUpvotes(prev => prev - 1);
        } else {
          setQualityDownvotes(prev => prev - 1);
        }
      } else if (currentQualityVote === -value) {
        // If clicking the opposite vote button, switch the vote
        setCurrentQualityVote(value);
        if (value === 1) {
          setQualityUpvotes(prev => prev + 1);
          setQualityDownvotes(prev => prev - 1);
        } else {
          setQualityUpvotes(prev => prev - 1);
          setQualityDownvotes(prev => prev + 1);
        }
      } else {
        // If no previous vote, add the vote
        setCurrentQualityVote(value);
        if (value === 1) {
          setQualityUpvotes(prev => prev + 1);
        } else {
          setQualityDownvotes(prev => prev + 1);
        }
      }
    } catch (error) {
      // Removed all console.error statements for cleaner production code.
    }
  };

  const handleVisibilityVote = async (isVoting: boolean) => {
    try {
      await onVisibilityVote(isVoting);
      setCurrentVisibilityVote(isVoting);
      setVisibilityVotes(prev => isVoting ? prev + 1 : prev - 1);
    } catch (error) {
      // Removed all console.error statements for cleaner production code.
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    setIsSubmitting(true);
    try {
      await onComment(commentContent);
      setCommentContent('');
    } catch (error) {
      // Removed all console.error statements for cleaner production code.
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerContent.trim()) return;

    setIsSubmitting(true);
    try {
      await onAnswer(answerContent);
      setAnswerContent('');
    } catch (error) {
      // Removed all console.error statements for cleaner production code.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quality Voting */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => handleQualityVote(1)}
          className={`flex items-center space-x-1 transition-colors ${
            currentQualityVote === 1 
              ? 'text-violet-400' 
              : 'text-gray-400 hover:text-violet-400'
          }`}
        >
          <FiThumbsUp className={`w-5 h-5 ${currentQualityVote === 1 ? 'fill-current' : 'fill-none'}`} />
          <span>{qualityUpvotes}</span>
        </button>
        <button
          onClick={() => handleQualityVote(-1)}
          className={`flex items-center space-x-1 transition-colors ${
            currentQualityVote === -1 
              ? 'text-violet-400' 
              : 'text-gray-400 hover:text-violet-400'
          }`}
        >
          <FiThumbsDown className={`w-5 h-5 ${currentQualityVote === -1 ? 'fill-current' : 'fill-none'}`} />
          <span>{qualityDownvotes}</span>
        </button>
      </div>

      {/* Visibility Voting */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => handleVisibilityVote(!currentVisibilityVote)}
          className={`flex items-center space-x-1 transition-colors ${
            currentVisibilityVote 
              ? 'text-violet-400' 
              : 'text-gray-400 hover:text-violet-400'
          }`}
        >
          <FiThumbsUp className={`w-5 h-5 ${currentVisibilityVote ? 'fill-current' : 'fill-none'}`} />
          <span>{visibilityVotes}</span>
        </button>
      </div>

      {/* Comments */}
      <div>
        <h3 className="text-lg font-semibold text-white">Comments ({comments.length})</h3>
        <Form onSubmit={handleComment} className="space-y-2">
          <textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="Write a comment..."
            className="w-full p-2 border rounded-md bg-neutral-700 text-white border-violet-500/50 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            rows={3}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-violet-500 text-white rounded-md hover:bg-violet-600 disabled:opacity-50 transition-colors"
          >
            Post Comment
          </button>
        </Form>
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="p-4 bg-neutral-700/50 rounded-md border border-violet-500/20">
              <div className="flex items-center space-x-2">
                <Link 
                  to={`/${comment.author.username}`}
                  className="font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                >
                  {comment.author.username}
                </Link>
                <span className="text-gray-400">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-2 text-gray-300">{comment.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Answers */}
      <div>
        <h3 className="text-lg font-semibold text-white">Answers ({answers.length})</h3>
        <Form onSubmit={handleAnswer} className="space-y-2">
          <textarea
            value={answerContent}
            onChange={(e) => setAnswerContent(e.target.value)}
            placeholder="Write an answer..."
            className="w-full p-2 border rounded-md bg-neutral-700 text-white border-violet-500/50 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            rows={4}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-violet-500 text-white rounded-md hover:bg-violet-600 disabled:opacity-50 transition-colors"
          >
            Post Answer
          </button>
        </Form>
        <div className="space-y-4">
          {answers.map((answer) => (
            <div
              key={answer.id}
              className={`p-4 rounded-md border ${
                answer.isAccepted 
                  ? 'bg-violet-500/10 border-violet-500/50' 
                  : 'bg-neutral-700/50 border-violet-500/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Link 
                    to={`/${answer.author.username}`}
                    className="font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    {answer.author.username}
                  </Link>
                  <span className="text-gray-400">
                    {new Date(answer.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {isAuthor && !answer.isAccepted && (
                  <button
                    onClick={() => onAcceptAnswer(answer.id)}
                    className="flex items-center space-x-1 text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    <FiCheck />
                    <span>Accept</span>
                  </button>
                )}
              </div>
              <p className="mt-2 text-gray-300">{answer.content}</p>
              {answer.isAccepted && (
                <div className="mt-2 text-violet-400 flex items-center space-x-1">
                  <FiCheck />
                  <span>Accepted Answer</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 
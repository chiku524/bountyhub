import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthProvider';
import { config } from '../utils/config';
import { LoadingSpinner } from './LoadingSpinner';
import { ProfilePicture } from './ProfilePicture';
import { FiMessageCircle, FiSend, FiChevronDown } from 'react-icons/fi';
import { useChatWebSocket, type ChatWsMessagePayload } from '../hooks/useChatWebSocket';

interface PostChatMessage {
  id: string;
  content: string;
  messageType: string;
  createdAt: string;
  author: { id: string; username: string; role: string };
  profile?: { profilePicture?: string };
}

interface PostChatRoomProps {
  postId: string;
  postTitle?: string;
}

const POLL_INTERVAL_MS = 2500;

export function PostChatRoom({ postId }: PostChatRoomProps) {
  const { user } = useAuth();
  const [room, setRoom] = useState<{ id: string; name: string } | null>(null);
  const [messages, setMessages] = useState<PostChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState<string | null>(null);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleVisibility = () => setIsPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollToBottom(false);
  }, []);

  const checkAtBottom = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    setShowScrollToBottom(!atBottom);
  }, []);

  useEffect(() => {
    checkAtBottom();
  }, [messages, checkAtBottom]);

  const handleWsMessage = useCallback((message: ChatWsMessagePayload) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev;
      return [...prev, { ...message, messageType: message.messageType ?? 'TEXT' }];
    });
    if (message.createdAt) setLastMessageTimestamp(message.createdAt);
  }, []);

  const { connected: wsConnected } = useChatWebSocket(room?.id ?? null, handleWsMessage);

  const fetchRoom = useCallback(async () => {
    try {
      const res = await fetch(`${config.api.baseUrl}/api/posts/${postId}/chat`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load chat');
      const data = await res.json();
      if (data.success && data.room) {
        setRoom(data.room);
        return data.room.id;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load chat');
    }
    return null;
  }, [postId]);

  const fetchMessages = useCallback(async (after?: string) => {
    try {
      const url = after
        ? `${config.api.baseUrl}/api/posts/${postId}/chat/messages?limit=50&after=${encodeURIComponent(after)}`
        : `${config.api.baseUrl}/api/posts/${postId}/chat/messages?limit=50`;
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        if (after) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newOnes = data.messages.filter((m: PostChatMessage) => !existingIds.has(m.id));
            return newOnes.length ? [...prev, ...newOnes] : prev;
          });
        } else {
          setMessages(data.messages);
        }
        if (data.messages.length > 0) {
          const last = data.messages[data.messages.length - 1];
          setLastMessageTimestamp(last.createdAt);
        }
      }
    } catch (_e) {
      // ignore poll errors
    }
  }, [postId]);

  useEffect(() => {
    if (!postId) return;

    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      const roomId = await fetchRoom();
      if (!mounted || !roomId) {
        setLoading(false);
        return;
      }
      await fetchMessages();
      if (mounted) setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [postId, fetchRoom, fetchMessages]);

  useEffect(() => {
    if (!room || !user || !isPageVisible || wsConnected) return;
    const interval = setInterval(() => fetchMessages(lastMessageTimestamp || undefined), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [room, user, lastMessageTimestamp, fetchMessages, isPageVisible, wsConnected]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !input.trim() || sending) return;

    const content = input.trim();
    setInput('');
    setSending(true);

    try {
      const res = await fetch(`${config.api.baseUrl}/api/posts/${postId}/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content, messageType: 'TEXT' }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to send');
      }
      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) => [...prev, data.message]);
        setLastMessageTimestamp(data.message.createdAt);
        setTimeout(() => scrollToBottom(), 0);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (ts: string) =>
    new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (loading && !room) {
    return (
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
          <FiMessageCircle className="h-5 w-5 text-indigo-500" />
          Post Chat
        </h3>
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
        <FiMessageCircle className="h-5 w-5 text-indigo-500" />
        Post Chat
        {room && (
          <span className="text-sm font-normal text-neutral-500 dark:text-gray-400">
            (history saved · active while this post is open)
          </span>
        )}
      </h3>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/50 overflow-hidden flex flex-col max-h-[420px]">
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[200px] max-h-[320px] relative"
          onScroll={checkAtBottom}
        >
          {messages.length === 0 && !loading ? (
            <p className="text-neutral-500 dark:text-gray-400 text-center py-6 text-sm">
              No messages yet. Be the first to chat about this post.
            </p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.author.id === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`rounded-lg px-3 py-2 max-w-[85%] ${
                    msg.author.id === user?.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-gray-100 border border-neutral-200 dark:border-neutral-700'
                  }`}
                >
                  {msg.author.id !== user?.id && (
                    <div className="flex items-center gap-2 mb-1">
                      <ProfilePicture
                        user={{
                          id: msg.author.id,
                          username: msg.author.username,
                          profilePicture: msg.profile?.profilePicture,
                        } as any}
                        size="sm"
                      />
                      <span className="text-xs font-medium text-neutral-600 dark:text-gray-400">
                        {msg.author.username}
                      </span>
                    </div>
                  )}
                  <div className="text-sm whitespace-pre-wrap break-words">{msg.content}</div>
                  <div
                    className={`text-xs mt-1 ${
                      msg.author.id === user?.id ? 'text-indigo-200' : 'text-neutral-500 dark:text-gray-500'
                    }`}
                  >
                    {formatTime(msg.createdAt)}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
          {showScrollToBottom && (
            <button
              type="button"
              onClick={scrollToBottom}
              className="absolute bottom-3 right-3 p-2 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              aria-label="Scroll to bottom"
            >
              <FiChevronDown className="h-4 w-4" />
            </button>
          )}
        </div>

        {user ? (
          <form onSubmit={sendMessage} className="p-3 border-t border-neutral-200 dark:border-neutral-700 flex gap-2">
            <input
              id="post-chat-message"
              name="postChatMessage"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message..."
              className="flex-1 px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={sending}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              aria-label="Send message"
            >
              {sending ? <LoadingSpinner size="sm" /> : <FiSend className="h-4 w-4" />}
            </button>
          </form>
        ) : (
          <div className="p-3 border-t border-neutral-200 dark:border-neutral-700 text-center text-sm text-neutral-500 dark:text-gray-400">
            <a href="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Sign in
            </a>
            {' to join the chat.'}
          </div>
        )}
      </div>
    </div>
  );
}

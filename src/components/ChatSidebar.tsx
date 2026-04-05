import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthProvider';
import { ApiClient } from '../utils/api';
import { config } from '../utils/config';
import { pickGiphyPreviewUrl, safeGifCaption, type GiphyGif } from '../utils/giphy';
import { Link } from 'react-router-dom';
import { FiSend, FiMessageSquare, FiX, FiMessageCircle, FiSmile, FiImage, FiGrid, FiUsers, FiChevronLeft, FiChevronDown, FiPlusCircle } from 'react-icons/fi';
import type { Team } from '../types';
import { useChatWebSocket } from '../hooks/useChatWebSocket';
import { LoadingSpinner } from './LoadingSpinner';

// Simple emoji data
const EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
  '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
  '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😯', '😦', '😧',
  '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢',
  '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '💩', '👻', '👽',
  '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'
];

interface Message {
  id: string;
  content: string;
  createdAt?: string;
  author: {
    id: string;
    username: string;
    role: string;
  };
}

interface ChatRoomOption {
  id: string;
  name: string;
  type: 'GLOBAL' | 'PRIVATE' | 'GROUP';
  isPublic?: boolean;
  isParticipant?: boolean;
}

type HubView = 'list' | 'chat';
type ChatTarget = { type: 'global'; roomId: string; name: string } | { type: 'room'; id: string; name: string } | { type: 'team'; roomId: string; name: string };

const ChatSidebar: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const [hubView, setHubView] = useState<HubView>('list');
  const [chatTarget, setChatTarget] = useState<ChatTarget | null>(null);
  const [rooms, setRooms] = useState<ChatRoomOption[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifSearch, setShowGifSearch] = useState(false);
  const [gifSearchTerm, setGifSearchTerm] = useState('');
  const [gifResults, setGifResults] = useState<GiphyGif[]>([]);
  const [searchingGifs, setSearchingGifs] = useState(false);
  const [sending, setSending] = useState(false);
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState<string | null>(null);
  const [_isPolling, setIsPolling] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const api = new ApiClient();

  // Focus message input when sidebar is open in chat view (so user can type immediately)
  useEffect(() => {
    if (!open || hubView !== 'chat' || loadingChat) return;
    const t = setTimeout(() => messageInputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, [open, hubView, loadingChat]);

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

  const GIPHY_API_KEY = config.giphy.apiKey;

  const messagesUrl = chatTarget
    ? chatTarget.type === 'global'
      ? '/api/chat/global-chat/messages'
      : `/api/chat/${chatTarget.type === 'room' ? chatTarget.id : chatTarget.roomId}/messages`
    : '';

  const chatRoomId = chatTarget
    ? chatTarget.type === 'global'
      ? chatTarget.roomId
      : chatTarget.type === 'room'
        ? chatTarget.id
        : chatTarget.roomId
    : null;

  const handleWsMessage = useCallback((message: { id: string; content: string; createdAt?: string; author: { id: string; username: string; role: string }; [key: string]: unknown }) => {
    setMessages(prev => {
      if (prev.some(m => m.id === message.id)) return prev;
      return [...prev, message as Message];
    });
    if (message.createdAt) setLastMessageTimestamp(message.createdAt);
  }, []);

  const { connected: wsConnected } = useChatWebSocket(chatTarget && hubView === 'chat' ? chatRoomId : null, handleWsMessage);

  const pollingRef = useRef(false);
  const fetchNewMessages = useCallback(async () => {
    if (!messagesUrl || pollingRef.current) return;
    pollingRef.current = true;
    setIsPolling(true);
    try {
      const url = lastMessageTimestamp ? `${messagesUrl}?limit=30&after=${encodeURIComponent(lastMessageTimestamp)}` : `${messagesUrl}?limit=30`;
      const res = await api.request<{ success: boolean; messages: Message[] }>(url);
      if (res.success && res.messages.length > 0) {
        setMessages(prev => {
          const existingIds = new Set(prev.map(msg => msg.id));
          const newMessages = res.messages.filter(msg => !existingIds.has(msg.id));
          return [...prev, ...newMessages];
        });
        const latest = res.messages[res.messages.length - 1];
        if (latest.createdAt) setLastMessageTimestamp(latest.createdAt);
      }
    } catch (err) {
      console.error('Failed to fetch new messages:', err);
    } finally {
      pollingRef.current = false;
      setIsPolling(false);
    }
  }, [messagesUrl, lastMessageTimestamp, api]);

  useEffect(() => {
    if (!user || !open) return;
    if (hubView !== 'chat' || !chatTarget) return;
    if (wsConnected) return;
    const pollInterval = setInterval(fetchNewMessages, 8000);
    return () => clearInterval(pollInterval);
  }, [user, open, hubView, chatTarget, fetchNewMessages, wsConnected]);

  useEffect(() => {
    if (!open || !user) return;
    const loadHub = async () => {
      try {
        const [chatRes, teamsRes] = await Promise.all([
          api.request<{ success: boolean; rooms: ChatRoomOption[] }>('/api/chat'),
          api.request<{ success: boolean; teams: Team[] }>('/api/teams'),
        ]);
        if (chatRes.success && chatRes.rooms) setRooms(chatRes.rooms);
        if (teamsRes.success && teamsRes.teams) setTeams(teamsRes.teams);
      } catch (err) {
        console.error('Failed to load hub:', err);
      }
    };
    loadHub();
  }, [open, user]);

  const selectGlobal = async () => {
    setLoadingChat(true);
    setHubView('chat');
    setMessages([]);
    setLastMessageTimestamp(null);
    try {
      const joinRes = await api.request<{ success: boolean; roomId?: string }>('/api/chat/global-chat/join', { method: 'POST' });
      const roomId = joinRes.roomId ?? '';
      setChatTarget({ type: 'global', roomId, name: 'Global Chat' });
      const res = await api.request<{ success: boolean; messages: Message[] }>('/api/chat/global-chat/messages?limit=30');
      if (res.success) {
        setMessages(res.messages);
        if (res.messages.length > 0 && res.messages[res.messages.length - 1].createdAt)
          setLastMessageTimestamp(res.messages[res.messages.length - 1].createdAt ?? null);
      }
    } catch (err) {
      console.error('Failed to load global chat:', err);
    } finally {
      setLoadingChat(false);
    }
  };

  const selectRoom = async (room: ChatRoomOption) => {
    setLoadingChat(true);
    setChatTarget({ type: 'room', id: room.id, name: room.name });
    setHubView('chat');
    setMessages([]);
    setLastMessageTimestamp(null);
    try {
      if (!room.isParticipant) {
        await api.request(`/api/chat/${room.id}/join`, { method: 'POST' });
      }
      const res = await api.request<{ success: boolean; messages: Message[] }>(`/api/chat/${room.id}/messages?limit=30`);
      if (res.success) {
        setMessages(res.messages);
        if (res.messages.length > 0 && res.messages[res.messages.length - 1].createdAt)
          setLastMessageTimestamp(res.messages[res.messages.length - 1].createdAt ?? null);
      }
    } catch (err) {
      console.error('Failed to load room:', err);
    } finally {
      setLoadingChat(false);
    }
  };

  const selectTeam = async (team: Team) => {
    setLoadingChat(true);
    setHubView('chat');
    setMessages([]);
    setLastMessageTimestamp(null);
    try {
      if (!team.isMember && team.isPublic) {
        await api.request(`/api/teams/${team.id}/join`, { method: 'POST' });
        setTeams(prev => prev.map(t => (t.id === team.id ? { ...t, isMember: true, role: 'MEMBER' as const } : t)));
      }
      const res = await api.request<{ success: boolean; room?: { id: string; name: string }; tasks?: unknown[] }>(`/api/teams/${team.id}`);
      if (res.success && res.room) {
        setChatTarget({ type: 'team', roomId: res.room.id, name: team.name });
        await api.request(`/api/chat/${res.room.id}/join`, { method: 'POST' });
        const msgRes = await api.request<{ success: boolean; messages: Message[] }>(`/api/chat/${res.room.id}/messages?limit=30`);
        if (msgRes.success) {
          setMessages(msgRes.messages);
          if (msgRes.messages.length > 0 && msgRes.messages[msgRes.messages.length - 1].createdAt)
            setLastMessageTimestamp(msgRes.messages[msgRes.messages.length - 1].createdAt ?? null);
        }
      }
    } catch (err) {
      console.error('Failed to load team chat:', err);
    } finally {
      setLoadingChat(false);
    }
  };

  const backToList = () => {
    setHubView('list');
    setChatTarget(null);
    setMessages([]);
    setLastMessageTimestamp(null);
  };

  const postMessageUrl = chatTarget
    ? chatTarget.type === 'global'
      ? '/api/chat/global-chat/messages'
      : `/api/chat/${chatTarget.type === 'room' ? chatTarget.id : chatTarget.roomId}/messages`
    : '';

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !input.trim() || sending || !postMessageUrl) return;
    const messageContent = input.trim();
    setInput('');
    setSending(true);
    try {
      const response = await api.request<{ success: boolean; message: Message }>(postMessageUrl, {
        method: 'POST',
        body: JSON.stringify({ content: messageContent, messageType: 'TEXT' }),
      });
      if (response.success) {
        setMessages(prev => [...prev, response.message]);
        if (response.message.createdAt) setLastMessageTimestamp(response.message.createdAt);
        setTimeout(() => scrollToBottom(), 0);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const addEmoji = (emoji: string) => {
    setInput(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const searchGifs = async (query: string) => {
    if (!query.trim()) return;
    setSearchingGifs(true);
    try {
      if (!GIPHY_API_KEY || GIPHY_API_KEY === 'dc6zaTOxFJmzC') {
        throw new Error('Invalid or missing GIPHY API key');
      }

      const url = new URL('https://api.giphy.com/v1/gifs/search');
      url.searchParams.set('api_key', GIPHY_API_KEY);
      url.searchParams.set('q', query.trim());
      url.searchParams.set('limit', '24');
      url.searchParams.set('rating', 'g');
      url.searchParams.set('lang', 'en');

      const response = await fetch(url.toString(), { method: 'GET', mode: 'cors' });
      let payload: { data?: GiphyGif[]; meta?: { status?: number; msg?: string } } = {};
      try {
        payload = await response.json();
      } catch {
        throw new Error(`GIPHY API error: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        const msg =
          (payload as { message?: string }).message ||
          payload.meta?.msg ||
          `${response.status} ${response.statusText}`;
        throw new Error(msg);
      }

      if (payload.meta && typeof payload.meta.status === 'number' && payload.meta.status !== 200) {
        throw new Error(payload.meta.msg || `GIPHY error (${payload.meta.status})`);
      }

      const raw = Array.isArray(payload.data) ? payload.data : [];
      const withUrl = raw.filter((g) => pickGiphyPreviewUrl(g));
      setGifResults(withUrl);
    } catch (error) {
      console.error('Error searching GIFs:', error);

      if (error instanceof Error) {
        if (error.message.includes('Invalid or missing GIPHY API key')) {
          alert(
            'GIF search needs a GIPHY key. Add VITE_GIPHY_API_KEY to .env.local (see .env.example) and rebuild, or set it in Cloudflare Pages for production.',
          );
        } else if (error.message.includes('429') || /rate/i.test(error.message)) {
          alert('GIF search rate limited. Please try again in a moment.');
        } else if (error.message.includes('403') || /forbidden|invalid.*key|access denied/i.test(error.message)) {
          alert('GIF search was denied. Check that VITE_GIPHY_API_KEY is a valid key from developers.giphy.com.');
        } else {
          alert(`Failed to search GIFs: ${error.message}`);
        }
      } else {
        alert('Failed to search GIFs. Please try again.');
      }

      setGifResults([]);
    } finally {
      setSearchingGifs(false);
    }
  };

  const sendGif = async (gif: GiphyGif) => {
    if (!user || sending || !postMessageUrl) return;
    const previewUrl = pickGiphyPreviewUrl(gif);
    if (!previewUrl) {
      alert('This GIF could not be loaded (no preview URL). Try another.');
      return;
    }
    setSending(true);
    try {
      const caption = safeGifCaption(gif.title);
      const gifContent = `[GIF: ${caption}](${previewUrl})`;
      const response = await api.request<{ success: boolean; message: Message }>(postMessageUrl, {
        method: 'POST',
        body: JSON.stringify({ content: gifContent, messageType: 'TEXT' }),
      });
      if (response.success) {
        setMessages(prev => [...prev, response.message]);
        if (response.message.createdAt) setLastMessageTimestamp(response.message.createdAt);
        setShowGifSearch(false);
        setGifSearchTerm('');
      }
    } catch (error) {
      console.error('Failed to send GIF:', error);
      alert('Failed to send GIF. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const renderMessageContent = (content: string) => {
    // Check if it's a GIF message
    const gifMatch = content.match(/\[GIF: (.+?)\]\((.+?)\)/);
    if (gifMatch) {
      return (
        <div>
          <img
            src={gifMatch[2]}
            alt={gifMatch[1]}
            className="max-w-full rounded-sm"
            style={{ maxHeight: '200px' }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            onError={(e) => {
              const el = e.currentTarget;
              el.style.display = 'none';
            }}
          />
        </div>
      );
    }
    return <div className="text-sm">{content}</div>;
  };

  if (!user) {
    return null;
  }

  return (
    <>
      {/* Floating Toggle Button (always visible) */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg p-4 flex items-center justify-center focus:outline-hidden focus:ring-2 focus:ring-indigo-400"
          aria-label="Open chat sidebar"
        >
          <FiMessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Sidebar - pt-16 so content starts below the top navbar */}
      <div
        className={`fixed top-0 right-0 h-full z-40 transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'} w-full max-w-[320px] sm:max-w-sm bg-neutral-900 border-l border-neutral-800 shadow-2xl flex flex-col pt-16`}
        style={{ minWidth: '280px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-neutral-800 bg-neutral-900 flex-shrink-0">
          <div className="flex items-center space-x-2 min-w-0">
            {hubView === 'chat' ? (
              <button
                type="button"
                onClick={backToList}
                className="flex-shrink-0 text-neutral-400 hover:text-white p-1 rounded"
                aria-label="Back to list"
              >
                <FiChevronLeft className="h-5 w-5" />
              </button>
            ) : null}
            <FiMessageSquare className="h-5 w-5 text-indigo-400 flex-shrink-0" />
            <span className="font-semibold text-white text-sm sm:text-base truncate">
              {hubView === 'chat' && chatTarget ? chatTarget.name : 'Team Hub'}
            </span>
            {hubView === 'chat' && chatTarget && (
              <div className="flex items-center space-x-1 flex-shrink-0" title={wsConnected ? 'Connected' : 'Connecting…'}>
                <div className={`rounded-full h-2 w-2 flex-shrink-0 ${wsConnected ? 'bg-green-500' : 'animate-pulse bg-amber-500'}`} />
                <span className="text-xs text-neutral-400">{wsConnected ? 'Connected' : 'Connecting…'}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {hubView === 'list' && (
              <Link
                to="/chat"
                className="flex items-center gap-1.5 px-2 py-1.5 rounded text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors text-xs font-medium"
                title="Full page — create teams, rooms, task lists"
              >
                <FiGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Full hub</span>
              </Link>
            )}
            <button
              onClick={() => setOpen(false)}
              className="text-neutral-400 hover:text-white p-1 rounded-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-400"
              aria-label="Close chat sidebar"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>

        {hubView === 'list' ? (
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            <p className="text-xs text-neutral-400">Choose a chat or open the full hub to create teams and rooms.</p>
            <div>
              <button
                type="button"
                onClick={selectGlobal}
                disabled={loadingChat}
                className="w-full flex items-center gap-2 p-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-left text-white transition-colors disabled:opacity-50"
              >
                <FiMessageSquare className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                <span className="font-medium">Global Chat</span>
              </button>
            </div>
            <div>
              <div className="flex items-center justify-between px-1 mb-1">
                <span className="text-xs font-medium text-neutral-400">Rooms</span>
                <Link to="/chat" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                  <FiPlusCircle className="h-3 w-3" /> Create
                </Link>
              </div>
              {(rooms.filter((r) => r.type === 'PRIVATE') as ChatRoomOption[]).length === 0 ? (
                <p className="text-xs text-neutral-500 px-1">No rooms yet. Create one in the full hub.</p>
              ) : (
                <div className="space-y-0.5">
                  {rooms.filter((r) => r.type === 'PRIVATE').map((room) => (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => selectRoom(room)}
                      disabled={loadingChat}
                      className="w-full flex items-center justify-between gap-2 p-2.5 rounded-lg hover:bg-neutral-800 text-left text-white text-sm disabled:opacity-50"
                    >
                      <span className="truncate">{room.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 ${room.isPublic ? 'bg-green-900/50 text-green-300' : 'bg-neutral-700 text-neutral-400'}`}>
                        {room.isPublic ? 'Public' : 'Private'}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between px-1 mb-1">
                <span className="text-xs font-medium text-neutral-400">Teams</span>
                <Link to="/chat" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                  <FiPlusCircle className="h-3 w-3" /> Create
                </Link>
              </div>
              {teams.length === 0 ? (
                <p className="text-xs text-neutral-500 px-1">No teams yet. Create one in the full hub.</p>
              ) : (
                <div className="space-y-0.5">
                  {teams.map((team) => (
                    <button
                      key={team.id}
                      type="button"
                      onClick={() => selectTeam(team)}
                      disabled={loadingChat}
                      className="w-full flex items-center gap-2 p-2.5 rounded-lg hover:bg-neutral-800 text-left text-white text-sm disabled:opacity-50"
                    >
                      <FiUsers className="h-4 w-4 text-neutral-500 flex-shrink-0" />
                      <span className="truncate">{team.name}</span>
                      {team.isMember && <span className="text-[10px] text-neutral-500 flex-shrink-0">In</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
        {loadingChat ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <LoadingSpinner size="md" />
          </div>
        ) : (
        <>
        {/* Messages */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-3 space-y-2 bg-neutral-900 scrollbar-hide relative"
          onScroll={checkAtBottom}
        >
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.author.id === user.id ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`rounded-lg px-3 py-2 shadow-xs wrap-break-word max-w-[85%] ${
                  msg.author.id === user.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-neutral-800 text-neutral-100 border border-neutral-700'
                }`}
              >
                <div className="text-xs font-medium mb-1 text-indigo-200">
                  {msg.author.username}
                </div>
                {renderMessageContent(msg.content)}
              </div>
            </div>
          ))}
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

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="p-3 border-t border-neutral-800 bg-neutral-800">
            <div className="grid grid-cols-8 sm:grid-cols-10 gap-1 max-h-32 overflow-y-auto">
              {EMOJIS.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => addEmoji(emoji)}
                  className="p-1 hover:bg-neutral-700 rounded-sm text-base sm:text-lg"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* GIF Search */}
        {showGifSearch && (
          <div className="p-3 border-t border-neutral-800 bg-neutral-800">
            <div className="flex space-x-2 mb-2">
              <input
                id="chat-sidebar-gif-search"
                name="gifSearch"
                type="text"
                placeholder="Search GIFs..."
                value={gifSearchTerm}
                onChange={(e) => setGifSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void searchGifs(gifSearchTerm);
                  }
                }}
                className="flex-1 px-2 py-1 rounded-sm bg-neutral-700 text-white border border-neutral-600 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-sm"
                autoComplete="off"
              />
              <button
                onClick={() => searchGifs(gifSearchTerm)}
                disabled={searchingGifs}
                className="px-2 sm:px-3 py-1 bg-indigo-600 text-white rounded-sm hover:bg-indigo-500 disabled:opacity-50 text-sm"
              >
                {searchingGifs ? '...' : 'Search'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {gifResults.map((gif) => {
                const thumb = pickGiphyPreviewUrl(gif);
                if (!thumb) return null;
                return (
                  <button
                    key={gif.id}
                    type="button"
                    onClick={() => void sendGif(gif)}
                    className="hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={thumb}
                      alt={safeGifCaption(gif.title)}
                      className="w-full rounded-sm"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </button>
                );
              })}
            </div>
            {gifResults.length === 0 && !searchingGifs && (
              <div className="text-center text-neutral-400 text-sm py-4">
                No GIFs found. Try searching for something else.
              </div>
            )}
          </div>
        )}

        {/* Input */}
        <form onSubmit={sendMessage} className="p-3 border-t border-neutral-800 bg-neutral-900">
          <div className="flex space-x-2 mb-2">
            <button
              type="button"
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
                setShowGifSearch(false);
              }}
              className="text-neutral-400 hover:text-white p-2 rounded-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-400"
            >
              <FiSmile className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setShowGifSearch(!showGifSearch);
                setShowEmojiPicker(false);
              }}
              className="text-neutral-400 hover:text-white p-2 rounded-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-400"
            >
              <FiImage className="h-4 w-4" />
            </button>
          </div>
          <div className="flex space-x-2">
            <input
              ref={messageInputRef}
              id="chat-sidebar-message"
              name="globalChatMessage"
              type="text"
              className="flex-1 px-3 py-2 rounded-sm bg-neutral-800 text-white border border-neutral-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 placeholder-neutral-400 text-sm"
              placeholder="Type a message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              autoComplete="off"
              disabled={sending}
              aria-label="Message"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-600 text-white px-3 py-2 rounded-sm flex items-center justify-center focus:outline-hidden focus:ring-2 focus:ring-indigo-400"
              aria-label="Send message"
            >
              {sending ? (
                <LoadingSpinner size="sm" variant="inverse" label={false} className="min-h-0" />
              ) : (
                <FiSend />
              )}
            </button>
          </div>
        </form>
        </>
        ) }
          </>
        )}
      </div>
    </>
  );
};

export default ChatSidebar; 
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import { api } from '../utils/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { FiSend, FiSmile, FiPaperclip, FiUsers, FiMessageSquare, FiPlusCircle, FiCheckSquare, FiList, FiChevronDown } from 'react-icons/fi';
import type { Team, TeamTask } from '../types';
import { useChatWebSocket, type ChatWsMessagePayload } from '../hooks/useChatWebSocket';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { faviconUrl } from '../utils/faviconUrl';
import { FocusRestoreBoundary } from '../components/FocusRestoreBoundary';
import { ChatMessageBody } from '../components/ChatMessageBody';

interface Message {
  id: string;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  mediaUrl?: string;
  fileName?: string;
  fileSize?: number;
  replyToId?: string;
  isEdited: boolean;
  editedAt?: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
    role: string;
  };
  profile?: {
    profilePicture?: string;
  };
}

interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  type: 'GLOBAL' | 'PRIVATE' | 'GROUP';
  isActive: boolean;
  createdAt: string;
  participantCount?: number;
  isPublic?: boolean;
  isParticipant?: boolean;
}

type ViewMode = 'global' | 'team' | 'room';

function normalizeMessage(m: Message): Message {
  const author = m.author && typeof m.author === 'object'
    ? { id: String(m.author.id), username: String((m.author as { username?: string }).username ?? 'Unknown'), role: String((m.author as { role?: string }).role ?? '') }
    : { id: '', username: 'Unknown', role: '' };
  return {
    ...m,
    author,
    profile: m.profile && typeof m.profile === 'object' ? m.profile : undefined,
  };
}

function mergeChatMessages(prev: Message[], msg: Message): Message[] {
  const n = normalizeMessage(msg);
  const id = String(n.id);
  if (prev.some((m) => String(m.id) === id)) return prev;
  return [...prev, n];
}

const Chat: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('global');
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamTasks, setTeamTasks] = useState<TeamTask[]>([]);
  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');
  const [createTeamLoading, setCreateTeamLoading] = useState(false);
  const [createRoomOpen, setCreateRoomOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDesc, setNewRoomDesc] = useState('');
  const [newRoomPublic, setNewRoomPublic] = useState(true);
  const [createRoomLoading, setCreateRoomLoading] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [hubTab, setHubTab] = useState<'chat' | 'tasks'>('chat');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  const [, setIsPolling] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const messagesRef = useRef<Message[]>([]);
  const lastMessageIdRef = useRef<string | null>(null);
  const pollingInFlightRef = useRef(false);
  messagesRef.current = messages;
  lastMessageIdRef.current = lastMessageId;

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
    const incoming: Message = {
      ...message,
      messageType: (message.messageType as Message['messageType']) ?? 'TEXT',
      isEdited: false,
      createdAt: message.createdAt ?? '',
    } as Message;
    setMessages((prev) => mergeChatMessages(prev, incoming));
    setLastMessageId(message.id);
  }, []);

  const { connected: wsConnected } = useChatWebSocket(
    currentRoom && isJoined && (viewMode !== 'team' || hubTab === 'chat') ? currentRoom.id : null,
    handleWsMessage
  );

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Fetch chat rooms and teams
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await api.request<{ success: boolean; rooms: ChatRoom[] }>('/api/chat');
        if (response.success) {
          setRooms(response.rooms);
          let globalRoom = response.rooms.find((room: ChatRoom) => room.type === 'GLOBAL');
          if (!globalRoom) {
            try {
              await api.request<{ success: boolean }>('/api/chat/global-chat/join', { method: 'POST' });
              const refreshResponse = await api.request<{ success: boolean; rooms: ChatRoom[] }>('/api/chat');
              if (refreshResponse.success) {
                setRooms(refreshResponse.rooms);
                globalRoom = refreshResponse.rooms.find((room: ChatRoom) => room.type === 'GLOBAL');
              }
            } catch (err) {
              console.error('Failed to create global chat room:', err);
            }
          }
          if (globalRoom) setCurrentRoom(globalRoom);
        }
      } catch (err) {
        console.error('Failed to load chat rooms:', err);
        setError('Failed to load chat rooms');
        try {
          await api.request<{ success: boolean }>('/api/chat/global-chat/join', { method: 'POST' });
          const tempGlobalRoom: ChatRoom = {
            id: 'temp-global',
            name: 'Global Chat',
            description: 'Global chat room for all users',
            type: 'GLOBAL',
            isActive: true,
            createdAt: new Date().toISOString(),
          };
          setRooms([tempGlobalRoom]);
          setCurrentRoom(tempGlobalRoom);
        } catch {
          // Fallback failed; leave error state as is
        }
      }
    };

    const fetchTeams = async () => {
      try {
        const res = await api.request<{ success: boolean; teams: Team[] }>('/api/teams');
        if (res.success && res.teams) setTeams(res.teams);
      } catch (err) {
        console.error('Failed to load teams:', err);
      }
    };

    fetchRooms();
    fetchTeams();
  }, []);

  // Fetch messages for current room
  useEffect(() => {
    if (!currentRoom) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        // Use the appropriate endpoint based on room type
        const messagesUrl = currentRoom.type === 'GLOBAL' 
          ? '/api/chat/global-chat/messages'
          : `/api/chat/${currentRoom.id}/messages`;
          
        const response = await api.request<{ success: boolean; messages: Message[] }>(messagesUrl);

        if (response.success) {
          const list = Array.isArray(response.messages) ? response.messages : [];
          const normalized = list.map(normalizeMessage);
          setMessages(normalized);
          if (normalized.length > 0) {
            const lastId = normalized[normalized.length - 1].id;
            setLastMessageId(lastId);
          }
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [currentRoom]);

  // Real-time polling for new messages when WebSocket is not connected
  useEffect(() => {
    if (!currentRoom || !isJoined || !isPageVisible || wsConnected) return;

    const pollInterval = setInterval(async () => {
      const room = currentRoom;
      const currentLastId = lastMessageIdRef.current;
      const currentMessages = messagesRef.current;
      if (!room || pollingInFlightRef.current) return;

      try {
        pollingInFlightRef.current = true;
        setIsPolling(true);
        const lastMessageTimestamp = currentMessages.length > 0 ? currentMessages[currentMessages.length - 1].createdAt : '';
        const baseUrl = room.type === 'GLOBAL'
          ? '/api/chat/global-chat/messages'
          : `/api/chat/${room.id}/messages`;
        const url = lastMessageTimestamp
          ? `${baseUrl}?after=${encodeURIComponent(lastMessageTimestamp)}`
          : baseUrl;

        const response = await api.request<{ success: boolean; messages: Message[] }>(url);

        const list = Array.isArray(response.messages) ? response.messages : [];
        if (response.success && list.length > 0) {
          const normalizedList = list.map(normalizeMessage);
          const lastMessage = normalizedList[normalizedList.length - 1];
          if (currentLastId && lastMessage.id !== currentLastId) {
            const lastKnownIndex = normalizedList.findIndex(msg => msg.id === currentLastId);
            if (lastKnownIndex !== -1) {
              const newMessages = normalizedList.slice(lastKnownIndex + 1);
              setMessages((prev) => {
                const ids = new Set(prev.map((m) => String(m.id)));
                const merged = newMessages.filter((m) => !ids.has(String(m.id)));
                return merged.length ? [...prev, ...merged] : prev;
              });
              setLastMessageId(lastMessage.id);
              if (document.hidden && newMessages.length > 0 && user) {
                const latest = newMessages[newMessages.length - 1];
                if (latest.author?.id !== user.id && 'Notification' in window && Notification.permission === 'granted') {
                  new Notification(`New message in ${room.name}`, {
                    body: `${latest.author?.username ?? 'Someone'}: ${latest.content}`,
                    icon: `${window.location.origin}${faviconUrl}`,
                  });
                }
              }
            } else {
              setMessages(normalizedList);
              setLastMessageId(lastMessage.id);
            }
          } else if (!currentLastId) {
            setLastMessageId(lastMessage.id);
          }
        }
      } catch (_err) {
        // Poll errors are non-fatal; ignore or log in dev
      } finally {
        pollingInFlightRef.current = false;
        setIsPolling(false);
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [currentRoom, isJoined, isPageVisible, user?.id, wsConnected]);

  // Join room when user is authenticated
  useEffect(() => {
    if (user && currentRoom && !isJoined) {
      const joinRoom = async () => {
        try {
          // Use the appropriate endpoint based on room type
          const joinUrl = currentRoom.type === 'GLOBAL' 
            ? '/api/chat/global-chat/join'
            : `/api/chat/${currentRoom.id}/join`;
            
          await api.request<{ success: boolean }>(joinUrl, {
            method: 'POST'
          });
          setIsJoined(true);
          
          // Request notification permission if not already granted
          if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
          }
        } catch (err) {
          console.error('Failed to join room:', err);
        }
      };
      joinRoom();
    }
  }, [user, currentRoom, isJoined]);

  const sendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentRoom || sending) return;

    try {
      setSending(true);
      
      // Use the appropriate endpoint based on room type
      const messageUrl = currentRoom.type === 'GLOBAL' 
        ? '/api/chat/global-chat/messages'
        : `/api/chat/${currentRoom.id}/messages`;
        
      const response = await api.request<{ success: boolean; message: Message }>(messageUrl, {
        method: 'POST',
        body: JSON.stringify({
          content: newMessage.trim(),
          messageType: 'TEXT'
        })
      });

      if (response.success && response.message) {
        setMessages((prev) => mergeChatMessages(prev, response.message));
        setLastMessageId(response.message.id);
        setNewMessage('');
        setTimeout(() => scrollToBottom(), 0);
      }
    } catch (_err) {
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  }, [currentRoom, newMessage, sending, scrollToBottom]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const selectGlobal = () => {
    setViewMode('global');
    setSelectedTeam(null);
    setTeamTasks([]);
    const globalRoom = rooms.find((r) => r.type === 'GLOBAL');
    if (globalRoom) {
      setCurrentRoom(globalRoom);
      setIsJoined(false);
      setLastMessageId(null);
    }
  };

  const selectRoom = (room: ChatRoom) => {
    setViewMode('room');
    setSelectedTeam(null);
    setTeamTasks([]);
    setCurrentRoom(room);
    setIsJoined(!!room.isParticipant);
    setLastMessageId(null);
  };

  const selectTeam = async (team: Team) => {
    setViewMode('team');
    setSelectedTeam(team);
    setHubTab('chat');
    try {
      if (!team.isMember && team.isPublic) {
        await api.request<{ success: boolean }>(`/api/teams/${team.id}/join`, { method: 'POST' });
        setTeams((prev) => prev.map((t) => (t.id === team.id ? { ...t, isMember: true, role: 'MEMBER' as const } : t)));
      }
      const res = await api.request<{ success: boolean; team: Team; members: unknown[]; room: ChatRoom | null; tasks: TeamTask[] }>(`/api/teams/${team.id}`);
      if (res.success) {
        setTeamTasks(res.tasks || []);
        if (res.room) {
          setCurrentRoom({ ...res.room, type: 'GROUP' });
          setIsJoined(false);
          setLastMessageId(null);
        }
      }
    } catch (err) {
      console.error('Failed to load team:', err);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim() || createTeamLoading) return;
    setCreateTeamLoading(true);
    try {
      const res = await api.request<{ success: boolean; team: Team; roomId: string }>('/api/teams', {
        method: 'POST',
        body: JSON.stringify({ name: newTeamName.trim(), description: newTeamDesc.trim() || undefined, isPublic: true }),
      });
      if (res.success && res.team) {
        setTeams((prev) => [{ ...res.team, isMember: true, role: 'ADMIN' }, ...prev]);
        setCreateTeamOpen(false);
        setNewTeamName('');
        setNewTeamDesc('');
        selectTeam(res.team);
      }
    } catch (err) {
      console.error('Create team failed:', err);
    } finally {
      setCreateTeamLoading(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim() || createRoomLoading) return;
    setCreateRoomLoading(true);
    try {
      const res = await api.request<{ success: boolean; room: ChatRoom }>('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          name: newRoomName.trim(),
          description: newRoomDesc.trim() || undefined,
          isPublic: newRoomPublic,
        }),
      });
      if (res.success && res.room) {
        setRooms((prev) => [res.room as ChatRoom, ...prev]);
        setCreateRoomOpen(false);
        setNewRoomName('');
        setNewRoomDesc('');
        setNewRoomPublic(true);
        selectRoom(res.room as ChatRoom);
      }
    } catch (err) {
      console.error('Create room failed:', err);
    } finally {
      setCreateRoomLoading(false);
    }
  };

  const refreshTeamTasks = useCallback(async () => {
    if (!selectedTeam) return;
    try {
      const res = await api.request<{ success: boolean; tasks: TeamTask[] }>(`/api/teams/${selectedTeam.id}/tasks`);
      if (res.success && res.tasks) setTeamTasks(res.tasks);
    } catch {
      // Ignore fetch errors for task refresh
    }
  }, [selectedTeam?.id]);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam || !newTaskTitle.trim()) return;
    try {
      const res = await api.request<{ success: boolean; task: TeamTask }>(`/api/teams/${selectedTeam.id}/tasks`, {
        method: 'POST',
        body: JSON.stringify({ title: newTaskTitle.trim(), status: 'TODO' }),
      });
      if (res.success && res.task) {
        setTeamTasks((prev) => [...prev, res.task]);
        setNewTaskTitle('');
      }
    } catch (err) {
      console.error('Add task failed:', err);
    }
  };

  const updateTaskStatus = async (task: TeamTask, status: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    if (!selectedTeam) return;
    try {
      const res = await api.request<{ success: boolean; task: TeamTask }>(`/api/teams/${selectedTeam.id}/tasks/${task.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      if (res.success && res.task) setTeamTasks((prev) => prev.map((t) => (t.id === task.id ? res.task : t)));
    } catch {
      // Ignore patch errors; UI state unchanged
    }
  };

  useEscapeKey(createTeamOpen, () => { if (!createTeamLoading) setCreateTeamOpen(false); });
  useEscapeKey(createRoomOpen, () => { if (!createRoomLoading) setCreateRoomOpen(false); });

  if (!user) {
    return (
      <div className="flex min-h-[50vh] flex-1 items-center justify-center px-4 py-8">
        <div className="text-center">
          <FiMessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Team Hub</h2>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            Sign in to use global chat, create teams, and manage task lists with others.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-gray-50 dark:bg-neutral-900 @xl/main:flex-row">
        {/* Sidebar: Team Hub (Global + Teams) */}
        <div className="flex max-h-[44vh] w-full min-h-0 shrink-0 flex-col border-b border-gray-200 bg-white dark:border-neutral-700 dark:bg-neutral-800 @xl/main:max-h-none @xl/main:h-auto @xl/main:w-72 @xl/main:max-w-[min(20rem,42%)] @xl/main:border-b-0 @xl/main:border-r @2xl/main:w-80">
          <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Team Hub</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Chat together, create teams, and manage task lists</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              <div
                onClick={selectGlobal}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  viewMode === 'global' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200' : 'hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-900 dark:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FiMessageSquare className="h-5 w-5" />
                  <span className="font-medium">Global Chat</span>
                </div>
              </div>
            </div>
            {/* Public/private chat rooms */}
            <div className="px-2 pt-4 pb-2">
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Rooms</span>
                <button
                  type="button"
                  onClick={() => setCreateRoomOpen(true)}
                  className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
                >
                  <FiPlusCircle className="h-4 w-4" /> Create
                </button>
              </div>
              {(rooms.filter((r) => r.type === 'PRIVATE') as ChatRoom[]).length === 0 ? (
                <p className="px-2 text-xs text-gray-500 dark:text-gray-400">Create a public or private room to chat with others.</p>
              ) : (
                (rooms.filter((r) => r.type === 'PRIVATE') as ChatRoom[]).map((room) => (
                  <div
                    key={room.id}
                    onClick={() => selectRoom(room)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      viewMode === 'room' && currentRoom?.id === room.id
                        ? 'bg-indigo-100 dark:bg-indigo-900/30'
                        : 'hover:bg-gray-100 dark:hover:bg-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-gray-900 dark:text-white truncate">{room.name}</span>
                      {room.isParticipant && <FiUsers className="h-4 w-4 text-gray-400 flex-shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${room.isPublic ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-200 text-gray-600 dark:bg-neutral-600 dark:text-neutral-300'}`}>
                        {room.isPublic ? 'Public' : 'Private'}
                      </span>
                      {typeof room.participantCount === 'number' && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">{room.participantCount} in room</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="px-2 pt-4 pb-2">
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Teams</span>
                <button
                  type="button"
                  onClick={() => setCreateTeamOpen(true)}
                  className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
                >
                  <FiPlusCircle className="h-4 w-4" /> Create
                </button>
              </div>
              {teams.length === 0 ? (
                <div className="px-2 space-y-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Create a team to collaborate, chat in a private room, and share task lists.</p>
                  <button
                    type="button"
                    onClick={() => setCreateTeamOpen(true)}
                    className="w-full py-2.5 px-3 rounded-lg border border-dashed border-indigo-300 dark:border-indigo-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <FiPlusCircle className="h-4 w-4" /> Create your first team
                  </button>
                </div>
              ) : (
                teams.map((team) => (
                  <div
                    key={team.id}
                    onClick={() => selectTeam(team)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      viewMode === 'team' && selectedTeam?.id === team.id
                        ? 'bg-indigo-100 dark:bg-indigo-900/30'
                        : 'hover:bg-gray-100 dark:hover:bg-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 dark:text-white truncate">{team.name}</span>
                      {team.isMember && <FiUsers className="h-4 w-4 text-gray-400 flex-shrink-0" />}
                    </div>
                    {!team.isMember && team.isPublic && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">Public · click to join</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Create Team Modal */}
        {createTeamOpen && (
          <FocusRestoreBoundary>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => !createTeamLoading && setCreateTeamOpen(false)}>
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create team</h3>
              <form onSubmit={handleCreateTeam}>
                <label htmlFor="create-team-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  id="create-team-name"
                  name="teamName"
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Team name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-gray-900 dark:text-white mb-3"
                  required
                />
                <label htmlFor="create-team-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (optional)</label>
                <textarea
                  id="create-team-description"
                  name="teamDescription"
                  value={newTeamDesc}
                  onChange={(e) => setNewTeamDesc(e.target.value)}
                  placeholder="Short description"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-gray-900 dark:text-white mb-4"
                />
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => setCreateTeamOpen(false)} disabled={createTeamLoading} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg">
                    Cancel
                  </button>
                  <button type="submit" disabled={createTeamLoading || !newTeamName.trim()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                    {createTeamLoading ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
          </FocusRestoreBoundary>
        )}

        {/* Create Room Modal (public/private chat room) */}
        {createRoomOpen && (
          <FocusRestoreBoundary>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => !createRoomLoading && setCreateRoomOpen(false)}>
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create chat room</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Create a public room (anyone can find and join) or a private room (invite by link).</p>
              <form onSubmit={handleCreateRoom}>
                <label htmlFor="create-room-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  id="create-room-name"
                  name="roomName"
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Room name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-gray-900 dark:text-white mb-3"
                  required
                />
                <label htmlFor="create-room-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (optional)</label>
                <textarea
                  id="create-room-description"
                  name="roomDescription"
                  value={newRoomDesc}
                  onChange={(e) => setNewRoomDesc(e.target.value)}
                  placeholder="Short description"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-gray-900 dark:text-white mb-3"
                />
                <div className="flex items-center gap-2 mb-4">
                  <input
                    id="create-room-public"
                    name="roomPublic"
                    type="checkbox"
                    checked={newRoomPublic}
                    onChange={(e) => setNewRoomPublic(e.target.checked)}
                    className="rounded border-gray-300 dark:border-neutral-600 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="create-room-public" className="text-sm text-gray-700 dark:text-gray-300">
                    Public room (discoverable in hub; anyone can join)
                  </label>
                </div>
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => setCreateRoomOpen(false)} disabled={createRoomLoading} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg">
                    Cancel
                  </button>
                  <button type="submit" disabled={createRoomLoading || !newRoomName.trim()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                    {createRoomLoading ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
          </FocusRestoreBoundary>
        )}

        {/* Chat / Team Area */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {currentRoom || (viewMode === 'team' && selectedTeam) ? (
            <>
              {/* Header: room name + team tabs when team selected */}
              <div className="bg-white dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center space-x-2">
                    <h2 className="truncate text-lg font-semibold text-gray-900 dark:text-white">
                      {viewMode === 'team' && selectedTeam ? selectedTeam.name : currentRoom?.name}
                    </h2>
                    {viewMode === 'room' && currentRoom && (
                      <span className={`text-xs px-1.5 py-0.5 rounded ${currentRoom.isPublic ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-200 text-gray-600 dark:bg-neutral-600 dark:text-neutral-300'}`}>
                        {currentRoom.isPublic ? 'Public' : 'Private'}
                      </span>
                    )}
                    {currentRoom && isJoined && (
                      <div className="flex items-center space-x-1">
                        {isPageVisible ? (
                          <><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /><span className="text-xs text-green-600">Live</span></>
                        ) : (
                          <><div className="w-2 h-2 bg-yellow-500 rounded-full" /><span className="text-xs text-yellow-600">Paused</span></>
                        )}
                      </div>
                    )}
                  </div>
                  {viewMode === 'team' && selectedTeam && (
                    <div className="flex rounded-lg border border-gray-200 dark:border-neutral-600 p-0.5">
                      <button
                        type="button"
                        onClick={() => setHubTab('chat')}
                        className={`px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1.5 ${hubTab === 'chat' ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-700'}`}
                      >
                        <FiMessageSquare className="h-4 w-4" /> Chat
                      </button>
                      <button
                        type="button"
                        onClick={() => { setHubTab('tasks'); refreshTeamTasks(); }}
                        className={`px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1.5 ${hubTab === 'tasks' ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-700'}`}
                      >
                        <FiList className="h-4 w-4" /> Tasks
                      </button>
                    </div>
                  )}
                </div>
                {currentRoom?.description && viewMode !== 'team' && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{currentRoom.description}</p>
                )}
              </div>

              {/* Content: Chat messages OR Team tasks */}
              {viewMode === 'team' && hubTab === 'tasks' ? (
                <div className="min-h-0 flex-1 overflow-y-auto p-4">
                  <div className="mx-auto max-w-2xl">
                    <form onSubmit={addTask} className="mb-4 flex flex-col gap-2 @xl/main:flex-row @xl/main:items-stretch">
                      <input
                        id="hub-new-task-title"
                        name="newTaskTitle"
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="New task..."
                        className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
                      />
                      <button type="submit" disabled={!newTaskTitle.trim()} className="flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50 @xl/main:w-auto">
                        <FiPlusCircle className="h-4 w-4" /> Add
                      </button>
                    </form>
                    <ul className="space-y-2">
                      {teamTasks.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">No tasks yet. Add one above.</p>
                      ) : (
                        teamTasks.map((task) => (
                          <li
                            key={task.id}
                            className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700"
                          >
                            <button
                              type="button"
                              onClick={() => updateTaskStatus(task, task.status === 'DONE' ? 'TODO' : 'DONE')}
                              className="flex-shrink-0 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                              title={task.status === 'DONE' ? 'Mark not done' : 'Mark done'}
                            >
                              <FiCheckSquare className={`h-5 w-5 ${task.status === 'DONE' ? 'text-green-500' : ''}`} />
                            </button>
                            <div className="flex-1 min-w-0">
                              <span className={`font-medium text-gray-900 dark:text-white ${task.status === 'DONE' ? 'line-through opacity-70' : ''}`}>
                                {task.title}
                              </span>
                              {task.description && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{task.description}</p>
                              )}
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{task.status.replace('_', ' ')}</span>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>
              ) : (
                <>
              <div
                ref={messagesContainerRef}
                className="relative min-h-0 flex-1 space-y-4 overflow-y-auto p-4"
                onScroll={checkAtBottom}
              >
                {loading ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="flex justify-start">
                      <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-neutral-600 flex-shrink-0" />
                      <div className="ml-2 h-12 w-64 bg-gray-200 dark:bg-neutral-600 rounded-lg rounded-tl-none" />
                    </div>
                    <div className="flex justify-end">
                      <div className="h-12 w-48 bg-indigo-200 dark:bg-indigo-900/40 rounded-lg rounded-tr-none" />
                    </div>
                    <div className="flex justify-start">
                      <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-neutral-600 flex-shrink-0" />
                      <div className="ml-2 h-10 w-72 bg-gray-200 dark:bg-neutral-600 rounded-lg rounded-tl-none" />
                    </div>
                    <div className="flex justify-center">
                      <LoadingSpinner size="sm" />
                    </div>
                  </div>
                ) : error ? (
                  <ErrorMessage message={error} />
                ) : (
                  <>
                    {messages.map((message, index) => {
                      const author = message.author ?? { id: '', username: 'Unknown', role: '' }
                      const isOwn = user && author.id === user.id
                      const showDate = index === 0 ||
                        formatDate(message.createdAt) !== formatDate(messages[index - 1]?.createdAt);

                      return (
                        <div key={message.id}>
                          {showDate && (
                            <div className="flex justify-center my-4">
                              <span className="bg-gray-100 dark:bg-neutral-700 text-gray-600 dark:text-neutral-300 text-xs px-3 py-1 rounded-full">
                                {formatDate(message.createdAt)}
                              </span>
                            </div>
                          )}

                          <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <div className={`min-w-0 max-w-[min(100%,20rem)] break-words @sm/main:max-w-xs @5xl/main:max-w-md ${
                              isOwn
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-600'
                            } rounded-lg px-4 py-2 shadow-xs`}>
                              {!isOwn && (
                                <div className="flex items-center space-x-2 mb-1">
                                  {message.profile?.profilePicture ? (
                                    <img
                                      src={message.profile.profilePicture}
                                      alt={author.username}
                                      className="w-6 h-6 rounded-full"
                                    />
                                  ) : (
                                    <div className="w-6 h-6 bg-gray-300 dark:bg-neutral-600 rounded-full flex items-center justify-center">
                                      <span className="text-xs text-gray-600 dark:text-neutral-300">
                                        {(author.username || '?').charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                  <span className="text-xs font-medium text-gray-600 dark:text-neutral-300">
                                    {author.username}
                                  </span>
                                </div>
                              )}

                              <div
                                className={`text-sm ${isOwn ? 'text-white' : 'text-neutral-900 dark:text-neutral-100'}`}
                              >
                                <ChatMessageBody
                                  content={message.content}
                                  className={isOwn ? 'text-white' : 'text-neutral-900 dark:text-neutral-100'}
                                />
                                {message.isEdited && (
                                  <span className="text-xs opacity-70 ml-2">(edited)</span>
                                )}
                              </div>

                              <div className={`text-xs mt-1 ${isOwn ? 'text-indigo-200' : 'text-gray-400 dark:text-neutral-400'}`}>
                                {formatTime(message.createdAt)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
                {showScrollToBottom && (
                  <button
                    type="button"
                    onClick={scrollToBottom}
                    className="absolute bottom-4 right-4 p-2 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    aria-label="Scroll to bottom"
                  >
                    <FiChevronDown className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Message Input (only when showing chat) */}
              {(!(viewMode === 'team' && hubTab === 'tasks')) && (
                <div className="bg-white dark:bg-neutral-800 border-t border-gray-200 dark:border-neutral-700 p-4">
                  <form onSubmit={sendMessage} className="flex min-w-0 gap-2">
                    <div className="relative min-w-0 flex-1">
                      <input
                        id="hub-chat-message"
                        name="chatMessage"
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        disabled={sending}
                        autoComplete="off"
                      />
                      <div className="absolute right-2 top-2 flex space-x-1">
                        <button type="button" className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                          <FiSmile className="h-4 w-4" />
                        </button>
                        <button type="button" className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                          <FiPaperclip className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {sending ? <LoadingSpinner size="sm" /> : <FiSend className="h-4 w-4" />}
                    </button>
                  </form>
                </div>
              )}
                </>
              )}
              </>
          ) : (
            <div className="flex min-h-0 flex-1 items-center justify-center p-8">
              <div className="max-w-sm text-center">
                <FiMessageSquare className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Team Hub</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Pick <strong>Global Chat</strong>, create a <strong>Room</strong> (public or private), or create a <strong>Team</strong> for a shared chat and task list.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => setCreateRoomOpen(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
                  >
                    Create a room
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateTeamOpen(true)}
                    className="px-4 py-2 border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 text-sm font-medium"
                  >
                    Create a team
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
  );
};

export default Chat; 
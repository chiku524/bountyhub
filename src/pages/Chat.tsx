import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthProvider';
import { api } from '../utils/api';
import Layout from '../components/Layout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { FiSend, FiSmile, FiPaperclip, FiUsers, FiMessageSquare } from 'react-icons/fi';

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
}

const Chat: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  // Fetch chat rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await api.request<{ success: boolean; rooms: ChatRoom[] }>('/api/chat');
        if (response.success) {
          setRooms(response.rooms);
          // Set global chat as default room
          let globalRoom = response.rooms.find((room: ChatRoom) => room.type === 'GLOBAL');
          
          // If no global room exists, create one by joining it
          if (!globalRoom) {
            console.log('No global chat room found, creating one...');
            try {
              await api.request<{ success: boolean }>('/api/chat/global-chat/join', {
                method: 'POST'
              });
              // Fetch rooms again to get the newly created global room
              const refreshResponse = await api.request<{ success: boolean; rooms: ChatRoom[] }>('/api/chat');
              if (refreshResponse.success) {
                setRooms(refreshResponse.rooms);
                globalRoom = refreshResponse.rooms.find((room: ChatRoom) => room.type === 'GLOBAL');
              }
            } catch (err) {
              console.error('Failed to create global chat room:', err);
            }
          }
          
          if (globalRoom) {
            setCurrentRoom(globalRoom);
          }
        }
      } catch (err) {
        console.error('Failed to load chat rooms:', err);
        setError('Failed to load chat rooms');
        
        // Fallback: try to create a global chat room even if room fetch failed
        try {
          console.log('Attempting fallback global chat room creation...');
          await api.request<{ success: boolean }>('/api/chat/global-chat/join', {
            method: 'POST'
          });
          // Create a temporary global room object
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
        } catch (fallbackErr) {
          console.error('Fallback global chat room creation failed:', fallbackErr);
        }
      }
    };

    fetchRooms();
  }, []);

  // Fetch messages for current room
  useEffect(() => {
    if (!currentRoom) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        console.log('Fetching messages for room:', currentRoom.id, 'type:', currentRoom.type);
        
        // Use the appropriate endpoint based on room type
        const messagesUrl = currentRoom.type === 'GLOBAL' 
          ? '/api/chat/global-chat/messages'
          : `/api/chat/${currentRoom.id}/messages`;
          
        const response = await api.request<{ success: boolean; messages: Message[] }>(messagesUrl);
        console.log('Initial messages response:', { 
          success: response.success, 
          messageCount: response.messages?.length || 0 
        });
        
        if (response.success) {
          setMessages(response.messages);
          // Set the last message ID for polling
          if (response.messages.length > 0) {
            const lastId = response.messages[response.messages.length - 1].id;
            console.log('Setting initial last message ID:', lastId);
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

  // Real-time polling for new messages
  useEffect(() => {
    console.log('Polling effect triggered:', { 
      currentRoom: currentRoom?.id, 
      isJoined, 
      isPolling, 
      isPageVisible,
      lastMessageId,
      messagesCount: messages.length 
    });
    
    if (!currentRoom || !isJoined || isPolling || !isPageVisible) {
      console.log('Polling skipped:', { 
        noCurrentRoom: !currentRoom, 
        notJoined: !isJoined, 
        isPolling, 
        notVisible: !isPageVisible 
      });
      return;
    }

    console.log('Starting polling for room:', currentRoom.id);
    const pollInterval = setInterval(async () => {
      try {
        setIsPolling(true);
        console.log(`[${new Date().toLocaleTimeString()}] Polling for new messages...`);
        
        // Only fetch messages after the last message timestamp to reduce data transfer
        const lastMessageTimestamp = messages.length > 0 ? messages[messages.length - 1].createdAt : '';
        
        // Use the appropriate endpoint based on room type
        const baseUrl = currentRoom.type === 'GLOBAL' 
          ? '/api/chat/global-chat/messages'
          : `/api/chat/${currentRoom.id}/messages`;
          
        const url = lastMessageTimestamp 
          ? `${baseUrl}?after=${encodeURIComponent(lastMessageTimestamp)}`
          : baseUrl;
        
        const response = await api.request<{ success: boolean; messages: Message[] }>(url);
        
        if (response.success && response.messages.length > 0) {
          // Check if there are new messages
          const lastMessage = response.messages[response.messages.length - 1];
          if (lastMessageId && lastMessage.id !== lastMessageId) {
            console.log(`[${new Date().toLocaleTimeString()}] New messages detected:`, { 
              lastKnownId: lastMessageId, 
              newLastId: lastMessage.id 
            });
            // Find the index of the last known message
            const lastKnownIndex = response.messages.findIndex(msg => msg.id === lastMessageId);
            if (lastKnownIndex !== -1) {
              // Get only the new messages
              const newMessages = response.messages.slice(lastKnownIndex + 1);
              console.log(`[${new Date().toLocaleTimeString()}] Adding new messages:`, newMessages.length);
              setMessages(prev => [...prev, ...newMessages]);
              setLastMessageId(lastMessage.id);
              
              // Show notification if page is not visible
              if (!isPageVisible && newMessages.length > 0) {
                const latestMessage = newMessages[newMessages.length - 1];
                if (latestMessage.author.id !== user?.id) {
                  // Show browser notification
                  if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification(`New message in ${currentRoom.name}`, {
                      body: `${latestMessage.author.username}: ${latestMessage.content}`,
                      icon: '/favicon.ico'
                    });
                  }
                }
              }
            } else {
              // If we can't find the last message, refresh all messages
              console.log(`[${new Date().toLocaleTimeString()}] Last message not found, refreshing all messages`);
              setMessages(response.messages);
              setLastMessageId(lastMessage.id);
            }
          } else if (!lastMessageId) {
            // First time loading, set the last message ID
            console.log(`[${new Date().toLocaleTimeString()}] Setting initial last message ID:`, lastMessage.id);
            setLastMessageId(lastMessage.id);
          }
        } else {
          console.log(`[${new Date().toLocaleTimeString()}] No new messages found`);
        }
      } catch (err) {
        console.error(`[${new Date().toLocaleTimeString()}] Error polling for new messages:`, err);
      } finally {
        setIsPolling(false);
      }
    }, 3000); // Poll every 3 seconds

    return () => {
      console.log('Clearing polling interval for room:', currentRoom.id);
      clearInterval(pollInterval);
    };
  }, [currentRoom, isJoined, lastMessageId, isPolling, messages, isPageVisible, user?.id]);

  // Join room when user is authenticated
  useEffect(() => {
    if (user && currentRoom && !isJoined) {
      const joinRoom = async () => {
        try {
          console.log('Attempting to join room:', currentRoom.id, 'type:', currentRoom.type);
          
          // Use the appropriate endpoint based on room type
          const joinUrl = currentRoom.type === 'GLOBAL' 
            ? '/api/chat/global-chat/join'
            : `/api/chat/${currentRoom.id}/join`;
            
          await api.request<{ success: boolean }>(joinUrl, {
            method: 'POST'
          });
          console.log('Successfully joined room:', currentRoom.id);
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

      if (response.success) {
        setMessages(prev => [...prev, response.message]);
        setLastMessageId(response.message.id);
        setNewMessage('');
      }
    } catch (err) {
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  }, [currentRoom, newMessage, sending]);

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

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <FiMessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Join the Conversation</h2>
            <p className="text-gray-600 mb-4">Please log in to participate in the global chat.</p>
            <a
              href="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Sign In
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-900">Chat Rooms</h1>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {rooms.map((room) => (
              <div
                key={room.id}
                onClick={() => {
                  setCurrentRoom(room);
                  setIsJoined(false);
                  setLastMessageId(null);
                  setIsPolling(false);
                }}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  currentRoom?.id === room.id ? 'bg-indigo-50 border-indigo-200' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{room.name}</h3>
                    {room.description && (
                      <p className="text-sm text-gray-500 mt-1">{room.description}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiUsers className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {room.participantCount || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {currentRoom ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-semibold text-gray-900">{currentRoom.name}</h2>
                    {isJoined && (
                      <div className="flex items-center space-x-1">
                        {isPageVisible ? (
                          <>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-green-600">Live</span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span className="text-xs text-yellow-600">Paused</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiUsers className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {currentRoom.participantCount || 0} participants
                    </span>
                  </div>
                </div>
                {currentRoom.description && (
                  <p className="text-sm text-gray-500 mt-1">{currentRoom.description}</p>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <LoadingSpinner />
                  </div>
                ) : error ? (
                  <ErrorMessage message={error} />
                ) : (
                  <>
                    {messages.map((message, index) => {
                      const showDate = index === 0 || 
                        formatDate(message.createdAt) !== formatDate(messages[index - 1]?.createdAt);
                      
                      return (
                        <div key={message.id}>
                          {showDate && (
                            <div className="flex justify-center my-4">
                              <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                                {formatDate(message.createdAt)}
                              </span>
                            </div>
                          )}
                          
                          <div className={`flex ${message.author.id === user.id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md ${
                              message.author.id === user.id 
                                ? 'bg-indigo-600 text-white' 
                                : 'bg-white border border-gray-200'
                            } rounded-lg px-4 py-2 shadow-sm`}>
                              {message.author.id !== user.id && (
                                <div className="flex items-center space-x-2 mb-1">
                                  {message.profile?.profilePicture ? (
                                    <img
                                      src={message.profile.profilePicture}
                                      alt={message.author.username}
                                      className="w-6 h-6 rounded-full"
                                    />
                                  ) : (
                                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                                      <span className="text-xs text-gray-600">
                                        {message.author.username.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                  <span className="text-xs font-medium text-gray-600">
                                    {message.author.username}
                                  </span>
                                </div>
                              )}
                              
                              <div className="text-sm">
                                {message.content}
                                {message.isEdited && (
                                  <span className="text-xs opacity-70 ml-2">(edited)</span>
                                )}
                              </div>
                              
                              <div className={`text-xs mt-1 ${
                                message.author.id === user.id ? 'text-indigo-200' : 'text-gray-400'
                              }`}>
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
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 p-4">
                <form onSubmit={sendMessage} className="flex space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      disabled={sending}
                    />
                    <div className="absolute right-2 top-2 flex space-x-1">
                      <button
                        type="button"
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <FiSmile className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <FiPaperclip className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {sending ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <FiSend className="h-4 w-4" />
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FiMessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Select a Chat Room</h2>
                <p className="text-gray-600">Choose a room from the sidebar to start chatting.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Chat; 
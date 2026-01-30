import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthProvider';
import { ApiClient } from '../utils/api';
import { config } from '../utils/config';
import { FiSend, FiMessageSquare, FiX, FiMessageCircle, FiSmile, FiImage } from 'react-icons/fi';

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

interface GifResult {
  id: string;
  title: string;
  images: {
    fixed_height: {
      url: string;
    };
  };
}

const ChatSidebar: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifSearch, setShowGifSearch] = useState(false);
  const [gifSearchTerm, setGifSearchTerm] = useState('');
  const [gifResults, setGifResults] = useState<GifResult[]>([]);
  const [searchingGifs, setSearchingGifs] = useState(false);
  const [sending, setSending] = useState(false);
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const api = new ApiClient();

  // Use GIPHY API key from config
  const GIPHY_API_KEY = config.giphy.apiKey;

  // Function to fetch new messages
  const fetchNewMessages = async () => {
    if (isPolling) return; // Prevent concurrent requests
    
    setIsPolling(true);
    try {
      const res = await api.request<{ success: boolean; messages: Message[] }>(
        `/api/chat/global-chat/messages?limit=30${lastMessageTimestamp ? `&after=${lastMessageTimestamp}` : ''}`
      );
      if (res.success && res.messages.length > 0) {
        setMessages(prev => {
          // Filter out duplicates and add new messages
          const existingIds = new Set(prev.map(msg => msg.id));
          const newMessages = res.messages.filter(msg => !existingIds.has(msg.id));
          return [...prev, ...newMessages];
        });
        
        // Update last message timestamp
        const latestMessage = res.messages[res.messages.length - 1];
        if (latestMessage.createdAt) {
          setLastMessageTimestamp(latestMessage.createdAt);
        }
      }
    } catch (error) {
      console.error('Failed to fetch new messages:', error);
    } finally {
      setIsPolling(false);
    }
  };

  useEffect(() => {
    // Fetch initial messages and join global chat room
    const initializeChat = async () => {
      try {
        // Join global chat room
        await api.request('/api/chat/global-chat/join', {
          method: 'POST'
        });
        
        // Load recent messages
        const res = await api.request<{ success: boolean; messages: Message[] }>('/api/chat/global-chat/messages?limit=30');
        if (res.success) {
          setMessages(res.messages);
          
          // Set initial timestamp for polling
          if (res.messages.length > 0) {
            const latestMessage = res.messages[res.messages.length - 1];
            if (latestMessage.createdAt) {
              setLastMessageTimestamp(latestMessage.createdAt);
            }
          }
        }
      } catch (error) {
        console.error('Failed to initialize chat:', error);
      }
    };

    if (user) {
      initializeChat();
    }
  }, [user]);

  // Set up polling for new messages when chat is open
  useEffect(() => {
    if (!user || !open) return;

    // Poll for new messages every 2 seconds when chat is open
    const pollInterval = setInterval(fetchNewMessages, 2000);

    return () => clearInterval(pollInterval);
  }, [user, open, lastMessageTimestamp]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !input.trim() || sending) return;

    const messageContent = input.trim();
    setInput('');
    setSending(true);

    try {
      const response = await api.request<{ success: boolean; message: Message }>('/api/chat/global-chat/messages', {
        method: 'POST',
        body: JSON.stringify({
          content: messageContent,
          messageType: 'TEXT'
        })
      });
      
      if (response.success) {
        setMessages(prev => [...prev, response.message]);
        
        // Update last message timestamp for polling
        if (response.message.createdAt) {
          setLastMessageTimestamp(response.message.createdAt);
        }
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
      // Validate API key
      if (!GIPHY_API_KEY || GIPHY_API_KEY === 'dc6zaTOxFJmzC') {
        throw new Error('Invalid or missing GIPHY API key');
      }
      
      // Use GIPHY API with real key
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=20&rating=g`
      );
      
      if (!response.ok) {
        throw new Error(`GIPHY API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.data && Array.isArray(data.data)) {
        setGifResults(data.data);
      } else {
        setGifResults([]);
      }
    } catch (error) {
      console.error('Error searching GIFs:', error);
      
      // Show more specific error message
      if (error instanceof Error) {
        if (error.message.includes('Invalid or missing GIPHY API key')) {
          alert('GIPHY API key not configured. Please check your environment variables.');
        } else if (error.message.includes('429')) {
          alert('GIF search rate limited. Please try again in a moment.');
        } else if (error.message.includes('403')) {
          alert('GIF search access denied. Please check your API key.');
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

  const sendGif = async (gif: GifResult) => {
    if (!user || sending) return;

    setSending(true);
    try {
      const gifContent = `[GIF: ${gif.title}](${gif.images.fixed_height.url})`;
      const response = await api.request<{ success: boolean; message: Message }>('/api/chat/global-chat/messages', {
        method: 'POST',
        body: JSON.stringify({
          content: gifContent,
          messageType: 'TEXT'
        })
      });
      
      if (response.success) {
        setMessages(prev => [...prev, response.message]);
        
        // Update last message timestamp for polling
        if (response.message.createdAt) {
          setLastMessageTimestamp(response.message.createdAt);
        }
        
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

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full z-40 transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'} w-full max-w-[320px] sm:max-w-sm bg-neutral-900 border-l border-neutral-800 shadow-2xl flex flex-col`}
        style={{ minWidth: '280px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-neutral-800 bg-neutral-900">
          <div className="flex items-center space-x-2">
            <FiMessageSquare className="h-5 w-5 text-indigo-400" />
            <span className="font-semibold text-white text-sm sm:text-base">Global Chat</span>
            {isPolling && (
              <div className="flex items-center space-x-1">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-indigo-400"></div>
                <span className="text-xs text-neutral-400">Live</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-neutral-400 hover:text-white p-1 rounded-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-400"
            aria-label="Close chat sidebar"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-neutral-900">
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
                type="text"
                placeholder="Search GIFs..."
                value={gifSearchTerm}
                onChange={(e) => setGifSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchGifs(gifSearchTerm)}
                className="flex-1 px-2 py-1 rounded-sm bg-neutral-700 text-white border border-neutral-600 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-sm"
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
              {gifResults.map((gif) => (
                <button
                  key={gif.id}
                  onClick={() => sendGif(gif)}
                  className="hover:opacity-80 transition-opacity"
                >
                  <img
                    src={gif.images.fixed_height.url}
                    alt={gif.title}
                    className="w-full rounded-sm"
                  />
                </button>
              ))}
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
              type="text"
              className="flex-1 px-3 py-2 rounded-sm bg-neutral-800 text-white border border-neutral-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 placeholder-neutral-400 text-sm"
              placeholder="Type a message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              autoComplete="off"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-600 text-white px-3 py-2 rounded-sm flex items-center justify-center focus:outline-hidden focus:ring-2 focus:ring-indigo-400"
              aria-label="Send message"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <FiSend />
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ChatSidebar; 
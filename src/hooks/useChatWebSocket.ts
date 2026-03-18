import { useEffect, useRef, useState } from 'react';
import { getChatWsUrl } from '../utils/config';

export interface ChatWsMessagePayload {
  id: string;
  content: string;
  messageType?: string;
  createdAt: string;
  author: { id: string; username: string; role: string };
  profile?: { profilePicture?: string };
  [key: string]: unknown;
}

export interface ChatWsMessage {
  type: 'message';
  message: ChatWsMessagePayload;
}

/**
 * Subscribe to real-time chat messages for a room via WebSocket.
 * When the server broadcasts a new message (after someone POSTs), it will be passed to onMessage.
 * Returns connection status and forces reconnect when roomId changes.
 */
export function useChatWebSocket(
  roomId: string | null,
  onMessage: (message: ChatWsMessagePayload) => void
): { connected: boolean } {
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!roomId) {
      setConnected(false);
      return;
    }

    const base = getChatWsUrl();
    const path = `${base.replace(/\/$/, '')}/api/chat/ws?roomId=${encodeURIComponent(roomId)}`;
    const ws = new WebSocket(path);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);
    ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data as string) as ChatWsMessage;
        if (data.type === 'message' && data.message) {
          onMessageRef.current(data.message);
        }
      } catch (_e) {
        // ignore parse errors
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
      setConnected(false);
    };
  }, [roomId]);

  return { connected };
}

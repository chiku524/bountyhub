/**
 * Durable Object for a single chat room. Holds WebSocket connections and
 * broadcasts new messages to all connected clients when the Worker sends a POST.
 */
import { DurableObject } from 'cloudflare:workers';

/** No bindings needed on the DO; state is in memory. */
export type Env = Record<string, never>;

type Session = { ws: WebSocket };

export class ChatRoomDO extends DurableObject<Env> {
  private sessions: Map<WebSocket, Session>;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.sessions = new Map();
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const upgrade = request.headers.get('Upgrade');

    // WebSocket upgrade: client connecting to this room
    if (upgrade === 'websocket') {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      server.accept();
      const session: Session = { ws: server };
      this.sessions.set(server, session);
      server.addEventListener('message', () => {
        // Client can send pings; we don't need to handle messages for chat (send via REST)
      });
      server.addEventListener('close', () => {
        this.sessions.delete(server);
      });
      return new Response(null, { status: 101, webSocket: client });
    }

    // POST /broadcast: Worker notifies us of a new message to push to all clients
    if (request.method === 'POST' && url.pathname.endsWith('/broadcast')) {
      let body: { message: unknown };
      try {
        body = await request.json();
      } catch {
        return new Response('Invalid JSON', { status: 400 });
      }
      const payload = JSON.stringify({ type: 'message', message: body.message });
      this.sessions.forEach((_session, ws) => {
        try {
          ws.send(payload);
        } catch (_e) {
          // Connection may be closed
        }
      });
      return new Response(JSON.stringify({ ok: true, count: this.sessions.size }));
    }

    return new Response('Not found', { status: 404 });
  }
}

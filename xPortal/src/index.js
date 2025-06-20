import { createRequestHandler } from "@remix-run/cloudflare";
import * as build from "../build/index.js";

const handleRequest = createRequestHandler({
  build,
  mode: "production",
});

export default {
  async fetch(request, env, ctx) {
    try {
      console.log('Worker request started:', request.url);
      console.log('Request method:', request.method);
      console.log('Request headers count:', request.headers.size);
      
      const response = await handleRequest(request, env, ctx);
      
      console.log('Worker request completed:', response.status);
      return response;
    } catch (error) {
      console.error('Worker error:', error);
      console.error('Error stack:', error.stack);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      
      return new Response(`Internal Server Error: ${error.message}`, {
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }
  },
}; 
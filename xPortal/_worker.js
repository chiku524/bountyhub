import { createRequestHandler } from "@remix-run/cloudflare";
import * as build from "./build/index.js";

const handleRequest = createRequestHandler({
  build,
  mode: process.env.NODE_ENV,
  getLoadContext: (context) => {
    // Set the session secret for the auth system by setting it on the global object
    if (context.env.SESSION_SECRET) {
      global.SESSION_SECRET = context.env.SESSION_SECRET;
    }
    
    return {
      env: context.env,
      db: context.env.DB, // Pass D1 database to context
    };
  },
});

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env, ctx);
  },
}; 
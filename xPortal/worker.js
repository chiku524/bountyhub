import * as build from './build/index.js';
import { createRequestHandler } from '@remix-run/cloudflare';

export default {
  fetch(request, env, ctx) {
    return createRequestHandler({
      build,
      mode: env.NODE_ENV,
    })(request, env, ctx);
  }
}; 
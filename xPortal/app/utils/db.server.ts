/// <reference types="@cloudflare/workers-types" />
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../../drizzle/schema';

export function createDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

export type Db = ReturnType<typeof createDb>;

// Add Cloudflare Workers types
declare global {
  interface Env {
    DB: D1Database;
  }
} 
// Temporarily disabled for testing
// TODO: Re-enable when database is properly configured

import { drizzle } from 'drizzle-orm/d1'

// Cloudflare D1Database type is available in the global scope in Cloudflare Workers
export function createDb(d1: any) {
  return drizzle(d1)
}

export type Db = ReturnType<typeof createDb>

// Cloudflare Workers types
declare global {
  interface Env {
    DB: any
  }
} 
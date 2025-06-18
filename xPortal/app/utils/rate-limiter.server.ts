interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (request: Request) => string; // Custom key generator
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export class RateLimiterService {
  private static rateLimitStore = new Map<string, RateLimitEntry>();
  
  // Default rate limit configurations
  private static readonly DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
    deposit: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 5 // 5 deposits per minute
    },
    withdrawal: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 3 // 3 withdrawals per minute
    },
    general: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 20 // 20 requests per minute
    }
  };

  /**
   * Check if a request is within rate limits
   */
  static async checkRateLimit(
    request: Request,
    type: keyof typeof RateLimiterService.DEFAULT_CONFIGS = 'general'
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const config = this.DEFAULT_CONFIGS[type];
    const key = this.generateKey(request, type);
    const now = Date.now();

    // Get current rate limit entry
    const entry = this.rateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      this.rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      });

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: now + config.windowMs
      };
    }

    if (entry.count >= config.maxRequests) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      };
    }

    // Increment count
    entry.count++;
    this.rateLimitStore.set(key, entry);

    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime
    };
  }

  /**
   * Generate a unique key for rate limiting
   */
  private static generateKey(request: Request, type: string): string {
    // Try to get user ID from the request
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || 'anonymous';
    
    // For production, you might want to get user ID from session/token
    return `${type}:${userId}:${this.getClientIP(request)}`;
  }

  /**
   * Get client IP address
   */
  private static getClientIP(request: Request): string {
    // In production, you'd get this from headers like X-Forwarded-For
    return 'unknown'; // Placeholder
  }

  /**
   * Clean up expired rate limit entries
   */
  static cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        this.rateLimitStore.delete(key);
      }
    }
  }

  /**
   * Get rate limit info for a specific key
   */
  static getRateLimitInfo(key: string): RateLimitEntry | undefined {
    return this.rateLimitStore.get(key);
  }

  /**
   * Reset rate limit for a specific key
   */
  static resetRateLimit(key: string): void {
    this.rateLimitStore.delete(key);
  }

  /**
   * Set custom rate limit configuration
   */
  static setCustomConfig(type: string, config: RateLimitConfig): void {
    this.DEFAULT_CONFIGS[type] = config;
  }
} 
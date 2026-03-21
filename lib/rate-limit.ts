/**
 * FIX-9 + FIX-25: In-memory sliding window rate limiter.
 * No external dependencies required. For production at scale,
 * replace with @upstash/ratelimit + Redis for multi-instance support.
 */

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

// Store rate limit state in memory
const store = new Map<string, RateLimitEntry>();

// Cleanup interval: remove expired entries every 2 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
        if (entry.resetAt <= now) {
            store.delete(key);
        }
    }
}, 2 * 60 * 1000);

export interface RateLimitConfig {
    /** Maximum number of requests allowed */
    limit: number;
    /** Window duration in seconds */
    windowSeconds: number;
}

export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    resetAt: number;
}

/**
 * Check and increment rate limit for a given identifier.
 * @param identifier - Unique key (e.g. IP address, user ID, email)
 * @param config - Rate limit configuration
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig
): RateLimitResult {
    const now = Date.now();
    const windowMs = config.windowSeconds * 1000;
    const key = identifier;

    const entry = store.get(key);

    if (!entry || entry.resetAt <= now) {
        // New window
        const resetAt = now + windowMs;
        store.set(key, { count: 1, resetAt });
        return {
            success: true,
            limit: config.limit,
            remaining: config.limit - 1,
            resetAt,
        };
    }

    if (entry.count >= config.limit) {
        return {
            success: false,
            limit: config.limit,
            remaining: 0,
            resetAt: entry.resetAt,
        };
    }

    entry.count += 1;
    return {
        success: true,
        limit: config.limit,
        remaining: config.limit - entry.count,
        resetAt: entry.resetAt,
    };
}

/**
 * Extract client IP from a Next.js Request object.
 */
export function getClientIp(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return request.headers.get('x-real-ip') || 'unknown';
}

/**
 * Pre-configured rate limit configs for different endpoints.
 */
export const RATE_LIMITS = {
    /** Login: 5 attempts per 15 minutes */
    LOGIN: { limit: 5, windowSeconds: 900 } as RateLimitConfig,
    /** Register: 3 registrations per hour per IP */
    REGISTER: { limit: 3, windowSeconds: 3600 } as RateLimitConfig,
    /** Orders: 10 orders per 10 minutes per IP */
    ORDERS: { limit: 10, windowSeconds: 600 } as RateLimitConfig,
    /** General API: 60 requests per minute */
    GENERAL: { limit: 60, windowSeconds: 60 } as RateLimitConfig,
} as const;

/**
 * Rate limiting utilities for authentication endpoints
 */

interface RateLimitConfig {
  maxAttempts: number
  windowMs: number
  blockDurationMs: number
}

interface RateLimitEntry {
  attempts: number
  windowStart: number
  blockedUntil?: number
}

// In-memory store (in production, use Redis or database)
const rateLimitStore = new Map<string, RateLimitEntry>()

/**
 * Default rate limit configurations
 */
export const RATE_LIMIT_CONFIGS = {
  login: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000, // 30 minutes
  },
  register: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 2 * 60 * 60 * 1000, // 2 hours
  },
  passwordReset: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 60 * 60 * 1000, // 1 hour
  },
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  allowed: boolean
  remainingAttempts: number
  resetTime: Date
  retryAfter?: number
}

/**
 * Check rate limit for a given identifier
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const key = identifier.toLowerCase()
  let entry = rateLimitStore.get(key)

  // Clean up expired entries
  if (entry && now - entry.windowStart > config.windowMs) {
    entry = undefined
  }

  // Check if currently blocked
  if (entry?.blockedUntil && now < entry.blockedUntil) {
    return {
      allowed: false,
      remainingAttempts: 0,
      resetTime: new Date(entry.blockedUntil),
      retryAfter: Math.ceil((entry.blockedUntil - now) / 1000),
    }
  }

  // Initialize or reset entry
  if (!entry || (entry.blockedUntil && now >= entry.blockedUntil)) {
    entry = {
      attempts: 0,
      windowStart: now,
    }
  }

  const remainingAttempts = Math.max(0, config.maxAttempts - entry.attempts)
  const resetTime = new Date(entry.windowStart + config.windowMs)

  return {
    allowed: entry.attempts < config.maxAttempts,
    remainingAttempts,
    resetTime,
  }
}

/**
 * Record a rate limit attempt
 */
export function recordAttempt(
  identifier: string,
  config: RateLimitConfig,
  success: boolean = false
): RateLimitResult {
  const now = Date.now()
  const key = identifier.toLowerCase()
  let entry = rateLimitStore.get(key)

  if (!entry) {
    entry = {
      attempts: 0,
      windowStart: now,
    }
  }

  // If it's a successful attempt, reset the counter
  if (success) {
    rateLimitStore.delete(key)
    return {
      allowed: true,
      remainingAttempts: config.maxAttempts,
      resetTime: new Date(now + config.windowMs),
    }
  }

  // Increment attempt counter
  entry.attempts += 1

  // Check if we've exceeded the limit
  if (entry.attempts >= config.maxAttempts) {
    entry.blockedUntil = now + config.blockDurationMs
  }

  rateLimitStore.set(key, entry)

  const remainingAttempts = Math.max(0, config.maxAttempts - entry.attempts)
  const resetTime = entry.blockedUntil 
    ? new Date(entry.blockedUntil)
    : new Date(entry.windowStart + config.windowMs)

  return {
    allowed: entry.attempts < config.maxAttempts,
    remainingAttempts,
    resetTime,
    retryAfter: entry.blockedUntil ? Math.ceil((entry.blockedUntil - now) / 1000) : undefined,
  }
}

/**
 * Get client identifier from request (IP address + user agent)
 */
export function getClientIdentifier(request: Request): string {
  // In production, you might want to use a more sophisticated approach
  // that takes into account X-Forwarded-For headers, etc.
  const ip = getClientIP(request)
  const userAgent = request.headers.get('user-agent') || ''
  const identifier = `${ip}:${userAgent.substring(0, 100)}`
  
  return Buffer.from(identifier).toString('base64')
}

/**
 * Extract client IP from request
 */
function getClientIP(request: Request): string {
  // Check various headers that might contain the real IP
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  if (cfConnectingIP) {
    return cfConnectingIP
  }

  // Fallback to a default value
  return 'unknown'
}

/**
 * Create a rate limit middleware function
 */
export function createRateLimitMiddleware(config: RateLimitConfig) {
  return (identifier: string) => {
    return checkRateLimit(identifier, config)
  }
}

/**
 * Clean up expired entries (should be called periodically)
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now()
  const maxAge = 24 * 60 * 60 * 1000 // 24 hours

  for (const [key, entry] of rateLimitStore.entries()) {
    if (now - entry.windowStart > maxAge) {
      rateLimitStore.delete(key)
    }
  }
}

/**
 * Reset rate limit for a specific identifier
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier.toLowerCase())
}

/**
 * Get current rate limit status without modifying it
 */
export function getRateLimitStatus(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  return checkRateLimit(identifier, config)
}
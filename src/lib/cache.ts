/**
 * Simple in-memory cache for API routes
 * Used to cache ownership checks and reduce database queries
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
}

class SimpleCache<T = any> {
  private cache: Map<string, CacheEntry<T>> = new Map()
  private ttl: number // Time to live in milliseconds

  constructor(ttlSeconds: number = 60) {
    this.ttl = ttlSeconds * 1000
  }

  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  get(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Cleanup expired entries periodically
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

// Create cache instances
export const ownershipCache = new SimpleCache<{ authorized: boolean; error?: string }>(60) // 60 seconds
export const postMetadataCache = new SimpleCache<any>(30) // 30 seconds

// Cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    ownershipCache.cleanup()
    postMetadataCache.cleanup()
  }, 5 * 60 * 1000)
}

// Helper function to create cache key for post ownership
export function createOwnershipKey(postId: string, userId: string): string {
  return `post:${postId}:user:${userId}`
}

// Invalidate ownership cache for a post (e.g., when post is deleted)
export function invalidatePostOwnership(postId: string): void {
  // Clear all entries related to this post
  for (const key of Array.from(ownershipCache['cache'].keys())) {
    if (key.startsWith(`post:${postId}:`)) {
      ownershipCache.delete(key)
    }
  }
}

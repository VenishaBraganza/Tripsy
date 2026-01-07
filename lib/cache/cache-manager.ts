/**
 * Cache Manager
 * Manages data caching with memory and localStorage support
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

export class CacheManager {
  private memoryCache: Map<string, CacheEntry<any>> = new Map()
  private readonly DEFAULT_TTL = 15 * 60 * 1000 // 15 minutes
  private readonly STORAGE_PREFIX = 'tripsy_cache_'

  /**
   * Get cached data
   */
  get<T>(key: string): T | null {
    // Try memory cache first
    const memoryEntry = this.memoryCache.get(key)
    if (memoryEntry && this.isValid(memoryEntry)) {
      return memoryEntry.data
    }

    // Try localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.STORAGE_PREFIX + key)
        if (stored) {
          const entry: CacheEntry<T> = JSON.parse(stored)
          if (this.isValid(entry)) {
            // Restore to memory cache
            this.memoryCache.set(key, entry)
            return entry.data
          } else {
            // Remove expired entry
            localStorage.removeItem(this.STORAGE_PREFIX + key)
          }
        }
      } catch (error) {
        console.error('Error reading from localStorage:', error)
      }
    }

    return null
  }

  /**
   * Set cached data with TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL,
    }

    // Set in memory cache
    this.memoryCache.set(key, entry)

    // Set in localStorage for persistence
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          this.STORAGE_PREFIX + key,
          JSON.stringify(entry)
        )
      } catch (error) {
        console.error('Error writing to localStorage:', error)
        // If localStorage is full, try to clear old entries
        this.clearExpired()
      }
    }
  }

  /**
   * Invalidate cache entry
   */
  invalidate(key: string): void {
    this.memoryCache.delete(key)
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(this.STORAGE_PREFIX + key)
      } catch (error) {
        console.error('Error removing from localStorage:', error)
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.memoryCache.clear()
    
    if (typeof window !== 'undefined') {
      try {
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          if (key.startsWith(this.STORAGE_PREFIX)) {
            localStorage.removeItem(key)
          }
        })
      } catch (error) {
        console.error('Error clearing localStorage:', error)
      }
    }
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    // Clear expired memory cache entries
    for (const [key, entry] of this.memoryCache.entries()) {
      if (!this.isValid(entry)) {
        this.memoryCache.delete(key)
      }
    }

    // Clear expired localStorage entries
    if (typeof window !== 'undefined') {
      try {
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          if (key.startsWith(this.STORAGE_PREFIX)) {
            const stored = localStorage.getItem(key)
            if (stored) {
              try {
                const entry = JSON.parse(stored)
                if (!this.isValid(entry)) {
                  localStorage.removeItem(key)
                }
              } catch {
                // Invalid JSON, remove it
                localStorage.removeItem(key)
              }
            }
          }
        })
      } catch (error) {
        console.error('Error clearing expired entries:', error)
      }
    }
  }

  /**
   * Check if cache entry is still valid
   */
  private isValid<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < entry.ttl
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    memorySize: number
    localStorageSize: number
  } {
    let localStorageSize = 0
    
    if (typeof window !== 'undefined') {
      try {
        const keys = Object.keys(localStorage)
        localStorageSize = keys.filter(key => 
          key.startsWith(this.STORAGE_PREFIX)
        ).length
      } catch (error) {
        console.error('Error getting cache stats:', error)
      }
    }

    return {
      memorySize: this.memoryCache.size,
      localStorageSize,
    }
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /**
   * Get or set pattern (fetch if not cached)
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const data = await fetcher()
    this.set(key, data, ttl)
    return data
  }
}

// Export singleton instance
export const cacheManager = new CacheManager()

// Auto-clear expired entries every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    cacheManager.clearExpired()
  }, 5 * 60 * 1000)
}

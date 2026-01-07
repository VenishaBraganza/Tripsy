// Prefetching utilities for better performance

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

// Prefetch pages that user is likely to visit
export function usePrefetchPages(routes: string[]) {
  const router = useRouter()

  useEffect(() => {
    // Prefetch routes after a short delay to avoid blocking initial load
    const timer = setTimeout(() => {
      routes.forEach(route => {
        router.prefetch(route)
      })
    }, 1000)

    return () => clearTimeout(timer)
  }, [router, routes])
}

// Prefetch data for likely next actions
export class DataPrefetcher {
  private cache = new Map<string, Promise<any>>()

  async prefetch(key: string, fetcher: () => Promise<any>): Promise<void> {
    if (this.cache.has(key)) return

    const promise = fetcher()
    this.cache.set(key, promise)

    try {
      await promise
    } catch (error) {
      // Remove failed requests from cache
      this.cache.delete(key)
      console.warn(`Prefetch failed for ${key}:`, error)
    }
  }

  get(key: string): Promise<any> | null {
    return this.cache.get(key) || null
  }

  clear() {
    this.cache.clear()
  }
}

export const dataPrefetcher = new DataPrefetcher()

// Prefetch trip details when hovering over trip cards
export function useTripPrefetch() {
  const prefetchTrip = (tripId: string) => {
    dataPrefetcher.prefetch(`trip-${tripId}`, async () => {
      const response = await fetch(`/api/trips/${tripId}`)
      return response.json()
    })
  }

  const prefetchTripBookings = (tripId: string) => {
    dataPrefetcher.prefetch(`trip-bookings-${tripId}`, async () => {
      const response = await fetch(`/api/bookings?trip_id=${tripId}`)
      return response.json()
    })
  }

  return { prefetchTrip, prefetchTripBookings }
}

// Prefetch package details when hovering over package cards
export function usePackagePrefetch() {
  const prefetchPackage = (packageId: string) => {
    dataPrefetcher.prefetch(`package-${packageId}`, async () => {
      const response = await fetch(`/api/packages/${packageId}`)
      return response.json()
    })
  }

  const prefetchPackageReviews = (packageId: string) => {
    dataPrefetcher.prefetch(`package-reviews-${packageId}`, async () => {
      const response = await fetch(`/api/packages/${packageId}/reviews`)
      return response.json()
    })
  }

  return { prefetchPackage, prefetchPackageReviews }
}

// Intelligent prefetching based on user behavior
export class IntelligentPrefetcher {
  private userActions: string[] = []
  private patterns = new Map<string, string[]>()

  trackAction(action: string) {
    this.userActions.push(action)
    
    // Keep only last 10 actions
    if (this.userActions.length > 10) {
      this.userActions.shift()
    }

    this.updatePatterns()
  }

  private updatePatterns() {
    // Simple pattern detection: if user does A then B frequently, prefetch B when A happens
    for (let i = 0; i < this.userActions.length - 1; i++) {
      const current = this.userActions[i]
      const next = this.userActions[i + 1]
      
      if (!this.patterns.has(current)) {
        this.patterns.set(current, [])
      }
      
      this.patterns.get(current)!.push(next)
    }
  }

  getPredictedActions(currentAction: string): string[] {
    const predictions = this.patterns.get(currentAction) || []
    
    // Return most frequent next actions
    const frequency = new Map<string, number>()
    predictions.forEach(action => {
      frequency.set(action, (frequency.get(action) || 0) + 1)
    })

    return Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([action]) => action)
  }
}

export const intelligentPrefetcher = new IntelligentPrefetcher()
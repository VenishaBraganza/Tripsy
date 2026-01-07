'use client'

import { useState, useEffect, useCallback } from 'react'
import { ErrorHandler } from '@/lib/errors'

export interface DataResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export interface UseDataFetchOptions<T> {
  // Function to fetch data
  fetcher: () => Promise<T>
  
  // Initial data
  initialData?: T | null
  
  // Whether to fetch on mount
  fetchOnMount?: boolean
  
  // Number of retry attempts
  retryAttempts?: number
  
  // Retry delay in milliseconds
  retryDelay?: number
  
  // Callback on success
  onSuccess?: (data: T) => void
  
  // Callback on error
  onError?: (error: Error) => void
  
  // Dependencies to trigger refetch
  dependencies?: any[]
}

/**
 * Base data fetching hook with loading, error states, and retry logic
 */
export function useDataFetch<T>({
  fetcher,
  initialData = null as T | null,
  fetchOnMount = true,
  retryAttempts = 2,
  retryDelay = 1000,
  onSuccess,
  onError,
  dependencies = [],
}: UseDataFetchOptions<T>): DataResult<T> {
  const [data, setData] = useState<T | null>(initialData)
  const [loading, setLoading] = useState(fetchOnMount)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async (attempt = 0): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await fetcher()
      
      setData(result)
      setError(null)
      
      if (onSuccess) {
        onSuccess(result)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred')
      
      // Retry logic
      if (attempt < retryAttempts) {
        console.log(`Retrying... Attempt ${attempt + 1} of ${retryAttempts}`)
        await new Promise(resolve => setTimeout(resolve, retryDelay))
        return fetchData(attempt + 1)
      }
      
      // Handle error
      const userFriendlyError = ErrorHandler.handleError(error, 'useDataFetch')
      setError(error)
      
      if (onError) {
        onError(error)
      }
      
      console.error('Data fetch error:', userFriendlyError)
    } finally {
      setLoading(false)
    }
  }, [fetcher, retryAttempts, retryDelay, onSuccess, onError])

  const refetch = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  useEffect(() => {
    if (fetchOnMount) {
      fetchData()
    }
  }, [fetchOnMount, ...dependencies])

  return {
    data,
    loading,
    error,
    refetch,
  }
}

/**
 * Hook for fetching data with automatic caching
 */
export function useDataFetchWithCache<T>({
  cacheKey,
  cacheTTL,
  ...options
}: UseDataFetchOptions<T> & {
  cacheKey: string
  cacheTTL?: number
}): DataResult<T> {
  const { cacheManager } = require('@/lib/cache')
  
  const cachedFetcher = async () => {
    return cacheManager.getOrSet(
      cacheKey,
      options.fetcher,
      cacheTTL
    )
  }

  return useDataFetch({
    ...options,
    fetcher: cachedFetcher,
  })
}

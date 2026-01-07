// Optimized data fetching hooks with caching and batching

import { useState, useEffect, useCallback } from 'react'
import { memoryCache, requestBatcher } from '@/lib/utils/performance'
import { dataPrefetcher } from '@/lib/utils/prefetch'

interface UseOptimizedDataOptions {
  cacheKey: string
  cacheTTL?: number
  enableBatching?: boolean
  batchKey?: string
  dependencies?: any[]
}

export function useOptimizedData<T>(
  fetcher: () => Promise<T>,
  options: UseOptimizedDataOptions
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const {
    cacheKey,
    cacheTTL = 5 * 60 * 1000, // 5 minutes default
    enableBatching = false,
    batchKey,
    dependencies = []
  } = options

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Check cache first
      const cachedData = memoryCache.get(cacheKey)
      if (cachedData) {
        setData(cachedData)
        setLoading(false)
        return
      }

      // Check prefetch cache
      const prefetchedData = dataPrefetcher.get(cacheKey)
      if (prefetchedData) {
        const result = await prefetchedData
        setData(result)
        memoryCache.set(cacheKey, result, cacheTTL)
        setLoading(false)
        return
      }

      let result: T

      if (enableBatching && batchKey) {
        // Use request batching
        result = await requestBatcher.batch(
          batchKey,
          { cacheKey },
          async (allParams) => {
            // This would need to be implemented per use case
            // For now, just fetch individually
            return Promise.all(allParams.map(() => fetcher()))
          }
        )
      } else {
        // Regular fetch
        result = await fetcher()
      }

      setData(result)
      memoryCache.set(cacheKey, result, cacheTTL)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [cacheKey, cacheTTL, enableBatching, batchKey, fetcher])

  useEffect(() => {
    fetchData()
  }, [fetchData, ...dependencies])

  const refetch = useCallback(() => {
    memoryCache.delete(cacheKey)
    fetchData()
  }, [cacheKey, fetchData])

  const invalidateCache = useCallback(() => {
    memoryCache.delete(cacheKey)
  }, [cacheKey])

  return {
    data,
    loading,
    error,
    refetch,
    invalidateCache
  }
}

// Optimized hook for paginated data
export function useOptimizedPaginatedData<T>(
  fetcher: (page: number, limit: number) => Promise<{ data: T[]; total: number }>,
  options: {
    cacheKeyPrefix: string
    limit?: number
    cacheTTL?: number
  }
) {
  const [page, setPage] = useState(1)
  const [allData, setAllData] = useState<T[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [hasMore, setHasMore] = useState(true)

  const { cacheKeyPrefix, limit = 20, cacheTTL = 5 * 60 * 1000 } = options

  const fetchPage = useCallback(async (pageNum: number) => {
    const cacheKey = `${cacheKeyPrefix}-page-${pageNum}`
    
    try {
      setLoading(true)
      setError(null)

      // Check cache first
      const cachedData = memoryCache.get(cacheKey)
      if (cachedData) {
        if (pageNum === 1) {
          setAllData(cachedData.data)
        } else {
          setAllData(prev => [...prev, ...cachedData.data])
        }
        setTotal(cachedData.total)
        setHasMore(cachedData.data.length === limit)
        setLoading(false)
        return
      }

      const result = await fetcher(pageNum, limit)
      
      // Cache the result
      memoryCache.set(cacheKey, result, cacheTTL)

      if (pageNum === 1) {
        setAllData(result.data)
      } else {
        setAllData(prev => [...prev, ...result.data])
      }
      
      setTotal(result.total)
      setHasMore(result.data.length === limit)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [fetcher, cacheKeyPrefix, limit, cacheTTL])

  useEffect(() => {
    fetchPage(1)
  }, [fetchPage])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchPage(nextPage)
    }
  }, [loading, hasMore, page, fetchPage])

  const refresh = useCallback(() => {
    // Clear all cached pages
    for (let i = 1; i <= page; i++) {
      memoryCache.delete(`${cacheKeyPrefix}-page-${i}`)
    }
    setPage(1)
    setAllData([])
    fetchPage(1)
  }, [cacheKeyPrefix, page, fetchPage])

  return {
    data: allData,
    total,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    currentPage: page
  }
}

// Hook for optimized search with debouncing
export function useOptimizedSearch<T>(
  searchFn: (query: string) => Promise<T[]>,
  options: {
    debounceMs?: number
    cacheKeyPrefix?: string
    cacheTTL?: number
    minQueryLength?: number
  } = {}
) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const {
    debounceMs = 300,
    cacheKeyPrefix = 'search',
    cacheTTL = 2 * 60 * 1000, // 2 minutes for search results
    minQueryLength = 2
  } = options

  useEffect(() => {
    if (query.length < minQueryLength) {
      setResults([])
      return
    }

    const timeoutId = setTimeout(async () => {
      const cacheKey = `${cacheKeyPrefix}-${query}`
      
      try {
        setLoading(true)
        setError(null)

        // Check cache first
        const cachedResults = memoryCache.get(cacheKey)
        if (cachedResults) {
          setResults(cachedResults)
          setLoading(false)
          return
        }

        const searchResults = await searchFn(query)
        setResults(searchResults)
        memoryCache.set(cacheKey, searchResults, cacheTTL)
      } catch (err) {
        setError(err as Error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, debounceMs)

    return () => clearTimeout(timeoutId)
  }, [query, searchFn, debounceMs, cacheKeyPrefix, cacheTTL, minQueryLength])

  return {
    query,
    setQuery,
    results,
    loading,
    error
  }
}
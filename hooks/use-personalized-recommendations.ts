'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'

interface RecommendationPackage {
  id: string
  name: string
  description: string
  base_price: number
  discounted_price?: number
  image_url?: string
  destinations?: {
    name: string
    state: string
    average_rating: number
  }
  recommendation_score: number
  recommendation_reasoning: string[]
  personalization_matches: string[]
  confidence_level: 'high' | 'medium' | 'low'
  persona_matches?: string[] // Legacy support
}

interface PersonalizationSummary {
  interests: string[]
  budget_preference: string
  travel_type: string
  preferred_region: string
  has_personalization: boolean
}

interface UsePersonalizedRecommendationsOptions {
  limit?: number
  location?: { lat: number, lng: number }
  excludePackageIds?: string[]
  autoRefresh?: boolean
  filterByInterests?: string[]
  filterByBudget?: string
}

export function usePersonalizedRecommendations(options: UsePersonalizedRecommendationsOptions = {}) {
  const [recommendations, setRecommendations] = useState<RecommendationPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<any>(null)
  const [personalizationSummary, setPersonalizationSummary] = useState<PersonalizationSummary | null>(null)
  const { toast } = useToast()

  const {
    limit = 10,
    location,
    excludePackageIds = [],
    autoRefresh = false,
    filterByInterests,
    filterByBudget
  } = options

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        limit: limit.toString(),
        page: '1'
      })

      if (location) {
        params.append('lat', location.lat.toString())
        params.append('lng', location.lng.toString())
      }

      if (excludePackageIds.length > 0) {
        params.append('exclude', excludePackageIds.join(','))
      }

      if (filterByInterests && filterByInterests.length > 0) {
        params.append('interests', filterByInterests.join(','))
      }

      if (filterByBudget) {
        params.append('budget', filterByBudget)
      }

      const response = await fetch(`/api/recommendations?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch recommendations')
      }

      setRecommendations(data.packages || [])
      setMetadata({
        source: data.source,
        algorithm: data.algorithm,
        has_location: data.has_location,
        has_personalization: data.has_personalization,
        confidence_distribution: data.confidence_distribution,
        total: data.total
      })

      // Set personalization summary if available
      if (data.personalization_summary) {
        setPersonalizationSummary(data.personalization_summary)
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Error fetching recommendations:', err)
      
      toast({
        title: "Error",
        description: "Failed to load personalized recommendations",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const trackInteraction = async (packageId: string, action: 'clicked' | 'booked') => {
    try {
      await fetch('/api/recommendations/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId,
          action,
          timestamp: new Date().toISOString()
        })
      })
    } catch (err) {
      console.warn('Failed to track recommendation interaction:', err)
    }
  }

  const handlePackageClick = (packageId: string) => {
    trackInteraction(packageId, 'clicked')
  }

  const handlePackageBook = (packageId: string) => {
    trackInteraction(packageId, 'booked')
  }

  const refreshRecommendations = () => {
    fetchRecommendations()
  }

  // Get recommendations by confidence level
  const getRecommendationsByConfidence = (level: 'high' | 'medium' | 'low') => {
    return recommendations.filter(rec => rec.confidence_level === level)
  }

  // Get recommendations by interest
  const getRecommendationsByInterest = (interest: string) => {
    return recommendations.filter(rec => 
      rec.personalization_matches.includes('interests') &&
      rec.recommendation_reasoning.some(reason => 
        reason.toLowerCase().includes(interest.toLowerCase())
      )
    )
  }

  useEffect(() => {
    fetchRecommendations()

    // Auto-refresh if enabled
    if (autoRefresh) {
      const interval = setInterval(fetchRecommendations, 5 * 60 * 1000) // 5 minutes
      return () => clearInterval(interval)
    }
  }, [
    limit, 
    location?.lat, 
    location?.lng, 
    excludePackageIds.join(','), 
    autoRefresh,
    filterByInterests?.join(','),
    filterByBudget
  ])

  return {
    recommendations,
    loading,
    error,
    metadata,
    personalizationSummary,
    refreshRecommendations,
    handlePackageClick,
    handlePackageBook,
    trackInteraction,
    getRecommendationsByConfidence,
    getRecommendationsByInterest
  }
}

// Hook for getting recommendations for specific interests
export function useInterestBasedRecommendations(interests: string[], options: UsePersonalizedRecommendationsOptions = {}) {
  return usePersonalizedRecommendations({
    ...options,
    filterByInterests: interests
  })
}

// Hook for getting recommendations for a specific budget
export function useBudgetBasedRecommendations(budget: string, options: UsePersonalizedRecommendationsOptions = {}) {
  return usePersonalizedRecommendations({
    ...options,
    filterByBudget: budget
  })
}

// Hook for getting high-confidence recommendations only
export function useHighConfidenceRecommendations(options: UsePersonalizedRecommendationsOptions = {}) {
  const result = usePersonalizedRecommendations(options)
  
  return {
    ...result,
    recommendations: result.recommendations.filter(rec => rec.confidence_level === 'high')
  }
}

// Legacy hook for persona-based recommendations (for backward compatibility)
export function usePersonaRecommendations(persona: string, options: UsePersonalizedRecommendationsOptions = {}) {
  const [recommendations, setRecommendations] = useState<RecommendationPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPersonaRecommendations = async () => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams({
          limit: (options.limit || 5).toString(),
          persona: persona
        })

        if (options.location) {
          params.append('lat', options.location.lat.toString())
          params.append('lng', options.location.lng.toString())
        }

        const response = await fetch(`/api/recommendations?${params}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch recommendations')
        }

        // Filter recommendations that match the specific persona (legacy support)
        const personaRecommendations = (data.packages || []).filter((pkg: RecommendationPackage) =>
          pkg.persona_matches?.includes(persona) || 
          pkg.personalization_matches.includes('interests')
        )

        setRecommendations(personaRecommendations)

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        console.error('Error fetching persona recommendations:', err)
      } finally {
        setLoading(false)
      }
    }

    if (persona) {
      fetchPersonaRecommendations()
    }
  }, [persona, options.limit, options.location?.lat, options.location?.lng])

  return {
    recommendations,
    loading,
    error
  }
}
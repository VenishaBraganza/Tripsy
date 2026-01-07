import { useState, useEffect } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export interface HiddenGem {
  id: string
  name: string
  slug: string
  description: string
  state: string
  district: string
  region: string
  hidden_gem_score: number
  popularity_score: number
  best_time_to_visit: string
  entry_fee?: string
  image_url?: string
  tags: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  user_id: string
  destination_id?: string
  package_id?: string
  rating: number
  comment: string
  photos?: string[]
  visit_date?: string
  helpful_count: number
  created_at: string
  profiles?: {
    full_name: string
    avatar_url?: string
  }
}

export function useHiddenGems(filters?: {
  region?: string
  minScore?: number
  tags?: string[]
  limit?: number
}) {
  const [gems, setGems] = useState<HiddenGem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseBrowserClient()

  const fetchGems = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('destinations')
        .select('*')
        .eq('is_active', true)
        .gte('hidden_gem_score', filters?.minScore || 70)
        .order('hidden_gem_score', { ascending: false })

      if (filters?.region) {
        query = query.eq('region', filters.region)
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags)
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      setGems(data || [])
    } catch (err: any) {
      console.error('Error fetching hidden gems:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGems()
  }, [filters?.region, filters?.minScore, filters?.tags, filters?.limit])

  return {
    gems,
    loading,
    error,
    refetch: fetchGems
  }
}

export function useDestinationReviews(destinationId?: string) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseBrowserClient()

  const fetchReviews = async () => {
    if (!destinationId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('destination_id', destinationId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setReviews(data || [])
    } catch (err: any) {
      console.error('Error fetching reviews:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [destinationId])

  const addReview = async (reviewData: {
    rating: number
    comment: string
    photos?: string[]
    visit_date?: string
  }, userId: string) => {
    if (!destinationId) {
      return { success: false, error: 'No destination selected' }
    }

    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          ...reviewData,
          destination_id: destinationId,
          user_id: userId,
          helpful_count: 0
        })
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .single()

      if (error) throw error

      setReviews(prev => [data, ...prev])
      return { success: true, data }
    } catch (err: any) {
      console.error('Error adding review:', err)
      return { success: false, error: err.message }
    }
  }

  const markHelpful = async (reviewId: string) => {
    try {
      const { error } = await supabase.rpc('increment_review_helpful', {
        review_id: reviewId
      })

      if (error) throw error

      setReviews(prev =>
        prev.map(r =>
          r.id === reviewId ? { ...r, helpful_count: r.helpful_count + 1 } : r
        )
      )

      return { success: true }
    } catch (err: any) {
      console.error('Error marking review as helpful:', err)
      return { success: false, error: err.message }
    }
  }

  return {
    reviews,
    loading,
    error,
    addReview,
    markHelpful,
    refetch: fetchReviews
  }
}

'use client'

import { useState, useEffect } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { ErrorHandler } from '@/lib/errors'

export interface Trip {
  id: string
  destination: string
  start_date: string
  end_date: string
  travelers_count: number
  status: string
  total_cost: number
  payment_status: string
  packages?: {
    name: string
    slug: string
    image_url: string
  }
}

export function useTrips(status?: string) {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = getSupabaseBrowserClient()
  
  const fetchTrips = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (status) params.append('status', status)
      
      const response = await fetch(`/api/trips?${params.toString()}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch trips')
      }
      
      setTrips(data.trips || [])
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch trips')
      setError(error)
      ErrorHandler.logError(error, 'useTrips')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchTrips()
    
    // Set up real-time subscription for trip updates
    const channel = supabase
      .channel('trips-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trips',
        },
        (payload) => {
          console.log('Trip update:', payload)
          // Refetch trips when changes occur
          fetchTrips()
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [status])
  
  const createTrip = async (tripData: {
    destination: string
    start_date: string
    end_date: string
    travelers_count: number
    package_id?: string
  }) => {
    try {
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tripData),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create trip')
      }
      
      // Refetch trips to get the new one
      await fetchTrips()
      return { success: true, trip: data.trip }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create trip')
      ErrorHandler.logError(error, 'useTrips.createTrip')
      return { success: false, error: error.message }
    }
  }
  
  const updateTrip = async (tripId: string, updates: Partial<Trip>) => {
    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update trip')
      }
      
      // Refetch trips to get updated data
      await fetchTrips()
      return { success: true, trip: data.trip }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update trip')
      ErrorHandler.logError(error, 'useTrips.updateTrip')
      return { success: false, error: error.message }
    }
  }
  
  return {
    trips,
    loading,
    error,
    createTrip,
    updateTrip,
    refetch: fetchTrips,
  }
}

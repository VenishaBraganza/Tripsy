'use client'

import { useState, useEffect } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { ErrorHandler } from '@/lib/errors'

export interface Booking {
  id: string
  trip_id: string
  booking_type: string
  title: string
  description?: string
  travel_date?: string
  status: string
  cost: number
  booking_reference?: string
  trips?: {
    id: string
    destination: string
    start_date: string
    end_date: string
  }
}

export function useBookings(tripId?: string) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = getSupabaseBrowserClient()
  
  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (tripId) params.append('trip_id', tripId)
      
      const response = await fetch(`/api/bookings?${params.toString()}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch bookings')
      }
      
      setBookings(data.bookings || [])
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch bookings')
      setError(error)
      ErrorHandler.logError(error, 'useBookings')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchBookings()
    
    // Set up real-time subscription for booking updates
    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        (payload) => {
          console.log('Booking update:', payload)
          // Refetch bookings when changes occur
          fetchBookings()
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [tripId])
  
  const createBooking = async (bookingData: {
    trip_id: string
    booking_type: string
    title: string
    description?: string
    travel_date?: string
    cost: number
  }) => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking')
      }
      
      // Refetch bookings to get the new one
      await fetchBookings()
      return { success: true, booking: data.booking }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create booking')
      ErrorHandler.logError(error, 'useBookings.createBooking')
      return { success: false, error: error.message }
    }
  }
  
  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update booking')
      }
      
      // Refetch bookings to get updated data
      await fetchBookings()
      return { success: true, booking: data.booking }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update booking')
      ErrorHandler.logError(error, 'useBookings.updateBookingStatus')
      return { success: false, error: error.message }
    }
  }
  
  return {
    bookings,
    loading,
    error,
    createBooking,
    updateBookingStatus,
    refetch: fetchBookings,
  }
}

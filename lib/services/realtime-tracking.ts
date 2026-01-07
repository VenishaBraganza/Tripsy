// Real-time trip tracking and updates

import { supabase } from '@/lib/supabase/queries'

export interface TripUpdate {
  id: string
  trip_id: string
  type: 'location' | 'status' | 'delay' | 'alert' | 'milestone'
  message: string
  location?: {
    lat: number
    lng: number
    name?: string
  }
  timestamp: string
  metadata?: any
}

export interface LiveTripStatus {
  trip_id: string
  current_location: {
    lat: number
    lng: number
    name: string
  }
  next_destination: string
  eta: string
  distance_remaining: number
  status: 'on_time' | 'delayed' | 'ahead' | 'completed'
  last_updated: string
}

// Subscribe to real-time trip updates
export function subscribeToTripUpdates(
  tripId: string,
  callback: (update: TripUpdate) => void
) {
  const channel = supabase
    .channel(`trip-${tripId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'trip_updates',
        filter: `trip_id=eq.${tripId}`,
      },
      (payload) => {
        callback(payload.new as TripUpdate)
      }
    )
    .subscribe()
  
  return () => {
    supabase.removeChannel(channel)
  }
}

// Publish trip update
export async function publishTripUpdate(update: Omit<TripUpdate, 'id' | 'timestamp'>) {
  const { data, error } = await supabase
    .from('trip_updates')
    .insert({
      ...update,
      timestamp: new Date().toISOString(),
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Get live trip status
export async function getLiveTripStatus(tripId: string): Promise<LiveTripStatus> {
  // In production, calculate from real GPS data
  const { data: trip } = await supabase
    .from('trips')
    .select('*, bookings(*)')
    .eq('id', tripId)
    .single()
  
  if (!trip) throw new Error('Trip not found')
  
  return {
    trip_id: tripId,
    current_location: {
      lat: 12.9716,
      lng: 77.5946,
      name: 'Bangalore',
    },
    next_destination: trip.destination,
    eta: new Date(trip.start_date).toISOString(),
    distance_remaining: 250,
    status: 'on_time',
    last_updated: new Date().toISOString(),
  }
}

// Track driver/cab location
export function trackDriverLocation(
  bookingId: string,
  callback: (location: { lat: number; lng: number; heading: number }) => void
) {
  const channel = supabase
    .channel(`driver-${bookingId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'bookings',
        filter: `id=eq.${bookingId}`,
      },
      (payload) => {
        const location = payload.new.driver_location
        if (location) {
          callback(location)
        }
      }
    )
    .subscribe()
  
  return () => {
    supabase.removeChannel(channel)
  }
}

// Send SOS alert
export async function sendSOSAlert(tripId: string, location: { lat: number; lng: number }) {
  const { data, error } = await supabase
    .from('sos_alerts')
    .insert({
      trip_id: tripId,
      location,
      status: 'active',
      timestamp: new Date().toISOString(),
    })
    .select()
    .single()
  
  if (error) throw error
  
  // In production, also send SMS/call to emergency contacts
  // and notify local authorities
  
  return data
}

// Get nearby emergency services
export async function getNearbyEmergencyServices(location: { lat: number; lng: number }) {
  return {
    hospitals: [
      {
        name: 'City Hospital',
        distance: 2.3,
        phone: '+91-80-12345678',
        location: { lat: location.lat + 0.01, lng: location.lng + 0.01 },
      },
    ],
    police: [
      {
        name: 'Local Police Station',
        distance: 1.5,
        phone: '100',
        location: { lat: location.lat - 0.005, lng: location.lng + 0.005 },
      },
    ],
    pharmacies: [
      {
        name: '24/7 Pharmacy',
        distance: 0.8,
        phone: '+91-80-87654321',
        location: { lat: location.lat + 0.003, lng: location.lng - 0.003 },
      },
    ],
  }
}

// Weather alerts for trip
export async function getWeatherAlerts(tripId: string) {
  const { data: trip } = await supabase
    .from('trips')
    .select('destination, start_date, end_date')
    .eq('id', tripId)
    .single()
  
  if (!trip) return []
  
  // Mock weather alerts
  return [
    {
      type: 'heavy_rain',
      severity: 'moderate',
      message: 'Heavy rainfall expected on Day 2 of your trip',
      date: trip.start_date,
      recommendations: [
        'Carry rain gear',
        'Some outdoor activities may be affected',
        'Roads might be slippery',
      ],
    },
  ]
}

// Share live location with family/friends
export async function shareLiveLocation(tripId: string, contacts: string[]) {
  const shareLink = `${process.env.NEXT_PUBLIC_APP_URL}/track/${tripId}`
  
  // In production, send SMS/email with tracking link
  
  return {
    shareLink,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  }
}

'use server'

import { revalidatePath } from 'next/cache'
import { createTrip, updateTrip, getUserTrips } from '@/lib/supabase/queries'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function createNewTrip(tripData: {
  destination: string
  start_date: string
  end_date: string
  travelers_count: number
  package_id?: string
  notes?: string
}) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  try {
    const trip = await createTrip({
      ...tripData,
      user_id: user.id,
      status: 'upcoming',
    })
    
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/my-trips')
    return { success: true, data: trip }
  } catch (error: any) {
    console.error('Error creating trip:', error)
    return { success: false, error: error.message }
  }
}

export async function updateTripDetails(tripId: string, updates: any) {
  try {
    const trip = await updateTrip(tripId, updates)
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/my-trips')
    return { success: true, data: trip }
  } catch (error: any) {
    console.error('Error updating trip:', error)
    return { success: false, error: error.message }
  }
}

export async function getUserTripsAction(status?: string) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  try {
    const trips = await getUserTrips(user.id, status)
    return { success: true, data: trips }
  } catch (error: any) {
    console.error('Error fetching trips:', error)
    return { success: false, error: error.message }
  }
}

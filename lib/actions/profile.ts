'use server'

import { revalidatePath } from 'next/cache'
import { 
  updateUserProfile, 
  updateUserPreferences,
  getUserProfile,
  getUserPreferences 
} from '@/lib/supabase/queries'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function updateProfile(updates: {
  full_name?: string
  phone?: string
  date_of_birth?: string
  preferred_name?: string
  travel_bio?: string
  avatar_url?: string
}) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  try {
    const profile = await updateUserProfile(user.id, updates)
    revalidatePath('/settings')
    revalidatePath('/dashboard')
    return { success: true, data: profile }
  } catch (error: any) {
    console.error('Error updating profile:', error)
    return { success: false, error: error.message }
  }
}

export async function updatePreferences(preferences: {
  favorite_regions?: string[]
  hidden_gem_intensity?: number
  travel_pace?: string
  budget_range?: string
  interests?: string[]
  dietary_restrictions?: string[]
}) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  try {
    const prefs = await updateUserPreferences(user.id, preferences)
    revalidatePath('/settings')
    return { success: true, data: prefs }
  } catch (error: any) {
    console.error('Error updating preferences:', error)
    return { success: false, error: error.message }
  }
}

export async function getProfileData() {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  try {
    const [profile, preferences] = await Promise.all([
      getUserProfile(user.id),
      getUserPreferences(user.id)
    ])
    
    return { success: true, data: { profile, preferences } }
  } catch (error: any) {
    console.error('Error fetching profile:', error)
    return { success: false, error: error.message }
  }
}

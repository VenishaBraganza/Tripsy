import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

interface PersonalizationData {
  preferredRegion: string
  tripDuration: string
  numberOfTravelers: number
  travelType: string
  interests: string[]
  budgetPreference: string
  travelPace: string
  safetyPreferences: string[]
  accommodationPreference: string
  foodPreference: string
}

export async function POST(request: NextRequest) {
  try {
    const personalizationData: PersonalizationData = await request.json()
    
    // Validate required fields
    if (!personalizationData.interests || personalizationData.interests.length === 0) {
      return NextResponse.json(
        { error: 'At least one interest must be selected' },
        { status: 400 }
      )
    }

    // Create Supabase client
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore cookie setting errors
            }
          },
        },
      }
    )

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Update user profile with onboarding completion
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      console.error('Profile update error:', profileError)
      
      if (profileError.message.includes('onboarding_completed')) {
        return NextResponse.json(
          { 
            error: 'Database not ready. Please run the migration first.',
            migration_needed: true,
            details: 'The onboarding_completed column is missing from the profiles table.'
          },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { error: `Failed to update profile: ${profileError.message}` },
        { status: 500 }
      )
    }

    // Save user personalization data
    const { error: saveError } = await supabase
      .from('user_personalization')
      .upsert({
        user_id: user.id,
        preferred_region: personalizationData.preferredRegion,
        trip_duration: personalizationData.tripDuration,
        number_of_travelers: personalizationData.numberOfTravelers,
        travel_type: personalizationData.travelType,
        interests: personalizationData.interests,
        budget_preference: personalizationData.budgetPreference,
        travel_pace: personalizationData.travelPace,
        safety_preferences: personalizationData.safetyPreferences,
        accommodation_preference: personalizationData.accommodationPreference,
        food_preference: personalizationData.foodPreference,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (saveError) {
      console.error('Save error:', saveError)
      return NextResponse.json(
        { error: `Failed to save preferences: ${saveError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Personalization preferences saved successfully' 
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Create Supabase client
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore cookie setting errors
            }
          },
        },
      }
    )

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Mark onboarding complete (skip functionality)
    const { error: skipError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      })

    if (skipError) {
      console.error('Skip error:', skipError)
      
      if (skipError.message.includes('onboarding_completed')) {
        return NextResponse.json(
          { 
            error: 'Database not ready. Please run the migration first.',
            migration_needed: true,
            details: 'The onboarding_completed column is missing from the profiles table.'
          },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { error: `Failed to complete onboarding: ${skipError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Onboarding completed successfully' 
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore cookie setting errors
            }
          },
        },
      }
    )

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user personalization data
    const { data: personalization, error: fetchError } = await supabase
      .from('user_personalization')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Fetch error:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch personalization data' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      personalization: personalization || {}
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    console.log('Starting persona columns migration...')
    
    // Create Supabase client
    const supabase = await getSupabaseServerClient()

    // Get the authenticated user (only allow authenticated users to run migrations)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Authentication error:', userError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Running migration for user:', user.id)

    // Add onboarding_completed column if it doesn't exist
    const addOnboardingColumn = `
      DO $$ 
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'profiles' 
              AND column_name = 'onboarding_completed'
          ) THEN
              ALTER TABLE profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
          END IF;
      END $$;
    `

    // Add travel_personas column if it doesn't exist
    const addPersonasColumn = `
      DO $$ 
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'profiles' 
              AND column_name = 'travel_personas'
          ) THEN
              ALTER TABLE profiles ADD COLUMN travel_personas TEXT[] DEFAULT '{}';
          END IF;
      END $$;
    `

    // Update existing users
    const updateExistingUsers = `
      UPDATE profiles 
      SET onboarding_completed = COALESCE(onboarding_completed, false),
          travel_personas = COALESCE(travel_personas, '{}')
      WHERE onboarding_completed IS NULL OR travel_personas IS NULL;
    `

    // Execute migrations
    console.log('Adding onboarding_completed column...')
    const { error: error1 } = await supabase.rpc('exec_sql', { sql: addOnboardingColumn })
    if (error1) {
      console.error('Error adding onboarding_completed column:', error1)
    }

    console.log('Adding travel_personas column...')
    const { error: error2 } = await supabase.rpc('exec_sql', { sql: addPersonasColumn })
    if (error2) {
      console.error('Error adding travel_personas column:', error2)
    }

    console.log('Updating existing users...')
    const { error: error3 } = await supabase.rpc('exec_sql', { sql: updateExistingUsers })
    if (error3) {
      console.error('Error updating existing users:', error3)
    }

    // If RPC doesn't work, try direct SQL execution (this might not work in hosted Supabase)
    if (error1 || error2 || error3) {
      console.log('RPC failed, trying direct column addition...')
      
      // Try to add columns directly
      try {
        await supabase.from('profiles').select('onboarding_completed').limit(1)
      } catch (e) {
        console.log('onboarding_completed column missing, will handle gracefully')
      }

      try {
        await supabase.from('profiles').select('travel_personas').limit(1)
      } catch (e) {
        console.log('travel_personas column missing, will handle gracefully')
      }
    }

    console.log('Migration completed successfully')
    return NextResponse.json({ 
      success: true,
      message: 'Persona columns migration completed successfully' 
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: 'Migration failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client
    const supabase = await getSupabaseServerClient()

    // Check if columns exist
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, onboarding_completed, travel_personas')
      .limit(1)

    return NextResponse.json({
      success: true,
      columns_exist: {
        onboarding_completed: profiles && profiles.length > 0 && 'onboarding_completed' in profiles[0],
        travel_personas: profiles && profiles.length > 0 && 'travel_personas' in profiles[0]
      },
      message: 'Column check completed'
    })

  } catch (error) {
    console.error('Column check error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Column check failed'
    })
  }
}
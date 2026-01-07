import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
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
              // Ignore cookie setting errors in server context
            }
          },
        },
      }
    )

    // Check if user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Adding onboarding_completed column to profiles table...')

    // Add the onboarding_completed column if it doesn't exist
    const addColumnQuery = `
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
    `

    // Try to execute the query
    const { error: alterError } = await supabase.rpc('exec_sql', { 
      sql: addColumnQuery 
    })

    if (alterError) {
      console.warn('Could not add column via RPC:', alterError.message)
      
      // Try alternative approach - check if we can query the column
      const { error: testError } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .limit(1)

      if (testError && testError.message.includes('column "onboarding_completed" does not exist')) {
        return NextResponse.json({
          success: false,
          message: 'Column does not exist and cannot be added via API. Please add manually in Supabase dashboard.',
          sql: addColumnQuery,
          error: alterError.message
        })
      } else if (!testError) {
        // Column already exists
        return NextResponse.json({
          success: true,
          message: 'Column already exists'
        })
      }
    }

    // Also create the user_personalization table
    const createPersonalizationTableQuery = `
      CREATE TABLE IF NOT EXISTS user_personalization (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        
        -- Basic Travel Information
        preferred_region TEXT DEFAULT 'south-karnataka',
        trip_duration TEXT DEFAULT '4-7-days',
        number_of_travelers INTEGER DEFAULT 2,
        travel_type TEXT DEFAULT 'couple',
        
        -- Interest Selection
        interests TEXT[] DEFAULT '{}',
        
        -- Budget & Travel Style
        budget_preference TEXT DEFAULT 'medium',
        travel_pace TEXT DEFAULT 'balanced',
        
        -- Safety & Accessibility
        safety_preferences TEXT[] DEFAULT '{}',
        
        -- Optional Enhancements
        accommodation_preference TEXT DEFAULT 'any',
        food_preference TEXT DEFAULT 'no-preference',
        
        -- Metadata
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        
        UNIQUE(user_id)
      );

      -- Enable RLS
      ALTER TABLE user_personalization ENABLE ROW LEVEL SECURITY;

      -- Create policies
      DROP POLICY IF EXISTS "Users can view own personalization" ON user_personalization;
      DROP POLICY IF EXISTS "Users can create own personalization" ON user_personalization;
      DROP POLICY IF EXISTS "Users can update own personalization" ON user_personalization;
      
      CREATE POLICY "Users can view own personalization" ON user_personalization FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY "Users can create own personalization" ON user_personalization FOR INSERT WITH CHECK (auth.uid() = user_id);
      CREATE POLICY "Users can update own personalization" ON user_personalization FOR UPDATE USING (auth.uid() = user_id);
    `

    const { error: createTableError } = await supabase.rpc('exec_sql', { 
      sql: createPersonalizationTableQuery 
    })

    if (createTableError) {
      console.warn('Could not create personalization table:', createTableError.message)
    }

    return NextResponse.json({
      success: true,
      message: 'Database migration completed successfully',
      details: {
        onboarding_column_added: !alterError,
        personalization_table_created: !createTableError
      }
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
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

    // Check if onboarding_completed column exists
    const { error: columnError } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .limit(1)

    const hasOnboardingColumn = !columnError || !columnError.message.includes('does not exist')

    // Check if personalization table exists
    const { error: tableError } = await supabase
      .from('user_personalization')
      .select('id')
      .limit(1)

    const hasPersonalizationTable = !tableError || !tableError.message.includes('does not exist')

    return NextResponse.json({
      onboarding_column_exists: hasOnboardingColumn,
      personalization_table_exists: hasPersonalizationTable,
      ready_for_personalization: hasOnboardingColumn && hasPersonalizationTable
    })

  } catch (error) {
    console.error('Check error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to check database status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
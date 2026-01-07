import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client with service role key for admin operations
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

    // Check if user is authenticated (optional security check)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Create the user_personalization table
    const createTableQuery = `
      -- Add user_personalization table for detailed travel preferences
      CREATE TABLE IF NOT EXISTS user_personalization (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        
        -- Basic Travel Information
        preferred_region TEXT DEFAULT 'south-karnataka',
        trip_duration TEXT DEFAULT '4-7-days' CHECK (trip_duration IN ('1-3-days', '4-7-days', '1-week-plus')),
        number_of_travelers INTEGER DEFAULT 2,
        travel_type TEXT DEFAULT 'couple' CHECK (travel_type IN ('solo', 'family', 'friends', 'couple')),
        
        -- Interest Selection (Multi-select)
        interests TEXT[] DEFAULT '{}',
        
        -- Budget & Travel Style
        budget_preference TEXT DEFAULT 'medium' CHECK (budget_preference IN ('budget', 'medium', 'premium')),
        travel_pace TEXT DEFAULT 'balanced' CHECK (travel_pace IN ('relaxed', 'balanced', 'packed')),
        
        -- Safety & Accessibility Preferences
        safety_preferences TEXT[] DEFAULT '{}',
        
        -- Optional Personalization Enhancements
        accommodation_preference TEXT DEFAULT 'any' CHECK (accommodation_preference IN ('hotel', 'homestay', 'any')),
        food_preference TEXT DEFAULT 'no-preference' CHECK (food_preference IN ('vegetarian', 'non-vegetarian', 'no-preference')),
        
        -- Metadata
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        
        UNIQUE(user_id)
      );
    `

    const { error: createError } = await supabase.rpc('exec_sql', { 
      sql: createTableQuery 
    })

    if (createError) {
      console.error('Error creating table:', createError)
      // Try direct query if RPC doesn't work
      const { error: directError } = await supabase
        .from('user_personalization')
        .select('id')
        .limit(1)

      if (directError && directError.code === '42P01') {
        // Table doesn't exist, but we can't create it via API
        return NextResponse.json({
          success: false,
          message: 'Table creation requires direct database access. Please run the migration script manually.',
          error: createError.message
        })
      }
    }

    // Create index
    const createIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_user_personalization_user_id ON user_personalization(user_id);
    `

    await supabase.rpc('exec_sql', { sql: createIndexQuery })

    // Enable RLS and create policies
    const rlsQuery = `
      ALTER TABLE user_personalization ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Users can view own personalization" ON user_personalization;
      DROP POLICY IF EXISTS "Users can create own personalization" ON user_personalization;
      DROP POLICY IF EXISTS "Users can update own personalization" ON user_personalization;
      
      CREATE POLICY "Users can view own personalization" ON user_personalization FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY "Users can create own personalization" ON user_personalization FOR INSERT WITH CHECK (auth.uid() = user_id);
      CREATE POLICY "Users can update own personalization" ON user_personalization FOR UPDATE USING (auth.uid() = user_id);
    `

    await supabase.rpc('exec_sql', { sql: rlsQuery })

    return NextResponse.json({
      success: true,
      message: 'Personalization table created successfully'
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

    // Check if table exists by trying to query it
    const { data, error } = await supabase
      .from('user_personalization')
      .select('id')
      .limit(1)

    if (error && error.code === '42P01') {
      return NextResponse.json({
        exists: false,
        message: 'user_personalization table does not exist'
      })
    }

    return NextResponse.json({
      exists: true,
      message: 'user_personalization table exists',
      sampleData: data
    })

  } catch (error) {
    console.error('Check error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to check table existence',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
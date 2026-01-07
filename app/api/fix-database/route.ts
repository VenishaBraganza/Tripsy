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

    console.log('🔧 Attempting to fix database schema...')

    // Step 1: Try to add the onboarding_completed column
    try {
      // First, let's check if the column already exists
      const { data: existingData, error: checkError } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .limit(1)

      if (checkError && checkError.message.includes('does not exist')) {
        // Column doesn't exist, we need to add it
        console.log('❌ onboarding_completed column missing')
        
        // Try to add it via a simple update (this will fail but might give us more info)
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ onboarding_completed: true })
          .eq('id', user.id)

        if (updateError) {
          console.log('Update error:', updateError.message)
        }
        
        return NextResponse.json({
          success: false,
          error: 'Column missing - manual SQL required',
          instructions: {
            step1: 'Go to your Supabase Dashboard',
            step2: 'Click SQL Editor',
            step3: 'Run this SQL:',
            sql: 'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;',
            step4: 'Then try the personalization form again'
          }
        })
      } else {
        console.log('✅ onboarding_completed column exists')
      }
    } catch (error) {
      console.error('Error checking column:', error)
    }

    // Step 2: Try to create the personalization table
    try {
      const { data: tableData, error: tableError } = await supabase
        .from('user_personalization')
        .select('id')
        .limit(1)

      if (tableError && tableError.message.includes('does not exist')) {
        console.log('❌ user_personalization table missing')
        
        return NextResponse.json({
          success: false,
          error: 'Table missing - manual SQL required',
          instructions: {
            step1: 'Go to your Supabase Dashboard',
            step2: 'Click SQL Editor',
            step3: 'Run this complete SQL:',
            sql: `
-- Add missing column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Create personalization table
CREATE TABLE IF NOT EXISTS user_personalization (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  preferred_region TEXT DEFAULT 'south-karnataka',
  trip_duration TEXT DEFAULT '4-7-days',
  number_of_travelers INTEGER DEFAULT 2,
  travel_type TEXT DEFAULT 'couple',
  interests TEXT[] DEFAULT '{}',
  budget_preference TEXT DEFAULT 'medium',
  travel_pace TEXT DEFAULT 'balanced',
  safety_preferences TEXT[] DEFAULT '{}',
  accommodation_preference TEXT DEFAULT 'any',
  food_preference TEXT DEFAULT 'no-preference',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable security
ALTER TABLE user_personalization ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own personalization" ON user_personalization FOR ALL USING (auth.uid() = user_id);
            `,
            step4: 'Then try the personalization form again'
          }
        })
      } else {
        console.log('✅ user_personalization table exists')
      }
    } catch (error) {
      console.error('Error checking table:', error)
    }

    // If we get here, everything should be working
    return NextResponse.json({
      success: true,
      message: 'Database appears to be ready!',
      next_step: 'Try the personalization form again'
    })

  } catch (error) {
    console.error('Fix database error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Database check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Use POST to run database fix',
    instructions: 'Send a POST request to this endpoint to check and fix database issues'
  })
}
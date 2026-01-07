import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

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

    const results = {
      profiles_table: false,
      onboarding_column: false,
      personalization_table: false,
      ready: false,
      errors: []
    }

    // Test 1: Check if profiles table exists
    try {
      const { error: profilesError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
      
      if (!profilesError) {
        results.profiles_table = true
      } else {
        results.errors.push(`Profiles table: ${profilesError.message}`)
      }
    } catch (error) {
      results.errors.push(`Profiles table test failed: ${error}`)
    }

    // Test 2: Check if onboarding_completed column exists
    try {
      const { error: columnError } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .limit(1)
      
      if (!columnError) {
        results.onboarding_column = true
      } else {
        results.errors.push(`Onboarding column: ${columnError.message}`)
      }
    } catch (error) {
      results.errors.push(`Onboarding column test failed: ${error}`)
    }

    // Test 3: Check if user_personalization table exists
    try {
      const { error: tableError } = await supabase
        .from('user_personalization')
        .select('id')
        .limit(1)
      
      if (!tableError) {
        results.personalization_table = true
      } else {
        results.errors.push(`Personalization table: ${tableError.message}`)
      }
    } catch (error) {
      results.errors.push(`Personalization table test failed: ${error}`)
    }

    // Overall readiness
    results.ready = results.profiles_table && results.onboarding_column && results.personalization_table

    return NextResponse.json({
      success: true,
      database_status: results,
      message: results.ready 
        ? "✅ Database is ready for personalization!" 
        : "❌ Database needs setup. Check the errors for details.",
      next_steps: results.ready 
        ? ["Your personalization system should work now!"]
        : [
            "1. Go to your Supabase Dashboard",
            "2. Navigate to SQL Editor", 
            "3. Run the SQL from QUICK_DATABASE_FIX.md",
            "4. Refresh this page to test again"
          ]
    })

  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Database test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
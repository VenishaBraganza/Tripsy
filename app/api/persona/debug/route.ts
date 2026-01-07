import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    console.log('Debug persona API called')
    
    // Create Supabase client
    const supabase = await getSupabaseServerClient()

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({
        error: 'Not authenticated',
        user: null,
        userError: userError?.message
      })
    }

    console.log('User authenticated:', user.id)

    // Try to get profile with all possible columns
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    console.log('Profile data:', profile)
    console.log('Profile error:', profileError)

    // Check what columns exist in the profiles table
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'profiles')

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      },
      profile,
      profileError: profileError?.message,
      availableColumns: tableInfo?.map(col => col.column_name) || [],
      tableError: tableError?.message
    })

  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
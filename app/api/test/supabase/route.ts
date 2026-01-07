import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()
    
    // Test basic connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: `Database error: ${error.message}`
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Database connected successfully!'
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: `Connection failed: ${error.message}`
    })
  }
}
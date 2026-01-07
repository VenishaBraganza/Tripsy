import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { recommendationEngine } from '@/lib/recommendation/engine'

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const { packageId, action } = await request.json()
    
    if (!packageId || !action) {
      return NextResponse.json(
        { error: 'Missing packageId or action' },
        { status: 400 }
      )
    }
    
    if (!['shown', 'clicked', 'booked'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be: shown, clicked, or booked' },
        { status: 400 }
      )
    }
    
    await recommendationEngine.trackRecommendation(user.id, packageId, action)
    
    return NextResponse.json({ 
      success: true,
      message: `Recommendation ${action} tracked successfully`
    })
    
  } catch (error: any) {
    console.error('Error tracking recommendation:', error)
    return NextResponse.json(
      { error: 'Failed to track recommendation', details: error.message },
      { status: 500 }
    )
  }
}
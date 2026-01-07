import { NextResponse } from 'next/server'
import { getUserTrips, createTrip } from '@/lib/supabase/queries'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || undefined
  
  try {
    const trips = await getUserTrips(user.id, status)
    return NextResponse.json({ trips, count: trips.length })
  } catch (error: any) {
    console.error('Error fetching trips:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trips', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    const trip = await createTrip({
      ...body,
      user_id: user.id,
    })
    
    return NextResponse.json({ trip }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating trip:', error)
    return NextResponse.json(
      { error: 'Failed to create trip', details: error.message },
      { status: 500 }
    )
  }
}

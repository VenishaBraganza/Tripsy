import { NextResponse } from 'next/server'
import { getDestinations, searchDestinations } from '@/lib/supabase/queries'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  const search = searchParams.get('search')
  const region = searchParams.get('region')
  const hiddenGemScore = searchParams.get('hiddenGemScore') ? Number(searchParams.get('hiddenGemScore')) : undefined
  const tags = searchParams.get('tags')?.split(',').filter(Boolean)
  const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined
  
  try {
    let destinations
    
    if (search) {
      destinations = await searchDestinations(search)
    } else {
      destinations = await getDestinations({
        region,
        hiddenGemScore,
        tags,
        limit
      })
    }
    
    return NextResponse.json({ 
      destinations, 
      count: destinations.length 
    })
  } catch (error: any) {
    console.error('Error fetching destinations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch destinations', details: error.message },
      { status: 500 }
    )
  }
}
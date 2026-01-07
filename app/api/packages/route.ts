import { NextResponse } from 'next/server'
import { getPackages, createPackage } from '@/lib/supabase/queries'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  const filters = {
    destinationId: searchParams.get('destinationId') || undefined,
    category: searchParams.get('category') || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    status: searchParams.get('status') || 'live',
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20, // Default limit for pagination
    offset: searchParams.get('offset') ? Number(searchParams.get('offset')) : 0, // Pagination offset
  }
  
  try {
    const packages = await getPackages(filters)
    return NextResponse.json({ packages, count: packages.length })
  } catch (error: any) {
    console.error('Error fetching packages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch packages', details: error.message },
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
  
  // Check if user is admin/operator
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (!profile || !['admin', 'operator'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  try {
    const body = await request.json()
    const newPackage = await createPackage(body, user.id)
    return NextResponse.json({ package: newPackage }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating package:', error)
    return NextResponse.json(
      { error: 'Failed to create package', details: error.message },
      { status: 500 }
    )
  }
}

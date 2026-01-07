import { NextResponse } from 'next/server'
import { getPackageBySlug, updatePackage, trackPackageView } from '@/lib/supabase/queries'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const packageData = await getPackageBySlug(params.slug)
    
    // Track view
    const supabase = await getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    await trackPackageView(user?.id || null, packageData.id)
    
    return NextResponse.json({ package: packageData })
  } catch (error: any) {
    console.error('Error fetching package:', error)
    return NextResponse.json(
      { error: 'Package not found', details: error.message },
      { status: 404 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    const packageData = await getPackageBySlug(params.slug)
    const updatedPackage = await updatePackage(packageData.id, body, user.id)
    
    return NextResponse.json({ package: updatedPackage })
  } catch (error: any) {
    console.error('Error updating package:', error)
    return NextResponse.json(
      { error: 'Failed to update package', details: error.message },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()
    
    // Check if we have real data in the database
    const [
      { count: destinationsCount },
      { count: packagesCount },
      { count: tripsCount },
      { count: bookingsCount }
    ] = await Promise.all([
      supabase.from('destinations').select('*', { count: 'exact', head: true }),
      supabase.from('packages').select('*', { count: 'exact', head: true }),
      supabase.from('trips').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('*', { count: 'exact', head: true })
    ])

    // Get current user data if authenticated
    const { data: { user } } = await supabase.auth.getUser()
    let userDataStatus = null
    
    if (user) {
      const [
        { count: userTripsCount },
        { count: userBookingsCount },
        { count: userWishlistCount }
      ] = await Promise.all([
        supabase.from('trips').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('wishlist').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      ])
      
      userDataStatus = {
        trips: userTripsCount || 0,
        bookings: userBookingsCount || 0,
        wishlist: userWishlistCount || 0,
        hasData: (userTripsCount || 0) > 0 || (userBookingsCount || 0) > 0 || (userWishlistCount || 0) > 0
      }
    }

    const hasRealData = {
      destinations: (destinationsCount || 0) > 0,
      packages: (packagesCount || 0) > 0,
      trips: (tripsCount || 0) > 0,
      bookings: (bookingsCount || 0) > 0
    }

    const overallStatus = Object.values(hasRealData).some(Boolean) ? 'partial' : 'empty'

    return NextResponse.json({
      success: true,
      status: overallStatus,
      counts: {
        destinations: destinationsCount || 0,
        packages: packagesCount || 0,
        trips: tripsCount || 0,
        bookings: bookingsCount || 0
      },
      hasRealData,
      userDataStatus,
      recommendations: {
        needsPackageData: (packagesCount || 0) === 0,
        needsUserData: user && !userDataStatus?.hasData,
        readyForTesting: Object.values(hasRealData).every(Boolean)
      }
    })

  } catch (error: any) {
    console.error('Error checking data status:', error)
    return NextResponse.json(
      { error: 'Failed to check data status', details: error.message },
      { status: 500 }
    )
  }
}
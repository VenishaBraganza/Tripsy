import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await getSupabaseServerClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }

    // Create realistic trips for the user
    const realTrips = [
      {
        user_id: user.id,
        destination: "Mysore, Karnataka",
        start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
        travelers_count: 2,
        status: 'upcoming',
        total_cost: 15000,
        trip_type: 'leisure',
        notes: 'Heritage tour with palace visits and cultural experiences'
      },
      {
        user_id: user.id,
        destination: "Coorg, Karnataka", 
        start_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days from now
        end_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days from now
        travelers_count: 4,
        status: 'upcoming',
        total_cost: 28000,
        trip_type: 'leisure',
        notes: 'Coffee plantation experience with family'
      },
      {
        user_id: user.id,
        destination: "Hampi, Karnataka",
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        end_date: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000).toISOString(), // 27 days ago
        travelers_count: 2,
        status: 'completed',
        total_cost: 12000,
        trip_type: 'leisure',
        notes: 'UNESCO World Heritage site exploration'
      }
    ]

    // Insert trips
    const { data: insertedTrips, error: tripsError } = await supabase
      .from('trips')
      .upsert(realTrips, { onConflict: 'id' })
      .select()

    if (tripsError) {
      console.error('Error inserting trips:', tripsError)
      return NextResponse.json({ error: 'Failed to create trips' }, { status: 500 })
    }

    // Create realistic bookings for upcoming trips
    const upcomingTrips = insertedTrips.filter(trip => trip.status === 'upcoming')
    const realBookings = []

    for (const trip of upcomingTrips) {
      if (trip.destination.includes('Mysore')) {
        realBookings.push(
          {
            trip_id: trip.id,
            user_id: user.id,
            booking_type: 'flight',
            title: 'Flight to Bangalore',
            description: 'AI 503 • Departs 08:30 AM',
            travel_date: trip.start_date,
            status: 'confirmed',
            cost: 4500,
            confirmation_number: 'AI503BLR123',
            provider: 'Air India'
          },
          {
            trip_id: trip.id,
            user_id: user.id,
            booking_type: 'hotel',
            title: 'Hotel Mysore Palace',
            description: 'Deluxe Room • Check-in 2:00 PM',
            travel_date: trip.start_date,
            status: 'confirmed',
            cost: 8500,
            confirmation_number: 'MYS2025001',
            provider: 'Hotel Mysore Palace'
          },
          {
            trip_id: trip.id,
            user_id: user.id,
            booking_type: 'activity',
            title: 'Mysore Palace Tour',
            description: 'Guided heritage tour • 10:00 AM',
            travel_date: new Date(new Date(trip.start_date).getTime() + 24 * 60 * 60 * 1000).toISOString(),
            status: 'confirmed',
            cost: 2000,
            confirmation_number: 'MPT001',
            provider: 'Karnataka Tourism'
          }
        )
      }
      
      if (trip.destination.includes('Coorg')) {
        realBookings.push(
          {
            trip_id: trip.id,
            user_id: user.id,
            booking_type: 'transport',
            title: 'Cab to Coorg',
            description: 'Toyota Innova • Pickup 6:00 AM',
            travel_date: trip.start_date,
            status: 'pending',
            cost: 6000,
            confirmation_number: 'CAB2025002',
            provider: 'Coorg Travels'
          },
          {
            trip_id: trip.id,
            user_id: user.id,
            booking_type: 'hotel',
            title: 'Coffee Estate Resort',
            description: 'Family Suite • Check-in 3:00 PM',
            travel_date: trip.start_date,
            status: 'confirmed',
            cost: 18000,
            confirmation_number: 'CER2025003',
            provider: 'Coorg Coffee Estate Resort'
          },
          {
            trip_id: trip.id,
            user_id: user.id,
            booking_type: 'activity',
            title: 'Coffee Plantation Tour',
            description: 'Full day tour with tasting • 9:00 AM',
            travel_date: new Date(new Date(trip.start_date).getTime() + 24 * 60 * 60 * 1000).toISOString(),
            status: 'confirmed',
            cost: 4000,
            confirmation_number: 'CPT001',
            provider: 'Coorg Adventures'
          }
        )
      }
    }

    // Insert bookings
    let insertedBookings = []
    if (realBookings.length > 0) {
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .upsert(realBookings, { onConflict: 'id' })
        .select()

      if (bookingsError) {
        console.error('Error inserting bookings:', bookingsError)
      } else {
        insertedBookings = bookingsData
      }
    }

    // Create/update loyalty points
    const { data: loyaltyData, error: loyaltyError } = await supabase
      .from('loyalty_points')
      .upsert({
        user_id: user.id,
        points: 8750,
        tier: 'gold',
        lifetime_points: 15420,
        tier_progress: 75
      }, { onConflict: 'user_id' })
      .select()

    if (loyaltyError) {
      console.error('Error updating loyalty points:', loyaltyError)
    }

    // Create realistic wishlist items
    const realWishlist = [
      {
        user_id: user.id,
        package_id: null,
        destination_name: 'Gokarna, Karnataka',
        item_type: 'destination',
        collection_name: 'Beach Destinations',
        notes: 'Peaceful beaches and temples',
        priority: 1
      },
      {
        user_id: user.id,
        package_id: null,
        destination_name: 'Chikmagalur, Karnataka',
        item_type: 'destination', 
        collection_name: 'Hill Stations',
        notes: 'Coffee trails and mountain views',
        priority: 2
      },
      {
        user_id: user.id,
        package_id: null,
        destination_name: 'Bandipur National Park, Karnataka',
        item_type: 'destination',
        collection_name: 'Wildlife',
        notes: 'Tiger safari and wildlife photography',
        priority: 3
      }
    ]

    // Insert wishlist
    const { data: wishlistData, error: wishlistError } = await supabase
      .from('wishlist')
      .upsert(realWishlist, { onConflict: 'id' })
      .select()

    if (wishlistError) {
      console.error('Error inserting wishlist:', wishlistError)
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully created realistic user data',
      data: {
        trips: insertedTrips.length,
        bookings: insertedBookings.length,
        loyaltyPoints: loyaltyData ? loyaltyData.points : 0,
        wishlist: wishlistData ? wishlistData.length : 0
      }
    })

  } catch (error: any) {
    console.error('Error seeding user data:', error)
    return NextResponse.json(
      { error: 'Failed to seed user data', details: error.message },
      { status: 500 }
    )
  }
}
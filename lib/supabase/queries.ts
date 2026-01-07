import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// =====================================================
// USER QUERIES
// =====================================================

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data
}

export async function updateUserProfile(userId: string, updates: any) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getUserPreferences(userId: string) {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error) throw error
  return data
}

export async function updateUserPreferences(userId: string, preferences: any) {
  const { data, error} = await supabase
    .from('user_preferences')
    .upsert({ user_id: userId, ...preferences })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getTravelDNA(userId: string) {
  const { data, error } = await supabase
    .from('travel_dna')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error) throw error
  return data
}

// =====================================================
// DESTINATION QUERIES
// =====================================================

export async function getDestinations(filters?: {
  region?: string
  hiddenGemScore?: number
  tags?: string[]
  limit?: number
}) {
  let query = supabase
    .from('destinations')
    .select('*')
    .eq('is_active', true)
  
  if (filters?.region) {
    query = query.eq('region', filters.region)
  }
  
  if (filters?.hiddenGemScore) {
    query = query.gte('hidden_gem_score', filters.hiddenGemScore)
  }
  
  if (filters?.tags && filters.tags.length > 0) {
    query = query.contains('tags', filters.tags)
  }
  
  if (filters?.limit) {
    query = query.limit(filters.limit)
  }
  
  const { data, error } = await query.order('popularity_score', { ascending: false })
  
  if (error) throw error
  return data
}

export async function getDestinationBySlug(slug: string) {
  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error) throw error
  return data
}

export async function searchDestinations(searchTerm: string) {
  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    .eq('is_active', true)
    .limit(10)
  
  if (error) throw error
  return data
}

// =====================================================
// PACKAGE QUERIES
// =====================================================

export async function getPackages(filters?: {
  destinationId?: string
  status?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  limit?: number
}) {
  let query = supabase
    .from('packages')
    .select(`
      *,
      destinations (
        name,
        slug,
        state,
        region,
        image_url
      )
    `)
  
  if (filters?.destinationId) {
    query = query.eq('destination_id', filters.destinationId)
  }
  
  if (filters?.status) {
    query = query.eq('status', filters.status)
  } else {
    query = query.eq('status', 'live')
  }
  
  if (filters?.category) {
    query = query.eq('category', filters.category)
  }
  
  if (filters?.minPrice) {
    query = query.gte('base_price', filters.minPrice)
  }
  
  if (filters?.maxPrice) {
    query = query.lte('base_price', filters.maxPrice)
  }
  
  if (filters?.limit) {
    query = query.limit(filters.limit)
  }
  
  const { data, error } = await query.order('total_bookings', { ascending: false })
  
  if (error) throw error
  return data
}

export async function getPackageBySlug(slug: string) {
  const { data, error } = await supabase
    .from('packages')
    .select(`
      *,
      destinations (*)
    `)
    .eq('slug', slug)
    .single()
  
  if (error) throw error
  return data
}

export async function createPackage(packageData: any, userId: string) {
  const { data, error } = await supabase
    .from('packages')
    .insert({
      ...packageData,
      created_by: userId,
      last_edited_by: userId
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updatePackage(packageId: string, updates: any, userId: string) {
  const { data, error } = await supabase
    .from('packages')
    .update({
      ...updates,
      last_edited_by: userId,
      version: supabase.rpc('increment', { x: 1 })
    })
    .eq('id', packageId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// =====================================================
// TRIP QUERIES
// =====================================================

export async function getUserTrips(userId: string, status?: string) {
  let query = supabase
    .from('trips')
    .select(`
      *,
      packages (
        name,
        slug,
        image_url
      )
    `)
    .eq('user_id', userId)
  
  if (status) {
    query = query.eq('status', status)
  }
  
  const { data, error } = await query.order('start_date', { ascending: true })
  
  if (error) throw error
  return data
}

export async function createTrip(tripData: any) {
  const { data, error } = await supabase
    .from('trips')
    .insert(tripData)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateTrip(tripId: string, updates: any) {
  const { data, error } = await supabase
    .from('trips')
    .update(updates)
    .eq('id', tripId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// =====================================================
// BOOKING QUERIES
// =====================================================

export async function getUserBookings(userId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      trips (
        destination,
        start_date,
        end_date
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function getTripBookings(tripId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('trip_id', tripId)
    .order('travel_date', { ascending: true })
  
  if (error) throw error
  return data
}

export async function createBooking(bookingData: any) {
  const { data, error } = await supabase
    .from('bookings')
    .insert(bookingData)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// =====================================================
// WISHLIST QUERIES
// =====================================================

export async function getUserWishlist(userId: string, collection?: string) {
  let query = supabase
    .from('wishlist')
    .select(`
      *,
      packages (
        name,
        slug,
        base_price,
        discounted_price,
        duration_text,
        image_url,
        tags,
        destinations (
          name,
          state
        )
      ),
      destinations (
        name,
        slug,
        min_price,
        max_price,
        image_url
      )
    `)
    .eq('user_id', userId)
  
  if (collection && collection !== 'all') {
    query = query.eq('collection_name', collection)
  }
  
  const { data, error } = await query.order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function addToWishlist(userId: string, itemData: any) {
  const { data, error } = await supabase
    .from('wishlist')
    .insert({
      user_id: userId,
      ...itemData
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function removeFromWishlist(wishlistId: string) {
  const { error } = await supabase
    .from('wishlist')
    .delete()
    .eq('id', wishlistId)
  
  if (error) throw error
}

// =====================================================
// REVIEW QUERIES
// =====================================================

export async function getPackageReviews(packageId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      profiles (
        full_name,
        avatar_url
      )
    `)
    .eq('package_id', packageId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function createReview(reviewData: any) {
  const { data, error } = await supabase
    .from('reviews')
    .insert(reviewData)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// =====================================================
// LOYALTY QUERIES
// =====================================================

export async function getLoyaltyPoints(userId: string) {
  const { data, error } = await supabase
    .from('loyalty_points')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error) throw error
  return data
}

export async function addLoyaltyPoints(userId: string, points: number, reason: string) {
  // Add transaction
  await supabase
    .from('loyalty_transactions')
    .insert({
      user_id: userId,
      points,
      transaction_type: 'earned',
      reason
    })
  
  // Update total
  const { data, error } = await supabase
    .rpc('add_loyalty_points', {
      p_user_id: userId,
      p_points: points
    })
  
  if (error) throw error
  return data
}

// =====================================================
// SUPPORT QUERIES
// =====================================================

export async function getUserTickets(userId: string) {
  const { data, error } = await supabase
    .from('support_tickets')
    .select(`
      *,
      support_messages (
        message,
        created_at,
        sender_id
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function createSupportTicket(ticketData: any) {
  const ticketNumber = `T-${Date.now().toString().slice(-6)}`
  
  const { data, error } = await supabase
    .from('support_tickets')
    .insert({
      ...ticketData,
      ticket_number: ticketNumber
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function addTicketMessage(ticketId: string, senderId: string, message: string) {
  const { data, error } = await supabase
    .from('support_messages')
    .insert({
      ticket_id: ticketId,
      sender_id: senderId,
      message
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

// =====================================================
// NOTIFICATION QUERIES
// =====================================================

export async function getUserNotifications(userId: string, unreadOnly = false) {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
  
  if (unreadOnly) {
    query = query.eq('is_read', false)
  }
  
  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(50)
  
  if (error) throw error
  return data
}

export async function markNotificationAsRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
  
  if (error) throw error
}

export async function createNotification(notificationData: any) {
  const { data, error } = await supabase
    .from('notifications')
    .insert(notificationData)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// =====================================================
// AI & RECOMMENDATIONS
// =====================================================

export async function getPersonalizedRecommendations(userId: string, limit = 10) {
  const { data, error } = await supabase
    .from('ai_recommendations')
    .select(`
      *,
      packages (
        *,
        destinations (*)
      )
    `)
    .eq('user_id', userId)
    .order('confidence_score', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data
}

export async function trackPackageView(userId: string | null, packageId: string) {
  await supabase
    .from('page_views')
    .insert({
      user_id: userId,
      package_id: packageId,
      page_type: 'package'
    })
  
  // Increment view count
  await supabase
    .rpc('increment_package_views', { package_id: packageId })
}

export async function trackConversionEvent(
  userId: string,
  packageId: string,
  eventType: 'view' | 'enquiry' | 'booking'
) {
  const { error } = await supabase
    .from('conversion_events')
    .insert({
      user_id: userId,
      package_id: packageId,
      event_type: eventType
    })
  
  if (error) throw error
}

/**
 * Cache Keys
 * Centralized cache key definitions
 */

export const CacheKeys = {
  // User data (5 min TTL)
  USER_PROFILE: (userId: string) => `user_profile_${userId}`,
  USER_PREFERENCES: (userId: string) => `user_preferences_${userId}`,
  LOYALTY_POINTS: (userId: string) => `loyalty_points_${userId}`,
  
  // Trips and bookings (5 min TTL)
  USER_TRIPS: (userId: string) => `user_trips_${userId}`,
  USER_BOOKINGS: (userId: string) => `user_bookings_${userId}`,
  TRIP_DETAILS: (tripId: string) => `trip_details_${tripId}`,
  
  // Packages (15 min TTL)
  PACKAGES_LIST: (filters?: string) => `packages_list_${filters || 'all'}`,
  PACKAGE_DETAILS: (packageId: string) => `package_details_${packageId}`,
  
  // Destinations (1 hour TTL)
  DESTINATIONS_LIST: (filters?: string) => `destinations_list_${filters || 'all'}`,
  DESTINATION_DETAILS: (destinationId: string) => `destination_details_${destinationId}`,
  HIDDEN_GEMS: (filters?: string) => `hidden_gems_${filters || 'all'}`,
  
  // Wishlist (5 min TTL)
  USER_WISHLIST: (userId: string) => `user_wishlist_${userId}`,
  
  // Notifications (1 min TTL)
  USER_NOTIFICATIONS: (userId: string) => `user_notifications_${userId}`,
  NOTIFICATION_COUNT: (userId: string) => `notification_count_${userId}`,
  
  // Support (5 min TTL)
  USER_TICKETS: (userId: string) => `user_tickets_${userId}`,
  TICKET_DETAILS: (ticketId: string) => `ticket_details_${ticketId}`,
  
  // Weather (15 min TTL)
  WEATHER: (lat: number, lng: number) => `weather_${lat}_${lng}`,
  
  // Recommendations (30 min TTL)
  USER_RECOMMENDATIONS: (userId: string) => `user_recommendations_${userId}`,
}

export const CacheTTL = {
  SHORT: 1 * 60 * 1000, // 1 minute
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 15 * 60 * 1000, // 15 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 hour
  DAY: 24 * 60 * 60 * 1000, // 24 hours
}

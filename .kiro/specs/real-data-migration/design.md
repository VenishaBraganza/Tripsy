# Design Document: Real Data Migration

## Overview

This design document outlines the architecture and implementation strategy for removing all mock/fake data from the Tripsy application and replacing it with real-time data from databases, APIs, and external services. The migration will be systematic, ensuring data integrity, proper error handling, and optimal performance.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Pages      │  │  Components  │  │    Hooks     │     │
│  │  (Server)    │  │   (Client)   │  │   (Client)   │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   Supabase    │   │  External     │   │   AI/ML       │
│   Database    │   │  APIs         │   │   Services    │
│               │   │               │   │               │
│ • Auth        │   │ • Maps        │   │ • OpenAI      │
│ • Profiles    │   │ • Weather     │   │ • Recommendations│
│ • Trips       │   │ • Places      │   │ • Analysis    │
│ • Bookings    │   │ • Payments    │   │               │
│ • Packages    │   │               │   │               │
│ • Realtime    │   │               │   │               │
└───────────────┘   └───────────────┘   └───────────────┘
```

### Data Flow

1. **Server-Side Rendering (SSR)**: Pages fetch initial data from Supabase
2. **Client-Side Hydration**: Components receive data as props
3. **Real-time Updates**: Supabase Realtime subscriptions for live data
4. **API Calls**: External services for maps, weather, payments
5. **Caching**: Local storage and memory caching for performance

## Components and Interfaces

### 1. Authentication Service

**Purpose**: Manage user authentication and session handling

**Interface**:
```typescript
interface AuthService {
  // Check if user is authenticated
  isAuthenticated(): Promise<boolean>
  
  // Get current user
  getCurrentUser(): Promise<User | null>
  
  // Redirect to login if not authenticated
  requireAuth(): Promise<void>
  
  // Handle session expiration
  handleSessionExpired(): void
}
```

**Implementation**:
- Use Supabase Auth for authentication
- Remove all mock user data
- Implement middleware to protect routes
- Add session refresh logic

### 2. Data Fetching Layer

**Purpose**: Centralized data fetching with error handling

**Interface**:
```typescript
interface DataFetcher<T> {
  // Fetch data with loading and error states
  fetch(params?: any): Promise<DataResult<T>>
  
  // Refetch data
  refetch(): Promise<DataResult<T>>
  
  // Subscribe to real-time updates
  subscribe(callback: (data: T) => void): () => void
}

interface DataResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
}
```

**Implementation**:
- Create custom hooks for each data type
- Implement loading states
- Add error handling with retry logic
- Use Supabase Realtime for subscriptions

### 3. External API Integration Layer

**Purpose**: Manage connections to external services

**Interfaces**:

```typescript
// Maps Service
interface MapsService {
  getCurrentLocation(): Promise<Coordinates>
  getRoute(origin: Coordinates, destination: Coordinates): Promise<Route>
  getNearbyPlaces(location: Coordinates, type: PlaceType): Promise<Place[]>
  getTrafficData(route: Route): Promise<TrafficData>
}

// Weather Service
interface WeatherService {
  getWeather(location: Coordinates): Promise<WeatherData>
  getForecast(location: Coordinates, days: number): Promise<ForecastData>
}

// Places Service
interface PlacesService {
  searchRestaurants(location: Coordinates, filters: RestaurantFilters): Promise<Restaurant[]>
  getPlaceDetails(placeId: string): Promise<PlaceDetails>
  getReviews(placeId: string): Promise<Review[]>
}

// Payment Service
interface PaymentService {
  createPaymentIntent(amount: number, currency: string): Promise<PaymentIntent>
  confirmPayment(intentId: string): Promise<PaymentResult>
  getPaymentHistory(userId: string): Promise<Payment[]>
}
```

**Implementation**:
- Integrate Google Maps API / Mapbox
- Use OpenWeatherMap API for weather
- Integrate Google Places API / Yelp API
- Use Stripe or Razorpay for payments
- Implement rate limiting and caching

### 4. Database Query Layer

**Purpose**: Type-safe database queries with RLS

**Interface**:
```typescript
interface DatabaseQueries {
  // User data
  getUserProfile(userId: string): Promise<Profile>
  updateUserProfile(userId: string, data: Partial<Profile>): Promise<Profile>
  
  // Trips
  getUserTrips(userId: string, filters?: TripFilters): Promise<Trip[]>
  createTrip(data: CreateTripInput): Promise<Trip>
  updateTrip(tripId: string, data: Partial<Trip>): Promise<Trip>
  
  // Bookings
  getUserBookings(userId: string): Promise<Booking[]>
  getTripBookings(tripId: string): Promise<Booking[]>
  createBooking(data: CreateBookingInput): Promise<Booking>
  
  // Packages
  getPackages(filters?: PackageFilters): Promise<Package[]>
  getPackageById(id: string): Promise<Package>
  
  // Wishlist
  getUserWishlist(userId: string): Promise<WishlistItem[]>
  addToWishlist(userId: string, itemId: string): Promise<WishlistItem>
  removeFromWishlist(wishlistId: string): Promise<void>
  
  // Loyalty
  getLoyaltyPoints(userId: string): Promise<LoyaltyPoints>
  addPoints(userId: string, points: number, reason: string): Promise<void>
  
  // Support
  getUserTickets(userId: string): Promise<SupportTicket[]>
  createTicket(data: CreateTicketInput): Promise<SupportTicket>
  addMessage(ticketId: string, message: string): Promise<Message>
  
  // Notifications
  getUserNotifications(userId: string): Promise<Notification[]>
  markAsRead(notificationId: string): Promise<void>
}
```

**Implementation**:
- Extend existing `lib/supabase/queries.ts`
- Add proper TypeScript types
- Implement RLS policies
- Add transaction support where needed

### 5. Real-time Subscription Manager

**Purpose**: Manage Supabase Realtime subscriptions

**Interface**:
```typescript
interface RealtimeManager {
  // Subscribe to table changes
  subscribeToTable(
    table: string,
    filter: string,
    callback: (payload: RealtimePayload) => void
  ): () => void
  
  // Subscribe to user-specific changes
  subscribeToUserData(
    userId: string,
    tables: string[],
    callback: (table: string, payload: RealtimePayload) => void
  ): () => void
  
  // Cleanup all subscriptions
  cleanup(): void
}
```

**Implementation**:
- Create centralized subscription manager
- Handle connection errors and reconnection
- Implement cleanup on component unmount
- Add subscription pooling for performance

### 6. Cache Manager

**Purpose**: Manage data caching for performance

**Interface**:
```typescript
interface CacheManager {
  // Get cached data
  get<T>(key: string): T | null
  
  // Set cached data with TTL
  set<T>(key: string, data: T, ttl?: number): void
  
  // Invalidate cache
  invalidate(key: string): void
  
  // Clear all cache
  clear(): void
}
```

**Implementation**:
- Use memory cache for short-term data
- Use localStorage for persistent cache
- Implement TTL (time-to-live) for cache entries
- Add cache invalidation strategies

### 7. Error Handler

**Purpose**: Centralized error handling and user feedback

**Interface**:
```typescript
interface ErrorHandler {
  // Handle different error types
  handleDatabaseError(error: Error): UserFriendlyError
  handleAPIError(error: Error): UserFriendlyError
  handleAuthError(error: Error): UserFriendlyError
  handleNetworkError(error: Error): UserFriendlyError
  
  // Display error to user
  displayError(error: UserFriendlyError): void
  
  // Log error for debugging
  logError(error: Error, context: string): void
}

interface UserFriendlyError {
  title: string
  message: string
  action?: {
    label: string
    handler: () => void
  }
}
```

**Implementation**:
- Create error boundary components
- Map technical errors to user-friendly messages
- Add retry mechanisms
- Implement error logging service

## Data Models

### Core Data Types

```typescript
// User & Profile
interface User {
  id: string
  email: string
  created_at: string
}

interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  phone: string | null
  date_of_birth: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

// Trip
interface Trip {
  id: string
  user_id: string
  package_id: string | null
  destination: string
  start_date: string
  end_date: string
  travelers_count: number
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  total_cost: number
  created_at: string
  updated_at: string
}

// Booking
interface Booking {
  id: string
  trip_id: string
  user_id: string
  booking_type: 'flight' | 'hotel' | 'activity' | 'transport'
  title: string
  description: string | null
  travel_date: string | null
  status: 'pending' | 'confirmed' | 'cancelled'
  cost: number
  booking_reference: string | null
  created_at: string
  updated_at: string
}

// Package
interface Package {
  id: string
  name: string
  slug: string
  description: string
  destination_id: string
  duration_days: number
  base_price: number
  discount_percentage: number | null
  category: string
  tags: string[]
  image_url: string | null
  is_popular: boolean
  status: 'draft' | 'live' | 'archived'
  created_at: string
  updated_at: string
}

// Wishlist
interface WishlistItem {
  id: string
  user_id: string
  package_id: string | null
  destination_id: string | null
  collection_name: string
  notes: string | null
  created_at: string
}

// Loyalty Points
interface LoyaltyPoints {
  id: string
  user_id: string
  points: number
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'elite'
  lifetime_points: number
  created_at: string
  updated_at: string
}

// Support Ticket
interface SupportTicket {
  id: string
  user_id: string
  ticket_number: string
  subject: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  created_at: string
  updated_at: string
}

// Notification
interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  is_read: boolean
  action_url: string | null
  created_at: string
}

// External API Types
interface Coordinates {
  lat: number
  lng: number
}

interface WeatherData {
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  icon: string
}

interface Place {
  id: string
  name: string
  type: string
  coordinates: Coordinates
  rating: number
  distance: number
}

interface Restaurant {
  id: string
  name: string
  cuisine: string[]
  rating: number
  priceLevel: number
  coordinates: Coordinates
  distance: number
  openingHours: string
  photos: string[]
}
```

## Error Handling

### Error Types and Handling Strategy

1. **Authentication Errors**
   - Session expired → Redirect to login
   - Invalid credentials → Show error message
   - Permission denied → Show access denied page

2. **Database Errors**
   - Connection failed → Show retry button
   - Query timeout → Show loading state with timeout message
   - RLS policy violation → Show permission error

3. **API Errors**
   - Rate limit exceeded → Show "try again later" message
   - Service unavailable → Fall back to cached data
   - Invalid response → Log error and show generic message

4. **Network Errors**
   - Offline → Show offline banner
   - Slow connection → Show loading state
   - Request timeout → Show retry option

5. **Validation Errors**
   - Invalid input → Highlight fields with error messages
   - Missing required fields → Prevent submission
   - Type mismatch → Show format requirements

### Error UI Components

```typescript
// Error Boundary
<ErrorBoundary fallback={<ErrorFallback />}>
  <Component />
</ErrorBoundary>

// Empty State
<EmptyState
  icon={<Icon />}
  title="No trips found"
  description="Start planning your next adventure"
  action={<Button>Create Trip</Button>}
/>

// Error State
<ErrorState
  title="Failed to load data"
  message="We couldn't fetch your trips. Please try again."
  onRetry={() => refetch()}
/>

// Loading State
<LoadingState>
  <Skeleton count={3} />
</LoadingState>
```

## Testing Strategy

### Unit Tests
- Test data fetching hooks
- Test error handling logic
- Test cache manager
- Test validation functions

### Integration Tests
- Test API integrations
- Test database queries
- Test real-time subscriptions
- Test authentication flow

### End-to-End Tests
- Test complete user flows
- Test error scenarios
- Test offline behavior
- Test real-time updates

### Property-Based Tests
Property-based tests will be defined in the implementation tasks.

## Performance Optimization

### Caching Strategy

1. **Memory Cache**: Short-lived data (5-15 minutes)
   - User profile
   - Loyalty points
   - Notification count

2. **Local Storage**: Persistent data (24 hours)
   - Package listings
   - Destination data
   - User preferences

3. **Supabase Cache**: Server-side caching
   - Use Supabase's built-in caching
   - Configure cache headers

### Data Fetching Optimization

1. **Parallel Fetching**: Use `Promise.all()` for independent queries
2. **Pagination**: Implement cursor-based pagination for large lists
3. **Lazy Loading**: Load data on-demand for tabs and modals
4. **Prefetching**: Prefetch likely next pages

### Real-time Optimization

1. **Subscription Pooling**: Share subscriptions across components
2. **Debouncing**: Debounce rapid updates
3. **Selective Updates**: Only update changed fields
4. **Connection Management**: Reuse connections, handle reconnection

## Security Considerations

### Authentication
- Use Supabase Auth with JWT tokens
- Implement token refresh
- Secure cookie storage
- HTTPS only

### Authorization
- Implement Row Level Security (RLS) policies
- Validate user permissions on server
- Never trust client-side checks
- Audit access logs

### Data Validation
- Validate all inputs on server
- Sanitize user-generated content
- Use parameterized queries
- Implement rate limiting

### API Security
- Store API keys in environment variables
- Use server-side API calls for sensitive operations
- Implement CORS properly
- Monitor API usage

## Migration Strategy

### Phase 1: Authentication & Core Data (Priority: High)
1. Remove mock authentication
2. Implement real user authentication
3. Fetch real user profiles
4. Fetch real trips and bookings

### Phase 2: External APIs (Priority: High)
1. Integrate maps API
2. Integrate weather API
3. Integrate places API
4. Remove mock location/weather data

### Phase 3: Additional Features (Priority: Medium)
1. Implement real wishlist
2. Implement real loyalty points
3. Implement real support tickets
4. Implement real notifications

### Phase 4: Advanced Features (Priority: Medium)
1. Integrate payment gateway
2. Implement AI recommendations
3. Add real-time subscriptions
4. Implement caching

### Phase 5: Polish & Optimization (Priority: Low)
1. Remove all placeholder images
2. Implement proper error handling
3. Add loading states everywhere
4. Optimize performance
5. Remove demo mode indicators

## Deployment Considerations

### Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
# or
NEXT_PUBLIC_MAPBOX_TOKEN=

# Weather
OPENWEATHER_API_KEY=

# Places
GOOGLE_PLACES_API_KEY=

# Payments
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
# or
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# AI
OPENAI_API_KEY=
```

### Database Setup
1. Run migration scripts
2. Set up RLS policies
3. Create indexes for performance
4. Set up backup strategy

### Monitoring
1. Set up error tracking (Sentry)
2. Monitor API usage and costs
3. Track performance metrics
4. Set up alerts for failures

## Rollback Plan

If issues arise during migration:

1. **Immediate Rollback**: Revert to previous commit
2. **Partial Rollback**: Keep working features, revert problematic ones
3. **Feature Flags**: Use feature flags to toggle between old and new implementations
4. **Gradual Migration**: Migrate one feature at a time, test thoroughly

## Success Metrics

1. **Zero Mock Data**: No hardcoded fake data in production
2. **Real-time Updates**: All data updates in real-time
3. **Error Rate**: < 1% error rate on data fetching
4. **Performance**: Page load time < 2 seconds
5. **User Experience**: Smooth transitions, proper loading states

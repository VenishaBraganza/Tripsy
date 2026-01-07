# Requirements Document: Real Data Migration

## Introduction

This specification outlines the complete removal of all mock/fake/placeholder data from the Tripsy travel application and the implementation of real-time data integration using APIs, databases, and external services. The goal is to transition from a demo application to a production-ready system with authentic data sources.

## Glossary

- **Mock Data**: Hardcoded fake data used for demonstration purposes
- **Real-time Data**: Live data fetched from databases, APIs, or external services
- **Supabase**: The primary database and authentication service
- **API Integration**: Connection to external services (maps, weather, payments, etc.)
- **Fallback State**: Empty or error state shown when data cannot be loaded
- **System**: The Tripsy travel application

## Requirements

### Requirement 1: Remove Authentication Mock Data

**User Story:** As a developer, I want to remove all mock authentication data, so that the system only works with real authenticated users.

#### Acceptance Criteria

1. WHEN a user is not authenticated THEN the System SHALL redirect to the login page instead of showing mock data
2. WHEN authentication fails THEN the System SHALL display an error message and prevent access to protected routes
3. WHEN a user logs in successfully THEN the System SHALL fetch real user data from Supabase profiles table
4. WHERE the dashboard page is accessed THEN the System SHALL require valid authentication tokens
5. WHEN mock user IDs are detected THEN the System SHALL remove them and use real Supabase user IDs

### Requirement 2: Implement Real Trip Data Integration

**User Story:** As a user, I want to see my actual trips from the database, so that I can manage my real travel plans.

#### Acceptance Criteria

1. WHEN the dashboard loads THEN the System SHALL fetch trips from the Supabase trips table using the authenticated user ID
2. WHEN no trips exist THEN the System SHALL display an empty state with a call-to-action to create a trip
3. WHEN trip data is loading THEN the System SHALL display loading skeletons
4. WHEN a trip is created THEN the System SHALL insert it into the database and refresh the UI
5. WHEN trip data fails to load THEN the System SHALL display an error message with retry option

### Requirement 3: Implement Real Booking Data Integration

**User Story:** As a user, I want to see my actual bookings from the database, so that I can track my real reservations.

#### Acceptance Criteria

1. WHEN bookings are displayed THEN the System SHALL fetch data from the Supabase bookings table
2. WHEN a booking status changes THEN the System SHALL update in real-time using Supabase Realtime subscriptions
3. WHEN no bookings exist for a trip THEN the System SHALL display an empty state
4. WHEN booking data is loading THEN the System SHALL show loading indicators
5. WHEN a booking is created THEN the System SHALL validate and insert it into the database

### Requirement 4: Implement Real Package Data Integration

**User Story:** As a user, I want to browse actual travel packages from the database, so that I can book real trips.

#### Acceptance Criteria

1. WHEN packages are displayed THEN the System SHALL fetch data from the Supabase packages table
2. WHEN filtering packages THEN the System SHALL query the database with filter parameters
3. WHEN no packages match filters THEN the System SHALL display an empty state with suggestions
4. WHEN package data is loading THEN the System SHALL display skeleton cards
5. WHEN a package is unavailable THEN the System SHALL mark it as sold out or inactive

### Requirement 5: Implement Real Wishlist Data Integration

**User Story:** As a user, I want to manage my actual wishlist in the database, so that my saved items persist across sessions.

#### Acceptance Criteria

1. WHEN the wishlist page loads THEN the System SHALL fetch data from the Supabase wishlist table
2. WHEN a user adds to wishlist THEN the System SHALL insert a record into the database
3. WHEN a user removes from wishlist THEN the System SHALL delete the record from the database
4. WHEN wishlist data is loading THEN the System SHALL display loading skeletons
5. WHEN the wishlist is empty THEN the System SHALL display an empty state with browse suggestions

### Requirement 6: Implement Real Location and Weather Data

**User Story:** As a user, I want to see real-time location and weather data, so that I can plan my trips accurately.

#### Acceptance Criteria

1. WHEN location is requested THEN the System SHALL use the browser Geolocation API to get real coordinates
2. WHEN weather is displayed THEN the System SHALL fetch data from a weather API (OpenWeatherMap or similar)
3. WHEN location permission is denied THEN the System SHALL display a message and use a default location
4. WHEN weather data fails to load THEN the System SHALL display cached data or a default state
5. WHEN location changes THEN the System SHALL update weather data automatically

### Requirement 7: Implement Real Map and Route Data

**User Story:** As a user, I want to see real maps and routes, so that I can navigate to my destinations.

#### Acceptance Criteria

1. WHEN maps are displayed THEN the System SHALL use Google Maps API or Mapbox API with real coordinates
2. WHEN routes are calculated THEN the System SHALL fetch real route data from a mapping service
3. WHEN nearby places are shown THEN the System SHALL query Google Places API or similar
4. WHEN traffic data is displayed THEN the System SHALL fetch real-time traffic information
5. WHEN map data fails to load THEN the System SHALL display an error message with retry option

### Requirement 8: Implement Real Food Recommendation Data

**User Story:** As a user, I want to see real restaurant recommendations, so that I can find actual places to eat.

#### Acceptance Criteria

1. WHEN food recommendations are displayed THEN the System SHALL fetch data from Google Places API or Yelp API
2. WHEN filtering by cuisine THEN the System SHALL query the API with cuisine type parameters
3. WHEN no restaurants are found THEN the System SHALL display an empty state
4. WHEN restaurant data is loading THEN the System SHALL show loading indicators
5. WHEN API rate limits are exceeded THEN the System SHALL display cached data or error message

### Requirement 9: Implement Real Hidden Gems Data

**User Story:** As a user, I want to discover real hidden gem destinations from the database, so that I can explore authentic offbeat locations.

#### Acceptance Criteria

1. WHEN hidden gems are displayed THEN the System SHALL fetch data from the Supabase destinations table with hidden_gem_score filter
2. WHEN reviews are shown THEN the System SHALL fetch real reviews from the Supabase reviews table
3. WHEN no hidden gems exist THEN the System SHALL display an empty state
4. WHEN hidden gem data is loading THEN the System SHALL display skeleton cards
5. WHEN user avatars are missing THEN the System SHALL display initials instead of placeholder images

### Requirement 10: Implement Real Loyalty Points Data

**User Story:** As a user, I want to see my actual loyalty points from the database, so that I can track my real rewards.

#### Acceptance Criteria

1. WHEN loyalty points are displayed THEN the System SHALL fetch data from the Supabase loyalty_points table
2. WHEN points are earned THEN the System SHALL update the database and refresh the UI
3. WHEN points are redeemed THEN the System SHALL deduct from the database balance
4. WHEN loyalty data is loading THEN the System SHALL show loading indicators
5. WHEN no loyalty record exists THEN the System SHALL create one with zero points

### Requirement 11: Implement Real Support Ticket Data

**User Story:** As a user, I want to manage real support tickets in the database, so that I can get actual help.

#### Acceptance Criteria

1. WHEN support tickets are displayed THEN the System SHALL fetch data from the Supabase support_tickets table
2. WHEN a ticket is created THEN the System SHALL insert it into the database with a unique ticket number
3. WHEN messages are sent THEN the System SHALL insert them into the support_messages table
4. WHEN ticket status changes THEN the System SHALL update in real-time
5. WHEN no tickets exist THEN the System SHALL display an empty state

### Requirement 12: Implement Real Notification Data

**User Story:** As a user, I want to receive real notifications from the database, so that I stay informed about my trips.

#### Acceptance Criteria

1. WHEN notifications are displayed THEN the System SHALL fetch data from the Supabase notifications table
2. WHEN a new notification arrives THEN the System SHALL update in real-time using Supabase Realtime
3. WHEN a notification is read THEN the System SHALL update the is_read flag in the database
4. WHEN no notifications exist THEN the System SHALL display an empty state
5. WHEN notification data is loading THEN the System SHALL show loading indicators

### Requirement 13: Remove Placeholder Images

**User Story:** As a developer, I want to remove all placeholder images, so that the system only displays real images or proper fallbacks.

#### Acceptance Criteria

1. WHEN an image URL is missing THEN the System SHALL display a gradient placeholder or icon
2. WHEN user avatars are missing THEN the System SHALL display user initials in a colored circle
3. WHEN package images are missing THEN the System SHALL display a default travel-themed gradient
4. WHEN destination images are missing THEN the System SHALL display a location icon with gradient background
5. WHEN image loading fails THEN the System SHALL display an error state with retry option

### Requirement 14: Implement Real AI Recommendations

**User Story:** As a user, I want to receive real AI-powered recommendations, so that I get personalized travel suggestions.

#### Acceptance Criteria

1. WHEN recommendations are displayed THEN the System SHALL call the AI recommendations API with user preferences
2. WHEN generating package ideas THEN the System SHALL use real user travel history and preferences
3. WHEN calculating confidence scores THEN the System SHALL use actual booking patterns and user behavior
4. WHEN AI service is unavailable THEN the System SHALL fall back to rule-based recommendations
5. WHEN recommendations are loading THEN the System SHALL display loading indicators

### Requirement 15: Implement Real Payment Integration

**User Story:** As a user, I want to make real payments, so that I can actually book trips.

#### Acceptance Criteria

1. WHEN payment is initiated THEN the System SHALL integrate with a real payment gateway (Stripe or Razorpay)
2. WHEN payment succeeds THEN the System SHALL update booking status in the database
3. WHEN payment fails THEN the System SHALL display an error message and allow retry
4. WHEN payment is processing THEN the System SHALL show a loading state
5. WHEN payment history is displayed THEN the System SHALL fetch real transaction data from the database

### Requirement 16: Remove Demo Mode Indicators

**User Story:** As a developer, I want to remove all demo mode indicators, so that the application appears production-ready.

#### Acceptance Criteria

1. WHEN the login page is displayed THEN the System SHALL remove "Demo Mode" text and instructions
2. WHEN error messages are shown THEN the System SHALL display production-appropriate messages
3. WHEN placeholder text is displayed THEN the System SHALL use real contextual placeholders
4. WHEN console logs contain demo indicators THEN the System SHALL remove or update them
5. WHEN comments reference mock data THEN the System SHALL update or remove them

### Requirement 17: Implement Proper Error Handling

**User Story:** As a user, I want to see helpful error messages when data fails to load, so that I understand what went wrong.

#### Acceptance Criteria

1. WHEN a database query fails THEN the System SHALL display a user-friendly error message
2. WHEN an API call fails THEN the System SHALL log the error and show a retry option
3. WHEN network is unavailable THEN the System SHALL display an offline message
4. WHEN authentication expires THEN the System SHALL redirect to login with a session expired message
5. WHEN rate limits are exceeded THEN the System SHALL display a "try again later" message

### Requirement 18: Implement Data Validation

**User Story:** As a developer, I want to validate all data before saving, so that the database maintains data integrity.

#### Acceptance Criteria

1. WHEN user input is received THEN the System SHALL validate it against schema rules
2. WHEN invalid data is detected THEN the System SHALL display validation errors
3. WHEN saving to database THEN the System SHALL use Supabase RLS policies for security
4. WHEN data types mismatch THEN the System SHALL prevent the operation and show an error
5. WHEN required fields are missing THEN the System SHALL highlight them and prevent submission

### Requirement 19: Implement Caching Strategy

**User Story:** As a user, I want fast load times, so that I can access my data quickly.

#### Acceptance Criteria

1. WHEN frequently accessed data is requested THEN the System SHALL cache it in memory or local storage
2. WHEN cached data expires THEN the System SHALL fetch fresh data from the database
3. WHEN offline THEN the System SHALL serve cached data if available
4. WHEN cache is invalidated THEN the System SHALL clear it and fetch new data
5. WHEN cache size exceeds limits THEN the System SHALL remove oldest entries

### Requirement 20: Implement Real-time Subscriptions

**User Story:** As a user, I want to see updates in real-time, so that I always have the latest information.

#### Acceptance Criteria

1. WHEN bookings change THEN the System SHALL update the UI via Supabase Realtime subscriptions
2. WHEN notifications arrive THEN the System SHALL display them immediately
3. WHEN trip status changes THEN the System SHALL reflect updates without page refresh
4. WHEN multiple users edit data THEN the System SHALL handle conflicts gracefully
5. WHEN connection is lost THEN the System SHALL attempt to reconnect automatically

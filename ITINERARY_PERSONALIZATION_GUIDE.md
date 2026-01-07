# Itinerary Personalization System - Implementation Guide

## Overview

The Itinerary Personalization System is a comprehensive onboarding flow that collects detailed user travel preferences during registration. This data is used to generate personalized itineraries and recommendations throughout the Tripsy platform.

## Features Implemented

### 🎯 Core Functionality
- **Multi-step personalization form** with 5 comprehensive steps
- **Mandatory onboarding flow** after user registration
- **Database storage** of detailed preferences
- **API endpoints** for saving and retrieving personalization data
- **Offline support** with retry logic for poor connectivity
- **Skip functionality** for users who want to complete later

### 📋 Data Collection Steps

#### Step 1: Basic Travel Information
- **Preferred Region**: South Karnataka (default), North Karnataka, Other States
- **Trip Duration**: 1-3 days, 4-7 days, 1+ week
- **Number of Travelers**: 1 (solo) to 5+ (large group)
- **Travel Type**: Solo, Family, Friends, Couple

#### Step 2: Interest Selection (Multi-select)
- Nature & Hills
- Beaches
- Religious / Spiritual
- Heritage & Culture
- Adventure
- Food & Local Cuisine
- Wellness & Relaxation

#### Step 3: Budget & Travel Style
- **Budget Preference**: Budget (₹2K-8K), Medium (₹8K-20K), Premium (₹20K+)
- **Travel Pace**: Relaxed, Balanced, Packed

#### Step 4: Safety & Accessibility
- Prefer safe & well-connected locations
- Avoid isolated or remote places
- Senior-friendly travel options
- Minimal walking preference

#### Step 5: Optional Enhancements
- **Accommodation**: Hotel, Homestay, Any
- **Food Preference**: Vegetarian, Non-vegetarian, No preference

## Technical Implementation

### Database Schema

```sql
-- User personalization table
CREATE TABLE user_personalization (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Basic Travel Information
  preferred_region TEXT DEFAULT 'south-karnataka',
  trip_duration TEXT DEFAULT '4-7-days',
  number_of_travelers INTEGER DEFAULT 2,
  travel_type TEXT DEFAULT 'couple',
  
  -- Interest Selection
  interests TEXT[] DEFAULT '{}',
  
  -- Budget & Travel Style
  budget_preference TEXT DEFAULT 'medium',
  travel_pace TEXT DEFAULT 'balanced',
  
  -- Safety & Accessibility
  safety_preferences TEXT[] DEFAULT '{}',
  
  -- Optional Enhancements
  accommodation_preference TEXT DEFAULT 'any',
  food_preference TEXT DEFAULT 'no-preference',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);
```

### API Endpoints

#### POST `/api/personalization`
Save user personalization preferences
```json
{
  "preferredRegion": "south-karnataka",
  "tripDuration": "4-7-days",
  "numberOfTravelers": 2,
  "travelType": "couple",
  "interests": ["nature-hills", "food-cuisine"],
  "budgetPreference": "medium",
  "travelPace": "balanced",
  "safetyPreferences": ["safe-connected"],
  "accommodationPreference": "any",
  "foodPreference": "no-preference"
}
```

#### PUT `/api/personalization`
Skip personalization (mark onboarding complete without detailed preferences)

#### GET `/api/personalization`
Retrieve user's personalization data

### Components

#### `ItineraryPersonalization` Component
- **Location**: `components/auth/itinerary-personalization.tsx`
- **Features**: 
  - Multi-step form with progress indicator
  - Form validation and error handling
  - Offline support with retry logic
  - Skip functionality
  - Responsive design

#### `PersonalizationService` Class
- **Location**: `lib/services/personalization-service.ts`
- **Features**:
  - API communication with retry logic
  - Offline data storage and sync
  - Data validation
  - Recommendation filter generation

### Pages

#### `/personalization`
Main personalization onboarding page

#### `/test-personalization`
Development testing page for:
- Database table status checking
- API endpoint testing
- Data visualization

## Registration Flow Integration

### Updated Flow
1. User lands on landing page
2. User signs up/logs in
3. **Redirect to `/personalization`** (NEW)
4. User completes personalization form
5. Data saved to database
6. User redirected to dashboard
7. Dashboard shows personalized content

### Middleware Updates
- Added `/personalization` to protected routes
- Updated redirect logic to use personalization page
- Onboarding status checking for dashboard access

### Authentication Updates
- Signup page redirects to `/personalization`
- Auth callback redirects to `/personalization` for new users
- Login redirects to `/personalization` if onboarding incomplete

## Database Migration

### Setup Instructions

1. **Run the migration script**:
   ```sql
   -- Execute the contents of scripts/add-personalization-table.sql
   ```

2. **Or use the API endpoint**:
   ```bash
   POST /api/migrate/personalization-table
   ```

3. **Verify table creation**:
   ```bash
   GET /api/migrate/personalization-table
   ```

## Usage Examples

### Saving Personalization Data
```typescript
import { PersonalizationService } from '@/lib/services/personalization-service'

const data = {
  preferredRegion: 'south-karnataka',
  tripDuration: '4-7-days',
  numberOfTravelers: 2,
  travelType: 'couple',
  interests: ['nature-hills', 'food-cuisine'],
  budgetPreference: 'medium',
  travelPace: 'balanced',
  safetyPreferences: ['safe-connected'],
  accommodationPreference: 'any',
  foodPreference: 'no-preference'
}

await PersonalizationService.savePersonalization(data)
```

### Generating Recommendation Filters
```typescript
const filters = PersonalizationService.generateRecommendationFilters(userPersonalization)
// Returns: { maxPrice: 20000, tags: ['nature-hills', 'food-cuisine'], ... }
```

## Future Integration Points

### Itinerary Generation
The personalization data will be used by:
- **AI Recommendation Engine**: Filter packages based on interests and budget
- **Itinerary Builder**: Customize trip pace and activities
- **Safety Filters**: Apply safety preferences to destination suggestions
- **Budget Optimization**: Show packages within user's budget range

### Recommendation System
```typescript
// Example usage in recommendation engine
const userPrefs = await PersonalizationService.getPersonalization()
const filters = PersonalizationService.generateRecommendationFilters(userPrefs)

const recommendations = await getPersonalizedPackages(filters)
```

## Testing

### Manual Testing
1. Visit `/test-personalization` to check system status
2. Complete the personalization flow at `/personalization`
3. Verify data is saved in database
4. Test skip functionality
5. Test offline/online sync

### API Testing
```bash
# Check table exists
curl -X GET /api/migrate/personalization-table

# Save test data
curl -X POST /api/personalization \
  -H "Content-Type: application/json" \
  -d '{"preferredRegion":"south-karnataka","interests":["nature-hills"]}'

# Retrieve data
curl -X GET /api/personalization
```

## Error Handling

### Offline Support
- Automatic retry with exponential backoff
- Local storage for offline data
- Sync when connection restored
- User feedback for offline state

### Validation
- Required field validation
- Enum value validation
- Array length validation
- Type checking

### Graceful Degradation
- Skip functionality always available
- Default values for missing data
- Fallback to basic preferences if detailed data unavailable

## Security

### Row Level Security (RLS)
- Users can only access their own personalization data
- Policies enforce user_id matching auth.uid()
- No cross-user data access

### Data Privacy
- All preferences stored securely
- No sensitive personal information collected
- User can update preferences anytime
- Data deletion on account deletion (CASCADE)

## Performance Considerations

### Database Optimization
- Indexed user_id for fast queries
- JSONB for flexible preference storage
- Efficient array operations for interests/preferences

### Frontend Optimization
- Progressive form loading
- Optimistic UI updates
- Debounced API calls
- Cached preference data

## Monitoring & Analytics

### Key Metrics to Track
- Personalization completion rate
- Step abandonment rates
- Skip vs complete ratios
- Time to complete personalization
- Preference distribution analysis

### Logging
- API endpoint usage
- Error rates and types
- Offline sync success rates
- User journey tracking

## Maintenance

### Regular Tasks
- Monitor personalization completion rates
- Update interest categories based on user feedback
- Optimize recommendation algorithms
- Clean up orphaned offline data

### Updates
- Add new interest categories
- Expand regional options
- Enhance safety preferences
- Improve UI/UX based on user feedback

---

## Quick Start Checklist

- [ ] Run database migration
- [ ] Test personalization flow
- [ ] Verify API endpoints
- [ ] Check middleware redirects
- [ ] Test offline functionality
- [ ] Validate data storage
- [ ] Test skip functionality
- [ ] Verify dashboard integration

The Itinerary Personalization System is now ready for production use and will provide the foundation for personalized travel recommendations throughout the Tripsy platform.
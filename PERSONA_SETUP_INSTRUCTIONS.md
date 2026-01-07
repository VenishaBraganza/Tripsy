# Persona Selection Setup Instructions

## Issue
The persona selection page is failing because the database is missing the required columns (`onboarding_completed` and `travel_personas`) in the `profiles` table.

## Quick Fix Options

### Option 1: Run Database Migration (Recommended)
1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the following SQL commands:

```sql
-- Add onboarding_completed column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'onboarding_completed'
    ) THEN
        ALTER TABLE profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
        COMMENT ON COLUMN profiles.onboarding_completed IS 'Tracks if user has completed the onboarding flow';
    END IF;
END $$;

-- Add travel_personas column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'travel_personas'
    ) THEN
        ALTER TABLE profiles ADD COLUMN travel_personas TEXT[] DEFAULT '{}';
        COMMENT ON COLUMN profiles.travel_personas IS 'Array of selected travel persona IDs';
    END IF;
END $$;

-- Update existing users to have default values
UPDATE profiles 
SET onboarding_completed = COALESCE(onboarding_completed, false),
    travel_personas = COALESCE(travel_personas, '{}')
WHERE onboarding_completed IS NULL OR travel_personas IS NULL;
```

### Option 2: Use the Complete Schema (Alternative)
1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the complete schema from `supabase-complete-schema.sql`

### Option 3: Test the Current Implementation
The persona selection has been updated to work gracefully without the missing columns:

1. Visit `/test-persona` to test the API endpoints
2. Try the persona selection at `/persona`
3. The system will now redirect to dashboard even if the database columns are missing

## What's Been Fixed

1. **Enhanced PersonaSelection Component**: 
   - Added offline storage support
   - Improved error handling with retry logic
   - Better user feedback with loading states
   - Network status indicators

2. **Robust API Endpoints**:
   - Graceful handling of missing database columns
   - Fallback mechanisms for schema mismatches
   - Better error messages and logging

3. **Middleware Updates**:
   - Temporarily disabled strict onboarding checks
   - Allows users to access dashboard even without completed onboarding

4. **New Services**:
   - `PersonaService`: Handles persona operations with retry logic
   - Offline data persistence using localStorage
   - Automatic sync when connection is restored

## Testing

1. Visit `/test-persona` to test the API functionality
2. Try the persona selection flow at `/persona`
3. Check the browser console for detailed logging
4. Test both online and offline scenarios

## Next Steps

Once the database schema is updated:
1. Re-enable the middleware onboarding checks in `middleware.ts`
2. Remove the temporary fallback logic in the API endpoints
3. Test the complete onboarding flow

The system is now resilient and will work with or without the proper database schema, but for the best experience, please run the database migration.
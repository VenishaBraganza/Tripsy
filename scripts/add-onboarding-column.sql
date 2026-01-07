-- Add onboarding_completed column to profiles table if it doesn't exist
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

-- Add travel_personas column to profiles table if it doesn't exist
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

-- Update existing users to have onboarding_completed = false if null
UPDATE profiles 
SET onboarding_completed = false 
WHERE onboarding_completed IS NULL;

-- Update existing users to have empty travel_personas array if null
UPDATE profiles 
SET travel_personas = '{}' 
WHERE travel_personas IS NULL;
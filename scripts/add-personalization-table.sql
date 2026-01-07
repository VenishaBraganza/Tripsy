-- Add user_personalization table for detailed travel preferences
CREATE TABLE IF NOT EXISTS user_personalization (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Basic Travel Information
  preferred_region TEXT DEFAULT 'south-karnataka',
  trip_duration TEXT DEFAULT '4-7-days' CHECK (trip_duration IN ('1-3-days', '4-7-days', '1-week-plus')),
  number_of_travelers INTEGER DEFAULT 2,
  travel_type TEXT DEFAULT 'couple' CHECK (travel_type IN ('solo', 'family', 'friends', 'couple')),
  
  -- Interest Selection (Multi-select)
  interests TEXT[] DEFAULT '{}',
  
  -- Budget & Travel Style
  budget_preference TEXT DEFAULT 'medium' CHECK (budget_preference IN ('budget', 'medium', 'premium')),
  travel_pace TEXT DEFAULT 'balanced' CHECK (travel_pace IN ('relaxed', 'balanced', 'packed')),
  
  -- Safety & Accessibility Preferences
  safety_preferences TEXT[] DEFAULT '{}',
  
  -- Optional Personalization Enhancements
  accommodation_preference TEXT DEFAULT 'any' CHECK (accommodation_preference IN ('hotel', 'homestay', 'any')),
  food_preference TEXT DEFAULT 'no-preference' CHECK (food_preference IN ('vegetarian', 'non-vegetarian', 'no-preference')),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_personalization_user_id ON user_personalization(user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_user_personalization_updated_at 
  BEFORE UPDATE ON user_personalization 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE user_personalization ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own personalization" ON user_personalization FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own personalization" ON user_personalization FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own personalization" ON user_personalization FOR UPDATE USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE user_personalization IS 'Detailed user travel personalization preferences collected during onboarding';
COMMENT ON COLUMN user_personalization.interests IS 'Array of selected interests: nature-hills, beaches, religious-spiritual, heritage-culture, adventure, food-cuisine, wellness-relaxation';
COMMENT ON COLUMN user_personalization.safety_preferences IS 'Array of safety preferences: safe-connected, avoid-isolated, senior-friendly, minimal-walking';
COMMENT ON COLUMN user_personalization.trip_duration IS 'Typical trip duration preference';
COMMENT ON COLUMN user_personalization.travel_type IS 'Primary travel type: solo, family, friends, couple';

-- Insert sample data for testing (optional)
-- This will be populated when users complete the personalization flow
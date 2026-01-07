-- Fix Personalization Database Schema (updated)
-- Run this in your Supabase SQL Editor to fix the personalization system

-- Ensure uuid generation extension is available (Supabase usually has this)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1: Create or replace trigger function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
NEW.updated_at := CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$;

-- 2: Add onboarding_completed column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- 3: Create user_personalization table
CREATE TABLE IF NOT EXISTS public.user_personalization (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  
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

-- 4: Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_personalization_user_id ON public.user_personalization(user_id);

-- 5: Create trigger for updated_at (uses the function created above)
DROP TRIGGER IF EXISTS update_user_personalization_updated_at ON public.user_personalization;
CREATE TRIGGER update_user_personalization_updated_at 
  BEFORE UPDATE ON public.user_personalization 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6: Enable RLS
ALTER TABLE public.user_personalization ENABLE ROW LEVEL SECURITY;

-- 7: Create RLS Policies
DROP POLICY IF EXISTS "Users can view own personalization" ON public.user_personalization;
DROP POLICY IF EXISTS "Users can create own personalization" ON public.user_personalization;
DROP POLICY IF EXISTS "Users can update own personalization" ON public.user_personalization;

CREATE POLICY "Users can view own personalization" ON public.user_personalization FOR SELECT USING ((SELECT auth.uid())::text = user_id::text);
CREATE POLICY "Users can create own personalization" ON public.user_personalization FOR INSERT WITH CHECK ((SELECT auth.uid())::text = user_id::text);
CREATE POLICY "Users can update own personalization" ON public.user_personalization FOR UPDATE USING ((SELECT auth.uid())::text = user_id::text);

-- 8: Add comments for documentation
COMMENT ON TABLE public.user_personalization IS 'Detailed user travel personalization preferences collected during onboarding';
COMMENT ON COLUMN public.user_personalization.interests IS 'Array of selected interests: nature-hills, beaches, religious-spiritual, heritage-culture, adventure, food-cuisine, wellness-relaxation';
COMMENT ON COLUMN public.user_personalization.safety_preferences IS 'Array of safety preferences: safe-connected, avoid-isolated, senior-friendly, minimal-walking';
COMMENT ON COLUMN public.user_personalization.trip_duration IS 'Typical trip duration preference';
COMMENT ON COLUMN public.user_personalization.travel_type IS 'Primary travel type: solo, family, friends, couple';

-- Verification queries (optional)
-- SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'onboarding_completed';
-- SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_personalization';
-- SELECT * FROM public.user_personalization LIMIT 1;
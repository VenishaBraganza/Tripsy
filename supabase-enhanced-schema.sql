-- Enhanced Tripsy Database Schema for South Karnataka Tourism
-- Includes: Food ordering, Hidden Gems, AI Recommendations, Reviews, and more

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For geospatial data
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ============================================
-- CORE TABLES (Enhanced)
-- ============================================

-- Users/Profiles (Enhanced)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  preferences JSONB DEFAULT '{}', -- Travel preferences for AI
  dietary_restrictions TEXT[],
  languages_spoken TEXT[],
  home_location GEOGRAPHY(POINT, 4326),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'guide', 'restaurant_owner', 'admin')),
  loyalty_tier TEXT DEFAULT 'bronze' CHECK (loyalty_tier IN ('bronze', 'silver', 'gold', 'platinum')),
  loyalty_points INTEGER DEFAULT 0,
  total_trips INTEGER DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Destinations (Enhanced with geolocation)
CREATE TABLE IF NOT EXISTS destinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  location GEOGRAPHY(POINT, 4326) NOT NULL, -- Lat/Long for maps
  address TEXT,
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT DEFAULT 'Karnataka',
  region TEXT, -- North/South/Coastal Karnataka
  category TEXT[] DEFAULT '{}', -- temple, beach, hill-station, wildlife, heritage
  image_url TEXT NOT NULL,
  gallery_images TEXT[] DEFAULT '{}',
  highlights TEXT[] DEFAULT '{}',
  best_time_to_visit TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'moderate', 'challenging')),
  entry_fee DECIMAL(10, 2),
  opening_hours JSONB, -- {mon: "9-5", tue: "9-5", ...}
  min_price DECIMAL(10, 2),
  max_price DECIMAL(10, 2),
  popularity_score INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  average_rating DECIMAL(2, 1) DEFAULT 0,
  is_hidden_gem BOOLEAN DEFAULT FALSE,
  hidden_gem_score INTEGER DEFAULT 0, -- Algorithm calculated
  accessibility_features TEXT[],
  nearby_attractions UUID[], -- Array of destination IDs
  weather_data JSONB, -- Current weather cache
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create spatial index for location queries
CREATE INDEX idx_destinations_location ON destinations USING GIST(location);
CREATE INDEX idx_destinations_hidden_gem ON destinations(is_hidden_gem, hidden_gem_score);
CREATE INDEX idx_destinations_category ON destinations USING GIN(category);

-- ============================================
-- FOOD ORDERING SYSTEM
-- ============================================

-- Restaurants
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cuisine_types TEXT[] NOT NULL, -- South Indian, North Karnataka, Coastal, etc.
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  owner_id UUID REFERENCES profiles(id),
  image_url TEXT,
  gallery_images TEXT[] DEFAULT '{}',
  opening_hours JSONB NOT NULL,
  average_prep_time INTEGER, -- minutes
  min_order_amount DECIMAL(10, 2) DEFAULT 0,
  delivery_available BOOLEAN DEFAULT FALSE,
  delivery_radius INTEGER, -- km
  delivery_fee DECIMAL(10, 2),
  pickup_available BOOLEAN DEFAULT TRUE,
  pre_order_available BOOLEAN DEFAULT TRUE,
  pre_order_min_hours INTEGER DEFAULT 2,
  accepts_online_payment BOOLEAN DEFAULT TRUE,
  average_rating DECIMAL(2, 1) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  special_features TEXT[], -- outdoor-seating, parking, wifi, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_restaurants_location ON restaurants USING GIST(location);
CREATE INDEX idx_restaurants_cuisine ON restaurants USING GIN(cuisine_types);
CREATE INDEX idx_restaurants_city ON restaurants(city);

-- Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- appetizer, main, dessert, beverage
  cuisine_type TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  is_vegetarian BOOLEAN DEFAULT FALSE,
  is_vegan BOOLEAN DEFAULT FALSE,
  is_gluten_free BOOLEAN DEFAULT FALSE,
  spice_level TEXT CHECK (spice_level IN ('mild', 'medium', 'hot', 'extra-hot')),
  allergens TEXT[],
  prep_time INTEGER, -- minutes
  is_available BOOLEAN DEFAULT TRUE,
  is_popular BOOLEAN DEFAULT FALSE,
  is_signature BOOLEAN DEFAULT FALSE,
  nutritional_info JSONB,
  customization_options JSONB, -- {size: [small, medium, large], extras: [...]}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX idx_menu_items_category ON menu_items(category);

-- Food Orders
CREATE TABLE IF NOT EXISTS food_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES restaurants(id),
  order_type TEXT NOT NULL CHECK (order_type IN ('delivery', 'pickup', 'pre-order')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'completed', 'cancelled')),
  items JSONB NOT NULL, -- [{menu_item_id, quantity, customizations, price}]
  subtotal DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  delivery_address TEXT,
  delivery_location GEOGRAPHY(POINT, 4326),
  pickup_time TIMESTAMPTZ,
  scheduled_time TIMESTAMPTZ, -- For pre-orders
  special_instructions TEXT,
  estimated_prep_time INTEGER,
  actual_delivery_time TIMESTAMPTZ,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_food_orders_user ON food_orders(user_id);
CREATE INDEX idx_food_orders_restaurant ON food_orders(restaurant_id);
CREATE INDEX idx_food_orders_status ON food_orders(status);
CREATE INDEX idx_food_orders_scheduled ON food_orders(scheduled_time);

-- ============================================
-- HIDDEN GEMS SYSTEM
-- ============================================

-- Reviews with Photos
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  destination_id UUID REFERENCES destinations(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT NOT NULL,
  photos TEXT[] DEFAULT '{}',
  visit_date DATE,
  travel_type TEXT, -- solo, couple, family, friends, business
  helpful_count INTEGER DEFAULT 0,
  verified_visit BOOLEAN DEFAULT FALSE,
  is_hidden_gem_review BOOLEAN DEFAULT FALSE,
  tags TEXT[], -- peaceful, crowded, overrated, underrated, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (
    (destination_id IS NOT NULL AND restaurant_id IS NULL) OR
    (destination_id IS NULL AND restaurant_id IS NOT NULL)
  )
);

CREATE INDEX idx_reviews_destination ON reviews(destination_id);
CREATE INDEX idx_reviews_restaurant ON reviews(restaurant_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- Review Helpfulness
CREATE TABLE IF NOT EXISTS review_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- ============================================
-- AI RECOMMENDATION SYSTEM
-- ============================================

-- User Behavior Tracking
CREATE TABLE IF NOT EXISTS user_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL, -- view, like, save, book, search, click
  entity_type TEXT NOT NULL, -- destination, restaurant, package
  entity_id UUID NOT NULL,
  metadata JSONB, -- Additional context
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_interactions_user ON user_interactions(user_id);
CREATE INDEX idx_user_interactions_type ON user_interactions(interaction_type);
CREATE INDEX idx_user_interactions_entity ON user_interactions(entity_type, entity_id);

-- AI Recommendations Cache
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL, -- destination, restaurant, itinerary, hidden-gem
  recommendations JSONB NOT NULL, -- Array of recommended items with scores
  algorithm_version TEXT,
  confidence_score DECIMAL(3, 2),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_recommendations_user ON ai_recommendations(user_id);
CREATE INDEX idx_ai_recommendations_type ON ai_recommendations(recommendation_type);
CREATE INDEX idx_ai_recommendations_expires ON ai_recommendations(expires_at);

-- User Preferences for ML
CREATE TABLE IF NOT EXISTS user_preference_vectors (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  destination_preferences JSONB, -- {temple: 0.8, beach: 0.6, ...}
  cuisine_preferences JSONB,
  activity_preferences JSONB,
  budget_range JSONB,
  travel_style TEXT[], -- adventure, relaxation, cultural, foodie, etc.
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRIPS & ITINERARIES
-- ============================================

-- Trips (Enhanced)
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'upcoming', 'ongoing', 'completed', 'cancelled')),
  destinations UUID[] NOT NULL, -- Array of destination IDs
  total_cost DECIMAL(10, 2),
  budget DECIMAL(10, 2),
  travelers_count INTEGER DEFAULT 1,
  trip_type TEXT, -- solo, couple, family, group
  is_ai_generated BOOLEAN DEFAULT FALSE,
  ai_optimization_score DECIMAL(3, 2),
  optimized_route JSONB, -- Optimized path with distances and times
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trips_user ON trips(user_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_dates ON trips(start_date, end_date);

-- Itinerary Items
CREATE TABLE IF NOT EXISTS itinerary_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  order_index INTEGER NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('destination', 'restaurant', 'activity', 'transport', 'accommodation')),
  destination_id UUID REFERENCES destinations(id),
  restaurant_id UUID REFERENCES restaurants(id),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIME,
  end_time TIME,
  duration INTEGER, -- minutes
  location GEOGRAPHY(POINT, 4326),
  cost DECIMAL(10, 2),
  booking_reference TEXT,
  notes TEXT,
  is_booked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_itinerary_trip ON itinerary_items(trip_id);
CREATE INDEX idx_itinerary_day ON itinerary_items(trip_id, day_number);

-- ============================================
-- BOOKINGS & PAYMENTS
-- ============================================

-- Bookings (Enhanced)
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES trips(id),
  destination_id UUID REFERENCES destinations(id),
  booking_type TEXT NOT NULL CHECK (booking_type IN ('tour', 'accommodation', 'activity', 'transport', 'package')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'refunded')),
  booking_date TIMESTAMPTZ DEFAULT NOW(),
  travel_date DATE NOT NULL,
  guests INTEGER NOT NULL DEFAULT 1,
  total_price DECIMAL(10, 2) NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT,
  cancellation_reason TEXT,
  special_requests TEXT,
  confirmation_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_trip ON bookings(trip_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- ============================================
-- WISHLIST & FAVORITES
-- ============================================

CREATE TABLE IF NOT EXISTS wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('destination', 'restaurant', 'package')),
  item_id UUID NOT NULL,
  notes TEXT,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_type, item_id)
);

CREATE INDEX idx_wishlist_user ON wishlist(user_id);

-- ============================================
-- REAL-TIME FEATURES
-- ============================================

-- Live Location Sharing (for group trips)
CREATE TABLE IF NOT EXISTS live_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  accuracy DECIMAL(10, 2),
  heading DECIMAL(5, 2),
  speed DECIMAL(5, 2),
  battery_level INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_live_locations_trip ON live_locations(trip_id);
CREATE INDEX idx_live_locations_user ON live_locations(user_id);
CREATE INDEX idx_live_locations_active ON live_locations(is_active, created_at);

-- Weather Cache
CREATE TABLE IF NOT EXISTS weather_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  city TEXT,
  weather_data JSONB NOT NULL,
  forecast_data JSONB,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_weather_location ON weather_cache USING GIST(location);
CREATE INDEX idx_weather_expires ON weather_cache(expires_at);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- booking, trip, food-order, recommendation, alert
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_destinations_updated_at BEFORE UPDATE ON destinations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Calculate hidden gem score
CREATE OR REPLACE FUNCTION calculate_hidden_gem_score(dest_id UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  review_count INTEGER;
  avg_rating DECIMAL;
  popularity INTEGER;
BEGIN
  SELECT total_reviews, average_rating, popularity_score
  INTO review_count, avg_rating, popularity
  FROM destinations WHERE id = dest_id;
  
  -- Low popularity but high rating = hidden gem
  IF review_count < 50 AND avg_rating >= 4.0 THEN
    score := score + 50;
  END IF;
  
  IF popularity < 30 AND avg_rating >= 4.5 THEN
    score := score + 30;
  END IF;
  
  -- Bonus for underrated tags in reviews
  score := score + (SELECT COUNT(*) * 5 FROM reviews 
                    WHERE destination_id = dest_id 
                    AND 'underrated' = ANY(tags));
  
  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql;

-- Update average ratings
CREATE OR REPLACE FUNCTION update_average_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'reviews' THEN
    IF NEW.destination_id IS NOT NULL THEN
      UPDATE destinations SET
        average_rating = (SELECT AVG(rating) FROM reviews WHERE destination_id = NEW.destination_id),
        total_reviews = (SELECT COUNT(*) FROM reviews WHERE destination_id = NEW.destination_id)
      WHERE id = NEW.destination_id;
    ELSIF NEW.restaurant_id IS NOT NULL THEN
      UPDATE restaurants SET
        average_rating = (SELECT AVG(rating) FROM reviews WHERE restaurant_id = NEW.restaurant_id),
        total_reviews = (SELECT COUNT(*) FROM reviews WHERE restaurant_id = NEW.restaurant_id)
      WHERE id = NEW.restaurant_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rating_after_review
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_average_rating();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit their own data
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own trips" ON trips FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own trips" ON trips FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own bookings" ON bookings FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own orders" ON food_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own orders" ON food_orders FOR ALL USING (auth.uid() = user_id);

-- Public read access for destinations and restaurants
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view destinations" ON destinations FOR SELECT USING (true);
CREATE POLICY "Anyone can view restaurants" ON restaurants FOR SELECT USING (true);
CREATE POLICY "Anyone can view menu items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Full text search indexes
CREATE INDEX idx_destinations_search ON destinations USING GIN(to_tsvector('english', name || ' ' || description));
CREATE INDEX idx_restaurants_search ON restaurants USING GIN(to_tsvector('english', name || ' ' || description));
CREATE INDEX idx_menu_items_search ON menu_items USING GIN(to_tsvector('english', name || ' ' || description));

-- Composite indexes for common queries
CREATE INDEX idx_trips_user_status ON trips(user_id, status);
CREATE INDEX idx_bookings_user_status ON bookings(user_id, status);
CREATE INDEX idx_food_orders_user_status ON food_orders(user_id, status);

COMMENT ON TABLE destinations IS 'Tourist destinations in South Karnataka';
COMMENT ON TABLE restaurants IS 'Restaurants for food ordering and pre-booking';
COMMENT ON TABLE food_orders IS 'Food delivery, pickup, and pre-orders';
COMMENT ON TABLE reviews IS 'User reviews with photos for destinations and restaurants';
COMMENT ON TABLE ai_recommendations IS 'ML-powered personalized recommendations';
COMMENT ON TABLE user_interactions IS 'User behavior tracking for ML algorithms';
COMMENT ON TABLE live_locations IS 'Real-time location sharing for group trips';

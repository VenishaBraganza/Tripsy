-- Sample Data for TravelOS
-- Replace 'YOUR_USER_ID' with your actual user ID from the profiles table
-- You can find it in Supabase: Table Editor > profiles > copy the 'id' column value

-- First, let's add a trip
INSERT INTO trips (user_id, destination, start_date, end_date, travelers_count, status, total_cost)
VALUES (
  'YOUR_USER_ID',
  'Bali, Indonesia',
  CURRENT_DATE + INTERVAL '4 days',
  CURRENT_DATE + INTERVAL '11 days',
  2,
  'upcoming',
  1500.00
) RETURNING id;

-- Copy the returned trip ID from above, then replace TRIP_ID_1 below

-- Add bookings for the Bali trip
INSERT INTO bookings (trip_id, user_id, booking_type, title, description, booking_date, status, cost, confirmation_number)
VALUES 
  (
    'TRIP_ID_1',
    'YOUR_USER_ID',
    'flight',
    'Flight to DPS',
    'SQ 940 • Departs 09:30 AM',
    CURRENT_DATE + INTERVAL '4 days' + INTERVAL '9 hours',
    'confirmed',
    450.00,
    'SQ940ABC123'
  ),
  (
    'TRIP_ID_1',
    'YOUR_USER_ID',
    'hotel',
    'Hotel Check-in',
    'Ubud Resort & Spa • 02:00 PM',
    CURRENT_DATE + INTERVAL '4 days' + INTERVAL '14 hours',
    'pending',
    800.00,
    'UBUD2025'
  ),
  (
    'TRIP_ID_1',
    'YOUR_USER_ID',
    'activity',
    'Monkey Forest Tour',
    'Day 2 • 10:00 AM',
    CURRENT_DATE + INTERVAL '5 days' + INTERVAL '10 hours',
    'confirmed',
    50.00,
    'MF12345'
  );

-- Add another trip (past trip)
INSERT INTO trips (user_id, destination, start_date, end_date, travelers_count, status, total_cost)
VALUES (
  'YOUR_USER_ID',
  'Kyoto, Japan',
  CURRENT_DATE - INTERVAL '30 days',
  CURRENT_DATE - INTERVAL '23 days',
  1,
  'completed',
  2200.00
);

-- Update loyalty points to Elite tier
UPDATE loyalty_points 
SET points = 12450, tier = 'elite' 
WHERE user_id = 'YOUR_USER_ID';

-- Add wishlist items
INSERT INTO wishlist (user_id, destination, description, estimated_cost, priority)
VALUES 
  ('YOUR_USER_ID', 'Phuket, Thailand', '5 Days • Beach & Spa', 850.00, 1),
  ('YOUR_USER_ID', 'Maldives Resort', '4 Days • Luxury Stay', 2100.00, 2),
  ('YOUR_USER_ID', 'Santorini, Greece', '6 Days • Island Paradise', 1800.00, 3),
  ('YOUR_USER_ID', 'Iceland Adventure', '7 Days • Northern Lights', 2500.00, 4);

-- Verify the data was inserted
SELECT 'Trips' as table_name, COUNT(*) as count FROM trips WHERE user_id = 'YOUR_USER_ID'
UNION ALL
SELECT 'Bookings', COUNT(*) FROM bookings WHERE user_id = 'YOUR_USER_ID'
UNION ALL
SELECT 'Wishlist', COUNT(*) FROM wishlist WHERE user_id = 'YOUR_USER_ID'
UNION ALL
SELECT 'Loyalty Points', points FROM loyalty_points WHERE user_id = 'YOUR_USER_ID';

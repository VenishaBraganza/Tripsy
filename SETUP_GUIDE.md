# TravelOS Setup Guide

## Prerequisites
- Node.js 20+ installed
- A Supabase account (free tier works)

## Step 1: Create Supabase Project

1. Go to https://supabase.com and sign up/login
2. Click "New Project"
3. Fill in:
   - Project name: `travelos` (or your choice)
   - Database password: (save this securely)
   - Region: Choose closest to you
4. Wait for project to be created (~2 minutes)

## Step 2: Get Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** > **API**
2. Copy the following:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 3: Configure Environment Variables

1. Open `.env.local` in your project root
2. Replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase-schema.sql` file
4. Paste into the SQL editor
5. Click **Run** (or press Ctrl/Cmd + Enter)
6. You should see "Success. No rows returned"

This creates:
- `profiles` table (user information)
- `trips` table (travel bookings)
- `bookings` table (flights, hotels, activities)
- `wishlist` table (saved destinations)
- `loyalty_points` table (rewards system)
- Row Level Security policies (data protection)
- Automatic triggers (profile creation on signup)

## Step 5: Enable Email Authentication

1. In Supabase dashboard, go to **Authentication** > **Providers**
2. Make sure **Email** is enabled
3. Configure email templates (optional):
   - Go to **Authentication** > **Email Templates**
   - Customize confirmation and reset password emails

## Step 6: Test the Application

1. Start the development server:
```bash
npm run dev
```

2. Open http://localhost:3000

3. Click "Login" or go to http://localhost:3000/login

4. Click "Create Account" and sign up with:
   - Email: your-email@example.com
   - Password: (at least 6 characters)

5. Check your email for confirmation link (if email confirmation is enabled)

6. After confirming, login with your credentials

7. You should be redirected to the dashboard!

## Step 7: Verify Database

1. Go to Supabase dashboard > **Table Editor**
2. Check the `profiles` table - you should see your user
3. Check the `loyalty_points` table - you should have 0 points with "bronze" tier

## Adding Sample Data (Optional)

To test the dashboard with sample data, run this SQL in Supabase SQL Editor:

```sql
-- Replace 'YOUR_USER_ID' with your actual user ID from profiles table
-- You can find it in Table Editor > profiles

-- Add a sample trip
INSERT INTO trips (user_id, destination, start_date, end_date, travelers_count, status, total_cost)
VALUES (
  'YOUR_USER_ID',
  'Bali, Indonesia',
  CURRENT_DATE + INTERVAL '4 days',
  CURRENT_DATE + INTERVAL '11 days',
  2,
  'upcoming',
  1500.00
);

-- Get the trip ID (check the trips table)
-- Then add sample bookings
INSERT INTO bookings (trip_id, user_id, booking_type, title, description, status, cost)
VALUES 
  ('TRIP_ID', 'YOUR_USER_ID', 'flight', 'Flight to DPS', 'SQ 940 • Departs 09:30 AM', 'confirmed', 450.00),
  ('TRIP_ID', 'YOUR_USER_ID', 'hotel', 'Hotel Check-in', 'Ubud Resort & Spa • 02:00 PM', 'pending', 800.00),
  ('TRIP_ID', 'YOUR_USER_ID', 'activity', 'Monkey Forest Tour', 'Day 2 • 10:00 AM', 'confirmed', 50.00);

-- Add some loyalty points
UPDATE loyalty_points 
SET points = 12450, tier = 'elite' 
WHERE user_id = 'YOUR_USER_ID';

-- Add wishlist items
INSERT INTO wishlist (user_id, destination, description, estimated_cost, priority)
VALUES 
  ('YOUR_USER_ID', 'Kyoto, Japan', '7 Days • Culture & Food', 2500.00, 1),
  ('YOUR_USER_ID', 'Maldives Resort', '4 Days • Luxury Stay', 3500.00, 2);
```

## Troubleshooting

### "Missing Supabase environment variables" error
- Make sure `.env.local` exists and has correct values
- Restart the dev server after changing `.env.local`

### Can't login / "Invalid credentials"
- Check if email confirmation is required in Supabase Auth settings
- Verify the user exists in Authentication > Users
- Try resetting password

### Database errors
- Make sure you ran the entire `supabase-schema.sql` script
- Check Supabase logs in Dashboard > Logs
- Verify Row Level Security policies are enabled

### Not redirected to dashboard after login
- Check browser console for errors
- Verify middleware.ts is working
- Clear cookies and try again

## Next Steps

- Customize the dashboard with your branding
- Add more destinations to the explore page
- Integrate real payment processing with Stripe
- Add AI-powered trip recommendations
- Connect weather API for real-time data

## Support

For issues with:
- **Supabase**: https://supabase.com/docs
- **Next.js**: https://nextjs.org/docs
- **This project**: Check the code comments or create an issue

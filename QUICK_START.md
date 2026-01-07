# Quick Start - Get Your App Running in 5 Minutes

## ⚡ Fast Setup

### Step 1: Supabase Setup (2 minutes)

1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Fill in:
   - Name: `travelos`
   - Password: (create a strong password)
   - Region: (choose closest)
4. Wait ~2 minutes for setup

### Step 2: Get Your Keys (30 seconds)

1. In your new project, click **Settings** (gear icon)
2. Click **API** in the sidebar
3. Copy these two values:
   - **Project URL** 
   - **anon public** key

### Step 3: Update .env.local (30 seconds)

Open `.env.local` and paste your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

### Step 4: Create Database Tables (1 minute)

1. In Supabase, click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Open `supabase-schema.sql` in your code editor
4. Copy ALL the SQL code
5. Paste into Supabase SQL Editor
6. Click **RUN** (or press Ctrl+Enter)
7. Should see "Success. No rows returned"

### Step 5: Start the App (30 seconds)

```bash
npm run dev
```

Open http://localhost:3000

### Step 6: Create Account (1 minute)

1. Click **Login** or go to http://localhost:3000/login
2. Click **"Create Account"**
3. Enter:
   - Email: your-email@example.com
   - Password: (at least 6 characters)
4. Click **"Create Account"**
5. Check your email and click confirmation link
6. Go back and click **"Sign In"**
7. Enter your credentials
8. You're in! 🎉

## ✅ Verify It's Working

After login, you should see:
- Dashboard with stats cards
- Sidebar navigation
- Your email in the bottom left
- "No upcoming trips" message (since you're new)

## 🎯 Add Sample Data (Optional)

To see the dashboard with data:

1. In Supabase, go to **Table Editor**
2. Click **profiles** table
3. Copy your user `id` (long UUID string)
4. Go to **SQL Editor** > **New Query**
5. Paste this (replace `YOUR_USER_ID` with your actual ID):

```sql
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
) RETURNING id;

-- Copy the returned trip ID, then add bookings (replace TRIP_ID):
INSERT INTO bookings (trip_id, user_id, booking_type, title, description, status, cost)
VALUES 
  ('TRIP_ID', 'YOUR_USER_ID', 'flight', 'Flight to DPS', 'SQ 940 • Departs 09:30 AM', 'confirmed', 450.00),
  ('TRIP_ID', 'YOUR_USER_ID', 'hotel', 'Hotel Check-in', 'Ubud Resort & Spa • 02:00 PM', 'pending', 800.00),
  ('TRIP_ID', 'YOUR_USER_ID', 'activity', 'Monkey Forest Tour', 'Day 2 • 10:00 AM', 'confirmed', 50.00);

-- Update loyalty points
UPDATE loyalty_points 
SET points = 12450, tier = 'elite' 
WHERE user_id = 'YOUR_USER_ID';
```

6. Click **RUN**
7. Refresh your dashboard - you should see the trip!

## 🐛 Troubleshooting

**"Missing Supabase environment variables"**
- Restart dev server: Stop (Ctrl+C) and run `npm run dev` again
- Check `.env.local` has correct values with no extra spaces

**Can't login**
- Check email for confirmation link
- In Supabase: Authentication > Users - verify user exists
- In Supabase: Authentication > Providers - verify Email is enabled

**Database errors**
- Make sure you ran the ENTIRE `supabase-schema.sql` script
- Check for errors in Supabase SQL Editor output

**Still stuck?**
- See detailed [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- Check Supabase logs: Dashboard > Logs

## 🎨 What's Next?

- Explore the dashboard
- Check out the sidebar navigation
- Try the logout button (bottom left)
- Add more trips manually in Supabase Table Editor
- Customize the design in `components/dashboard/dashboard-content.tsx`

---

**Need help?** Check the full [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed explanations!

# Authentication Setup - Complete Guide

## 🔐 What I've Built

A complete authentication system with:
- ✅ User signup and login
- ✅ Secure session management
- ✅ Protected dashboard routes
- ✅ Database storage for user data
- ✅ Automatic profile creation on signup
- ✅ Logout functionality

## 📋 What You Need to Do

### 1. Create Supabase Account & Project

**Why?** Supabase provides the database and authentication backend.

**Steps:**
1. Go to https://supabase.com
2. Click "Start your project" or "Sign In"
3. Sign up with GitHub, Google, or email
4. Click "New Project"
5. Fill in:
   - **Organization**: Create new or select existing
   - **Name**: `travelos` (or any name you like)
   - **Database Password**: Create a strong password (SAVE THIS!)
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Free (sufficient for development)
6. Click "Create new project"
7. Wait 2-3 minutes for setup to complete

### 2. Get Your API Credentials

**Why?** Your app needs these to connect to Supabase.

**Steps:**
1. In your Supabase project dashboard
2. Click the **Settings** icon (⚙️) in the left sidebar
3. Click **API** in the settings menu
4. You'll see two important values:

   **Project URL:**
   ```
   https://abcdefghijklmnop.supabase.co
   ```
   
   **anon/public key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMjc0ODAwMCwiZXhwIjoxOTQ4MzI0MDAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

5. Copy both values (click the copy icon)

### 3. Update Environment Variables

**Why?** This connects your app to your Supabase project.

**Steps:**
1. Open `.env.local` file in your project root
2. Replace the placeholder values with your actual credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

3. Save the file
4. **IMPORTANT**: Restart your dev server
   - Stop it (Ctrl+C or Cmd+C)
   - Start again: `npm run dev`

### 4. Set Up Database Tables

**Why?** Creates the tables to store user profiles, trips, bookings, etc.

**Steps:**
1. In Supabase dashboard, click **SQL Editor** in left sidebar
2. Click **New Query** button
3. Open `supabase-schema.sql` file in your code editor
4. Select ALL the SQL code (Ctrl+A or Cmd+A)
5. Copy it (Ctrl+C or Cmd+C)
6. Paste into the Supabase SQL Editor
7. Click **RUN** button (or press Ctrl+Enter)
8. You should see: ✅ **"Success. No rows returned"**

**What this creates:**
- `profiles` - User information
- `trips` - Travel bookings
- `bookings` - Individual reservations
- `wishlist` - Saved destinations
- `loyalty_points` - Rewards system
- Security policies (Row Level Security)
- Automatic triggers

### 5. Configure Email Settings (Optional but Recommended)

**Why?** For email confirmations and password resets.

**Steps:**
1. In Supabase dashboard, go to **Authentication** > **Providers**
2. Make sure **Email** is enabled (should be by default)
3. Scroll down to **Email Auth**
4. You can choose:
   - **Confirm email**: ON (users must verify email) - Recommended
   - **Confirm email**: OFF (instant signup) - Easier for testing

For testing, you might want to turn OFF email confirmation initially.

### 6. Test the Authentication

**Steps:**

1. Make sure dev server is running: `npm run dev`

2. Open http://localhost:3000/login

3. **Create an account:**
   - Click "Create Account" button
   - Enter email: `test@example.com`
   - Enter password: `password123` (at least 6 characters)
   - Click "Create Account"

4. **If email confirmation is ON:**
   - Check your email inbox
   - Click the confirmation link
   - Return to login page

5. **Login:**
   - Enter your email and password
   - Click "Sign In"
   - You should be redirected to `/dashboard`

6. **Verify it worked:**
   - You should see the dashboard
   - Your email should appear in bottom left
   - Stats cards should show zeros (no data yet)

### 7. Verify Database

**Steps:**
1. Go to Supabase dashboard
2. Click **Table Editor** in left sidebar
3. Click **profiles** table
4. You should see your user with:
   - `id` (UUID)
   - `email` (your email)
   - `created_at` (timestamp)

5. Click **loyalty_points** table
6. You should see an entry with:
   - Your `user_id`
   - `points`: 0
   - `tier`: bronze

### 8. Add Sample Data (Optional)

**Why?** To see the dashboard with actual trip data.

**Steps:**
1. In Supabase **Table Editor**, click **profiles**
2. Find your user and copy the `id` (long UUID string)
3. Go to **SQL Editor** > **New Query**
4. Open `sample-data.sql` in your code editor
5. Replace ALL instances of `YOUR_USER_ID` with your actual user ID
6. For the bookings, you'll need to:
   - First run the trip INSERT
   - Copy the returned trip `id`
   - Replace `TRIP_ID_1` with that ID
   - Then run the bookings INSERT
7. Run the SQL
8. Refresh your dashboard - you should see the trip!

## 🎯 Testing Checklist

- [ ] Supabase project created
- [ ] API credentials copied to `.env.local`
- [ ] Dev server restarted
- [ ] Database schema created (ran `supabase-schema.sql`)
- [ ] Can access login page
- [ ] Can create new account
- [ ] Can login with credentials
- [ ] Redirected to dashboard after login
- [ ] Can see user email in sidebar
- [ ] Can logout (button in sidebar)
- [ ] After logout, redirected to login
- [ ] Dashboard is protected (can't access without login)

## 🐛 Common Issues

### "Missing Supabase environment variables"

**Problem:** App can't find your Supabase credentials

**Solution:**
1. Check `.env.local` exists in project root
2. Check values are correct (no extra spaces)
3. Restart dev server completely
4. Clear browser cache

### "Invalid login credentials"

**Problem:** Can't login with email/password

**Solution:**
1. Check if email confirmation is required
2. Go to Supabase: Authentication > Users
3. Verify user exists
4. Check if email is confirmed
5. Try "Forgot Password" flow

### "User already registered"

**Problem:** Email already used

**Solution:**
1. Use different email, OR
2. Go to Supabase: Authentication > Users
3. Delete the existing user
4. Try again

### Database errors / "relation does not exist"

**Problem:** Tables not created properly

**Solution:**
1. Go to Supabase: SQL Editor
2. Run this to check tables:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```
3. If tables missing, run `supabase-schema.sql` again
4. Make sure you ran the ENTIRE script

### Can't access dashboard / redirected to login

**Problem:** Authentication not persisting

**Solution:**
1. Check browser cookies are enabled
2. Clear browser cookies for localhost
3. Check middleware.ts is working
4. Try incognito/private window
5. Check browser console for errors

### Email not received

**Problem:** Confirmation email not arriving

**Solution:**
1. Check spam folder
2. In Supabase: Authentication > Email Templates
3. Check email settings
4. For testing, disable email confirmation:
   - Authentication > Providers > Email
   - Turn OFF "Confirm email"

## 📚 Files Created

- `supabase-schema.sql` - Database structure
- `sample-data.sql` - Test data
- `app/auth/callback/route.ts` - Auth callback handler
- `app/api/auth/logout/route.ts` - Logout endpoint
- `app/dashboard/page.tsx` - Dashboard with data fetching
- `components/dashboard/dashboard-content.tsx` - Dashboard UI with real data
- `.env.local` - Environment variables (you need to fill this)

## 🎓 Understanding the Flow

1. **User visits `/login`**
2. **User clicks "Create Account"**
3. **Supabase creates auth user**
4. **Trigger automatically creates profile + loyalty_points**
5. **User confirms email (if required)**
6. **User logs in**
7. **Middleware checks authentication**
8. **User redirected to `/dashboard`**
9. **Dashboard fetches user data from database**
10. **Dashboard displays personalized information**

## 🔒 Security Features

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Users can only see their own data
- ✅ Passwords hashed by Supabase
- ✅ Secure session tokens
- ✅ Protected routes via middleware
- ✅ HTTPS in production

## 🚀 Next Steps

Once authentication is working:
1. Add more trips manually in Supabase
2. Test the wishlist feature
3. Customize the dashboard design
4. Add more features (explore page, etc.)
5. Deploy to production (Vercel + Supabase)

## 💡 Tips

- Use Supabase Table Editor to manually add/edit data
- Check Supabase Logs for debugging
- Use browser DevTools Network tab to see API calls
- Keep your `.env.local` file secure (never commit to git)
- Use different Supabase projects for dev/staging/production

---

**Need more help?** Check:
- [QUICK_START.md](./QUICK_START.md) - 5-minute setup
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Detailed guide
- [Supabase Docs](https://supabase.com/docs)

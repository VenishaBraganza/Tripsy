# Troubleshooting Guide

## "Failed to fetch" Error on Signup/Login

This error means the app cannot connect to Supabase. Here's how to fix it:

### Step 1: Test Your Connection

Go to: **http://localhost:3000/test-connection**

This page will show you:
- ✓ If environment variables are loaded
- ✓ If Supabase connection works
- Detailed error messages

### Step 2: Common Fixes

#### Fix 1: Wait for Supabase Project Initialization

**Problem:** Your Supabase project is still being set up.

**Solution:**
1. Go to https://supabase.com/dashboard
2. Check if your project shows "Setting up project..." or similar
3. Wait 2-3 minutes for full initialization
4. Refresh and try again

#### Fix 2: Verify Environment Variables

**Problem:** `.env.local` has incorrect values or formatting issues.

**Solution:**
1. Open `.env.local` in your project root
2. Make sure it looks EXACTLY like this (with YOUR values):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. **No extra spaces** before or after the `=`
4. **No quotes** around the values
5. **No trailing spaces** at the end of lines
6. Save the file

#### Fix 3: Restart Dev Server

**Problem:** Server didn't pick up the new environment variables.

**Solution:**
1. Stop the server (Ctrl+C in terminal)
2. Start it again: `npm run dev`
3. Wait for "Ready" message
4. Try again

#### Fix 4: Check Supabase Project URL

**Problem:** The URL is incorrect or project doesn't exist.

**Solution:**
1. Go to https://supabase.com/dashboard
2. Click on your project
3. Go to **Settings** (gear icon) → **API**
4. Copy the **Project URL** (should look like: `https://xxxxx.supabase.co`)
5. Make sure it matches what's in `.env.local`
6. Try accessing the URL in your browser - it should load a page

#### Fix 5: Verify API Key

**Problem:** The anon key is incorrect or expired.

**Solution:**
1. In Supabase dashboard: **Settings** → **API**
2. Find **anon public** key (NOT the service_role key!)
3. Copy the entire key (it's very long, starts with `eyJ`)
4. Replace the value in `.env.local`
5. Restart server

#### Fix 6: Check Internet Connection

**Problem:** Your computer can't reach Supabase servers.

**Solution:**
1. Check your internet connection
2. Try accessing https://supabase.com in your browser
3. Check if you're behind a firewall or VPN
4. Try disabling VPN temporarily

#### Fix 7: Clear Browser Cache

**Problem:** Browser is caching old configuration.

**Solution:**
1. Open browser DevTools (F12)
2. Go to Application/Storage tab
3. Clear all site data for localhost:3000
4. Refresh the page
5. Or try in Incognito/Private window

### Step 3: Verify Supabase Project Status

1. Go to https://supabase.com/dashboard
2. Click on your project
3. Check the status indicator (should be green/active)
4. Go to **Settings** → **General**
5. Make sure project is not paused or suspended

### Step 4: Test with cURL (Advanced)

Open terminal and run:

```bash
curl https://YOUR-PROJECT-ID.supabase.co/rest/v1/
```

Replace `YOUR-PROJECT-ID` with your actual project ID.

**Expected result:** Should return some JSON (even if it's an error about auth)
**Problem:** If it times out or fails, your Supabase project URL is wrong

### Step 5: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try to signup/login
4. Look for error messages
5. Common errors:
   - **CORS error**: Supabase project not configured properly
   - **Network error**: Internet/firewall issue
   - **401/403**: API key issue

### Step 6: Verify Database is Set Up

Even if connection works, you need the database tables:

1. Go to Supabase dashboard
2. Click **Table Editor**
3. You should see these tables:
   - profiles
   - trips
   - bookings
   - wishlist
   - loyalty_points

**If tables are missing:**
1. Go to **SQL Editor**
2. Click **New Query**
3. Copy entire `supabase-schema.sql` file
4. Paste and click **RUN**

## Other Common Issues

### "Invalid login credentials"

**Problem:** Wrong email/password or user doesn't exist.

**Solution:**
1. Make sure you created an account first
2. Check email for confirmation link (if required)
3. Try "Create Account" again
4. Check Supabase: **Authentication** → **Users** to see if user exists

### "Email already registered"

**Problem:** Email is already in use.

**Solution:**
1. Use the login form instead of signup
2. Or use a different email
3. Or delete the user in Supabase: **Authentication** → **Users**

### Redirected to login after accessing dashboard

**Problem:** Not authenticated or session expired.

**Solution:**
1. Make sure you logged in successfully
2. Check browser cookies are enabled
3. Try logging in again
4. Check browser console for errors

### "Cannot find module" errors

**Problem:** Missing dependencies or TypeScript issues.

**Solution:**
```bash
npm install
npm run dev
```

### Database errors / "relation does not exist"

**Problem:** Database tables not created.

**Solution:**
1. Run the entire `supabase-schema.sql` in Supabase SQL Editor
2. Check for errors in the SQL output
3. Verify tables exist in Table Editor

## Still Not Working?

### Debug Checklist

- [ ] Supabase project is fully initialized (green status)
- [ ] `.env.local` exists in project root
- [ ] Environment variables are correct (no typos, spaces, quotes)
- [ ] Dev server was restarted after updating `.env.local`
- [ ] Can access Supabase project URL in browser
- [ ] Database tables are created (ran `supabase-schema.sql`)
- [ ] Internet connection is working
- [ ] Browser cookies are enabled
- [ ] Tried in incognito/private window
- [ ] Checked browser console for errors
- [ ] Tested connection at `/test-connection` page

### Get More Help

1. Check the test connection page: http://localhost:3000/test-connection
2. Look at browser console (F12) for detailed errors
3. Check Supabase logs: Dashboard → Logs
4. Review the setup guides:
   - `QUICK_START.md`
   - `AUTHENTICATION_SETUP.md`
   - `SETUP_GUIDE.md`

### Example of Correct .env.local

```env
NEXT_PUBLIC_SUPABASE_URL=https://pbpzviowuvqkvokaxuhx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBicHp2aW93dXZxa3Zva2F4dWh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NzIzMTgsImV4cCI6MjA4MDE0ODMxOH0.MMnh05GpgxS5eixEQXedp7-F-PTOm-e02qbLWLK6if8
```

**Important:**
- No spaces around `=`
- No quotes around values
- No blank lines between variables
- File must be named exactly `.env.local` (with the dot at the start)
- File must be in the project root (same folder as `package.json`)

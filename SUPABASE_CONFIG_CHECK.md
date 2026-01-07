# Supabase Configuration Checklist

## Issue: "Failed to fetch" on Login but Test Connection Works

This usually means there's a configuration issue in Supabase itself. Follow these steps:

### Step 1: Check Authentication Settings

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Authentication** → **Providers**
4. Make sure **Email** provider is **ENABLED** (toggle should be ON/green)

### Step 2: Check Site URL Configuration

1. In Supabase dashboard, go to **Authentication** → **URL Configuration**
2. Add these URLs:

   **Site URL:**
   ```
   http://localhost:3000
   ```

   **Redirect URLs:** (click "Add URL" for each)
   ```
   http://localhost:3000
   http://localhost:3000/auth/callback
   http://localhost:3000/dashboard
   http://localhost:3000/login
   ```

3. Click **Save**

### Step 3: Disable Email Confirmation (For Testing)

1. Go to **Authentication** → **Providers**
2. Click on **Email** provider
3. Find **"Confirm email"** setting
4. **Turn it OFF** (for easier testing)
5. Click **Save**

### Step 4: Check API Settings

1. Go to **Settings** → **API**
2. Verify:
   - **Project URL** is correct
   - **anon public** key is correct
   - **JWT expiry** is set (default 3600 is fine)

### Step 5: Check Database Connection

1. Go to **Table Editor**
2. You should see tables: `profiles`, `trips`, `bookings`, `wishlist`, `loyalty_points`
3. If not, run the `supabase-schema.sql` script in SQL Editor

### Step 6: Enable Realtime (Optional but Recommended)

1. Go to **Database** → **Replication**
2. Enable replication for your tables (optional)

### Step 7: Check CORS Settings

Supabase should handle CORS automatically, but verify:

1. Go to **Settings** → **API**
2. Scroll to **CORS**
3. Make sure `http://localhost:3000` is allowed (should be by default)

### Step 8: Restart Everything

After making changes:

1. **In Supabase**: Changes are usually instant, but wait 30 seconds
2. **In your app**: 
   - Stop the dev server (Ctrl+C)
   - Clear browser cache or use incognito
   - Start dev server: `npm run dev`
   - Try again

## Common Fixes

### Fix 1: Email Provider Not Enabled

**Symptom:** "Failed to fetch" or "Email provider not enabled"

**Solution:**
1. Authentication → Providers
2. Enable Email provider
3. Save

### Fix 2: Wrong Site URL

**Symptom:** CORS errors or redirect issues

**Solution:**
1. Authentication → URL Configuration
2. Set Site URL to `http://localhost:3000`
3. Add redirect URLs
4. Save

### Fix 3: Email Confirmation Blocking

**Symptom:** Can create account but can't login

**Solution:**
1. Authentication → Providers → Email
2. Disable "Confirm email"
3. Or check your email for confirmation link

### Fix 4: Database Not Set Up

**Symptom:** Can login but dashboard errors

**Solution:**
1. SQL Editor → New Query
2. Run entire `supabase-schema.sql`
3. Check Table Editor for tables

## Testing Steps

After configuration:

1. **Clear browser cache** or use incognito window
2. Go to http://localhost:3000/test-connection
3. Verify: ✅ Environment Variables Found, ✅ Supabase Connected
4. Go to http://localhost:3000/login
5. Try **Create Account** with a new email
6. Should see: "Account created! You can now login."
7. Try **Sign In** with same credentials
8. Should redirect to dashboard

## Still Not Working?

### Check Browser Console

1. Open DevTools (F12)
2. Go to Console tab
3. Try to login
4. Look for errors
5. Common errors:
   - **CORS**: Check Site URL configuration
   - **401/403**: Check API key
   - **Network error**: Check internet/firewall
   - **Invalid credentials**: User doesn't exist or wrong password

### Check Supabase Logs

1. In Supabase dashboard
2. Go to **Logs** → **Auth Logs**
3. Try to login
4. Check for error messages
5. Common issues:
   - "Email provider not enabled"
   - "Invalid JWT"
   - "User not found"

### Verify Environment Variables

Run this in your terminal:

```bash
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Or check in browser console:
```javascript
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
```

Should show your actual values, not undefined.

## Quick Fix Checklist

- [ ] Email provider is enabled in Supabase
- [ ] Site URL is set to `http://localhost:3000`
- [ ] Redirect URLs include `/auth/callback`
- [ ] Email confirmation is disabled (for testing)
- [ ] Database tables are created (ran SQL script)
- [ ] `.env.local` has correct values
- [ ] Dev server was restarted
- [ ] Browser cache was cleared
- [ ] Test connection page shows ✅ Connected
- [ ] Tried in incognito/private window

## Contact Support

If still not working after all these steps:

1. Take screenshot of:
   - Supabase Authentication → Providers page
   - Supabase Authentication → URL Configuration
   - Browser console errors
   - Test connection page results

2. Check Supabase status: https://status.supabase.com

3. Review Supabase docs: https://supabase.com/docs/guides/auth

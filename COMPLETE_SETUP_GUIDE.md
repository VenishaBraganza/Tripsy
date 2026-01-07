# 🚀 Tripsy - Complete Setup & Integration Guide

## Overview
This guide will help you set up the complete Tripsy backend with all features connected and functional.

## ✅ What's Been Built

### 1. Database Layer
- **Complete Schema**: 25+ tables with relationships
- **RLS Policies**: Row-level security for all tables
- **Triggers**: Auto-update timestamps, user creation
- **Indexes**: Optimized for performance
- **Full-text Search**: Enabled on destinations and packages

### 2. API Layer
- **7 API Routes**: packages, wishlist, trips, bookings, support, recommendations
- **RESTful Design**: GET, POST, PATCH, DELETE methods
- **Authentication**: Protected routes with Supabase Auth
- **Error Handling**: Comprehensive error responses

### 3. Server Actions
- **4 Action Files**: profile, trips, wishlist, support
- **Revalidation**: Automatic cache invalidation
- **Type-safe**: Full TypeScript support

### 4. React Hooks
- **4 Custom Hooks**: useTrips, useWishlist, useBookings, usePackages
- **Real-time Updates**: Automatic refetching
- **Error States**: Built-in error handling

### 5. AI Integration
- **Personalized Recommendations**: Based on user DNA
- **Package Idea Generator**: AI-powered package creation
- **Pricing Analysis**: Dynamic pricing suggestions
- **Itinerary Generator**: Auto-create day-by-day plans

## 📋 Prerequisites

```bash
# Required
- Node.js 18+ 
- npm or pnpm
- Supabase account
- OpenAI API key (for AI features)

# Optional
- Stripe account (for payments)
- Twilio account (for SMS/WhatsApp)
```

## 🔧 Step-by-Step Setup

### Step 1: Environment Variables (5 minutes)

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI (for AI features)
OPENAI_API_KEY=sk-your-openai-key

# Vercel AI SDK
AI_SDK_API_KEY=your-ai-sdk-key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Payments
STRIPE_SECRET_KEY=sk_test_your-stripe-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Optional: Communications
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890
```

### Step 2: Database Setup (10 minutes)

1. **Go to Supabase SQL Editor**
2. **Copy entire `supabase-complete-schema.sql`**
3. **Execute the script**
4. **Verify tables created**:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected tables:
- profiles
- user_preferences
- travel_dna
- destinations
- packages
- package_pricing
- package_availability
- trips
- bookings
- travelers
- wishlist
- reviews
- loyalty_points
- support_tickets
- support_messages
- notifications
- ai_recommendations
- search_history
- page_views
- conversion_events

### Step 3: Install Dependencies (2 minutes)

```bash
npm install
# or
pnpm install
```

### Step 4: Test Database Connection (2 minutes)

```bash
npm run dev
```

Visit: `http://localhost:3000/test-connection`

You should see:
- ✅ Supabase connection successful
- ✅ Tables accessible
- ✅ RLS policies active

### Step 5: Seed Sample Data (5 minutes)

Run in Supabase SQL Editor:

```sql
-- Insert sample destinations
INSERT INTO destinations (name, slug, description, short_description, state, region, image_url, hidden_gem_score, tags, is_active)
VALUES 
  ('Gokarna Beach', 'gokarna-beach', 'Pristine beaches away from crowds', 'Hidden beach paradise', 'Karnataka', 'South Karnataka', '/placeholder.jpg', 85, ARRAY['beach', 'hidden gem', 'spiritual'], true),
  ('Meghalaya Living Root Bridges', 'meghalaya-root-bridges', 'Trek through living root bridges', 'Natural wonders of Northeast', 'Meghalaya', 'Northeast', '/placeholder.jpg', 92, ARRAY['trekking', 'nature', 'offbeat'], true),
  ('Spiti Valley', 'spiti-valley', 'High altitude desert mountain valley', 'Cold desert adventure', 'Himachal Pradesh', 'Himalayas', '/placeholder.jpg', 78, ARRAY['mountains', 'adventure', 'photography'], true)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample packages
INSERT INTO packages (destination_id, name, slug, description, duration_days, duration_text, base_price, status, image_url, tags, category)
SELECT 
  d.id,
  'Gokarna Beach Escape',
  'gokarna-beach-escape',
  'Relax on pristine beaches, visit ancient temples, and enjoy fresh seafood',
  4,
  '3N/4D',
  12600,
  'live',
  '/placeholder.jpg',
  ARRAY['beach', 'relaxation', 'budget-friendly'],
  'weekend'
FROM destinations d WHERE d.slug = 'gokarna-beach'
ON CONFLICT (slug) DO NOTHING;
```

### Step 6: Test API Routes (5 minutes)

Test each endpoint:

```bash
# Get packages
curl http://localhost:3000/api/packages

# Get trips (requires auth)
curl http://localhost:3000/api/trips \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get wishlist (requires auth)
curl http://localhost:3000/api/wishlist \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 7: Enable Realtime (2 minutes)

In Supabase Dashboard:
1. Go to Database → Replication
2. Enable replication for these tables:
   - notifications
   - bookings
   - support_messages
   - trips

### Step 8: Configure Storage (5 minutes)

Create storage buckets in Supabase:

```sql
-- Create buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('package-images', 'package-images', true),
  ('vouchers', 'vouchers', false),
  ('support-attachments', 'support-attachments', false);

-- Set up policies
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## 🔗 Component Integration Examples

### Example 1: Connect Dashboard to Real Data

Update `app/dashboard/page.tsx`:

```typescript
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getUserTrips, getUserBookings, getLoyaltyPoints, getUserWishlist } from "@/lib/supabase/queries"

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  const [profile, trips, bookings, loyaltyPoints, wishlist] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    getUserTrips(user.id),
    getUserBookings(user.id),
    getLoyaltyPoints(user.id),
    getUserWishlist(user.id)
  ])
  
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="ml-72 flex-1">
        <DashboardContent 
          user={user}
          profile={profile.data}
          trips={trips}
          bookings={bookings}
          loyaltyPoints={loyaltyPoints}
          wishlist={wishlist}
        />
      </div>
    </div>
  )
}
```

### Example 2: Connect Wishlist with Real Data

Update `app/dashboard/wishlist/page.tsx`:

```typescript
import { WishlistContent } from "@/components/dashboard/wishlist-content"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getUserWishlist } from "@/lib/supabase/queries"

export default async function WishlistPage() {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  const wishlist = await getUserWishlist(user.id)
  
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="ml-72 flex-1">
        <WishlistContent initialWishlist={wishlist} userId={user.id} />
      </div>
    </div>
  )
}
```

Then update `components/dashboard/wishlist-content.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useWishlist } from '@/hooks/use-wishlist'
import { removePackageFromWishlist } from '@/lib/actions/wishlist'

export function WishlistContent({ initialWishlist, userId }: { initialWishlist: any[], userId: string }) {
  const { wishlist, loading, removeFromWishlist } = useWishlist()
  const [items, setItems] = useState(initialWishlist)
  
  const handleRemove = async (wishlistId: string) => {
    const result = await removeFromWishlist(wishlistId)
    if (result.success) {
      setItems(items.filter(item => item.id !== wishlistId))
    }
  }
  
  // Rest of component with real data...
}
```

### Example 3: AI-Powered Package Recommendations

```typescript
'use client'

import { useChat } from 'ai/react'

export function AIRecommendations() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/ai/recommendations',
  })
  
  return (
    <div>
      <h3>Get Personalized Recommendations</h3>
      <button onClick={() => handleSubmit()}>
        Generate Recommendations
      </button>
      
      {isLoading && <p>Analyzing your preferences...</p>}
      
      <div>
        {messages.map(m => (
          <div key={m.id}>
            {m.role === 'assistant' && <pre>{m.content}</pre>}
          </div>
        ))}
      </div>
    </div>
  )
}
```

## 🎯 Testing Checklist

### Authentication
- [ ] User can sign up
- [ ] User can log in
- [ ] User can log out
- [ ] Profile is auto-created on signup
- [ ] Protected routes redirect to login

### Trips
- [ ] User can view their trips
- [ ] User can create a new trip
- [ ] User can update trip details
- [ ] Trip status updates correctly

### Bookings
- [ ] User can view all bookings
- [ ] Bookings are linked to trips
- [ ] Booking status can be updated
- [ ] Vouchers can be downloaded

### Wishlist
- [ ] User can add packages to wishlist
- [ ] User can remove from wishlist
- [ ] Collections work correctly
- [ ] Price alerts are tracked

### Packages
- [ ] Packages are listed correctly
- [ ] Filters work (price, category, region)
- [ ] Package details page loads
- [ ] Views are tracked

### Support
- [ ] User can create tickets
- [ ] Messages can be sent
- [ ] Ticket status updates
- [ ] File attachments work

### AI Features
- [ ] Recommendations are generated
- [ ] Package ideas are created
- [ ] Pricing analysis works
- [ ] Itineraries are generated

## 🐛 Common Issues & Solutions

### Issue: "Supabase connection failed"
**Solution**: 
- Check `.env.local` has correct credentials
- Verify Supabase project is active
- Check API keys are not expired

### Issue: "RLS policy violation"
**Solution**:
- Ensure user is authenticated
- Check RLS policies in Supabase
- Verify user has correct role

### Issue: "AI features not working"
**Solution**:
- Check OpenAI API key is valid
- Verify you have credits
- Check API rate limits

### Issue: "Slow queries"
**Solution**:
- Add indexes to frequently queried columns
- Use `select` to limit columns
- Implement pagination
- Enable query caching

## 📊 Performance Optimization

### 1. Enable Caching

```typescript
// In API routes
export const revalidate = 3600 // Cache for 1 hour

// In server components
export const dynamic = 'force-static'
```

### 2. Implement Pagination

```typescript
const { data, error } = await supabase
  .from('packages')
  .select('*')
  .range(0, 9) // First 10 items
  .order('created_at', { ascending: false })
```

### 3. Use React Query (Optional)

```bash
npm install @tanstack/react-query
```

```typescript
import { useQuery } from '@tanstack/react-query'

export function usePackages() {
  return useQuery({
    queryKey: ['packages'],
    queryFn: async () => {
      const res = await fetch('/api/packages')
      return res.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
```

## 🚀 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Add all variables from .env.local
```

### Post-Deployment Checklist
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Storage buckets created
- [ ] RLS policies enabled
- [ ] API routes working
- [ ] Authentication working
- [ ] Real-time features enabled

## 📚 Next Steps

1. **Add Payment Integration**: Stripe or Razorpay
2. **Implement Email Notifications**: Resend or SendGrid
3. **Add SMS/WhatsApp**: Twilio integration
4. **Analytics Dashboard**: Track user behavior
5. **Admin Panel**: Full CRUD for all resources
6. **Mobile App**: React Native or Flutter
7. **SEO Optimization**: Meta tags, sitemaps
8. **Performance Monitoring**: Sentry or LogRocket

## 🎉 You're Done!

Your Tripsy backend is now fully functional with:
- ✅ Complete database schema
- ✅ RESTful API routes
- ✅ Server actions
- ✅ React hooks
- ✅ AI integration
- ✅ Real-time features
- ✅ Authentication
- ✅ Authorization

Start building amazing features! 🚀

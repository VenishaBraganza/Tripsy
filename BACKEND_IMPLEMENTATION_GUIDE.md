# Tripsy Backend Implementation Guide

## Overview
This guide outlines the complete backend architecture and implementation steps for connecting all components with full functionality.

## ✅ What's Been Created

### 1. Database Schema (`supabase-complete-schema.sql`)
- **User Management**: profiles, user_preferences, travel_dna
- **Content**: destinations, packages, package_pricing, package_availability
- **Bookings**: trips, bookings, travelers
- **Engagement**: wishlist, reviews, loyalty_points
- **Support**: support_tickets, support_messages
- **AI**: ai_recommendations, search_history
- **Analytics**: page_views, conversion_events
- **Notifications**: notifications, notification_preferences

### 2. Query Library (`lib/supabase/queries.ts`)
- Complete CRUD operations for all tables
- User profile and preferences management
- Destination and package queries with filters
- Trip and booking management
- Wishlist operations
- Review system
- Loyalty points tracking
- Support ticket system
- Notification management
- AI recommendations

## 🚀 Implementation Steps

### Phase 1: Database Setup (30 minutes)

1. **Run the schema**:
   ```bash
   # In Supabase SQL Editor
   # Copy and paste supabase-complete-schema.sql
   # Execute the entire script
   ```

2. **Verify tables created**:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

3. **Check RLS policies**:
   ```sql
   SELECT * FROM pg_policies;
   ```

### Phase 2: API Routes Creation (2-3 hours)

Create these API routes in `app/api/`:

#### `/api/packages/route.ts`
```typescript
import { NextResponse } from 'next/server'
import { getPackages } from '@/lib/supabase/queries'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const filters = {
    category: searchParams.get('category') || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
  }
  
  try {
    const packages = await getPackages(filters)
    return NextResponse.json({ packages })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 })
  }
}
```

#### `/api/trips/route.ts`
```typescript
import { NextResponse } from 'next/server'
import { getUserTrips, createTrip } from '@/lib/supabase/queries'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const trips = await getUserTrips(user.id)
    return NextResponse.json({ trips })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const body = await request.json()
  
  try {
    const trip = await createTrip({ ...body, user_id: user.id })
    return NextResponse.json({ trip })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 })
  }
}
```

### Phase 3: Server Actions (1-2 hours)

Create `lib/actions/` directory with server actions:

#### `lib/actions/wishlist.ts`
```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { addToWishlist, removeFromWishlist } from '@/lib/supabase/queries'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function addPackageToWishlist(packageId: string, collection: string = 'all') {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')
  
  await addToWishlist(user.id, {
    package_id: packageId,
    collection_name: collection
  })
  
  revalidatePath('/dashboard/wishlist')
  return { success: true }
}

export async function removePackageFromWishlist(wishlistId: string) {
  await removeFromWishlist(wishlistId)
  revalidatePath('/dashboard/wishlist')
  return { success: true }
}
```

### Phase 4: Connect Components (3-4 hours)

Update each component to use real data:

#### Example: Update `components/dashboard/wishlist-content.tsx`
```typescript
'use client'

import { useEffect, useState } from 'react'
import { getUserWishlist } from '@/lib/supabase/queries'
import { removePackageFromWishlist } from '@/lib/actions/wishlist'

export function WishlistContent({ userId }: { userId: string }) {
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function loadWishlist() {
      try {
        const data = await getUserWishlist(userId)
        setWishlist(data)
      } catch (error) {
        console.error('Failed to load wishlist:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadWishlist()
  }, [userId])
  
  const handleRemove = async (wishlistId: string) => {
    await removePackageFromWishlist(wishlistId)
    setWishlist(wishlist.filter(item => item.id !== wishlistId))
  }
  
  // Rest of component...
}
```

### Phase 5: AI Integration (2-3 hours)

#### Create AI recommendation engine:

```typescript
// lib/ai/recommendations.ts
import { OpenAI } from 'openai'
import { getUserPreferences, getTravelDNA } from '@/lib/supabase/queries'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function generatePersonalizedRecommendations(userId: string) {
  const [preferences, travelDNA] = await Promise.all([
    getUserPreferences(userId),
    getTravelDNA(userId)
  ])
  
  const prompt = `Based on this user profile:
  - Favorite regions: ${preferences.favorite_regions.join(', ')}
  - Hidden gem intensity: ${preferences.hidden_gem_intensity}%
  - Travel pace: ${preferences.travel_pace}
  - Mountain lover score: ${travelDNA.mountain_lover_score}
  - Beach bum score: ${travelDNA.beach_bum_score}
  
  Recommend 5 travel packages from India that match their preferences.
  Return as JSON array with: name, destination, duration, price, reasoning`
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  })
  
  return JSON.parse(completion.choices[0].message.content)
}
```

### Phase 6: Real-time Features (1-2 hours)

#### Setup Supabase Realtime for live updates:

```typescript
// lib/realtime/subscriptions.ts
import { supabase } from '@/lib/supabase/queries'

export function subscribeToNotifications(userId: string, callback: (notification: any) => void) {
  return supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      (payload) => callback(payload.new)
    )
    .subscribe()
}

export function subscribeToBookingUpdates(tripId: string, callback: (booking: any) => void) {
  return supabase
    .channel('bookings')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter: `trip_id=eq.${tripId}`
      },
      (payload) => callback(payload.new)
    )
    .subscribe()
}
```

### Phase 7: Middleware & Auth (1 hour)

Update `middleware.ts`:

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()
  
  // Protect dashboard routes
  if (req.nextUrl.pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  
  // Protect admin routes
  if (req.nextUrl.pathname.startsWith('/dashboard/manage-packages')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session?.user.id)
      .single()
    
    if (profile?.role !== 'admin' && profile?.role !== 'operator') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }
  
  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*']
}
```

## 📊 Data Flow Architecture

```
User Action → Component
    ↓
Server Action / API Route
    ↓
Query Function (lib/supabase/queries.ts)
    ↓
Supabase Database
    ↓
Response → Component Update
    ↓
UI Re-render
```

## 🔄 Key Integration Points

### 1. Dashboard → Trips
- Fetch user trips on load
- Real-time updates for booking changes
- Link to package details

### 2. Explore → Packages
- Filter by region, price, tags
- Track views for analytics
- Add to wishlist functionality

### 3. Wishlist → Packages
- Display saved packages
- Price drop notifications
- Quick booking actions

### 4. Bookings → Trips
- Show all bookings for a trip
- Download vouchers
- Modify bookings

### 5. Support → Tickets
- Create tickets linked to trips
- Real-time chat updates
- File uploads to Supabase Storage

## 🎯 Priority Implementation Order

1. **Critical (Week 1)**:
   - Database setup
   - Authentication flow
   - User profile management
   - Package listing and details

2. **High (Week 2)**:
   - Trip creation and management
   - Booking system
   - Wishlist functionality
   - Basic search

3. **Medium (Week 3)**:
   - AI recommendations
   - Support ticket system
   - Notifications
   - Reviews and ratings

4. **Nice-to-have (Week 4)**:
   - Advanced analytics
   - Admin dashboard features
   - Real-time chat
   - Payment integration

## 🔐 Environment Variables Needed

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI (for AI features)
OPENAI_API_KEY=your_openai_key

# Vercel AI SDK
AI_SDK_API_KEY=your_ai_sdk_key

# Optional: Payment
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Optional: SMS/WhatsApp
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
```

## 📝 Next Steps

1. Run the database schema in Supabase
2. Update `.env.local` with your credentials
3. Test authentication flow
4. Implement API routes one by one
5. Connect components to real data
6. Add error handling and loading states
7. Implement caching strategies
8. Add analytics tracking
9. Test end-to-end flows
10. Deploy to production

## 🐛 Common Issues & Solutions

### Issue: RLS blocking queries
**Solution**: Ensure user is authenticated and policies are correct

### Issue: Slow queries
**Solution**: Add indexes, use select specific columns, implement pagination

### Issue: Real-time not working
**Solution**: Check Supabase Realtime is enabled for tables

### Issue: Type errors
**Solution**: Generate types from Supabase: `npx supabase gen types typescript`

## 📚 Additional Resources

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [React Query for data fetching](https://tanstack.com/query/latest)

---

**Note**: This is a comprehensive foundation. Each phase can be implemented incrementally. Start with Phase 1-3 for a working MVP, then add advanced features.

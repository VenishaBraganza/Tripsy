# Tripsy - AI-Powered Travel Management App

A production-ready travel management application with AI-powered features, real-time updates, and comprehensive data validation. Built with Next.js 16, Supabase, and TypeScript.

## ✨ Features

### 🔐 **Authentication & Security**
- Production-ready Supabase authentication
- Protected routes with middleware
- Rate limiting on API endpoints
- Comprehensive input validation with Zod schemas

### 📊 **Real-time Dashboard**
- Live booking updates with Supabase Realtime
- Real weather data integration (OpenWeatherMap)
- Loyalty points tracking with real-time updates
- Interactive maps with Google Maps API

### 🗺️ **Trip Management**
- Create and manage trips with real-time sync
- Real booking data from Supabase
- Live status updates and notifications
- Interactive map with route planning

### ⭐ **Smart Wishlist**
- Real-time wishlist management
- Collection-based organization
- Price tracking and alerts
- Automatic image fallbacks

### 🤖 **AI-Powered Features**
- Personalized recommendations using OpenAI
- Real user behavior analysis
- Smart fallback to rule-based recommendations
- AI-generated itineraries

### 🎨 **Production UI**
- Modern, responsive design
- Comprehensive error handling
- Loading states and empty states
- Image fallback system with gradients/initials

### 🔄 **Real-time Features**
- Live booking updates
- Real-time notifications
- Support ticket messaging
- Centralized subscription management

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, React 19)
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime subscriptions
- **Validation**: Zod schemas with middleware
- **External APIs**: Google Maps, OpenWeatherMap, OpenAI
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI + shadcn/ui
- **TypeScript**: Full type safety throughout
- **Icons**: Lucide React

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

### 2. Set Up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and anon key from Settings > API

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```env
# Database & Authentication
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# External APIs (Optional but recommended)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Set Up Database

1. Go to Supabase SQL Editor
2. Copy contents of `supabase-complete-schema.sql`
3. Run the SQL script

This creates all necessary tables, RLS policies, triggers, and functions.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Create Your Account

1. Go to `/login`
2. Create a new account with email/password
3. Verify email if required
4. Login and start exploring!

## 🔧 API Keys Setup

### Required APIs:
- **Supabase**: Database and authentication (free tier available)

### Optional APIs (for full functionality):
- **Google Maps API**: Maps, places, directions, traffic
  - Get from: [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
  - Required APIs: Maps JavaScript, Places, Directions, Geocoding
- **OpenWeatherMap**: Weather data
  - Get from: [OpenWeatherMap](https://openweathermap.org/api)
  - Free tier: 1,000 calls/day
- **OpenAI**: AI recommendations and itineraries
  - Get from: [OpenAI Platform](https://platform.openai.com/api-keys)

## Detailed Setup

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions including:
- Database schema explanation
- Adding sample data
- Troubleshooting
- Configuration options

## 📁 Project Structure

```
├── app/
│   ├── dashboard/          # Dashboard pages & layouts
│   ├── login/              # Authentication pages
│   ├── auth/callback/      # Auth callback handler
│   ├── api/                # API routes with validation
│   ├── hidden-gems/        # Hidden gems discovery
│   └── explore/            # Package exploration
├── components/
│   ├── dashboard/          # Dashboard components
│   ├── error/              # Error handling components
│   ├── ui/                 # Reusable UI components
│   └── maps/               # Map components
├── hooks/
│   ├── use-trips.ts        # Trip management with real-time
│   ├── use-bookings.ts     # Booking management
│   ├── use-wishlist.ts     # Wishlist with real-time
│   ├── use-loyalty.ts      # Loyalty points tracking
│   ├── use-notifications.ts # Real-time notifications
│   ├── use-support.ts      # Support tickets & messaging
│   └── use-hidden-gems.ts  # Hidden gems & reviews
├── lib/
│   ├── supabase/           # Supabase clients & queries
│   ├── validation/         # Zod schemas & middleware
│   ├── services/           # External API integrations
│   ├── auth/               # Authentication utilities
│   ├── cache/              # Caching system
│   ├── errors/             # Error handling
│   └── ai/                 # AI recommendation engine
├── public/                 # Static assets
└── supabase-complete-schema.sql # Complete database schema
```

## 🗄️ Database Schema

### Core Tables:
- **profiles**: User information and preferences
- **trips**: Travel itineraries with real-time sync
- **bookings**: Individual reservations (flights, hotels, activities)
- **packages**: Travel packages with pricing
- **destinations**: Destinations with hidden gem scores
- **wishlist**: Saved packages with collections
- **loyalty_points**: Rewards and tier system
- **notifications**: Real-time user notifications
- **support_tickets**: Customer support system
- **reviews**: User reviews and ratings

### Features:
- Row Level Security (RLS) on all tables
- Real-time subscriptions enabled
- Comprehensive indexes for performance
- Triggers for automatic updates

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## ✅ Completed Features

- ✅ **Real-time weather integration** (OpenWeatherMap)
- ✅ **AI-powered trip recommendations** (OpenAI + user behavior)
- ✅ **Real-time data synchronization** (Supabase Realtime)
- ✅ **Comprehensive validation** (Zod schemas + middleware)
- ✅ **Production authentication** (Supabase Auth)
- ✅ **Interactive maps** (Google Maps API)
- ✅ **Image fallback system** (Automatic error handling)
- ✅ **Rate limiting** (API protection)
- ✅ **Error boundaries** (Comprehensive error handling)
- ✅ **Loading states** (Throughout the application)

## 🚧 Future Roadmap

- [ ] **Payment integration** (Stripe/Razorpay)
- [ ] **Social sharing** (Trip sharing with friends)
- [ ] **Trip collaboration** (Multi-user trip planning)
- [ ] **Mobile app** (React Native)
- [ ] **Offline mode** (PWA capabilities)
- [ ] **Multi-language support** (i18n)
- [ ] **Advanced analytics** (User behavior tracking)
- [ ] **Push notifications** (Mobile notifications)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions:
- Check [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- Review Supabase documentation
- Open an issue on GitHub

---


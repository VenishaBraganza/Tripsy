"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Search, Bell, Plus, Star, CloudRain, Plane, Building2, 
  Mountain, MapPin, TrendingUp, Navigation, Download, Heart
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format, differenceInDays } from "date-fns"
import { InteractiveMap } from "@/components/maps/interactive-map"
import { freeWeatherService, freeGeocodingService, freeAIService } from "@/lib/services/free-apis"
import { routes } from "@/lib/utils/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { PersonalizedRecommendations } from "@/components/dashboard/personalized-recommendations"

interface DashboardContentProps {
  user: any
  profile: any
  trips: any[]
  bookings: any[]
  loyaltyPoints: any
  wishlist: any[]
}

interface RecommendedPackage {
  id: string
  name: string
  description: string
  duration_days: number
  base_price: number
  discount_percentage?: number
  image_url?: string
  category: string
  is_popular: boolean
}

export function DashboardContent({ user, trips, bookings, loyaltyPoints, wishlist }: DashboardContentProps) {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const [currentLocation, setCurrentLocation] = useState<any>(null)
  const [weather, setWeather] = useState<any>(null)
  const [packagesLoading, setPackagesLoading] = useState(false)
  const [selectedTab, setSelectedTab] = useState("my-trip")
  const [recommendedPackages, setRecommendedPackages] = useState<RecommendedPackage[]>([])
  const [realtimeBookings, setRealtimeBookings] = useState(bookings)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [aiRecommendation, setAiRecommendation] = useState<string>("")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  
  // Calculate stats
  const upcomingTrips = trips.filter(t => t.status === "upcoming")
  const nextTrip = upcomingTrips[0]
  const daysUntilNextTrip = nextTrip ? differenceInDays(new Date(nextTrip.start_date), new Date()) : 0
  const totalSpent = trips.reduce((sum, trip) => sum + (parseFloat(trip.total_cost) || 0), 0)
  const points = loyaltyPoints?.points || 0
  const tier = loyaltyPoints?.tier || "bronze"
  
  // Load data in parallel for better performance with intelligent prefetching
  useEffect(() => {
    // Load all data in parallel using Promise.all
    const loadAllData = async () => {
      try {
        await Promise.all([
          loadLocationAndWeather(),
          loadRecommendedPackages(),
          loadAIRecommendations(),
        ])
        
        // Prefetch likely next pages after initial load
        setTimeout(() => {
          // Prefetch trip details for upcoming trips
          upcomingTrips.slice(0, 2).forEach(trip => {
            fetch(`/api/trips/${trip.id}`).catch(() => {}) // Silent prefetch
          })
          
          // Prefetch package details for recommended packages
          recommendedPackages.slice(0, 3).forEach(pkg => {
            fetch(`/api/packages/${pkg.id}`).catch(() => {}) // Silent prefetch
          })
        }, 2000)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      }
    }
    
    loadAllData()
    setupRealtimeSubscription()
    
    // Set up auto-refresh for weather data every 10 minutes
    const weatherInterval = setInterval(() => {
      loadLocationAndWeather()
    }, 10 * 60 * 1000) // 10 minutes
    
    // Set up auto-refresh for recommendations every 30 minutes
    const recommendationsInterval = setInterval(() => {
      loadRecommendedPackages()
    }, 30 * 60 * 1000) // 30 minutes
    
    return () => {
      clearInterval(weatherInterval)
      clearInterval(recommendationsInterval)
    }
  }, [])
  
  const loadLocationAndWeather = async () => {
    setWeatherLoading(true)
    setLocationError(null)
    
    try {
      // Get user's current location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported'))
          return
        }
        
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        })
      })
      
      const { latitude, longitude } = position.coords
      setCurrentLocation({ lat: latitude, lng: longitude })
      
      // Use our weather API endpoint
      const response = await fetch(`/api/weather?lat=${latitude}&lng=${longitude}`)
      const data = await response.json()
      
      if (data.success) {
        setWeather(data.data.current)
        setLastUpdated(new Date())
      } else {
        throw new Error(data.error || 'Failed to fetch weather')
      }
      
    } catch (error) {
      console.error('Error loading location/weather:', error)
      setLocationError('Unable to get your location')
      
      // Fallback to Bangalore weather
      try {
        const response = await fetch('/api/weather?location=Bangalore')
        const data = await response.json()
        
        if (data.success) {
          setWeather(data.data.current)
          setCurrentLocation(data.data.current.coordinates)
          setLastUpdated(new Date())
        }
      } catch (fallbackError) {
        console.error('Error loading fallback weather:', fallbackError)
        // Set default weather data
        setWeather({
          temperature: 28,
          description: 'Partly Cloudy',
          humidity: 65,
          windSpeed: 12,
          locationName: 'Bangalore'
        })
        setCurrentLocation({ lat: 12.9716, lng: 77.5946 })
      }
    } finally {
      setWeatherLoading(false)
    }
  }
  
  const loadRecommendedPackages = async () => {
    try {
      setPackagesLoading(true)
      // Add pagination and limit to improve performance with caching
      const cacheKey = 'dashboard-recommendations'
      const cachedData = localStorage.getItem(cacheKey)
      const cacheExpiry = localStorage.getItem(`${cacheKey}-expiry`)
      
      // Use cached data if available and not expired
      if (cachedData && cacheExpiry && Date.now() < parseInt(cacheExpiry)) {
        setRecommendedPackages(JSON.parse(cachedData))
        setPackagesLoading(false)
        return
      }
      
      const response = await fetch('/api/recommendations?limit=3&page=1')
      const data = await response.json()
      if (data.packages) {
        setRecommendedPackages(data.packages)
        // Cache for 15 minutes
        localStorage.setItem(cacheKey, JSON.stringify(data.packages))
        localStorage.setItem(`${cacheKey}-expiry`, (Date.now() + 15 * 60 * 1000).toString())
      }
    } catch (error) {
      console.error('Error loading recommendations:', error)
      // Fallback to empty array to prevent UI issues
      setRecommendedPackages([])
    } finally {
      setPackagesLoading(false)
    }
  }
  
  const loadAIRecommendations = async () => {
    try {
      // Use our AI insights API endpoint
      const response = await fetch('/api/ai/travel-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          preferences: 'Cultural heritage, nature, and local experiences',
          destination: 'South Karnataka',
          userHistory: trips
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setAiRecommendation(data.data.recommendation)
      } else {
        throw new Error(data.error || 'Failed to get AI recommendations')
      }
    } catch (error) {
      console.error('Error loading AI recommendations:', error)
      // Fallback recommendation
      setAiRecommendation(
        'Explore the rich cultural heritage of South Karnataka with visits to ancient temples, lush hill stations, and vibrant local markets. Best time to visit is during the cooler months from October to March.'
      )
    }
  }
  
  const setupRealtimeSubscription = () => {
    if (!user?.id) return
    
    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `user_id=eq.${user.id}`
        },
        (payload: any) => {
          console.log('Booking update:', payload)
          // Refresh bookings when changes occur
          if (payload.eventType === 'INSERT') {
            setRealtimeBookings(prev => [...prev, payload.new as any])
          } else if (payload.eventType === 'UPDATE') {
            setRealtimeBookings(prev => 
              prev.map(b => b.id === payload.new.id ? payload.new as any : b)
            )
          } else if (payload.eventType === 'DELETE') {
            setRealtimeBookings(prev => prev.filter(b => b.id !== payload.old.id))
          }
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }
  
  // Get trip destinations for map with real coordinates
  const [tripDestinations, setTripDestinations] = useState<any[]>([])
  const [wishlistDestinations, setWishlistDestinations] = useState<any[]>([])
  
  useEffect(() => {
    const loadTripCoordinates = async () => {
      const destinations = await Promise.all(
        upcomingTrips.slice(0, 3).map(async (trip) => {
          try {
            const response = await fetch(`/api/location/geocode?address=${encodeURIComponent(trip.destination)}`)
            const data = await response.json()
            
            if (data.success) {
              return {
                lat: data.data.result.lat,
                lng: data.data.result.lng,
                name: trip.destination
              }
            }
          } catch (error) {
            console.error(`Error geocoding ${trip.destination}:`, error)
          }
          
          // Fallback to approximate South Karnataka coordinates
          return {
            lat: 12.9716 + (Math.random() - 0.5) * 0.5,
            lng: 77.5946 + (Math.random() - 0.5) * 0.5,
            name: trip.destination
          }
        })
      )
      setTripDestinations(destinations)
    }
    
    if (upcomingTrips.length > 0) {
      loadTripCoordinates()
    }
    
    const loadWishlistCoordinates = async () => {
      const destinations = await Promise.all(
        wishlist.slice(0, 5).map(async (item) => {
          const locationName = item.packages?.destinations?.name || 
                              item.destinations?.name || 
                              item.packages?.name ||
                              'Unknown Location'
          
          try {
            const response = await fetch(`/api/location/geocode?address=${encodeURIComponent(locationName)}`)
            const data = await response.json()
            
            if (data.success) {
              return {
                lat: data.data.result.lat,
                lng: data.data.result.lng,
                name: locationName
              }
            }
          } catch (error) {
            console.error(`Error geocoding ${locationName}:`, error)
          }
          
          // Fallback to approximate South Karnataka coordinates
          return {
            lat: 12.9716 + (Math.random() - 0.5) * 2,
            lng: 77.5946 + (Math.random() - 0.5) * 2,
            name: locationName
          }
        })
      )
      setWishlistDestinations(destinations)
    }
    
    if (wishlist.length > 0) {
      loadWishlistCoordinates()
    }
  }, [upcomingTrips, wishlist])
  
  const handleAddToWishlist = async (packageId: string) => {
    try {
      await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package_id: packageId })
      })
      router.refresh()
    } catch (error) {
      console.error('Error adding to wishlist:', error)
    }
  }
  
  const handleBookNow = (packageId: string) => {
    router.push(`/packages/${packageId}`)
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Real-time Status Indicator */}
            {lastUpdated && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live • {lastUpdated.toLocaleTimeString()}</span>
              </div>
            )}
          </div>
          
          <div className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search bookings, destinations, or blogs" 
                className="pl-10 pr-16 bg-gray-50 border-gray-200"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    router.push(`/explore?q=${e.currentTarget.value}`)
                  }
                }}
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs bg-white border border-gray-200 rounded">
                ⌘K
              </kbd>
            </div>
          </div>
          
          <div className="flex items-center gap-3 ml-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative hover:bg-green-50"
              onClick={() => router.push('/notifications')}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </Button>
            
            <Button 
              variant="default"
              onClick={() => router.push(routes.myTrips)}
              className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Trip
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-8">
        {/* Welcome Banner */}
        {nextTrip && daysUntilNextTrip <= 7 && (
          <Card className="mb-6 p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {daysUntilNextTrip === 0 ? '🎉 Your trip starts today!' : `Your ${nextTrip.destination} trip is in ${daysUntilNextTrip} days!`}
                </h2>
                <p className="text-blue-100 mb-4">
                  {format(new Date(nextTrip.start_date), 'MMMM dd')} - {format(new Date(nextTrip.end_date), 'MMMM dd, yyyy')}
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="secondary"
                    onClick={() => router.push(`${routes.myTrips}?trip=${nextTrip.id}`)}
                    className="text-sm px-4 py-2"
                  >
                    View Details
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/20"
                    onClick={() => router.push(`${routes.myTrips}?trip=${nextTrip.id}&action=download`)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Vouchers
                  </Button>
                </div>
              </div>
              <div className="text-6xl">✈️</div>
            </div>
          </Card>
        )}
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* Trips Card */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push(routes.myTrips)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{upcomingTrips.length}</p>
                  <p className="text-sm text-gray-600">
                    {nextTrip ? `Next: ${nextTrip.destination} in ${daysUntilNextTrip} days ✈️` : `${upcomingTrips.length} upcoming adventures`}
                  </p>
                </div>
                <Plane className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          {/* Loyalty Points Card */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push('/dashboard/loyalty')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{points.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{`${tier} tier ⭐ • Earn 500 pts next booking`}</p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          {/* Spending Card */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push(routes.history)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">₹{totalSpent.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total adventures funded 💰 • Year 2025</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          {/* Weather Card */}
          <Card className="relative">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    {weatherLoading ? "..." : `${weather?.temperature || 28}°C`}
                  </p>
                  <p className="text-sm text-gray-600">
                    {weatherLoading ? "Loading sky..." : `${weather?.description || 'Partly Cloudy'} • 💧${weather?.humidity || 0}% • 💨${Math.round(weather?.windSpeed || 0)}km/h`}
                  </p>
                </div>
                <CloudRain className="w-8 h-8 text-blue-500" />
              </div>
              
              {weather && !weatherLoading && (
                <button 
                  onClick={loadLocationAndWeather}
                  className="absolute bottom-3 right-3 text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1 bg-gray-100 rounded-full p-2"
                  disabled={weatherLoading}
                >
                  <span className={weatherLoading ? 'animate-spin' : ''}>🔄</span>
                </button>
              )}
              
              {locationError && (
                <div className="absolute bottom-2 left-2 right-2 text-xs text-red-600 bg-red-50 rounded p-1">
                  {locationError}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Trip Details */}
          <Card className="p-6 bg-white border-gray-200">
            {nextTrip ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">Upcoming: {nextTrip.destination}</h3>
                    <p className="text-sm text-gray-500">
                      {format(new Date(nextTrip.start_date), "MMM dd")} - {format(new Date(nextTrip.end_date), "MMM dd, yyyy")} • {nextTrip.travelers_count} Travelers
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {realtimeBookings.filter(b => b.trips?.id === nextTrip.id).slice(0, 3).map((booking) => {
                    const icons = {
                      flight: Plane,
                      hotel: Building2,
                      activity: Mountain,
                      transport: Plane
                    }
                    const Icon = icons[booking.booking_type as keyof typeof icons] || Plane
                    
                    return (
                      <div 
                        key={booking.id}
                        className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-green-50 transition-colors border border-transparent hover:border-green-200"
                        onClick={() => router.push(`${routes.bookings}?id=${booking.id}`)}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          booking.status === 'confirmed' ? 'bg-black' : 'bg-gray-200'
                        }`}>
                          <Icon className={`w-5 h-5 ${booking.status === 'confirmed' ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{booking.title}</p>
                            <span className={`text-xs px-2 py-1 rounded-full cursor-pointer hover:opacity-80 ${
                              booking.status === 'confirmed' 
                                ? 'bg-green-100 text-green-700' 
                                : booking.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{booking.description}</p>
                        </div>
                      </div>
                    )
                  })}
                  
                  {realtimeBookings.filter(b => b.trips?.id === nextTrip.id).length === 0 && (
                    <p className="text-center text-gray-500 py-8">No bookings yet for this trip</p>
                  )}
                </div>

                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => router.push(`${routes.myTrips}?trip=${nextTrip.id}`)}
                >
                  Manage Booking
                </Button>
              </>
            ) : (
              <div className="text-center py-12">
                <Plane className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No upcoming trips</p>
                <Button asChild>
                  <Link href="/explore">Plan Your Next Adventure</Link>
                </Button>
              </div>
            )}
          </Card>

          {/* Interactive Map */}
          <Card className="p-6 bg-white border-gray-200 relative overflow-hidden">
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-4">
              <TabsList className="bg-gray-100">
                <TabsTrigger value="my-trip">My Trip</TabsTrigger>
                <TabsTrigger value="saved">Saved ({wishlist.length})</TabsTrigger>
                <TabsTrigger value="explore">Explore</TabsTrigger>
              </TabsList>
            </Tabs>

            {selectedTab === "my-trip" && tripDestinations.length > 0 ? (
              <InteractiveMap
                center={currentLocation || { lat: 12.9716, lng: 77.5946 }}
                destinations={tripDestinations}
                showNearby={false}
                height="300px"
              />
            ) : selectedTab === "saved" && wishlist.length > 0 ? (
              <InteractiveMap
                center={currentLocation || { lat: 12.9716, lng: 77.5946 }}
                destinations={wishlistDestinations}
                showNearby={false}
                height="300px"
              />
            ) : (
              <InteractiveMap
                center={currentLocation || { lat: 12.9716, lng: 77.5946 }}
                destinations={[]}
                showNearby={true}
                height="300px"
              />
            )}
            
            {/* Quick Actions Overlay */}
            <div className="absolute bottom-8 left-8 right-8 flex gap-2">
              <Button 
                size="sm" 
                variant="secondary" 
                className="bg-white shadow-lg"
                onClick={() => router.push(routes.explore)}
              >
                <Navigation className="w-4 h-4 mr-2" />
                Explore Nearby
              </Button>
              {nextTrip && (
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="bg-white shadow-lg"
                  onClick={() => router.push(`${routes.myTrips}?trip=${nextTrip.id}`)}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  View Route
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Real-time Data Integration Panel */}
        <Card className="mb-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h3 className="font-semibold text-green-900">🌐 Live Data Integration</h3>
                <p className="text-sm text-green-700">Real-time weather, location, and AI insights</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-green-300 text-green-700 hover:bg-green-100"
                onClick={loadLocationAndWeather}
                disabled={weatherLoading}
              >
                {weatherLoading ? 'Updating...' : 'Refresh All'}
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Weather Status */}
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <CloudRain className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Weather API</p>
                <p className="text-xs text-gray-500">
                  {weather ? `${weather.temperature}°C in ${weather.locationName}` : 'Loading...'}
                </p>
              </div>
            </div>
            
            {/* Location Status */}
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Location API</p>
                <p className="text-xs text-gray-500">
                  {currentLocation ? 'GPS Active' : 'Getting location...'}
                </p>
              </div>
            </div>
            
            {/* AI Status */}
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 font-bold text-xs">AI</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">AI Insights</p>
                <p className="text-xs text-gray-500">
                  {aiRecommendation ? 'Ready' : 'Loading insights...'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* AI Travel Insights */}
        {aiRecommendation && (
          <Card className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 font-bold">AI</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-purple-900 mb-2">✨ AI Travel Insights</h3>
                <p className="text-purple-800 text-sm leading-relaxed">{aiRecommendation}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 border-purple-300 text-purple-700 hover:bg-purple-100"
                  onClick={loadAIRecommendations}
                >
                  Get New Insights
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Personalized Recommendations */}
        <div className="mt-8">
          <PersonalizedRecommendations 
            limit={6} 
            showHeader={true}
            showConfidenceLevels={true}
          />
        </div>
      </div>
    </div>
  )
}

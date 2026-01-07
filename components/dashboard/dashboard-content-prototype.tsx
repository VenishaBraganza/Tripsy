'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, Bell, Plus, Star, CloudRain, Plane, Building2, 
  Mountain, MapPin, TrendingUp, Navigation, Download, Heart, 
  Clock, ArrowRight, Calendar, Users
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { format, differenceInDays } from "date-fns"
import { 
  dummyTrips, 
  dummyPackages, 
  dummyUserProfile, 
  dummyNotifications, 
  dummyBookings,
  generateDummyRecommendations 
} from "@/lib/data/dummy-data"

export function DashboardContentPrototype() {
  const upcomingTrips = dummyTrips.filter(trip => trip.status === 'upcoming')
  const nextTrip = upcomingTrips[0]
  const daysUntilNextTrip = nextTrip ? differenceInDays(new Date(nextTrip.startDate), new Date()) : 0
  const recentNotifications = dummyNotifications.slice(0, 3)
  const personalizedRecommendations = generateDummyRecommendations(dummyUserProfile.preferences)
  const recentBookings = dummyBookings.filter(b => b.tripId === nextTrip?.id).slice(0, 3)

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live • {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
          
          <div className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search destinations, packages, or experiences" 
                className="pl-10 pr-16 bg-gray-50 border-gray-200"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs bg-white border border-gray-200 rounded">
                ⌘K
              </kbd>
            </div>
          </div>
          
          <div className="flex items-center gap-3 ml-4">
            <Button variant="ghost" size="icon" className="relative hover:bg-green-50">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </Button>
            
            <Button className="bg-green-600 hover:bg-green-700 text-white shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              New Trip
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white p-6 rounded-lg mb-6">
          <h1 className="text-2xl font-bold mb-2">Welcome back, {dummyUserProfile.preferredName}!</h1>
          <p className="text-teal-100 mb-4">Ready for your next adventure in South Karnataka?</p>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              <span>{dummyUserProfile.loyaltyPoints.tier} Member</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>{dummyUserProfile.loyaltyPoints.points} Points</span>
            </div>
          </div>
        </div>

        {/* Trip Countdown Banner */}
        {nextTrip && (
          <Card className="mb-6 p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Your {nextTrip.destination} trip is in {Math.abs(daysUntilNextTrip)} days! ✈️
                </h2>
                <p className="text-blue-100 mb-4">
                  {format(new Date(nextTrip.startDate), 'MMMM dd')} - {format(new Date(nextTrip.endDate), 'MMMM dd, yyyy')}
                </p>
                <div className="flex gap-2">
                  <Button variant="secondary" className="text-sm px-4 py-2">
                    View Details
                  </Button>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                    <Download className="w-4 h-4 mr-2" />
                    Download Vouchers
                  </Button>
                </div>
              </div>
              <div className="text-6xl">🎒</div>
            </div>
          </Card>
        )}
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{upcomingTrips.length}</p>
                  <p className="text-sm text-gray-600">
                    {nextTrip ? `Next: ${nextTrip.destination}` : 'Upcoming trips'}
                  </p>
                </div>
                <Plane className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{dummyUserProfile.loyaltyPoints.points.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{dummyUserProfile.loyaltyPoints.tier} tier ⭐</p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">₹{dummyUserProfile.stats.totalSpent.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total adventures 💰</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">28°C</p>
                  <p className="text-sm text-gray-600">Partly Cloudy ☁️ • 65% 💧</p>
                </div>
                <CloudRain className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Upcoming Trip Details */}
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center justify-between">
                <span>Upcoming: {nextTrip?.destination}</span>
                <Badge variant="secondary">{nextTrip?.travelersCount} travelers</Badge>
              </CardTitle>
              <CardDescription>
                {nextTrip && format(new Date(nextTrip.startDate), "MMM dd")} - {nextTrip && format(new Date(nextTrip.endDate), "MMM dd, yyyy")}
              </CardDescription>
            </CardHeader>

            <div className="space-y-4">
              {recentBookings.map((booking) => {
                const icons = {
                  package: Mountain,
                  flight: Plane,
                  hotel: Building2,
                  activity: Mountain,
                  transport: Plane
                }
                const Icon = icons[booking.bookingType as keyof typeof icons] || Mountain
                
                return (
                  <div 
                    key={booking.id}
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-green-50 transition-colors border border-transparent hover:border-green-200 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{booking.title}</p>
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                          {booking.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">{booking.description}</p>
                      <p className="text-sm font-medium text-green-600">₹{booking.cost.toLocaleString()}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <Button variant="outline" className="w-full mt-4">
              Manage Booking
            </Button>
          </Card>

          {/* Notifications & Updates */}
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center justify-between">
                <span>Recent Updates</span>
                <Button variant="ghost" size="sm">
                  <Bell className="w-4 h-4 mr-2" />
                  View All
                </Button>
              </CardTitle>
            </CardHeader>

            <div className="space-y-4">
              {recentNotifications.map((notification) => (
                <div 
                  key={notification.id}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    {notification.type === 'booking_confirmation' && <Plane className="w-4 h-4 text-blue-600" />}
                    {notification.type === 'price_drop' && <TrendingUp className="w-4 h-4 text-green-600" />}
                    {notification.type === 'trip_reminder' && <Clock className="w-4 h-4 text-orange-600" />}
                    {notification.type === 'review_request' && <Star className="w-4 h-4 text-yellow-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {format(new Date(notification.createdAt), 'MMM dd, h:mm a')}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* AI Travel Insights */}
        <Card className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <span className="text-purple-600 font-bold">AI</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-purple-900 mb-2">✨ AI Travel Insights</h3>
              <p className="text-purple-800 text-sm leading-relaxed">
                Based on your preferences for nature and culture, I recommend visiting Coorg during the coffee harvest season (December-February). 
                The weather is perfect, and you'll experience the authentic coffee-making process. Consider staying at a heritage coffee estate for the full experience!
              </p>
              <Button variant="outline" size="sm" className="mt-3 border-purple-300 text-purple-700 hover:bg-purple-100">
                Get New Insights
              </Button>
            </div>
          </div>
        </Card>

        {/* Personalized Recommendations */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold">Recommended for You</h3>
              <p className="text-sm text-gray-500">Based on your interests: {dummyUserProfile.preferences.interests.join(', ')}</p>
            </div>
            <Button variant="outline" size="sm">
              <ArrowRight className="w-4 h-4 mr-2" />
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {personalizedRecommendations.slice(0, 3).map((pkg) => (
              <Card key={pkg.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="relative h-48">
                  <Image
                    src={pkg.imageUrl}
                    alt={pkg.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-black text-white">
                      {pkg.durationText}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Button variant="ghost" size="icon" className="bg-white/90 hover:bg-white">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                  {pkg.discountedPrice && (
                    <div className="absolute bottom-3 left-3">
                      <Badge variant="destructive">
                        Save ₹{(pkg.basePrice - pkg.discountedPrice).toLocaleString()}
                      </Badge>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold group-hover:text-blue-600 transition-colors">
                        {pkg.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-600">{pkg.averageRating}</span>
                        </div>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-600">{pkg.totalReviews} reviews</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {pkg.discountedPrice && (
                        <p className="text-xs text-gray-400 line-through">
                          ₹{pkg.basePrice.toLocaleString()}
                        </p>
                      )}
                      <p className="font-bold text-green-600">
                        ₹{(pkg.discountedPrice || pkg.basePrice).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {pkg.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-green-600 hover:bg-green-700">
                      Book Now
                    </Button>
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Search className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Explore</p>
                <p className="text-xs text-gray-500">Find new destinations</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Heart className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Wishlist</p>
                <p className="text-xs text-gray-500">{dummyUserProfile.stats.wishlistItems} saved items</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Mountain className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Hidden Gems</p>
                <p className="text-xs text-gray-500">Discover secret spots</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Star className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium">Reviews</p>
                <p className="text-xs text-gray-500">Share your experience</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
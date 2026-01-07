"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Search, Bell, Plus, Train, CloudRain, MapPin, 
  CheckCircle2, Clock, Plane, Hotel, Calendar,
  Download, Share2, Filter, ChevronDown, TrendingUp
} from "lucide-react"

export function MyTripsContent() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming")
  const [showFilters, setShowFilters] = useState(false)

  const updates = [
    {
      id: 1,
      icon: Train,
      title: "Your train to Munnar leaves in 4 hours",
      description: "PNR: 8234587896 • Platform 3 • On time • Web check-in completed",
      time: "2 min ago",
      priority: "high",
      actions: [
        { label: "View Ticket", variant: "outline" as const },
        { label: "Track Live", variant: "default" as const }
      ]
    },
    {
      id: 2,
      icon: CloudRain,
      title: "Weather alert for Cherrapunji tomorrow",
      description: "Heavy rainfall expected. We found an indoor tribal museum 5 km away as backup activity",
      time: "1 hour ago",
      priority: "medium",
      actions: [
        { label: "View Museum", variant: "outline" as const },
        { label: "Dismiss", variant: "ghost" as const }
      ]
    },
    {
      id: 3,
      icon: MapPin,
      title: "Hidden gem alert near Coorg!",
      description: "Irukanam Mutte trek is 8 km from your homestay – underrated sunrise viewpoint. Want to add to itinerary?",
      time: "3 hours ago",
      priority: "low",
      actions: [
        { label: "Add to Trip", variant: "default" as const },
        { label: "View on Map", variant: "outline" as const }
      ]
    }
  ]

  const trips = [
    {
      id: 1,
      name: "Munnar Escape",
      destination: "Munnar Tea Gardens & Hills",
      dates: "Jan 15 - Jan 19, 2025",
      nights: 4,
      tripId: "#TRV-2847",
      status: "In Progress",
      progress: 50,
      currentDay: 2,
      totalDays: 4,
      image: "/placeholder-trip.jpg",
      confirmed: ["Flight Confirmed", "Hotel Voucher", "Cab Booked"],
      liveStatus: [
        {
          title: "Tea Valley Resort",
          subtitle: "Check-in: 2:00 PM today • Digital key available",
          icon: Hotel,
          action: "View"
        },
        {
          title: "Airport Transfer",
          subtitle: "Driver: Ravi Kumar • +91 98765 43210",
          icon: Train,
          action: "Track"
        }
      ]
    }
  ]

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Trips</h1>
            <p className="text-sm text-gray-500 mt-1">Manage and track all your adventures</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
            
            <Button className="bg-black hover:bg-gray-800 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Trip
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-white border-gray-200 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Active Trips</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                <Plane className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white border-gray-200 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Completed</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white border-gray-200 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Distance</p>
                <p className="text-2xl font-bold text-gray-900">8.4K</p>
                <p className="text-xs text-gray-400">km traveled</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white border-gray-200 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Next Trip</p>
                <p className="text-2xl font-bold text-gray-900">4</p>
                <p className="text-xs text-gray-400">days away</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Trip Health Score */}
        <Card className="p-8 mb-6 bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-8">
            {/* Score Circle */}
            <div className="relative">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#10b981"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(92 / 100) * 351.86} 351.86`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-gray-900">92</span>
                <span className="text-xs text-gray-500 font-medium">Excellent</span>
              </div>
            </div>

            {/* Message */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your trips are looking great!</h2>
              <p className="text-gray-600 mb-4">
                All bookings confirmed. One minor update: Your Munnar hotel upgraded you to a valley-view room at no extra cost
              </p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>3 Trips Active</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>All Confirmed</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* AI Travel Assistant Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">AI Travel Assistant</h3>
            <Button variant="link" className="text-sm">View All Updates</Button>
          </div>

          <div className="space-y-4">
            {updates.map((update, index) => {
              const Icon = update.icon
              return (
                <Card 
                  key={update.id} 
                  className="p-6 bg-white border-gray-200 hover:shadow-md transition-all duration-300 hover:scale-[1.01]"
                  style={{
                    animation: `slideIn 0.5s ease-out ${index * 0.1}s both`
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{update.title}</h4>
                          {update.priority === "high" && (
                            <Badge variant="destructive" className="text-xs">Urgent</Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-4">{update.time}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{update.description}</p>
                      <div className="flex gap-2">
                        {update.actions.map((action, i) => (
                          <Button 
                            key={i} 
                            variant={action.variant}
                            size="sm"
                            className={action.variant === "default" ? "bg-black hover:bg-gray-800 text-white" : ""}
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Upcoming Trip Hero Card */}
        <Card className="overflow-hidden border-gray-200 hover:shadow-xl transition-all duration-300 mb-8">
          <div className="relative h-64 bg-gradient-to-br from-slate-800 to-slate-900">
            <div className="absolute inset-0 bg-[url('/placeholder-landscape.jpg')] bg-cover bg-center opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
            
            <div className="relative h-full p-8 flex flex-col justify-between">
              <div>
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm mb-4">
                  <Clock className="w-3 h-3 mr-1" />
                  UPCOMING TRIP
                </Badge>
                <h2 className="text-4xl font-bold text-white mb-2">Spiti Valley Adventure</h2>
                <p className="text-white/80 text-lg">14 days 3 hours until departure</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-3">
                  <Button variant="secondary" className="bg-white hover:bg-gray-100 text-gray-900">
                    View Itinerary
                  </Button>
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    Hidden Route Unlocked
                  </Button>
                </div>
                <div className="text-right">
                  <p className="text-white/60 text-sm mb-1">Chandratal Lake Night View</p>
                  <div className="flex items-center gap-2 text-white">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">Special Location</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Your Trips Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Your Trips</h3>
            <div className="flex gap-2">
              <Button 
                variant={activeTab === "upcoming" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("upcoming")}
                className={activeTab === "upcoming" ? "bg-black hover:bg-gray-800" : ""}
              >
                Upcoming (3)
              </Button>
              <Button 
                variant={activeTab === "past" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("past")}
                className={activeTab === "past" ? "bg-black hover:bg-gray-800" : ""}
              >
                Past (12)
              </Button>
            </div>
          </div>

          {/* Trip Cards */}
          {trips.map((trip) => (
            <Card key={trip.id} className="overflow-hidden border-gray-200 hover:shadow-lg transition-all duration-300 mb-4">
              <div className="relative h-48 bg-gradient-to-br from-slate-700 to-slate-800">
                <div className="absolute top-4 left-4">
                  <Badge className="bg-blue-500 text-white">{trip.status}</Badge>
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button size="icon" variant="secondary" className="bg-white/90 hover:bg-white">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </Button>
                  <Button size="icon" variant="secondary" className="bg-white/90 hover:bg-white">
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="secondary" className="bg-white/90 hover:bg-white">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white/60 text-lg">{trip.destination}</p>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-1">{trip.name}</h4>
                    <p className="text-sm text-gray-500">{trip.dates} • {trip.nights} nights</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm font-medium text-gray-700">Trip ID</span>
                      <span className="text-sm text-gray-500">{trip.tripId}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">Trip Progress</p>
                    <p className="text-lg font-bold text-gray-900">Day {trip.currentDay} of {trip.totalDays}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000"
                      style={{ width: `${trip.progress}%` }}
                    />
                  </div>
                </div>

                {/* Checkmarks */}
                <div className="flex gap-6 mb-4">
                  {trip.confirmed.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {/* Live Status Tracker */}
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-sm font-semibold text-gray-900">Live Status Tracker</h5>
                    <span className="text-xs text-gray-500">Real-time updates</span>
                  </div>

                  <div className="space-y-3">
                    {trip.liveStatus.map((status, i) => {
                      const Icon = status.icon
                      return (
                        <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <Icon className="w-5 h-5 text-gray-600 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium text-gray-900">{status.title}</p>
                              <Button variant="link" size="sm" className="h-auto p-0 text-xs">{status.action}</Button>
                            </div>
                            <p className="text-xs text-gray-500">{status.subtitle}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  <Button variant="outline" className="flex-1">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    View Full Itinerary
                  </Button>
                  <Button className="flex-1 bg-black hover:bg-gray-800 text-white">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share with Family
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

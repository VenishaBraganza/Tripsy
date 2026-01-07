"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, Bell, Plus, Filter, Download, Calendar, 
  Plane, Hotel, Car, Utensils, Ticket, MapPin,
  CheckCircle2, Clock, AlertCircle, QrCode, Mail,
  Phone, ChevronDown, ExternalLink, Edit, Trash2
} from "lucide-react"

export function BookingsContent() {
  const [activeTab, setActiveTab] = useState<"all" | "flights" | "hotels" | "activities">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "confirmed" | "pending" | "cancelled">("all")

  const bookings = [
    {
      id: 1,
      type: "flight",
      title: "Mumbai to Bali",
      airline: "Air India",
      flightNumber: "AI 345",
      date: "Dec 5, 2025",
      time: "09:30 AM",
      status: "confirmed",
      confirmationCode: "AI345MUM",
      price: "₹18,500",
      details: {
        from: "Mumbai (BOM)",
        to: "Denpasar (DPS)",
        duration: "6h 30m",
        class: "Economy",
        seat: "12A"
      },
      actions: ["Web Check-in", "View Ticket", "Add to Calendar"]
    },
    {
      id: 2,
      type: "hotel",
      title: "Ubud Valley Resort",
      provider: "Booking.com",
      date: "Dec 5-12, 2025",
      time: "Check-in: 2:00 PM",
      status: "confirmed",
      confirmationCode: "BK789456",
      price: "₹45,000",
      details: {
        room: "Deluxe Valley View",
        guests: "2 Adults",
        nights: "7 nights",
        amenities: "Breakfast, Pool, Spa"
      },
      actions: ["View Voucher", "Contact Hotel", "Modify Booking"]
    },
    {
      id: 3,
      type: "activity",
      title: "Monkey Forest Tour",
      provider: "GetYourGuide",
      date: "Dec 7, 2025",
      time: "10:00 AM",
      status: "pending",
      confirmationCode: "GYG123789",
      price: "₹2,500",
      details: {
        duration: "3 hours",
        pickup: "Hotel Lobby",
        guide: "English Speaking",
        groupSize: "Max 10 people"
      },
      actions: ["Confirm Booking", "View Details", "Cancel"]
    },
    {
      id: 4,
      type: "transport",
      title: "Airport Transfer",
      provider: "Bali Transfers",
      date: "Dec 5, 2025",
      time: "11:00 AM",
      status: "confirmed",
      confirmationCode: "BT567890",
      price: "₹1,200",
      details: {
        vehicle: "Private Car",
        driver: "Made Suarta",
        phone: "+62 812 3456 7890",
        pickup: "DPS Airport"
      },
      actions: ["Track Driver", "Contact Driver", "View Route"]
    }
  ]

  const getIcon = (type: string) => {
    switch (type) {
      case "flight": return Plane
      case "hotel": return Hotel
      case "activity": return Ticket
      case "transport": return Car
      default: return MapPin
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-700 border-green-200"
      case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "cancelled": return "bg-red-100 text-red-700 border-red-200"
      default: return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const filteredBookings = bookings.filter(b => {
    if (activeTab !== "all" && b.type !== activeTab) return false
    if (statusFilter !== "all" && b.status !== statusFilter) return false
    return true
  })

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-sm text-gray-500 mt-1">Manage all your reservations in one place</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
            
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
            </Button>
            
            <Button className="bg-black hover:bg-gray-800 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Booking
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-white border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
              </div>
              <Ticket className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-4 bg-white border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">
                  {bookings.filter(b => b.status === "confirmed").length}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-4 bg-white border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {bookings.filter(b => b.status === "pending").length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </Card>

          <Card className="p-4 bg-white border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">₹67.2K</p>
              </div>
              <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <Button 
              variant={activeTab === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("all")}
              className={activeTab === "all" ? "bg-black hover:bg-gray-800" : ""}
            >
              All ({bookings.length})
            </Button>
            <Button 
              variant={activeTab === "flights" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("flights")}
              className={activeTab === "flights" ? "bg-black hover:bg-gray-800" : ""}
            >
              <Plane className="w-4 h-4 mr-1" />
              Flights
            </Button>
            <Button 
              variant={activeTab === "hotels" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("hotels")}
              className={activeTab === "hotels" ? "bg-black hover:bg-gray-800" : ""}
            >
              <Hotel className="w-4 h-4 mr-1" />
              Hotels
            </Button>
            <Button 
              variant={activeTab === "activities" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("activities")}
              className={activeTab === "activities" ? "bg-black hover:bg-gray-800" : ""}
            >
              <Ticket className="w-4 h-4 mr-1" />
              Activities
            </Button>
          </div>

          <div className="flex gap-2">
            <select 
              className="text-sm border border-gray-200 rounded-md px-3 py-2 bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.map((booking, index) => {
            const Icon = getIcon(booking.type)
            return (
              <Card 
                key={booking.id}
                className="overflow-hidden border-gray-200 hover:shadow-lg transition-all duration-300"
                style={{
                  animation: `slideUp 0.4s ease-out ${index * 0.05}s both`
                }}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-md">
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-bold text-gray-900">{booking.title}</h3>
                            <Badge className={`${getStatusColor(booking.status)} border`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{booking.provider}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">{booking.price}</p>
                          <p className="text-xs text-gray-500">total cost</p>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                        {Object.entries(booking.details).map(([key, value]) => (
                          <div key={key}>
                            <p className="text-xs text-gray-500 uppercase mb-1">{key}</p>
                            <p className="text-sm font-medium text-gray-900">{value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Booking Info */}
                      <div className="flex items-center gap-6 mb-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{booking.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{booking.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <QrCode className="w-4 h-4" />
                          <span className="font-mono">{booking.confirmationCode}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        {booking.actions.map((action, i) => (
                          <Button 
                            key={i}
                            variant={i === 0 ? "default" : "outline"}
                            size="sm"
                            className={i === 0 ? "bg-black hover:bg-gray-800 text-white" : ""}
                          >
                            {action}
                          </Button>
                        ))}
                        <Button variant="ghost" size="sm">
                          <Mail className="w-4 h-4 mr-2" />
                          Email
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredBookings.length === 0 && (
          <Card className="p-12 text-center border-gray-200">
            <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your filters or create a new booking</p>
            <Button className="bg-black hover:bg-gray-800 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Booking
            </Button>
          </Card>
        )}
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
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

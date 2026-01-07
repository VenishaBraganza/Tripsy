"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { 
  Search, Bell, Plus, CheckCircle, Phone, MessageCircle, 
  AlertCircle, Clock, CreditCard, FileText, Hotel, Car,
  Mountain, Upload, Video, Send, Sparkles, Coffee
} from "lucide-react"

export function SupportContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showChat, setShowChat] = useState(false)

  const faqSuggestions = [
    "How to add infant to booking",
    "Change hotel in Spiti package",
    "Refund for train cancelled",
    "Download travel voucher",
    "Modify travel dates",
  ]

  const issueCategories = [
    {
      icon: FileText,
      title: "Booking Changes",
      description: "Modify dates, travelers, or destinations",
      avgTime: "Usually solved in <8 mins",
      color: "blue",
    },
    {
      icon: CreditCard,
      title: "Payment & Refund",
      description: "Payment issues, refund status, invoices",
      avgTime: "Usually solved in <12 mins",
      color: "green",
    },
    {
      icon: FileText,
      title: "Voucher / Tickets",
      description: "Download, resend, or update vouchers",
      avgTime: "Usually solved in <5 mins",
      color: "purple",
    },
    {
      icon: Hotel,
      title: "Hotel Issues",
      description: "Room changes, check-in problems",
      avgTime: "Usually solved in <15 mins",
      color: "orange",
    },
    {
      icon: Car,
      title: "Cab / Transfer",
      description: "Driver details, pickup changes",
      avgTime: "Usually solved in <10 mins",
      color: "teal",
    },
    {
      icon: Mountain,
      title: "Hidden Gem Access",
      description: "Offbeat locations, local guides",
      avgTime: "Usually solved in <20 mins",
      color: "indigo",
    },
  ]

  const ticketHistory = [
    {
      id: "T-1234",
      title: "Cab pickup time change",
      status: "resolved",
      date: "2 days ago",
      agent: "Rahul Kumar",
      resolution: "Cab rescheduled to 6:30 AM. Driver will call 30 mins before.",
    },
    {
      id: "T-1189",
      title: "Hotel room upgrade request",
      status: "waiting",
      date: "5 hours ago",
      agent: "Priya Sharma",
      lastMessage: "Checking with hotel partner. Will update in 2 hours.",
    },
  ]

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search for help..." 
                className="pl-10 pr-16 bg-gray-50 border-gray-200"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs bg-white border border-gray-200 rounded">
                ⌘K
              </kbd>
            </div>
          </div>
          
          <div className="flex items-center gap-3 ml-4">
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
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Smart Issue Detector - Hero Banner */}
          <Card className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">Your Goa trip (14 Dec) – Everything is confirmed ✅</h2>
                <p className="text-green-50 mb-4">
                  Flight, hotel, and cab bookings are all set. Your vouchers are ready to download.
                </p>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" className="bg-white text-green-700 hover:bg-green-50">
                    View Trip Details
                  </Button>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                    Download All Vouchers
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Live Status Bar */}
          <Card className="p-4 border-green-200 bg-green-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping" />
                </div>
                <div>
                  <p className="font-semibold text-green-900">Live agents online · Average response: 42 seconds</p>
                  <p className="text-sm text-green-700">After 11 PM? We'll reply first thing at 8 AM sharp</p>
                </div>
              </div>
              <Badge className="bg-green-600 text-white">We're Here 18 hrs/day</Badge>
            </div>
          </Card>

          {/* Emergency Shortcuts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-auto py-4 bg-blue-600 hover:bg-blue-700 text-white flex-col gap-2">
              <Phone className="w-6 h-6" />
              <span className="font-semibold">Call Us Now</span>
              <span className="text-xs opacity-90">+91-1800-XXX-XXXX</span>
            </Button>
            <Button className="h-auto py-4 bg-green-600 hover:bg-green-700 text-white flex-col gap-2">
              <MessageCircle className="w-6 h-6" />
              <span className="font-semibold">WhatsApp Instant</span>
              <span className="text-xs opacity-90">Chat with us directly</span>
            </Button>
            <Button className="h-auto py-4 bg-red-600 hover:bg-red-700 text-white flex-col gap-2">
              <AlertCircle className="w-6 h-6" />
              <span className="font-semibold">SOS Emergency</span>
              <span className="text-xs opacity-90">Hospital / Police nearby</span>
            </Button>
          </div>

          {/* Recent Trip Support Widget */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Your Upcoming Trip</h3>
                <p className="text-sm text-gray-600">Goa Beach Escape • 14-18 Dec • 2 Travelers</p>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">In 8 days</Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button variant="outline" size="sm" className="bg-white">
                Reschedule
              </Button>
              <Button variant="outline" size="sm" className="bg-white">
                Add Traveller
              </Button>
              <Button variant="outline" size="sm" className="bg-white">
                Download Voucher
              </Button>
              <Button variant="outline" size="sm" className="bg-white">
                Change Hotel
              </Button>
            </div>
          </Card>

          {/* Smart FAQ Search */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">How can we help you?</h3>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 mb-2">Popular questions:</p>
              {faqSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700"
                  onClick={() => setSearchQuery(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </Card>

          {/* Issue Categories */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Browse by category</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {issueCategories.map((category) => {
                const Icon = category.icon
                return (
                  <Card
                    key={category.title}
                    className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl bg-${category.color}-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className={`w-6 h-6 text-${category.color}-600`} />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">{category.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {category.avgTime}
                    </Badge>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Ticket History */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Your Support Tickets</h3>
              <Button variant="outline" size="sm">View All</Button>
            </div>
            <div className="space-y-4">
              {ticketHistory.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`p-4 rounded-lg border-2 ${
                    ticket.status === "resolved"
                      ? "bg-green-50 border-green-200"
                      : "bg-orange-50 border-orange-200"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          ticket.status === "resolved"
                            ? "bg-green-600 text-white"
                            : "bg-orange-500 text-white"
                        }
                      >
                        {ticket.status === "resolved" ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Resolved
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 mr-1" />
                            In Progress
                          </>
                        )}
                      </Badge>
                      <span className="text-sm text-gray-600">{ticket.id}</span>
                    </div>
                    <span className="text-xs text-gray-500">{ticket.date}</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{ticket.title}</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    {ticket.status === "resolved" ? ticket.resolution : ticket.lastMessage}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-300" />
                      <span className="text-sm text-gray-600">{ticket.agent}</span>
                    </div>
                    {ticket.status === "resolved" ? (
                      <Button variant="ghost" size="sm" className="text-gray-600">
                        Re-open
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" className="text-blue-600">
                        View Chat
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Upload Evidence */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Need to share documents?</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="font-medium text-gray-900 mb-1">Drop screenshots, tickets, or photos here</p>
              <p className="text-sm text-gray-600">or click to browse files</p>
            </div>
          </Card>

          {/* Video Call Booking */}
          <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Video className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Need personalized help?</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Book a 10-minute video call with our trip expert for complex issues or hidden-gem homestays
                </p>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Video className="w-4 h-4 mr-2" />
                  Schedule Video Call
                </Button>
              </div>
            </div>
          </Card>

          {/* Live Chat Button */}
          <div className="fixed bottom-8 right-8 z-50">
            <Button
              size="lg"
              className="h-16 px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-2xl rounded-full"
              onClick={() => setShowChat(!showChat)}
            >
              <MessageCircle className="w-6 h-6 mr-2" />
              <div className="text-left">
                <div className="font-semibold">Chat with us</div>
                <div className="text-xs opacity-90">We're online now</div>
              </div>
            </Button>
          </div>

          {/* Chat Widget */}
          {showChat && (
            <div className="fixed bottom-32 right-8 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Support Team</p>
                      <p className="text-xs opacity-90">Usually replies in 42 seconds</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    onClick={() => setShowChat(false)}
                  >
                    ✕
                  </Button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">👋</span>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-2xl rounded-tl-none p-3">
                      <p className="text-sm text-gray-900">
                        Hi! I'm Rahul from Tripsy. How can I help you today?
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Rahul Kumar • Travelled 47 times in India</p>
                  </div>
                </div>

                {/* Typing Indicator */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Coffee className="w-4 h-4 text-blue-600 animate-pulse" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-none p-3">
                    <p className="text-sm text-gray-600 italic">Rahul is typing...</p>
                  </div>
                </div>
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    className="min-h-[60px] resize-none"
                  />
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

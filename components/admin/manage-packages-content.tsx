"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, Bell, Plus, TrendingUp, TrendingDown, Package, 
  DollarSign, Eye, Calendar, Edit, Copy, Pause, Zap,
  Sparkles, AlertTriangle, CheckCircle, Clock, Filter,
  MoreVertical, Grid3x3, List, ArrowUpRight, ArrowDownRight
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ManagePackagesContent() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedPackages, setSelectedPackages] = useState<string[]>([])

  const performanceStats = [
    { label: "Active Packages", value: "142", change: "+12", trend: "up", icon: Package },
    { label: "Revenue This Month", value: "₹24.8L", change: "+18%", trend: "up", icon: DollarSign },
    { label: "Total Bookings", value: "1,247", change: "+23%", trend: "up", icon: CheckCircle },
    { label: "Avg Conversion", value: "8.4%", change: "-1.2%", trend: "down", icon: TrendingUp },
  ]

  const topPerformers = [
    { name: "Meghalaya Living Roots", bookings: 89, revenue: "₹16.8L", trend: "+45%" },
    { name: "Spiti Valley Winter", bookings: 67, revenue: "₹14.2L", trend: "+38%" },
    { name: "Gokarna Beach Escape", bookings: 54, revenue: "₹6.8L", trend: "+29%" },
  ]

  const underperformers = [
    { name: "Kerala Backwaters", bookings: 3, revenue: "₹45K", trend: "-67%" },
    { name: "Rajasthan Heritage", bookings: 5, revenue: "₹89K", trend: "-54%" },
  ]

  const packages = [
    {
      id: "1",
      name: "Meghalaya Living Root Bridges Trek",
      destination: "Meghalaya, Northeast",
      duration: "4N/5D",
      price: 18999,
      originalPrice: 24999,
      bookings: 89,
      views: 2340,
      status: "live",
      seats: 12,
      maxSeats: 15,
      image: "/placeholder.jpg",
      tags: ["Hidden Gem", "Trending", "Offbeat"],
      lastEdited: "2 hours ago",
      editedBy: "Rahul",
      hiddenGemScore: 92,
    },
    {
      id: "2",
      name: "Spiti Valley Winter Expedition",
      destination: "Himachal Pradesh",
      duration: "6N/7D",
      price: 32999,
      bookings: 67,
      views: 1890,
      status: "live",
      seats: 3,
      maxSeats: 12,
      image: "/placeholder.jpg",
      tags: ["Adventure", "Seasonal"],
      lastEdited: "1 day ago",
      editedBy: "Priya",
      hiddenGemScore: 78,
    },
    {
      id: "3",
      name: "Gokarna Beach & Temples",
      destination: "Karnataka",
      duration: "3N/4D",
      price: 12600,
      originalPrice: 15000,
      bookings: 54,
      views: 3200,
      status: "live",
      seats: 8,
      maxSeats: 20,
      image: "/placeholder.jpg",
      tags: ["Beach", "Budget Friendly"],
      lastEdited: "3 days ago",
      editedBy: "Amit",
      hiddenGemScore: 85,
    },
    {
      id: "4",
      name: "Ladakh Nubra Valley Safari",
      destination: "Ladakh",
      duration: "5N/6D",
      price: 45000,
      bookings: 12,
      views: 890,
      status: "seasonal",
      seats: 0,
      maxSeats: 10,
      image: "/placeholder.jpg",
      tags: ["Luxury", "Sold Out"],
      lastEdited: "1 week ago",
      editedBy: "Rahul",
      hiddenGemScore: 65,
    },
  ]

  const aiSuggestions = [
    {
      title: "Dawki Crystal Waters + Mawryngkhang Trek",
      duration: "4N/5D",
      price: 16999,
      reason: "42% higher demand, low competition",
      confidence: 94,
    },
    {
      title: "Ziro Valley Music & Culture Trail",
      duration: "3N/4D",
      price: 14500,
      reason: "Festival season approaching",
      confidence: 87,
    },
  ]

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search packages by name, destination, or tags..." 
                className="pl-10 pr-16 bg-gray-50 border-gray-200"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs bg-white border border-gray-200 rounded">
                ⌘K
              </kbd>
            </div>
          </div>
          
          <div className="flex items-center gap-3 ml-4">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
            
            <Button className="bg-black hover:bg-gray-800 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Package
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Page Title */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Packages</h1>
              <p className="text-gray-600 mt-1">Create, monitor, and optimize your travel packages</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {performanceStats.map((stat) => {
              const Icon = stat.icon
              return (
                <Card key={stat.label} className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <Badge
                      variant="secondary"
                      className={stat.trend === "up" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
                    >
                      {stat.trend === "up" ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                      {stat.change}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                </Card>
              )
            })}
          </div>

          {/* Top & Bottom Performers + AI Suggestions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Performers */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-lg">Top Performers</h3>
              </div>
              <div className="space-y-3">
                {topPerformers.map((pkg, idx) => (
                  <div key={idx} className="flex items-start justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">{pkg.name}</p>
                      <p className="text-xs text-gray-600 mt-1">{pkg.bookings} bookings • {pkg.revenue}</p>
                    </div>
                    <Badge className="bg-green-600 text-white">{pkg.trend}</Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Underperformers */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-lg">Needs Attention</h3>
              </div>
              <div className="space-y-3">
                {underperformers.map((pkg, idx) => (
                  <div key={idx} className="flex items-start justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">{pkg.name}</p>
                      <p className="text-xs text-gray-600 mt-1">{pkg.bookings} bookings • {pkg.revenue}</p>
                    </div>
                    <Badge className="bg-red-600 text-white">{pkg.trend}</Badge>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4">
                View All Insights
              </Button>
            </Card>

            {/* AI Suggestions */}
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-lg">AI Package Ideas</h3>
              </div>
              <div className="space-y-3 mb-4">
                {aiSuggestions.map((suggestion, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-lg border border-purple-200">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-sm text-gray-900">{suggestion.title}</p>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                        {suggestion.confidence}%
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{suggestion.duration} • ₹{suggestion.price.toLocaleString()}</p>
                    <p className="text-xs text-purple-700 italic">{suggestion.reason}</p>
                  </div>
                ))}
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate More Ideas
              </Button>
            </Card>
          </div>

          {/* Bulk Actions Bar */}
          {selectedPackages.length > 0 && (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-blue-900">
                  {selectedPackages.length} package{selectedPackages.length > 1 ? "s" : ""} selected
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">Mark Seasonal</Button>
                  <Button variant="outline" size="sm">Apply Discount</Button>
                  <Button variant="outline" size="sm">Feature on Homepage</Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    Pause All
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Packages Grid/List */}
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {packages.map((pkg) => (
              <Card key={pkg.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                {viewMode === "grid" ? (
                  <>
                    {/* Image */}
                    <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300">
                      <div className="absolute inset-0 bg-[url('/placeholder.jpg')] bg-cover bg-center" />
                      
                      {/* Status Badge */}
                      <div className="absolute top-3 left-3">
                        <Badge
                          className={
                            pkg.status === "live"
                              ? "bg-green-500 text-white"
                              : pkg.status === "seasonal"
                                ? "bg-orange-500 text-white"
                                : "bg-gray-500 text-white"
                          }
                        >
                          {pkg.status === "live" ? "Live" : pkg.status === "seasonal" ? "Seasonal" : "Draft"}
                        </Badge>
                      </div>

                      {/* Quick Actions */}
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="bg-white/90 hover:bg-white">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Package
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Zap className="w-4 h-4 mr-2" />
                              Boost Package
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Pause className="w-4 h-4 mr-2" />
                              Pause
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Hidden Gem Score */}
                      <div className="absolute bottom-3 right-3">
                        <Badge className="bg-purple-500 text-white">
                          💎 {pkg.hiddenGemScore}
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{pkg.name}</h3>
                          <p className="text-sm text-gray-600">{pkg.destination}</p>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {pkg.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 mb-3 p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-xs text-gray-500">Bookings</p>
                          <p className="text-sm font-bold text-gray-900">{pkg.bookings}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Views</p>
                          <p className="text-sm font-bold text-gray-900">{pkg.views}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Seats</p>
                          <p className="text-sm font-bold text-gray-900">
                            {pkg.seats}/{pkg.maxSeats}
                          </p>
                        </div>
                      </div>

                      {/* Price & Duration */}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-lg font-bold text-gray-900">₹{pkg.price.toLocaleString()}</p>
                          {pkg.originalPrice && (
                            <p className="text-xs text-gray-400 line-through">₹{pkg.originalPrice.toLocaleString()}</p>
                          )}
                        </div>
                        <Badge variant="outline">{pkg.duration}</Badge>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{pkg.lastEdited} by {pkg.editedBy}</span>
                        </div>
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  // List View
                  <div className="p-4 flex items-center gap-4">
                    <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900">{pkg.name}</h3>
                          <p className="text-sm text-gray-600">{pkg.destination} • {pkg.duration}</p>
                        </div>
                        <Badge
                          className={
                            pkg.status === "live"
                              ? "bg-green-500 text-white"
                              : "bg-orange-500 text-white"
                          }
                        >
                          {pkg.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-gray-600">{pkg.bookings} bookings</span>
                        <span className="text-sm text-gray-600">{pkg.views} views</span>
                        <span className="text-sm text-gray-600">{pkg.seats}/{pkg.maxSeats} seats</span>
                        <span className="text-lg font-bold text-gray-900">₹{pkg.price.toLocaleString()}</span>
                      </div>
                    </div>
                    <Button size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Dynamic Pricing Alert */}
          <Card className="p-4 bg-amber-50 border-amber-200">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-amber-900">Pricing Opportunity Detected</p>
                <p className="text-sm text-amber-700 mt-1">
                  You can increase "Meghalaya Living Root Bridges" price by ₹1,200 – demand is 42% higher than supply this season
                </p>
              </div>
              <Button size="sm" variant="outline" className="border-amber-300 hover:bg-amber-100">
                Apply Suggestion
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

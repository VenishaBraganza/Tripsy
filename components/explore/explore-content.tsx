"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, Bell, Sparkles, MapPin, Plus, Minus, Maximize2,
  Navigation, Mountain, Waves, Trees, Landmark, Star, X
} from "lucide-react"

interface ExploreContentProps {
  user: any
}

export function ExploreContent({ user }: ExploreContentProps) {
  const [selectedLocation, setSelectedLocation] = useState("Near: Mumbai, Maharashtra")
  const [mapView, setMapView] = useState<"map" | "satellite" | "terrain">("map")
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  
  const itemsPerPage = 6

  const discoveredPlaces = [
    {
      id: 1,
      name: "Araku Valley",
      type: "Hidden Gem",
      location: "Andhra Pradesh",
      distance: "142 km away",
      rating: 4.7,
      description: "Lush greenery",
      icon: Mountain
    },
    {
      id: 2,
      name: "Tarkarli Beach",
      type: "Beach",
      location: "Maharashtra",
      distance: "368 km away",
      rating: 4.9,
      description: "Best in Mar-May",
      icon: Waves
    },
    {
      id: 3,
      name: "Spiti Valley",
      type: "Adventure",
      location: "Himachal Pradesh",
      distance: "1,842 km",
      rating: 4.8,
      description: "Jun-Sep ideal",
      icon: Mountain
    },
    {
      id: 4,
      name: "Majuli Island",
      type: "Eco-Friendly",
      location: "Assam",
      distance: "2,100 km away",
      rating: 4.6,
      description: "Cultural hub",
      icon: Trees
    }
  ]

  // Memoize filtered results for better performance
  const filteredPlaces = useMemo(() => {
    return discoveredPlaces.filter(place => 
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.type.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  // Memoize paginated results
  const paginatedPlaces = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredPlaces.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredPlaces, currentPage, itemsPerPage])

  // Debounced search handler
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    setCurrentPage(1) // Reset to first page on search
  }, [])

  // Load more places (lazy loading simulation)
  const loadMorePlaces = useCallback(async () => {
    setLoading(true)
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    setCurrentPage(prev => prev + 1)
    setLoading(false)
  }, [])

  const mapLegend = [
    { icon: Mountain, label: "Hidden Gems", color: "text-purple-600" },
    { icon: Waves, label: "Beaches & Coasts", color: "text-blue-600" },
    { icon: Mountain, label: "Hill Stations", color: "text-green-600" },
    { icon: Landmark, label: "Spiritual Sites", color: "text-orange-600" },
    { icon: Trees, label: "Adventure Activities", color: "text-emerald-600" }
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Discovery Sidebar */}
      <aside className="w-96 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">AI Discovery</h2>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              <Button className="bg-black hover:bg-gray-800 text-white">
                <Navigation className="w-4 h-4 mr-2" />
                Plan Route
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search destinations, hidden gems in India..." 
              className="pl-10 pr-10 bg-gray-50 border-gray-200"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs bg-white border border-gray-200 rounded">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* AI Recommendation */}
        <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">AI Recommendation for {user?.email?.split('@')[0] || 'You'}</h3>
              <p className="text-xs text-gray-600">
                Based on your adventure preference: Explore underrated Araku Valley in Andhra Pradesh for tribal culture and coffee plantations
              </p>
              <Button variant="link" className="h-auto p-0 text-xs mt-1">
                View on Map →
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Interactive Discovery Map</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowFilters(!showFilters)}
            >
              More Filters
            </Button>
          </div>
          <p className="text-xs text-gray-500 mb-3">Explore India's hidden gems with AI-powered recommendations</p>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="flex-1 justify-start text-xs">
                {selectedLocation}
                <X className="w-3 h-3 ml-auto" />
              </Button>
            </div>
            <div className="flex gap-2">
              <select className="flex-1 text-xs border border-gray-200 rounded-md px-3 py-2 bg-white">
                <option>All Categories</option>
                <option>Hidden Gems</option>
                <option>Beaches & Coasts</option>
                <option>Hill Stations</option>
                <option>Spiritual Sites</option>
                <option>Adventure</option>
              </select>
              <select className="flex-1 text-xs border border-gray-200 rounded-md px-3 py-2 bg-white">
                <option>All Regions</option>
                <option>North India</option>
                <option>South India</option>
                <option>East India</option>
                <option>West India</option>
              </select>
            </div>
            <Button variant="outline" size="sm" className="w-full text-xs">
              <Trees className="w-3 h-3 mr-2" />
              Eco-Friendly Only
            </Button>
          </div>
        </div>

        {/* Discovered Places */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Discovered Places ({discoveredPlaces.length})</h3>
            <Button variant="link" className="h-auto p-0 text-xs">
              View All Places
            </Button>
          </div>

          <div className="space-y-3">
            {discoveredPlaces.map((place) => {
              const Icon = place.icon
              return (
                <Card key={place.id} className="p-4 hover:shadow-md transition-all cursor-pointer border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <h4 className="font-semibold text-sm">{place.name}</h4>
                          <p className="text-xs text-gray-500">{place.location} • {place.distance}</p>
                        </div>
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full whitespace-nowrap">
                          {place.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-medium">{place.rating}</span>
                        </div>
                        <span className="text-xs text-gray-500">• {place.description}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Map Legend */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <h4 className="font-semibold text-xs mb-3">Map Legend</h4>
          <div className="grid grid-cols-2 gap-2">
            {mapLegend.map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-xs text-gray-600">{item.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </aside>

      {/* Map Area */}
      <main className="flex-1 relative">
        {/* Map Controls */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
          <Tabs value={mapView} onValueChange={(v) => setMapView(v as any)} className="bg-white rounded-lg shadow-md">
            <TabsList className="bg-transparent">
              <TabsTrigger value="map">Map</TabsTrigger>
              <TabsTrigger value="satellite">Satellite</TabsTrigger>
              <TabsTrigger value="terrain">Terrain</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Button variant="secondary" className="bg-white shadow-md">
              <MapPin className="w-4 h-4 mr-2" />
              Thematic Views
            </Button>
            <Button variant="secondary" className="bg-white shadow-md">
              <Navigation className="w-4 h-4 mr-2" />
              Offline Mode
            </Button>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center relative">
          <div className="text-center">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">Interactive Map View</h3>
            <p className="text-sm text-gray-400">AI-powered discovery with smart routing</p>
          </div>

          {/* Zoom Controls */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2">
            <Button size="icon" variant="secondary" className="bg-white shadow-md">
              <Plus className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="secondary" className="bg-white shadow-md">
              <Minus className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="secondary" className="bg-white shadow-md">
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="secondary" className="bg-white shadow-md">
              <Navigation className="w-4 h-4" />
            </Button>
          </div>

          {/* Route Planner Button */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
            <Button className="bg-black hover:bg-gray-800 text-white shadow-lg">
              <Navigation className="w-4 h-4 mr-2" />
              Route Planner
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Search,
  MapPin,
  Star,
  Heart,
  Camera,
  TrendingUp,
  Filter,
  Map as MapIcon,
  List,
  Eye,
  ThumbsUp,
  Share2,
  Navigation,
  Sparkles,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface HiddenGemsContentProps {
  user: any
}

export function HiddenGemsContent({ user }: HiddenGemsContentProps) {
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [hiddenGems, setHiddenGems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Mock data - Replace with actual API call
  useEffect(() => {
    const mockGems = [
      {
        id: "1",
        name: "Yana Caves & Rocks",
        location: "Kumta, Uttara Kannada",
        district: "Uttara Kannada",
        hiddenGemScore: 95,
        rating: 4.8,
        reviewCount: 23,
        category: ["nature", "trekking", "offbeat"],
        image: "/placeholder-nature.jpg",
        description: "Unique rock formations and ancient caves hidden in dense forests",
        distance: "45 km",
        visitorsLastMonth: 156,
        bestTimeToVisit: "Oct-Feb",
        entryFee: "Free",
        reviews: [
          {
            id: "r1",
            userName: "Priya Kumar",
            userAvatar: "/placeholder-user.jpg",
            rating: 5,
            comment: "Absolutely stunning! The trek through the forest is magical. Hardly any tourists, felt like discovering a secret paradise.",
            photos: ["/placeholder-nature.jpg", "/placeholder-landscape.jpg"],
            visitDate: "2024-11-15",
            helpful: 24,
            tags: ["peaceful", "underrated", "must-visit"],
          },
          {
            id: "r2",
            userName: "Rajesh Rao",
            userAvatar: "/placeholder-user.jpg",
            rating: 5,
            comment: "Hidden gem indeed! The Bhairaveshwara Shikhara rock is breathtaking. Perfect for nature lovers and photographers.",
            photos: ["/japanese-countryside-totoro-house.jpg"],
            visitDate: "2024-10-28",
            helpful: 18,
            tags: ["photography", "peaceful", "spiritual"],
          },
        ],
      },
      {
        id: "2",
        name: "Vibhooti Falls",
        location: "Karkala, Udupi",
        district: "Udupi",
        hiddenGemScore: 88,
        rating: 4.7,
        reviewCount: 31,
        category: ["waterfall", "nature", "adventure"],
        image: "/placeholder-waterfall.jpg",
        description: "Pristine waterfall with crystal clear water, perfect for swimming",
        distance: "28 km",
        visitorsLastMonth: 203,
        bestTimeToVisit: "Jun-Sep",
        entryFee: "₹20",
        reviews: [
          {
            id: "r3",
            userName: "Ananya Shetty",
            userAvatar: "/placeholder-user.jpg",
            rating: 5,
            comment: "Best waterfall experience! Clean water, not crowded at all. The trek down is a bit steep but totally worth it.",
            photos: ["/placeholder-waterfall.jpg", "/placeholder-clouds.jpg"],
            visitDate: "2024-11-20",
            helpful: 32,
            tags: ["adventure", "clean", "underrated"],
          },
        ],
      },
      {
        id: "3",
        name: "Mirjan Fort",
        location: "Kumta, Uttara Kannada",
        district: "Uttara Kannada",
        hiddenGemScore: 82,
        rating: 4.6,
        reviewCount: 18,
        category: ["heritage", "history", "architecture"],
        image: "/placeholder-heritage.jpg",
        description: "16th century fort with stunning architecture, rarely visited",
        distance: "52 km",
        visitorsLastMonth: 89,
        bestTimeToVisit: "Oct-Mar",
        entryFee: "Free",
        reviews: [
          {
            id: "r4",
            userName: "Karthik Bhat",
            userAvatar: "/placeholder-user.jpg",
            rating: 4,
            comment: "Amazing historical site! Needs better maintenance but the architecture is impressive. Great for history enthusiasts.",
            photos: ["/placeholder-heritage.jpg"],
            visitDate: "2024-10-15",
            helpful: 12,
            tags: ["history", "architecture", "peaceful"],
          },
        ],
      },
    ]
    
    setHiddenGems(mockGems)
    setLoading(false)
  }, [])

  const filteredGems = hiddenGems.filter(gem => {
    const matchesCategory = selectedCategory === "all" || gem.category.includes(selectedCategory)
    const matchesSearch = gem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         gem.location.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading hidden gems...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Hidden Gems of South Karnataka</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover underrated destinations with authentic reviews from fellow travelers. 
              Find your next adventure off the beaten path.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search hidden gems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
            >
              All
            </Button>
            <Button
              variant={selectedCategory === "nature" ? "default" : "outline"}
              onClick={() => setSelectedCategory("nature")}
            >
              Nature
            </Button>
            <Button
              variant={selectedCategory === "heritage" ? "default" : "outline"}
              onClick={() => setSelectedCategory("heritage")}
            >
              Heritage
            </Button>
            <Button
              variant={selectedCategory === "waterfall" ? "default" : "outline"}
              onClick={() => setSelectedCategory("waterfall")}
            >
              Waterfalls
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "map" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("map")}
            >
              <MapIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGems.map((gem) => (
            <Card key={gem.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative aspect-video">
                <Image
                  src={gem.image}
                  alt={gem.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-primary/90 text-primary-foreground">
                    Hidden Gem Score: {gem.hiddenGemScore}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Button size="icon" variant="secondary" className="rounded-full">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-semibold">{gem.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{gem.rating}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 text-muted-foreground mb-3">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{gem.location}</span>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">{gem.description}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span>{gem.reviewCount} reviews</span>
                    <span>{gem.visitorsLastMonth} visitors</span>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredGems.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hidden gems found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
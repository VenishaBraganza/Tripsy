"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Bell, Plus, Play, Calendar, MapPin, Heart, Share2,
  Grid3x3, List, Trophy, Mountain, Compass, TrendingUp,
  Camera, Repeat
} from "lucide-react"

export function HistoryContent() {
  const [activeFilter, setActiveFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const memories = [
    {
      id: 1,
      title: "Ladakh High Altitude Adventure",
      subtitle: "Ladakh Adventure Photo Collage",
      location: "Ladakh with the Gang '24",
      dates: "Jun 15-22, 2024",
      duration: "8 days",
      cost: "₹45,600",
      tags: ["Adventurous", "Spiritual", "Hidden gems: 4"],
      images: 3,
      rating: 5,
      theme: "from-slate-700 to-slate-800"
    },
    {
      id: 2,
      title: "Kerala Backwaters & Spices",
      subtitle: "Kerala Backwaters Serenity",
      location: "Kerala Escape '24",
      dates: "Mar 8-14, 2024",
      duration: "7 days",
      cost: "₹32,400",
      tags: ["Serene", "Foodie", "Hidden gems: 3"],
      images: 3,
      rating: 5,
      theme: "from-teal-700 to-teal-800"
    }
  ]

  const achievements = [
    { icon: Compass, label: "Monsoon Chaser", color: "text-blue-600" },
    { icon: Mountain, label: "Hidden Gem Collector", color: "text-purple-600" },
    { icon: TrendingUp, label: "Northeast Conqueror", color: "text-orange-600" }
  ]

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Travel History</h1>
            <p className="text-sm text-gray-500 mt-1">Your journey through memories</p>
          </div>
          
          <div className="flex items-center gap-3">
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
        {/* Hero Card - Your Journey So Far */}
        <Card className="overflow-hidden border-gray-200 mb-6 hover:shadow-xl transition-all duration-300">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm mb-4">
                  <Trophy className="w-3 h-3 mr-1" />
                  YOUR TRAVEL STORY
                </Badge>
                <h2 className="text-4xl font-bold text-white mb-3">Your Journey So Far</h2>
                <p className="text-white/80 text-lg mb-2">You've explored 12 states & 3 countries</p>
                <p className="text-white/60 text-sm mb-6">Discovered 18 hidden gems across India</p>

                {/* Stats */}
                <div className="flex gap-8 mb-6">
                  <div>
                    <p className="text-4xl font-bold text-white mb-1">47</p>
                    <p className="text-white/60 text-sm">Trips Completed</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-white mb-1">12,340</p>
                    <p className="text-white/60 text-sm">KM Traveled</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-white mb-1">₹2.8L</p>
                    <p className="text-white/60 text-sm">Total Saved</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button variant="secondary" className="bg-white hover:bg-gray-100 text-gray-900">
                    <Play className="w-4 h-4 mr-2" />
                    Watch Your Story
                  </Button>
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    2025 Yearbook Ready
                  </Button>
                </div>
              </div>

              {/* Video Placeholder */}
              <div className="w-80 h-48 bg-slate-700/50 rounded-lg flex items-center justify-center border border-white/10">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-white/40 mx-auto mb-2" />
                  <p className="text-white/60 text-sm">Auto-Generated Travel Montage Video</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Level & Achievements */}
        <Card className="p-6 mb-6 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-3 mb-2">
                <h3 className="text-3xl font-bold text-gray-900">Level 7</h3>
                <span className="text-sm text-gray-500">Memory Keeper</span>
              </div>
              <p className="text-sm text-gray-600">42 memories preserved</p>
              <p className="text-xs text-gray-400">Next level: 8 more trips</p>
            </div>

            <div className="flex gap-6">
              {achievements.map((achievement, i) => {
                const Icon = achievement.icon
                return (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <Icon className={`w-6 h-6 ${achievement.color}`} />
                    </div>
                    <p className="text-xs text-gray-600 text-center max-w-[80px]">{achievement.label}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>

        {/* On This Day */}
        <Card className="p-6 mb-6 border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">On This Day</h4>
                <p className="text-sm text-gray-600">Exactly 1 year ago you were sipping tea at this underrated café in Majuli</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-gray-500">Majuli Café</p>
                <p className="text-xs text-gray-400">Photo</p>
              </div>
              <Button variant="outline">View Memory</Button>
            </div>
          </div>
        </Card>

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <Button 
              variant={activeFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter("all")}
              className={activeFilter === "all" ? "bg-black hover:bg-gray-800" : ""}
            >
              All Memories (47)
            </Button>
            <Button 
              variant={activeFilter === "hidden" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter("hidden")}
              className={activeFilter === "hidden" ? "bg-black hover:bg-gray-800" : ""}
            >
              Hidden Gems (18)
            </Button>
            <Button 
              variant={activeFilter === "2025" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter("2025")}
              className={activeFilter === "2025" ? "bg-black hover:bg-gray-800" : ""}
            >
              2025 (12)
            </Button>
            <Button 
              variant={activeFilter === "2024" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter("2024")}
              className={activeFilter === "2024" ? "bg-black hover:bg-gray-800" : ""}
            >
              2024 (23)
            </Button>
            <Button 
              variant={activeFilter === "international" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter("international")}
              className={activeFilter === "international" ? "bg-black hover:bg-gray-800" : ""}
            >
              International (3)
            </Button>
          </div>

          <div className="flex gap-2">
            <Button 
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-black hover:bg-gray-800" : ""}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button 
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-black hover:bg-gray-800" : ""}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Memory Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {memories.map((memory, index) => (
            <Card 
              key={memory.id} 
              className="overflow-hidden border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              style={{
                animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`
              }}
            >
              {/* Header with Location Badge */}
              <div className={`relative h-48 bg-gradient-to-br ${memory.theme}`}>
                <div className="absolute top-4 left-4">
                  <Badge className="bg-white/90 text-gray-900 border-0">
                    {memory.location}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button size="icon" variant="secondary" className="bg-white/90 hover:bg-white h-8 w-8">
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="secondary" className="bg-white/90 hover:bg-white h-8 w-8">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Photo Collage Indicator */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="flex gap-2 mb-2 justify-center">
                      {[...Array(memory.images)].map((_, i) => (
                        <div key={i} className="w-16 h-16 bg-white/20 rounded-lg border border-white/30" />
                      ))}
                    </div>
                    <p className="text-white/80 text-sm">{memory.subtitle}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{memory.title}</h3>
                    <p className="text-sm text-gray-500">{memory.dates} • {memory.duration}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{memory.cost}</p>
                    <p className="text-xs text-gray-500">total spent</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {memory.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Repeat className="w-4 h-4 mr-2" />
                    Rebook Similar
                  </Button>
                  <Button className="flex-1 bg-black hover:bg-gray-800 text-white">
                    <Play className="w-4 h-4 mr-2" />
                    Relive
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="flex justify-center mt-8">
          <Button variant="outline" size="lg">
            Load More Memories
          </Button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
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

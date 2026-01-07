"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Heart, MapPin, Map, BarChart3, Search, Bell, Plus, Loader2, Trash2 } from "lucide-react"
import { useWishlist } from "@/hooks/use-wishlist"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { ErrorState } from "@/components/error/error-state"
import { EmptyState } from "@/components/error/empty-state"
import { LoadingState } from "@/components/error/loading-state"

export function WishlistContent() {
  const router = useRouter()
  const [selectedCollection, setSelectedCollection] = useState<string | undefined>(undefined)
  const { wishlist, loading, error, removeFromWishlist, refetch } = useWishlist(selectedCollection)
  const [removingId, setRemovingId] = useState<string | null>(null)

  // Get unique collections from wishlist
  const collections = [
    { id: undefined, label: "All Dreams", count: wishlist.length },
    ...Array.from(new Set(wishlist.map(item => item.collection_name)))
      .filter(name => name !== 'all')
      .map(name => ({
        id: name,
        label: name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' '),
        count: wishlist.filter(item => item.collection_name === name).length
      }))
  ]

  const handleRemove = async (wishlistId: string) => {
    setRemovingId(wishlistId)
    const result = await removeFromWishlist(wishlistId)
    setRemovingId(null)
    
    if (!result.success) {
      alert(result.error || 'Failed to remove from wishlist')
    }
  }

  const handleBookNow = (slug: string) => {
    router.push(`/packages/${slug}`)
  }

  if (loading && wishlist.length === 0) {
    return <LoadingState message="Loading your wishlist..." />
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />
  }

  const filteredWishlist = selectedCollection 
    ? wishlist.filter(item => item.collection_name === selectedCollection)
    : wishlist

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search your dream destinations..." 
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
            </Button>
            
            <Button 
              className="bg-black hover:bg-gray-800 text-white"
              onClick={() => router.push('/dashboard/my-trips')}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Trip
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header with Actions */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">My Wishlist</h2>
              <p className="text-gray-600 mt-1">{wishlist.length} {wishlist.length === 1 ? 'package' : 'packages'} saved</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/explore')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add More
              </Button>
              <Button variant="outline" size="sm">
                <Map className="w-4 h-4 mr-2" />
                Map View
              </Button>
              <Button variant="outline" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Compare
              </Button>
            </div>
          </div>

          {/* Collection Filters */}
          {collections.length > 1 && (
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
              {collections.map((collection) => (
                <Button
                  key={collection.id || 'all'}
                  variant={selectedCollection === collection.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCollection(collection.id)}
                  className={
                    selectedCollection === collection.id
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-white hover:bg-gray-50"
                  }
                >
                  {collection.label}
                  {collection.count > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {collection.count}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          )}

          {/* Empty State */}
          {filteredWishlist.length === 0 && (
            <EmptyState
              icon={Heart}
              title="No packages in your wishlist"
              description="Start adding packages you love to keep track of them"
              action={{
                label: "Explore Packages",
                onClick: () => router.push('/explore')
              }}
            />
          )}

          {/* Wishlist Grid */}
          {filteredWishlist.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWishlist.map((item) => {
                const pkg = item.packages
                if (!pkg) return null

                const discountedPrice = pkg.discounted_price || pkg.base_price
                const hasDiscount = pkg.discounted_price && pkg.discounted_price < pkg.base_price
                const discount = hasDiscount ? pkg.base_price - pkg.discounted_price : 0

                return (
                  <Card 
                    key={item.id} 
                    className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
                    onClick={() => handleBookNow(pkg.slug)}
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-500">
                      {/* Discount Badge */}
                      {hasDiscount && (
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-green-500 text-white font-semibold">
                            ₹{(discount / 1000).toFixed(1)}k OFF
                          </Badge>
                        </div>
                      )}

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-3 right-3 bg-white/90 text-red-600 hover:bg-white hover:text-red-700"
                        disabled={removingId === item.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemove(item.id)
                        }}
                      >
                        {removingId === item.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>

                      {/* Collection Badge */}
                      {item.collection_name && item.collection_name !== 'all' && (
                        <div className="absolute bottom-3 left-3">
                          <Badge className="bg-black/70 text-white">
                            {item.collection_name.charAt(0).toUpperCase() + item.collection_name.slice(1)}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                            {pkg.name}
                          </h3>
                          {pkg.destinations && (
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {pkg.destinations.name}, {pkg.destinations.state}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            ₹{discountedPrice.toLocaleString()}
                          </p>
                          {hasDiscount && (
                            <p className="text-xs text-gray-400 line-through">
                              ₹{pkg.base_price.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Tags */}
                      {pkg.tags && pkg.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {pkg.tags.slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Duration */}
                      <p className="text-xs text-gray-500 mb-3">
                        {pkg.duration_text}
                      </p>

                      {/* Notes */}
                      {item.notes && (
                        <p className="text-xs text-gray-600 italic mb-3 line-clamp-2">
                          "{item.notes}"
                        </p>
                      )}

                      {/* Meta Info */}
                      <div className="text-xs text-gray-500 mb-3">
                        Added {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm h-9"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleBookNow(pkg.slug)
                          }}
                        >
                          Book Now
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-sm h-9"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/packages/${pkg.slug}`)
                          }}
                        >
                          Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

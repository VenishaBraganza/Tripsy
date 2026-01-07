'use client'

import { useEffect, useState, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Navigation, Utensils, Hotel, Camera, Plus, Minus } from 'lucide-react'
import { getCurrentLocation, findNearbyPlaces, type Location, type NearbyPlace } from '@/lib/services/maps'

interface InteractiveMapProps {
  center?: Location
  destinations?: Location[]
  showNearby?: boolean
  height?: string
}

export function InteractiveMap({ 
  center, 
  destinations = [], 
  showNearby = false,
  height = '400px' 
}: InteractiveMapProps) {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(center || null)
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([])
  const [selectedType, setSelectedType] = useState<'restaurant' | 'attraction' | 'hotel' | 'cafe'>('restaurant')
  const [zoom, setZoom] = useState(13)
  const [loading, setLoading] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!center) {
      loadCurrentLocation()
    }
  }, [center])
  
  const loadCurrentLocation = async () => {
    try {
      setLoading(true)
      const location = await getCurrentLocation()
      setCurrentLocation(location)
    } catch (error) {
      console.error('Error getting location:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const loadNearbyPlaces = async (type: typeof selectedType) => {
    if (!currentLocation) return
    
    try {
      setLoading(true)
      
      // Use our real places API
      const response = await fetch(
        `/api/places/nearby?lat=${currentLocation.lat}&lng=${currentLocation.lng}&category=${type}&limit=8`
      )
      const data = await response.json()
      
      if (data.success) {
        // Transform the data to match our interface
        const transformedPlaces = data.places.map((place: any) => ({
          id: place.name.toLowerCase().replace(/\s+/g, '-'),
          name: place.name,
          type: type,
          rating: place.rating,
          openNow: true, // Assume open for now
          location: {
            lat: place.lat,
            lng: place.lng
          },
          distance: place.distance,
          category: place.category
        }))
        
        setNearbyPlaces(transformedPlaces)
      } else {
        // Fallback to mock data if API fails
        const mockPlaces = await findNearbyPlaces(currentLocation, type)
        setNearbyPlaces(mockPlaces)
      }
      
      setSelectedType(type)
    } catch (error) {
      console.error('Error loading nearby places:', error)
      // Fallback to existing mock data
      try {
        const places = await findNearbyPlaces(currentLocation, type)
        setNearbyPlaces(places)
        setSelectedType(type)
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError)
      }
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Card className="overflow-hidden">
      {/* Map Controls */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Interactive Map</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.min(zoom + 1, 18))}
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.max(zoom - 1, 1))}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadCurrentLocation}
            >
              <Navigation className="w-4 h-4 mr-2" />
              My Location
            </Button>
          </div>
        </div>
        
        {showNearby && (
          <div className="flex gap-2">
            <Button
              variant={selectedType === 'restaurant' ? 'default' : 'outline'}
              size="sm"
              onClick={() => loadNearbyPlaces('restaurant')}
            >
              <Utensils className="w-4 h-4 mr-2" />
              Food
            </Button>
            <Button
              variant={selectedType === 'attraction' ? 'default' : 'outline'}
              size="sm"
              onClick={() => loadNearbyPlaces('attraction')}
            >
              <Camera className="w-4 h-4 mr-2" />
              Attractions
            </Button>
            <Button
              variant={selectedType === 'hotel' ? 'default' : 'outline'}
              size="sm"
              onClick={() => loadNearbyPlaces('hotel')}
            >
              <Hotel className="w-4 h-4 mr-2" />
              Hotels
            </Button>
          </div>
        )}
      </div>
      
      {/* Map Display */}
      <div 
        ref={mapRef}
        className="relative bg-gradient-to-br from-blue-100 to-green-100"
        style={{ height }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        )}
        
        {/* Current Location Marker */}
        {currentLocation && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="relative">
              <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg animate-pulse" />
              <div className="absolute inset-0 w-4 h-4 bg-blue-400 rounded-full animate-ping" />
            </div>
          </div>
        )}
        
        {/* Destination Markers */}
        {destinations.map((dest, idx) => (
          <div
            key={idx}
            className="absolute"
            style={{
              top: `${40 + idx * 15}%`,
              left: `${45 + idx * 10}%`,
            }}
          >
            <div className="relative group cursor-pointer">
              <MapPin className="w-6 h-6 text-red-600 drop-shadow-lg" />
              {dest.name && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-white rounded shadow-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  {dest.name}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Nearby Places */}
        {nearbyPlaces.map((place, idx) => (
          <div
            key={place.id}
            className="absolute"
            style={{
              top: `${30 + idx * 20}%`,
              left: `${50 + (idx % 2 === 0 ? 15 : -15)}%`,
            }}
          >
            <div className="relative group cursor-pointer">
              <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                {place.type === 'restaurant' && <Utensils className="w-4 h-4 text-white" />}
                {place.type === 'attraction' && <Camera className="w-4 h-4 text-white" />}
                {place.type === 'hotel' && <Hotel className="w-4 h-4 text-white" />}
              </div>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-white rounded-lg shadow-xl text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-30">
                <p className="font-semibold">{place.name}</p>
                {place.rating && (
                  <p className="text-gray-600">⭐ {place.rating}</p>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Map Info Overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          <Card className="p-3 bg-white/95 backdrop-blur">
            <p className="text-xs text-gray-600 mb-1">Current Location</p>
            <p className="font-semibold text-sm">
              {currentLocation 
                ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`
                : 'Loading...'}
            </p>
          </Card>
          
          {nearbyPlaces.length > 0 && (
            <Badge className="bg-green-600 text-white">
              {nearbyPlaces.length} places nearby
            </Badge>
          )}
        </div>
      </div>
      
      {/* Nearby Places List */}
      {nearbyPlaces.length > 0 && (
        <div className="p-4 border-t border-gray-200 max-h-48 overflow-y-auto">
          <h4 className="font-semibold text-sm mb-3">Nearby {selectedType}s</h4>
          <div className="space-y-2">
            {nearbyPlaces.map((place) => (
              <div
                key={place.id}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                  <div>
                    <p className="font-medium text-sm">{place.name}</p>
                    <p className="text-xs text-gray-600">
                      {place.rating && `⭐ ${place.rating}`}
                      {place.openNow && <span className="ml-2 text-green-600">• Open now</span>}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

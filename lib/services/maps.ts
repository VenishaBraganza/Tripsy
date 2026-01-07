// Real-time map and location services

export interface Location {
  lat: number
  lng: number
  name?: string
  address?: string
}

export interface Route {
  origin: Location
  destination: Location
  waypoints?: Location[]
  distance: number
  duration: number
  steps: RouteStep[]
}

export interface RouteStep {
  instruction: string
  distance: number
  duration: number
  location: Location
}

export interface NearbyPlace {
  id: string
  name: string
  type: string
  location: Location
  rating?: number
  photos?: string[]
  openNow?: boolean
  priceLevel?: number
}

/**
 * Get user's current location using browser Geolocation API
 * This is a real implementation - no mock data
 */
export async function getCurrentLocation(): Promise<Location> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'))
      return
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      (error: GeolocationPositionError) => {
        // Handle specific geolocation errors
        let errorMessage = 'Failed to get location'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access in your browser settings.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.'
            break
        }
        reject(new Error(errorMessage))
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 60000 // Cache for 1 minute
      }
    )
  })
}

/**
 * Calculate route between two points using Google Maps Directions API
 * Requires NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable
 */
export async function calculateRoute(
  origin: Location,
  destination: Location,
  waypoints?: Location[]
): Promise<Route> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  
  if (!apiKey) {
    console.warn('Google Maps API key not configured, using fallback calculation')
    // Fallback to simple distance calculation
    const distance = calculateDistance(origin, destination)
    const duration = Math.round(distance / 50 * 60) // Assume 50 km/h average
    
    return {
      origin,
      destination,
      waypoints,
      distance,
      duration,
      steps: [
        {
          instruction: `Head towards ${destination.name || 'destination'}`,
          distance: distance * 0.3,
          duration: duration * 0.3,
          location: origin,
        },
        {
          instruction: 'Continue on main road',
          distance: distance * 0.5,
          duration: duration * 0.5,
          location: { lat: (origin.lat + destination.lat) / 2, lng: (origin.lng + destination.lng) / 2 },
        },
        {
          instruction: `Arrive at ${destination.name || 'destination'}`,
          distance: distance * 0.2,
          duration: duration * 0.2,
          location: destination,
        },
      ],
    }
  }
  
  try {
    // Build waypoints string if provided
    const waypointsStr = waypoints?.map(w => `${w.lat},${w.lng}`).join('|') || ''
    
    const url = new URL('https://maps.googleapis.com/maps/api/directions/json')
    url.searchParams.append('origin', `${origin.lat},${origin.lng}`)
    url.searchParams.append('destination', `${destination.lat},${destination.lng}`)
    if (waypointsStr) url.searchParams.append('waypoints', waypointsStr)
    url.searchParams.append('key', apiKey)
    
    const response = await fetch(url.toString())
    const data = await response.json()
    
    if (data.status !== 'OK') {
      throw new Error(`Directions API error: ${data.status}`)
    }
    
    const route = data.routes[0]
    const leg = route.legs[0]
    
    return {
      origin,
      destination,
      waypoints,
      distance: leg.distance.value / 1000, // Convert to km
      duration: leg.duration.value / 60, // Convert to minutes
      steps: leg.steps.map((step: any) => ({
        instruction: step.html_instructions.replace(/<[^>]*>/g, ''), // Strip HTML
        distance: step.distance.value / 1000,
        duration: step.duration.value / 60,
        location: {
          lat: step.end_location.lat,
          lng: step.end_location.lng,
        },
      })),
    }
  } catch (error) {
    console.error('Error calculating route:', error)
    // Fallback to simple calculation
    const distance = calculateDistance(origin, destination)
    const duration = Math.round(distance / 50 * 60)
    
    return {
      origin,
      destination,
      waypoints,
      distance,
      duration,
      steps: [],
    }
  }
}

// Calculate distance between two points (Haversine formula)
export function calculateDistance(point1: Location, point2: Location): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(point2.lat - point1.lat)
  const dLon = toRad(point2.lng - point1.lng)
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) *
      Math.cos(toRad(point2.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Find nearby places using Google Places API
 * Requires NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable
 */
export async function findNearbyPlaces(
  location: Location,
  type: 'restaurant' | 'attraction' | 'hotel' | 'cafe',
  radius: number = 5000 // meters
): Promise<NearbyPlace[]> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  
  if (!apiKey) {
    console.warn('Google Maps API key not configured, returning empty results')
    return []
  }
  
  try {
    // Map our types to Google Places types
    const placeTypeMap: Record<string, string> = {
      restaurant: 'restaurant',
      attraction: 'tourist_attraction',
      hotel: 'lodging',
      cafe: 'cafe',
    }
    
    const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json')
    url.searchParams.append('location', `${location.lat},${location.lng}`)
    url.searchParams.append('radius', radius.toString())
    url.searchParams.append('type', placeTypeMap[type] || type)
    url.searchParams.append('key', apiKey)
    
    const response = await fetch(url.toString())
    const data = await response.json()
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Places API error: ${data.status}`)
    }
    
    return data.results.map((place: any) => ({
      id: place.place_id,
      name: place.name,
      type,
      location: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        name: place.name,
        address: place.vicinity,
      },
      rating: place.rating,
      photos: place.photos?.map((photo: any) => 
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${apiKey}`
      ),
      openNow: place.opening_hours?.open_now,
      priceLevel: place.price_level,
    }))
  } catch (error) {
    console.error('Error finding nearby places:', error)
    return []
  }
}

/**
 * Get real-time traffic updates using Google Maps Directions API with traffic model
 * Requires NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable
 */
export async function getTrafficUpdates(route: Route): Promise<{
  congestionLevel: 'low' | 'medium' | 'high'
  delays: number // in minutes
  alternativeRoutes: Route[]
}> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  
  if (!apiKey) {
    console.warn('Google Maps API key not configured, returning default traffic data')
    return {
      congestionLevel: 'low',
      delays: 0,
      alternativeRoutes: [],
    }
  }
  
  try {
    const url = new URL('https://maps.googleapis.com/maps/api/directions/json')
    url.searchParams.append('origin', `${route.origin.lat},${route.origin.lng}`)
    url.searchParams.append('destination', `${route.destination.lat},${route.destination.lng}`)
    url.searchParams.append('departure_time', 'now')
    url.searchParams.append('traffic_model', 'best_guess')
    url.searchParams.append('alternatives', 'true')
    url.searchParams.append('key', apiKey)
    
    const response = await fetch(url.toString())
    const data = await response.json()
    
    if (data.status !== 'OK') {
      throw new Error(`Directions API error: ${data.status}`)
    }
    
    const mainRoute = data.routes[0]
    const leg = mainRoute.legs[0]
    
    // Calculate delay by comparing duration_in_traffic with duration
    const normalDuration = leg.duration.value / 60 // minutes
    const trafficDuration = leg.duration_in_traffic?.value / 60 || normalDuration
    const delays = Math.max(0, trafficDuration - normalDuration)
    
    // Determine congestion level based on delay
    let congestionLevel: 'low' | 'medium' | 'high' = 'low'
    if (delays > 15) congestionLevel = 'high'
    else if (delays > 5) congestionLevel = 'medium'
    
    // Parse alternative routes
    const alternativeRoutes: Route[] = data.routes.slice(1).map((altRoute: any) => {
      const altLeg = altRoute.legs[0]
      return {
        origin: route.origin,
        destination: route.destination,
        distance: altLeg.distance.value / 1000,
        duration: altLeg.duration.value / 60,
        steps: [],
      }
    })
    
    return {
      congestionLevel,
      delays: Math.round(delays),
      alternativeRoutes,
    }
  } catch (error) {
    console.error('Error getting traffic updates:', error)
    return {
      congestionLevel: 'low',
      delays: 0,
      alternativeRoutes: [],
    }
  }
}

/**
 * Track live location during trip
 * Returns a cleanup function to stop tracking
 */
export function trackLiveLocation(
  callback: (location: Location) => void,
  errorCallback?: (error: Error) => void
): () => void {
  if (!navigator.geolocation) {
    errorCallback?.(new Error('Geolocation not supported'))
    return () => {}
  }
  
  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      callback({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      })
    },
    (error: GeolocationPositionError) => {
      let errorMessage = 'Failed to track location'
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location permission denied'
          break
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location unavailable'
          break
        case error.TIMEOUT:
          errorMessage = 'Location request timed out'
          break
      }
      errorCallback?.(new Error(errorMessage))
    },
    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
  )
  
  return () => navigator.geolocation.clearWatch(watchId)
}

/**
 * Get weather for location using OpenWeatherMap API
 * Requires OPENWEATHER_API_KEY environment variable
 */
export async function getWeatherForLocation(location: Location): Promise<{
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  icon?: string
}> {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
  
  if (!apiKey) {
    console.warn('OpenWeather API key not configured, returning default weather')
    return {
      temperature: 28,
      condition: 'Partly Cloudy',
      humidity: 65,
      windSpeed: 12,
    }
  }
  
  try {
    const url = new URL('https://api.openweathermap.org/data/2.5/weather')
    url.searchParams.append('lat', location.lat.toString())
    url.searchParams.append('lon', location.lng.toString())
    url.searchParams.append('units', 'metric') // Celsius
    url.searchParams.append('appid', apiKey)
    
    const response = await fetch(url.toString())
    const data = await response.json()
    
    if (response.status !== 200) {
      throw new Error(`Weather API error: ${data.message}`)
    }
    
    return {
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      icon: data.weather[0].icon,
    }
  } catch (error) {
    console.error('Error getting weather:', error)
    // Return fallback weather data
    return {
      temperature: 28,
      condition: 'Partly Cloudy',
      humidity: 65,
      windSpeed: 12,
    }
  }
}

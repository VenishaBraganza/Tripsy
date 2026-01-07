/**
 * AI-powered food recommendations using Google Places API
 * Requires NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable
 */

export interface FoodRecommendation {
  id: string
  name: string
  cuisine: string
  description: string
  location: {
    lat: number
    lng: number
    address: string
  }
  rating: number
  priceRange: string
  mustTry: string[]
  dietaryOptions: string[]
  openingHours: string
  distance: number
  photos: string[]
  isLocal: boolean
  hiddenGem: boolean
}

/**
 * Get food recommendations using Google Places API
 */
export async function getFoodRecommendations(
  location: { lat: number; lng: number },
  preferences: {
    cuisine?: string[]
    dietary?: string[]
    priceRange?: string
    radius?: number
  }
): Promise<FoodRecommendation[]> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  
  if (!apiKey) {
    console.warn('Google Maps API key not configured, returning empty results')
    return []
  }
  
  try {
    const radius = preferences.radius ? preferences.radius * 1000 : 5000 // Convert km to meters
    
    // Build search query based on cuisine preferences
    let keyword = 'restaurant'
    if (preferences.cuisine && preferences.cuisine.length > 0) {
      keyword = preferences.cuisine.join(' ') + ' restaurant'
    }
    
    const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json')
    url.searchParams.append('location', `${location.lat},${location.lng}`)
    url.searchParams.append('radius', radius.toString())
    url.searchParams.append('type', 'restaurant')
    url.searchParams.append('keyword', keyword)
    url.searchParams.append('key', apiKey)
    
    const response = await fetch(url.toString())
    const data = await response.json()
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Places API error: ${data.status}`)
    }
    
    // Transform Google Places results to our format
    const recommendations: FoodRecommendation[] = await Promise.all(
      data.results.slice(0, 10).map(async (place: any) => {
        // Get place details for more information
        const details = await getPlaceDetails(place.place_id, apiKey)
        
        // Calculate distance
        const distance = calculateDistance(
          location.lat,
          location.lng,
          place.geometry.location.lat,
          place.geometry.location.lng
        )
        
        // Map price level to price range
        const priceRangeMap: Record<number, string> = {
          1: '₹',
          2: '₹₹',
          3: '₹₹₹',
          4: '₹₹₹₹',
        }
        
        return {
          id: place.place_id,
          name: place.name,
          cuisine: determineCuisine(place.types, place.name),
          description: details?.editorial_summary?.overview || place.vicinity || '',
          location: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
            address: place.vicinity || '',
          },
          rating: place.rating || 0,
          priceRange: priceRangeMap[place.price_level] || '₹₹',
          mustTry: extractMustTry(details?.reviews || []),
          dietaryOptions: extractDietaryOptions(details?.types || place.types),
          openingHours: formatOpeningHours(details?.opening_hours),
          distance: Math.round(distance * 10) / 10,
          photos: place.photos?.slice(0, 3).map((photo: any) =>
            `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${apiKey}`
          ) || [],
          isLocal: distance < 2, // Within 2km considered local
          hiddenGem: place.user_ratings_total < 500 && place.rating >= 4.3, // Less known but highly rated
        }
      })
    )
    
    // Filter based on preferences
    let filtered = recommendations
    
    if (preferences.dietary && preferences.dietary.length > 0) {
      filtered = filtered.filter(r =>
        preferences.dietary!.some(d =>
          r.dietaryOptions.some(opt => opt.toLowerCase().includes(d.toLowerCase()))
        )
      )
    }
    
    if (preferences.priceRange) {
      filtered = filtered.filter(r => r.priceRange === preferences.priceRange)
    }
    
    // Sort by rating and distance
    filtered.sort((a, b) => {
      const scoreA = a.rating * 0.7 + (5 - a.distance) * 0.3
      const scoreB = b.rating * 0.7 + (5 - b.distance) * 0.3
      return scoreB - scoreA
    })
    
    return filtered
  } catch (error) {
    console.error('Error getting food recommendations:', error)
    return []
  }
}

/**
 * Get detailed place information
 */
async function getPlaceDetails(placeId: string, apiKey: string): Promise<any> {
  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
    url.searchParams.append('place_id', placeId)
    url.searchParams.append('fields', 'editorial_summary,opening_hours,reviews,types')
    url.searchParams.append('key', apiKey)
    
    const response = await fetch(url.toString())
    const data = await response.json()
    
    return data.result
  } catch (error) {
    console.error('Error getting place details:', error)
    return null
  }
}

/**
 * Determine cuisine type from place types and name
 */
function determineCuisine(types: string[], name: string): string {
  const cuisineMap: Record<string, string> = {
    'indian_restaurant': 'Indian',
    'chinese_restaurant': 'Chinese',
    'italian_restaurant': 'Italian',
    'japanese_restaurant': 'Japanese',
    'mexican_restaurant': 'Mexican',
    'thai_restaurant': 'Thai',
    'cafe': 'Cafe',
    'bakery': 'Bakery',
  }
  
  for (const type of types) {
    if (cuisineMap[type]) {
      return cuisineMap[type]
    }
  }
  
  // Try to extract from name
  const nameLower = name.toLowerCase()
  if (nameLower.includes('indian') || nameLower.includes('dosa') || nameLower.includes('biryani')) {
    return 'Indian'
  }
  if (nameLower.includes('chinese')) return 'Chinese'
  if (nameLower.includes('italian') || nameLower.includes('pizza')) return 'Italian'
  
  return 'Restaurant'
}

/**
 * Extract must-try dishes from reviews
 */
function extractMustTry(reviews: any[]): string[] {
  // Simple extraction - in production, use NLP/AI
  const dishes: string[] = []
  const commonDishes = ['biryani', 'dosa', 'pizza', 'burger', 'pasta', 'noodles', 'curry', 'tandoori']
  
  reviews.slice(0, 5).forEach(review => {
    const text = review.text?.toLowerCase() || ''
    commonDishes.forEach(dish => {
      if (text.includes(dish) && !dishes.includes(dish)) {
        dishes.push(dish.charAt(0).toUpperCase() + dish.slice(1))
      }
    })
  })
  
  return dishes.slice(0, 3)
}

/**
 * Extract dietary options from place types
 */
function extractDietaryOptions(types: string[]): string[] {
  const options: string[] = []
  
  if (types.includes('vegetarian_restaurant')) options.push('Vegetarian')
  if (types.includes('vegan_restaurant')) options.push('Vegan')
  if (types.includes('meal_delivery')) options.push('Delivery Available')
  if (types.includes('meal_takeaway')) options.push('Takeaway')
  
  return options
}

/**
 * Format opening hours
 */
function formatOpeningHours(openingHours: any): string {
  if (!openingHours || !openingHours.weekday_text) {
    return 'Hours not available'
  }
  
  // Return today's hours
  const today = new Date().getDay()
  return openingHours.weekday_text[today] || 'Hours not available'
}

/**
 * Calculate distance between two points (Haversine formula)
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Get local specialties for a region
 * In production, this would query a database of regional dishes
 */
export async function getLocalSpecialties(
  region: string,
  location: { lat: number; lng: number }
): Promise<{
  dishes: string[]
  restaurants: FoodRecommendation[]
  foodTours: {
    name: string
    description: string
    duration: string
    price: number
    stops: string[]
  }[]
}> {
  // Regional dishes database (in production, fetch from database)
  const regionalDishes: Record<string, string[]> = {
    'karnataka': ['Bisi Bele Bath', 'Mysore Pak', 'Ragi Mudde', 'Mangalore Buns', 'Coorg Pandi Curry'],
    'kerala': ['Appam', 'Kerala Sadya', 'Fish Moilee', 'Puttu', 'Banana Chips'],
    'tamil nadu': ['Chettinad Chicken', 'Idli', 'Dosa', 'Pongal', 'Filter Coffee'],
    'goa': ['Fish Curry Rice', 'Vindaloo', 'Bebinca', 'Xacuti', 'Sorpotel'],
    'maharashtra': ['Vada Pav', 'Misal Pav', 'Puran Poli', 'Modak', 'Pav Bhaji'],
  }
  
  const dishes = regionalDishes[region.toLowerCase()] || []
  
  // Get restaurants serving local cuisine
  const restaurants = await getFoodRecommendations(location, {
    cuisine: [region],
    radius: 5,
  })
  
  return {
    dishes,
    restaurants,
    foodTours: [], // Food tours would be fetched from database in production
  }
}

/**
 * Get food safety information for a restaurant
 * In production, this would integrate with food safety databases
 */
export async function getFoodSafetyInfo(restaurantId: string): Promise<{
  hygieneRating: number
  lastInspection: string
  certifications: string[]
  reviews: {
    cleanliness: number
    foodQuality: number
    service: number
  }
} | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  
  if (!apiKey) {
    console.warn('Google Maps API key not configured')
    return null
  }
  
  try {
    // Get place details including reviews
    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
    url.searchParams.append('place_id', restaurantId)
    url.searchParams.append('fields', 'reviews,rating')
    url.searchParams.append('key', apiKey)
    
    const response = await fetch(url.toString())
    const data = await response.json()
    
    if (data.status !== 'OK') {
      return null
    }
    
    const place = data.result
    
    // Analyze reviews for cleanliness, food quality, service
    const reviews = place.reviews || []
    let cleanlinessSum = 0
    let foodQualitySum = 0
    let serviceSum = 0
    let count = 0
    
    reviews.forEach((review: any) => {
      const text = review.text?.toLowerCase() || ''
      const rating = review.rating || 0
      
      // Simple keyword-based analysis (in production, use NLP)
      if (text.includes('clean') || text.includes('hygiene')) {
        cleanlinessSum += rating
        count++
      }
      if (text.includes('food') || text.includes('taste') || text.includes('delicious')) {
        foodQualitySum += rating
      }
      if (text.includes('service') || text.includes('staff')) {
        serviceSum += rating
      }
    })
    
    return {
      hygieneRating: place.rating || 0,
      lastInspection: 'Not available', // Would come from food safety database
      certifications: [], // Would come from food safety database
      reviews: {
        cleanliness: count > 0 ? cleanlinessSum / count : place.rating || 0,
        foodQuality: foodQualitySum > 0 ? foodQualitySum / reviews.length : place.rating || 0,
        service: serviceSum > 0 ? serviceSum / reviews.length : place.rating || 0,
      },
    }
  } catch (error) {
    console.error('Error getting food safety info:', error)
    return null
  }
}

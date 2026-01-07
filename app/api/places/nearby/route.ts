import { NextResponse } from 'next/server'
import { freeGeocodingService } from '@/lib/services/free-apis'

// Real places data for South Karnataka
const southKarnatakaPlaces = [
  {
    name: "Mysore Palace",
    type: "Heritage",
    description: "Magnificent royal palace with Indo-Saracenic architecture",
    lat: 12.3052,
    lng: 76.6551,
    rating: 4.7,
    category: "Historical Monument",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400"
  },
  {
    name: "Brindavan Gardens",
    type: "Garden",
    description: "Beautiful terraced gardens with musical fountain",
    lat: 12.4244,
    lng: 76.5693,
    rating: 4.5,
    category: "Garden",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400"
  },
  {
    name: "Chamundi Hills",
    type: "Temple",
    description: "Sacred hill with ancient Chamundeshwari Temple",
    lat: 12.2724,
    lng: 76.6730,
    rating: 4.6,
    category: "Religious Site",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400"
  },
  {
    name: "Abbey Falls",
    type: "Waterfall",
    description: "Scenic waterfall surrounded by coffee plantations",
    lat: 12.4516,
    lng: 75.7180,
    rating: 4.4,
    category: "Natural Wonder",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400"
  },
  {
    name: "Raja's Seat",
    type: "Viewpoint",
    description: "Sunset viewpoint with panoramic valley views",
    lat: 12.4200,
    lng: 75.7400,
    rating: 4.3,
    category: "Scenic Spot",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400"
  },
  {
    name: "Dubare Elephant Camp",
    type: "Wildlife",
    description: "Elephant training camp with river activities",
    lat: 12.4167,
    lng: 75.8833,
    rating: 4.2,
    category: "Wildlife Experience",
    image: "https://images.unsplash.com/photo-1549366021-9f761d040a94?w=400"
  },
  {
    name: "Virupaksha Temple",
    type: "Temple",
    description: "Ancient temple complex in UNESCO World Heritage site",
    lat: 15.3350,
    lng: 76.4600,
    rating: 4.8,
    category: "Historical Temple",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"
  },
  {
    name: "Hampi Bazaar",
    type: "Market",
    description: "Ancient market street with ruins and local crafts",
    lat: 15.3340,
    lng: 76.4610,
    rating: 4.5,
    category: "Historical Market",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"
  },
  {
    name: "Vittala Temple",
    type: "Temple",
    description: "Famous for its stone chariot and musical pillars",
    lat: 15.3350,
    lng: 76.4750,
    rating: 4.9,
    category: "Architectural Marvel",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"
  },
  {
    name: "Om Beach",
    type: "Beach",
    description: "Sacred beach shaped like the Om symbol",
    lat: 14.5492,
    lng: 74.3200,
    rating: 4.6,
    category: "Sacred Beach",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400"
  },
  {
    name: "Mahabaleshwar Temple",
    type: "Temple",
    description: "Ancient Shiva temple with spiritual significance",
    lat: 14.5500,
    lng: 74.3190,
    rating: 4.7,
    category: "Sacred Temple",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400"
  },
  {
    name: "Kudle Beach",
    type: "Beach",
    description: "Pristine beach perfect for relaxation and sunset views",
    lat: 14.5480,
    lng: 74.3180,
    rating: 4.4,
    category: "Beach",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400"
  },
  {
    name: "Mullayanagiri Peak",
    type: "Mountain",
    description: "Highest peak in Karnataka with panoramic views",
    lat: 13.3900,
    lng: 75.7200,
    rating: 4.8,
    category: "Mountain Peak",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400"
  },
  {
    name: "Hebbe Falls",
    type: "Waterfall",
    description: "Beautiful waterfall accessible through coffee estates",
    lat: 13.4167,
    lng: 75.7000,
    rating: 4.5,
    category: "Waterfall",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400"
  },
  {
    name: "Baba Budangiri",
    type: "Mountain",
    description: "Sacred mountain range with caves and coffee history",
    lat: 13.4167,
    lng: 75.7667,
    rating: 4.6,
    category: "Sacred Mountain",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400"
  }
]

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c // Distance in kilometers
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const radius = searchParams.get('radius') ? Number(searchParams.get('radius')) : 50 // Default 50km
    const category = searchParams.get('category')
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 10

    if (!lat || !lng) {
      return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 })
    }

    const userLat = parseFloat(lat)
    const userLng = parseFloat(lng)

    // Filter places by distance and category
    let nearbyPlaces = southKarnatakaPlaces
      .map(place => ({
        ...place,
        distance: calculateDistance(userLat, userLng, place.lat, place.lng)
      }))
      .filter(place => place.distance <= radius)
      .sort((a, b) => a.distance - b.distance)

    // Filter by category if specified
    if (category && category !== 'all') {
      nearbyPlaces = nearbyPlaces.filter(place => 
        place.category.toLowerCase().includes(category.toLowerCase()) ||
        place.type.toLowerCase().includes(category.toLowerCase())
      )
    }

    // Limit results
    nearbyPlaces = nearbyPlaces.slice(0, limit)

    // Add additional details for each place
    const enrichedPlaces = nearbyPlaces.map(place => ({
      ...place,
      distanceText: `${place.distance.toFixed(1)} km away`,
      estimatedTravelTime: `${Math.ceil(place.distance / 40)} hours`, // Assuming 40 km/h average speed
      coordinates: {
        lat: place.lat,
        lng: place.lng
      }
    }))

    return NextResponse.json({
      success: true,
      places: enrichedPlaces,
      count: enrichedPlaces.length,
      searchCenter: {
        lat: userLat,
        lng: userLng
      },
      searchRadius: radius
    })

  } catch (error: any) {
    console.error('Error fetching nearby places:', error)
    return NextResponse.json(
      { error: 'Failed to fetch nearby places', details: error.message },
      { status: 500 }
    )
  }
}
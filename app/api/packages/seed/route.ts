import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

// Real South Karnataka travel packages data
const realPackages = [
  {
    name: "Mysore Palace & Gardens Heritage Tour",
    slug: "mysore-palace-heritage-tour",
    description: "Explore the magnificent Mysore Palace, Brindavan Gardens, and Chamundi Hills in this 3-day cultural journey through Karnataka's royal heritage.",
    duration_days: 3,
    base_price: 8500,
    discounted_price: 7650,
    discount_percentage: 10,
    category: "Heritage & Culture",
    difficulty_level: "Easy",
    group_size_min: 2,
    group_size_max: 15,
    is_popular: true,
    tags: ["Palace", "Heritage", "Culture", "Gardens", "Royal History"],
    inclusions: ["Accommodation", "Breakfast", "Guide", "Entry Tickets", "Transport"],
    exclusions: ["Lunch", "Dinner", "Personal Expenses"],
    highlights: [
      "Mysore Palace illumination tour",
      "Brindavan Gardens musical fountain",
      "Chamundi Hills temple visit",
      "Traditional silk weaving demonstration"
    ],
    itinerary: {
      "Day 1": "Arrival in Mysore, Palace tour, Local market visit",
      "Day 2": "Brindavan Gardens, Chamundi Hills, Silk factory",
      "Day 3": "Srirangapatna, Departure"
    },
    status: "live",
    total_bookings: 156,
    average_rating: 4.7,
    image_url: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800",
    location: "Mysore, Karnataka"
  },
  {
    name: "Coorg Coffee Plantation Experience",
    slug: "coorg-coffee-plantation-experience",
    description: "Immerse yourself in the aromatic world of coffee plantations, misty hills, and local Kodava culture in Scotland of India.",
    duration_days: 4,
    base_price: 12000,
    discounted_price: 10800,
    discount_percentage: 10,
    category: "Nature & Adventure",
    difficulty_level: "Moderate",
    group_size_min: 2,
    group_size_max: 12,
    is_popular: true,
    tags: ["Coffee", "Plantations", "Hills", "Nature", "Adventure"],
    inclusions: ["Accommodation", "All Meals", "Coffee Tasting", "Plantation Tours", "Transport"],
    exclusions: ["Personal Expenses", "Shopping"],
    highlights: [
      "Coffee plantation walk and tasting",
      "Abbey Falls trek",
      "Raja's Seat sunset viewing",
      "Traditional Kodava cuisine"
    ],
    itinerary: {
      "Day 1": "Arrival in Coorg, Coffee plantation tour",
      "Day 2": "Abbey Falls trek, Dubare Elephant Camp",
      "Day 3": "Raja's Seat, Omkareshwara Temple, Local market",
      "Day 4": "Talacauvery visit, Departure"
    },
    status: "live",
    total_bookings: 203,
    average_rating: 4.8,
    image_url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
    location: "Coorg, Karnataka"
  },
  {
    name: "Hampi UNESCO World Heritage Adventure",
    slug: "hampi-unesco-heritage-adventure",
    description: "Discover the ruins of the Vijayanagara Empire, ancient temples, and boulder landscapes in this archaeological wonder.",
    duration_days: 3,
    base_price: 9500,
    discounted_price: 8550,
    discount_percentage: 10,
    category: "Heritage & Adventure",
    difficulty_level: "Moderate",
    group_size_min: 2,
    group_size_max: 20,
    is_popular: true,
    tags: ["UNESCO", "Heritage", "Temples", "History", "Adventure"],
    inclusions: ["Accommodation", "Breakfast", "Guide", "Entry Tickets", "Bicycle Rental"],
    exclusions: ["Lunch", "Dinner", "Personal Expenses"],
    highlights: [
      "Virupaksha Temple complex",
      "Hampi Bazaar exploration",
      "Coracle ride on Tungabhadra",
      "Sunset at Hemakuta Hills"
    ],
    itinerary: {
      "Day 1": "Arrival, Virupaksha Temple, Hampi Bazaar",
      "Day 2": "Royal Enclosure, Lotus Mahal, Elephant Stables",
      "Day 3": "Vittala Temple, Coracle ride, Departure"
    },
    status: "live",
    total_bookings: 189,
    average_rating: 4.6,
    image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
    location: "Hampi, Karnataka"
  },
  {
    name: "Gokarna Beach & Temple Retreat",
    slug: "gokarna-beach-temple-retreat",
    description: "Combine spiritual experiences with pristine beaches in this coastal Karnataka gem, perfect for relaxation and rejuvenation.",
    duration_days: 4,
    base_price: 11000,
    discounted_price: 9900,
    discount_percentage: 10,
    category: "Beach & Spiritual",
    difficulty_level: "Easy",
    group_size_min: 2,
    group_size_max: 16,
    is_popular: false,
    tags: ["Beach", "Temple", "Spiritual", "Relaxation", "Coastal"],
    inclusions: ["Beach Resort Stay", "Breakfast", "Temple Tours", "Beach Activities"],
    exclusions: ["Lunch", "Dinner", "Water Sports", "Personal Expenses"],
    highlights: [
      "Mahabaleshwar Temple darshan",
      "Om Beach sunset viewing",
      "Kudle Beach relaxation",
      "Half Moon Beach trek"
    ],
    itinerary: {
      "Day 1": "Arrival, Mahabaleshwar Temple, Gokarna Beach",
      "Day 2": "Om Beach, Kudle Beach, Beach activities",
      "Day 3": "Half Moon Beach trek, Paradise Beach",
      "Day 4": "Morning prayers, Departure"
    },
    status: "live",
    total_bookings: 87,
    average_rating: 4.5,
    image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    location: "Gokarna, Karnataka"
  },
  {
    name: "Chikmagalur Hill Station & Coffee Trail",
    slug: "chikmagalur-hill-station-coffee-trail",
    description: "Experience the birthplace of Indian coffee with scenic hill stations, waterfalls, and aromatic coffee estates.",
    duration_days: 3,
    base_price: 10500,
    discounted_price: 9450,
    discount_percentage: 10,
    category: "Hill Station & Nature",
    difficulty_level: "Moderate",
    group_size_min: 2,
    group_size_max: 14,
    is_popular: true,
    tags: ["Hill Station", "Coffee", "Waterfalls", "Nature", "Trekking"],
    inclusions: ["Hill Resort Stay", "All Meals", "Coffee Estate Tours", "Waterfall Visits"],
    exclusions: ["Personal Expenses", "Adventure Activities"],
    highlights: [
      "Mullayanagiri peak trek",
      "Hebbe Falls visit",
      "Coffee estate walk and tasting",
      "Baba Budangiri caves"
    ],
    itinerary: {
      "Day 1": "Arrival, Coffee estate tour, Local sightseeing",
      "Day 2": "Mullayanagiri trek, Hebbe Falls",
      "Day 3": "Baba Budangiri, Coffee tasting, Departure"
    },
    status: "live",
    total_bookings: 134,
    average_rating: 4.7,
    image_url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800",
    location: "Chikmagalur, Karnataka"
  },
  {
    name: "Bandipur Wildlife Safari Adventure",
    slug: "bandipur-wildlife-safari-adventure",
    description: "Spot tigers, elephants, and diverse wildlife in one of India's premier national parks with expert naturalist guides.",
    duration_days: 2,
    base_price: 7500,
    discounted_price: 6750,
    discount_percentage: 10,
    category: "Wildlife & Adventure",
    difficulty_level: "Easy",
    group_size_min: 4,
    group_size_max: 18,
    is_popular: true,
    tags: ["Wildlife", "Safari", "Tigers", "Elephants", "National Park"],
    inclusions: ["Forest Lodge Stay", "All Meals", "Safari Rides", "Naturalist Guide"],
    exclusions: ["Personal Expenses", "Camera Fees"],
    highlights: [
      "Morning and evening safaris",
      "Tiger and elephant spotting",
      "Bird watching sessions",
      "Nature photography opportunities"
    ],
    itinerary: {
      "Day 1": "Arrival, Evening safari, Wildlife briefing",
      "Day 2": "Morning safari, Nature walk, Departure"
    },
    status: "live",
    total_bookings: 167,
    average_rating: 4.6,
    image_url: "https://images.unsplash.com/photo-1549366021-9f761d040a94?w=800",
    location: "Bandipur, Karnataka"
  }
]

export async function POST() {
  try {
    const supabase = await getSupabaseServerClient()
    
    // First, create destinations if they don't exist
    const destinations = [
      {
        name: "Mysore",
        slug: "mysore",
        state: "Karnataka",
        region: "South Karnataka",
        description: "The cultural capital of Karnataka, known for its royal heritage and magnificent palace.",
        latitude: 12.2958,
        longitude: 76.6394,
        image_url: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800",
        is_active: true,
        hidden_gem_score: 7,
        popularity_score: 9
      },
      {
        name: "Coorg",
        slug: "coorg",
        state: "Karnataka", 
        region: "South Karnataka",
        description: "Scotland of India, famous for coffee plantations and misty hills.",
        latitude: 12.3375,
        longitude: 75.8069,
        image_url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
        is_active: true,
        hidden_gem_score: 8,
        popularity_score: 9
      },
      {
        name: "Hampi",
        slug: "hampi",
        state: "Karnataka",
        region: "North Karnataka", 
        description: "UNESCO World Heritage Site with ancient Vijayanagara Empire ruins.",
        latitude: 15.3350,
        longitude: 76.4600,
        image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
        is_active: true,
        hidden_gem_score: 9,
        popularity_score: 8
      },
      {
        name: "Gokarna",
        slug: "gokarna",
        state: "Karnataka",
        region: "Coastal Karnataka",
        description: "Sacred town with pristine beaches and ancient temples.",
        latitude: 14.5492,
        longitude: 74.3200,
        image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
        is_active: true,
        hidden_gem_score: 8,
        popularity_score: 7
      },
      {
        name: "Chikmagalur",
        slug: "chikmagalur",
        state: "Karnataka",
        region: "South Karnataka",
        description: "Birthplace of Indian coffee with scenic hill stations and waterfalls.",
        latitude: 13.3161,
        longitude: 75.7720,
        image_url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800",
        is_active: true,
        hidden_gem_score: 8,
        popularity_score: 8
      },
      {
        name: "Bandipur",
        slug: "bandipur",
        state: "Karnataka",
        region: "South Karnataka",
        description: "Premier national park known for tigers, elephants and diverse wildlife.",
        latitude: 11.6840,
        longitude: 76.6413,
        image_url: "https://images.unsplash.com/photo-1549366021-9f761d040a94?w=800",
        is_active: true,
        hidden_gem_score: 7,
        popularity_score: 8
      }
    ]

    // Insert destinations
    const { data: insertedDestinations, error: destError } = await supabase
      .from('destinations')
      .upsert(destinations, { onConflict: 'slug' })
      .select()

    if (destError) {
      console.error('Error inserting destinations:', destError)
      return NextResponse.json({ error: 'Failed to create destinations' }, { status: 500 })
    }

    // Create a mapping of destination names to IDs
    const destinationMap = insertedDestinations.reduce((acc: any, dest: any) => {
      acc[dest.name] = dest.id
      return acc
    }, {})

    // Add destination_id to packages
    const packagesWithDestinations = realPackages.map(pkg => ({
      ...pkg,
      destination_id: destinationMap[pkg.location.split(',')[0]] || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))

    // Insert packages
    const { data: insertedPackages, error: pkgError } = await supabase
      .from('packages')
      .upsert(packagesWithDestinations, { onConflict: 'slug' })
      .select()

    if (pkgError) {
      console.error('Error inserting packages:', pkgError)
      return NextResponse.json({ error: 'Failed to create packages' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully created ${insertedDestinations.length} destinations and ${insertedPackages.length} packages`,
      destinations: insertedDestinations.length,
      packages: insertedPackages.length
    })

  } catch (error: any) {
    console.error('Error seeding data:', error)
    return NextResponse.json(
      { error: 'Failed to seed data', details: error.message },
      { status: 500 }
    )
  }
}
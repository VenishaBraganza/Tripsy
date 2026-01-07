import { NextRequest, NextResponse } from 'next/server'
import { freeAIService } from '@/lib/services/free-apis'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { preferences, destination, userHistory } = body

    // Build user preferences string
    let userPreferences = preferences || 'General travel interests'
    
    if (userHistory && userHistory.length > 0) {
      const destinations = userHistory.map((trip: any) => trip.destination).join(', ')
      userPreferences += `. Previous destinations: ${destinations}`
    }

    // Generate AI recommendation
    const recommendation = await freeAIService.generateTravelRecommendation(
      userPreferences,
      destination || 'South Karnataka'
    )

    return NextResponse.json({
      success: true,
      data: {
        recommendation,
        preferences: userPreferences,
        destination: destination || 'South Karnataka',
        generatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('AI Travel Insights API error:', error)
    
    // Fallback recommendations based on South Karnataka
    const fallbackRecommendations = [
      'Explore the magnificent Mysore Palace and its royal gardens during the cooler evening hours.',
      'Visit Coorg for coffee plantations and misty hill stations - best between October and March.',
      'Discover the ancient temples of Hampi, a UNESCO World Heritage site with stunning sunrise views.',
      'Experience the wildlife at Bandipur National Park - ideal for safari adventures.',
      'Enjoy the beaches of Gokarna for a peaceful retreat away from crowded tourist spots.'
    ]
    
    const randomRecommendation = fallbackRecommendations[
      Math.floor(Math.random() * fallbackRecommendations.length)
    ]

    return NextResponse.json({
      success: true,
      data: {
        recommendation: randomRecommendation,
        preferences: 'Cultural heritage and natural beauty',
        destination: 'South Karnataka',
        generatedAt: new Date().toISOString(),
        fallback: true
      }
    })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const destination = searchParams.get('destination') || 'South Karnataka'
    
    // Generate a quick recommendation
    const recommendation = await freeAIService.generateTravelRecommendation(
      'Interested in cultural heritage, nature, and local experiences',
      destination
    )

    return NextResponse.json({
      success: true,
      data: {
        recommendation,
        destination,
        generatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('AI Travel Insights API error:', error)
    
    return NextResponse.json({
      success: true,
      data: {
        recommendation: 'South Karnataka offers incredible diversity - from the royal heritage of Mysore to the coffee estates of Coorg, ancient ruins of Hampi, and pristine beaches of Gokarna. Plan your visit during October to March for the best weather.',
        destination: 'South Karnataka',
        generatedAt: new Date().toISOString(),
        fallback: true
      }
    })
  }
}
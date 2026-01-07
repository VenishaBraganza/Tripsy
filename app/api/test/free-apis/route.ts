import { NextResponse } from 'next/server'
import { freeWeatherService, freeGeocodingService, freeAIService } from '@/lib/services/free-apis'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const service = searchParams.get('service')

  try {
    switch (service) {
      case 'weather':
        // Test weather for Bangalore
        const weather = await freeWeatherService.getWeatherForLocation(12.9716, 77.5946)
        return NextResponse.json({
          success: true,
          service: 'OpenWeatherMap (FREE)',
          data: weather
        })

      case 'geocoding':
        // Test geocoding for a sample address
        const location = await freeGeocodingService.geocodeAddress('Bangalore, Karnataka, India')
        return NextResponse.json({
          success: true,
          service: 'Nominatim/OpenStreetMap (FREE)',
          data: location
        })

      case 'ai':
        // Test AI recommendation
        const recommendation = await freeAIService.generateTravelRecommendation(
          'adventure, nature, photography',
          'Coorg, Karnataka'
        )
        return NextResponse.json({
          success: true,
          service: 'Hugging Face (FREE)',
          data: { recommendation }
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid service. Use: weather, geocoding, or ai'
        })
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    })
  }
}
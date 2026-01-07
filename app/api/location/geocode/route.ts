import { NextRequest, NextResponse } from 'next/server'
import { freeGeocodingService } from '@/lib/services/free-apis'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')

    if (address) {
      // Forward geocoding (address to coordinates)
      const result = await freeGeocodingService.geocodeAddress(address)
      
      return NextResponse.json({
        success: true,
        data: {
          type: 'forward',
          query: address,
          result
        }
      })
    } else if (lat && lng) {
      // Reverse geocoding (coordinates to address)
      const latitude = parseFloat(lat)
      const longitude = parseFloat(lng)
      
      const result = await freeGeocodingService.reverseGeocode(latitude, longitude)
      
      return NextResponse.json({
        success: true,
        data: {
          type: 'reverse',
          query: { lat: latitude, lng: longitude },
          result
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Please provide either an address or lat/lng coordinates'
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Geocoding API error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to geocode location',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { freeWeatherService, freeGeocodingService } from '@/lib/services/free-apis'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const location = searchParams.get('location')

    let latitude: number
    let longitude: number

    if (lat && lng) {
      latitude = parseFloat(lat)
      longitude = parseFloat(lng)
    } else if (location) {
      // Geocode the location
      const geocoded = await freeGeocodingService.geocodeAddress(location)
      latitude = geocoded.lat
      longitude = geocoded.lng
    } else {
      // Default to Bangalore
      latitude = 12.9716
      longitude = 77.5946
    }

    // Get current weather
    const weather = await freeWeatherService.getWeatherForLocation(latitude, longitude)
    
    // Get 5-day forecast
    const forecast = await freeWeatherService.getForecast(latitude, longitude, 5)

    // Get location name if not provided
    let locationName = location
    if (!locationName) {
      try {
        const locationInfo = await freeGeocodingService.reverseGeocode(latitude, longitude)
        locationName = locationInfo.city || locationInfo.formattedAddress
      } catch (error) {
        locationName = 'Unknown Location'
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        current: {
          ...weather,
          locationName,
          coordinates: { lat: latitude, lng: longitude }
        },
        forecast: forecast.slice(0, 5), // Next 5 forecasts
        lastUpdated: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Weather API error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch weather data',
      data: {
        current: {
          temperature: 28,
          description: 'Partly Cloudy',
          humidity: 65,
          windSpeed: 12,
          locationName: 'Bangalore',
          coordinates: { lat: 12.9716, lng: 77.5946 }
        },
        forecast: [],
        lastUpdated: new Date().toISOString()
      }
    }, { status: 500 })
  }
}
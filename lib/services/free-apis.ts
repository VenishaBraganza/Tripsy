// FREE API Services - No cost alternatives
import { ErrorHandler } from '@/lib/errors/error-handler'

// ==============================================
// FREE WEATHER SERVICE (OpenWeatherMap)
// ==============================================
export class FreeWeatherService {
  private apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY

  async getWeatherForLocation(lat: number, lon: number) {
    if (!this.apiKey || this.apiKey === 'your_openweather_api_key_here') {
      throw new Error('OpenWeatherMap API key not configured')
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
      )

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        icon: data.weather[0].icon,
        location: data.name
      }
    } catch (error) {
      console.error('Weather API error:', error)
      throw ErrorHandler.handleError(error as Error, 'EXTERNAL_API_ERROR')
    }
  }

  async getForecast(lat: number, lon: number, days: number = 5) {
    if (!this.apiKey) {
      throw new Error('OpenWeatherMap API key not configured')
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&cnt=${days * 8}`
      )

      if (!response.ok) {
        throw new Error(`Forecast API error: ${response.statusText}`)
      }

      const data = await response.json()
      
      return data.list.map((item: any) => ({
        date: new Date(item.dt * 1000),
        temperature: Math.round(item.main.temp),
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        humidity: item.main.humidity
      }))
    } catch (error) {
      console.error('Forecast API error:', error)
      throw ErrorHandler.handleError(error as Error, 'EXTERNAL_API_ERROR')
    }
  }
}

// ==============================================
// FREE GEOCODING SERVICE (Nominatim/OpenStreetMap)
// ==============================================
export class FreeGeocodingService {
  private baseUrl = 'https://nominatim.openstreetmap.org'

  async geocodeAddress(address: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        {
          headers: {
            'User-Agent': 'Tripsy Travel App (contact@tripsy.com)' // Required by Nominatim
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Geocoding error: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.length === 0) {
        throw new Error('Address not found')
      }

      const result = data[0]
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        formattedAddress: result.display_name,
        placeId: result.place_id
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      throw ErrorHandler.handleError(error as Error, 'EXTERNAL_API_ERROR')
    }
  }

  async reverseGeocode(lat: number, lng: number) {
    try {
      const response = await fetch(
        `${this.baseUrl}/reverse?format=json&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'User-Agent': 'Tripsy Travel App (contact@tripsy.com)'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Reverse geocoding error: ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        formattedAddress: data.display_name,
        city: data.address?.city || data.address?.town || data.address?.village,
        state: data.address?.state,
        country: data.address?.country,
        postcode: data.address?.postcode
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      throw ErrorHandler.handleError(error as Error, 'EXTERNAL_API_ERROR')
    }
  }
}

// ==============================================
// FREE AI SERVICE (Hugging Face)
// ==============================================
export class FreeAIService {
  private apiKey = process.env.HUGGINGFACE_API_KEY
  private baseUrl = 'https://api-inference.huggingface.co/models'

  async generateTravelRecommendation(userPreferences: string, destination: string) {
    if (!this.apiKey || this.apiKey === 'your_huggingface_token_here') {
      // Fallback to rule-based recommendations
      return this.getRuleBasedRecommendation(userPreferences, destination)
    }

    try {
      const prompt = `Generate a travel recommendation for ${destination} based on these preferences: ${userPreferences}. Include activities, best time to visit, and local tips.`
      
      const response = await fetch(`${this.baseUrl}/microsoft/DialoGPT-medium`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 200,
            temperature: 0.7
          }
        })
      })

      if (!response.ok) {
        throw new Error(`AI API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data[0]?.generated_text || this.getRuleBasedRecommendation(userPreferences, destination)
    } catch (error) {
      console.error('AI API error:', error)
      // Fallback to rule-based recommendations
      return this.getRuleBasedRecommendation(userPreferences, destination)
    }
  }

  private getRuleBasedRecommendation(preferences: string, destination: string) {
    // Simple rule-based fallback
    const recommendations = [
      `${destination} offers great experiences for travelers interested in ${preferences}.`,
      `Best time to visit ${destination} is during the cooler months.`,
      `Don't miss the local cuisine and cultural attractions in ${destination}.`,
      `Consider visiting nearby hidden gems around ${destination}.`
    ]

    return recommendations.join(' ')
  }
}

// ==============================================
// FREE MAP TILES SERVICE (OpenStreetMap)
// ==============================================
export class FreeMapService {
  // OpenStreetMap tiles - completely free
  getTileUrl(z: number, x: number, y: number) {
    return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`
  }

  // Alternative: MapTiler free tier
  getMapTilerUrl(z: number, x: number, y: number) {
    const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY
    if (!apiKey || apiKey === 'your_maptiler_api_key_here') {
      return this.getTileUrl(z, x, y) // Fallback to OSM
    }
    return `https://api.maptiler.com/maps/streets-v2/${z}/${x}/${y}.png?key=${apiKey}`
  }
}

// Export service instances
export const freeWeatherService = new FreeWeatherService()
export const freeGeocodingService = new FreeGeocodingService()
export const freeAIService = new FreeAIService()
export const freeMapService = new FreeMapService()
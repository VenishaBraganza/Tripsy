"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function APITestPage() {
  const [tests, setTests] = useState({
    supabase: { status: 'idle', message: '' },
    googleMaps: { status: 'idle', message: '' },
    openWeather: { status: 'idle', message: '' },
    openAI: { status: 'idle', message: '' },
    freeGeocoding: { status: 'idle', message: '' },
    freeAI: { status: 'idle', message: '' },
    realtimeWeather: { status: 'idle', message: '' },
    locationAPI: { status: 'idle', message: '' },
    aiInsights: { status: 'idle', message: '' },
    dataStatus: { status: 'idle', message: '' },
    nearbyPlaces: { status: 'idle', message: '' }
  })
  
  const [dataStatus, setDataStatus] = useState<any>(null)

  const updateTest = (api: string, status: string, message: string) => {
    setTests(prev => ({
      ...prev,
      [api]: { status, message }
    }))
  }

  const testSupabase = async () => {
    updateTest('supabase', 'testing', 'Testing connection...')
    try {
      const response = await fetch('/api/test/supabase')
      const data = await response.json()
      if (data.success) {
        updateTest('supabase', 'success', `Connected! ${data.message}`)
      } else {
        updateTest('supabase', 'error', data.error)
      }
    } catch (error: any) {
      updateTest('supabase', 'error', error.message)
    }
  }

  const testGoogleMaps = async () => {
    updateTest('googleMaps', 'testing', 'Testing API key...')
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
        updateTest('googleMaps', 'error', 'API key not configured')
        return
      }
      
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=Bangalore&key=${apiKey}`)
      const data = await response.json()
      
      if (data.status === 'OK') {
        updateTest('googleMaps', 'success', 'API key working!')
      } else {
        updateTest('googleMaps', 'error', `API Error: ${data.status}`)
      }
    } catch (error: any) {
      updateTest('googleMaps', 'error', error.message)
    }
  }

  const testOpenWeather = async () => {
    updateTest('openWeather', 'testing', 'Testing FREE weather API...')
    try {
      const response = await fetch('/api/test/free-apis?service=weather')
      const data = await response.json()
      
      if (data.success) {
        updateTest('openWeather', 'success', `FREE Weather API working! Temp: ${data.data.temperature}°C, ${data.data.description}`)
      } else {
        updateTest('openWeather', 'error', data.error)
      }
    } catch (error: any) {
      updateTest('openWeather', 'error', error.message)
    }
  }

  const testOpenAI = async () => {
    updateTest('openAI', 'testing', 'Testing API key...')
    try {
      const response = await fetch('/api/test/openai')
      const data = await response.json()
      if (data.success) {
        updateTest('openAI', 'success', 'OpenAI API working!')
      } else {
        updateTest('openAI', 'error', data.error)
      }
    } catch (error: any) {
      updateTest('openAI', 'error', error.message)
    }
  }

  const testFreeGeocoding = async () => {
    updateTest('freeGeocoding', 'testing', 'Testing FREE geocoding...')
    try {
      const response = await fetch('/api/test/free-apis?service=geocoding')
      const data = await response.json()
      
      if (data.success) {
        updateTest('freeGeocoding', 'success', `FREE Geocoding working! Found: ${data.data.formattedAddress.substring(0, 50)}...`)
      } else {
        updateTest('freeGeocoding', 'error', data.error)
      }
    } catch (error: any) {
      updateTest('freeGeocoding', 'error', error.message)
    }
  }

  const testFreeAI = async () => {
    updateTest('freeAI', 'testing', 'Testing FREE AI...')
    try {
      const response = await fetch('/api/test/free-apis?service=ai')
      const data = await response.json()
      
      if (data.success) {
        updateTest('freeAI', 'success', 'FREE AI working! Generated travel recommendation.')
      } else {
        updateTest('freeAI', 'error', data.error)
      }
    } catch (error: any) {
      updateTest('freeAI', 'error', error.message)
    }
  }

  const testRealtimeWeather = async () => {
    updateTest('realtimeWeather', 'testing', 'Testing real-time weather API...')
    try {
      const response = await fetch('/api/weather?location=Bangalore')
      const data = await response.json()
      
      if (data.success) {
        const weather = data.data.current
        updateTest('realtimeWeather', 'success', `Real-time weather: ${weather.temperature}°C, ${weather.description} in ${weather.locationName}`)
      } else {
        updateTest('realtimeWeather', 'error', data.error)
      }
    } catch (error: any) {
      updateTest('realtimeWeather', 'error', error.message)
    }
  }

  const testLocationAPI = async () => {
    updateTest('locationAPI', 'testing', 'Testing location geocoding API...')
    try {
      const response = await fetch('/api/location/geocode?address=Mysore, Karnataka')
      const data = await response.json()
      
      if (data.success) {
        const result = data.data.result
        updateTest('locationAPI', 'success', `Geocoded: ${result.formattedAddress.substring(0, 50)}... (${result.lat}, ${result.lng})`)
      } else {
        updateTest('locationAPI', 'error', data.error)
      }
    } catch (error: any) {
      updateTest('locationAPI', 'error', error.message)
    }
  }

  const testAIInsights = async () => {
    updateTest('aiInsights', 'testing', 'Testing AI travel insights API...')
    try {
      const response = await fetch('/api/ai/travel-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: 'South Karnataka',
          preferences: 'Cultural heritage and nature'
        })
      })
      const data = await response.json()
      
      if (data.success) {
        updateTest('aiInsights', 'success', `AI Insights: ${data.data.recommendation.substring(0, 80)}...`)
      } else {
        updateTest('aiInsights', 'error', data.error)
      }
    } catch (error: any) {
      updateTest('aiInsights', 'error', error.message)
    }
  }

  const testDataStatus = async () => {
    updateTest('dataStatus', 'testing', 'Checking database data status...')
    try {
      const response = await fetch('/api/data/status')
      const data = await response.json()
      
      if (data.success) {
        setDataStatus(data)
        const { counts, hasRealData } = data
        const realDataCount = Object.values(hasRealData).filter(Boolean).length
        updateTest('dataStatus', 'success', 
          `Database Status: ${realDataCount}/4 tables have data. Destinations: ${counts.destinations}, Packages: ${counts.packages}, Trips: ${counts.trips}, Bookings: ${counts.bookings}`
        )
      } else {
        updateTest('dataStatus', 'error', data.error)
      }
    } catch (error: any) {
      updateTest('dataStatus', 'error', error.message)
    }
  }

  const testNearbyPlaces = async () => {
    updateTest('nearbyPlaces', 'testing', 'Testing nearby places API...')
    try {
      const response = await fetch('/api/places/nearby?lat=12.9716&lng=77.5946&category=attraction&limit=5')
      const data = await response.json()
      
      if (data.success) {
        updateTest('nearbyPlaces', 'success', `Found ${data.places.length} nearby places: ${data.places.map((p: any) => p.name).slice(0, 2).join(', ')}...`)
      } else {
        updateTest('nearbyPlaces', 'error', data.error)
      }
    } catch (error: any) {
      updateTest('nearbyPlaces', 'error', error.message)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'testing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Connected</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>
      case 'testing':
        return <Badge className="bg-blue-100 text-blue-800">Testing...</Badge>
      default:
        return <Badge variant="outline">Not Tested</Badge>
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">API Connection Test</h1>
        <p className="text-muted-foreground">
          Test your API connections to ensure everything is configured correctly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Supabase Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Supabase Database</span>
              {getStatusIcon(tests.supabase.status)}
            </CardTitle>
            {getStatusBadge(tests.supabase.status)}
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Tests database connection and authentication
            </p>
            <Button 
              onClick={testSupabase} 
              disabled={tests.supabase.status === 'testing'}
              className="w-full mb-2"
            >
              Test Supabase
            </Button>
            {tests.supabase.message && (
              <p className={`text-sm ${tests.supabase.status === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                {tests.supabase.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Google Maps Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Google Maps API</span>
              {getStatusIcon(tests.googleMaps.status)}
            </CardTitle>
            {getStatusBadge(tests.googleMaps.status)}
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Tests geocoding and maps functionality
            </p>
            <Button 
              onClick={testGoogleMaps} 
              disabled={tests.googleMaps.status === 'testing'}
              className="w-full mb-2"
            >
              Test Google Maps
            </Button>
            {tests.googleMaps.message && (
              <p className={`text-sm ${tests.googleMaps.status === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                {tests.googleMaps.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* FREE Weather Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>FREE Weather API</span>
              {getStatusIcon(tests.openWeather.status)}
            </CardTitle>
            {getStatusBadge(tests.openWeather.status)}
            <Badge className="bg-green-100 text-green-800 text-xs">100% FREE</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              OpenWeatherMap - 1,000 calls/day FREE
            </p>
            <Button 
              onClick={testOpenWeather} 
              disabled={tests.openWeather.status === 'testing'}
              className="w-full mb-2"
            >
              Test FREE Weather
            </Button>
            {tests.openWeather.message && (
              <p className={`text-sm ${tests.openWeather.status === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                {tests.openWeather.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* OpenAI Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>OpenAI API (PAID)</span>
              {getStatusIcon(tests.openAI.status)}
            </CardTitle>
            {getStatusBadge(tests.openAI.status)}
            <Badge className="bg-yellow-100 text-yellow-800 text-xs">$5-20/month</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Tests AI recommendations functionality
            </p>
            <Button 
              onClick={testOpenAI} 
              disabled={tests.openAI.status === 'testing'}
              className="w-full mb-2"
            >
              Test OpenAI
            </Button>
            {tests.openAI.message && (
              <p className={`text-sm ${tests.openAI.status === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                {tests.openAI.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* FREE Geocoding Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>FREE Geocoding</span>
              {getStatusIcon(tests.freeGeocoding.status)}
            </CardTitle>
            {getStatusBadge(tests.freeGeocoding.status)}
            <Badge className="bg-green-100 text-green-800 text-xs">100% FREE</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              OpenStreetMap Nominatim - Unlimited FREE
            </p>
            <Button 
              onClick={testFreeGeocoding} 
              disabled={tests.freeGeocoding.status === 'testing'}
              className="w-full mb-2"
            >
              Test FREE Geocoding
            </Button>
            {tests.freeGeocoding.message && (
              <p className={`text-sm ${tests.freeGeocoding.status === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                {tests.freeGeocoding.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* FREE AI Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>FREE AI Service</span>
              {getStatusIcon(tests.freeAI.status)}
            </CardTitle>
            {getStatusBadge(tests.freeAI.status)}
            <Badge className="bg-green-100 text-green-800 text-xs">100% FREE</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Hugging Face + Rule-based fallback
            </p>
            <Button 
              onClick={testFreeAI} 
              disabled={tests.freeAI.status === 'testing'}
              className="w-full mb-2"
            >
              Test FREE AI
            </Button>
            {tests.freeAI.message && (
              <p className={`text-sm ${tests.freeAI.status === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                {tests.freeAI.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Real-time Weather API Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>🌐 Real-time Weather</span>
              {getStatusIcon(tests.realtimeWeather.status)}
            </CardTitle>
            {getStatusBadge(tests.realtimeWeather.status)}
            <Badge className="bg-blue-100 text-blue-800 text-xs">LIVE DATA</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Integrated weather API with location
            </p>
            <Button 
              onClick={testRealtimeWeather} 
              disabled={tests.realtimeWeather.status === 'testing'}
              className="w-full mb-2"
            >
              Test Live Weather
            </Button>
            {tests.realtimeWeather.message && (
              <p className={`text-sm ${tests.realtimeWeather.status === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                {tests.realtimeWeather.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Location API Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>📍 Location API</span>
              {getStatusIcon(tests.locationAPI.status)}
            </CardTitle>
            {getStatusBadge(tests.locationAPI.status)}
            <Badge className="bg-blue-100 text-blue-800 text-xs">LIVE DATA</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Geocoding and reverse geocoding
            </p>
            <Button 
              onClick={testLocationAPI} 
              disabled={tests.locationAPI.status === 'testing'}
              className="w-full mb-2"
            >
              Test Location API
            </Button>
            {tests.locationAPI.message && (
              <p className={`text-sm ${tests.locationAPI.status === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                {tests.locationAPI.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* AI Insights API Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>🤖 AI Travel Insights</span>
              {getStatusIcon(tests.aiInsights.status)}
            </CardTitle>
            {getStatusBadge(tests.aiInsights.status)}
            <Badge className="bg-purple-100 text-purple-800 text-xs">AI POWERED</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Personalized travel recommendations
            </p>
            <Button 
              onClick={testAIInsights} 
              disabled={tests.aiInsights.status === 'testing'}
              className="w-full mb-2"
            >
              Test AI Insights
            </Button>
            {tests.aiInsights.message && (
              <p className={`text-sm ${tests.aiInsights.status === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                {tests.aiInsights.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Database Data Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>🗄️ Database Data Status</span>
              {getStatusIcon(tests.dataStatus.status)}
            </CardTitle>
            {getStatusBadge(tests.dataStatus.status)}
            <Badge className="bg-indigo-100 text-indigo-800 text-xs">REAL DATA</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Check if database has real data vs dummy data
            </p>
            <Button 
              onClick={testDataStatus} 
              disabled={tests.dataStatus.status === 'testing'}
              className="w-full mb-2"
            >
              Check Data Status
            </Button>
            {tests.dataStatus.message && (
              <p className={`text-sm ${tests.dataStatus.status === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                {tests.dataStatus.message}
              </p>
            )}
            {dataStatus && (
              <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>Destinations: {dataStatus.counts.destinations}</div>
                  <div>Packages: {dataStatus.counts.packages}</div>
                  <div>Trips: {dataStatus.counts.trips}</div>
                  <div>Bookings: {dataStatus.counts.bookings}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Nearby Places API Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>📍 Nearby Places</span>
              {getStatusIcon(tests.nearbyPlaces.status)}
            </CardTitle>
            {getStatusBadge(tests.nearbyPlaces.status)}
            <Badge className="bg-green-100 text-green-800 text-xs">REAL PLACES</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Real South Karnataka attractions and places
            </p>
            <Button 
              onClick={testNearbyPlaces} 
              disabled={tests.nearbyPlaces.status === 'testing'}
              className="w-full mb-2"
            >
              Test Nearby Places
            </Button>
            {tests.nearbyPlaces.message && (
              <p className={`text-sm ${tests.nearbyPlaces.status === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                {tests.nearbyPlaces.message}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 text-center space-y-4">
        <div className="flex gap-4 justify-center">
          <Button 
            onClick={() => {
              testSupabase()
              testOpenWeather()
              testFreeGeocoding()
              testFreeAI()
              testRealtimeWeather()
              testLocationAPI()
              testAIInsights()
              testDataStatus()
              testNearbyPlaces()
            }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
          >
            🚀 Test All APIs
          </Button>
          
          <Button 
            onClick={async () => {
              try {
                // Seed real package data
                const packagesResponse = await fetch('/api/packages/seed', { method: 'POST' })
                const packagesData = await packagesResponse.json()
                
                // Seed real user data
                const userResponse = await fetch('/api/users/seed', { method: 'POST' })
                const userData = await userResponse.json()
                
                if (packagesData.success && userData.success) {
                  alert('✅ Real data loaded successfully! Refresh the dashboard to see changes.')
                } else {
                  alert('⚠️ Some data failed to load. Check console for details.')
                }
              } catch (error) {
                console.error('Error seeding data:', error)
                alert('❌ Failed to load real data. Check console for details.')
              }
            }}
            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-8 py-3"
          >
            🌱 Load Real Data
          </Button>
        </div>
        
        <p className="text-sm text-gray-600">
          Use "Load Real Data" to replace dummy data with realistic South Karnataka travel information
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold mb-2 text-green-800">🆓 FREE API Setup Guide:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-green-700">
            <li><strong>OpenWeatherMap:</strong> Sign up at openweathermap.org (1,000 calls/day FREE)</li>
            <li><strong>Nominatim:</strong> No signup needed - completely FREE geocoding</li>
            <li><strong>Hugging Face:</strong> Sign up at huggingface.co (FREE AI models)</li>
            <li><strong>MapTiler:</strong> Sign up at maptiler.com (100,000 map loads/month FREE)</li>
          </ol>
          <div className="mt-3 p-2 bg-green-100 rounded text-xs text-green-800">
            💡 <strong>Total Cost:</strong> $0/month for all FREE services!
          </div>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold mb-2 text-blue-800">🌐 Real-time Integration Features:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
            <li><strong>Live Weather:</strong> Auto-refreshes every 10 minutes with current conditions</li>
            <li><strong>GPS Location:</strong> Automatically detects user location for personalized data</li>
            <li><strong>AI Insights:</strong> Generates personalized travel recommendations based on history</li>
            <li><strong>Real-time Updates:</strong> Dashboard shows live status indicators and timestamps</li>
            <li><strong>Fallback Systems:</strong> Graceful degradation when APIs are unavailable</li>
          </ul>
        </div>

        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="font-semibold mb-2 text-purple-800">🚀 API Endpoints Created:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-purple-700">
            <div><code>/api/weather</code> - Real-time weather data</div>
            <div><code>/api/location/geocode</code> - Address ↔ Coordinates</div>
            <div><code>/api/ai/travel-insights</code> - AI recommendations</div>
            <div><code>/api/test/free-apis</code> - API testing endpoint</div>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Mountain, 
  Utensils, 
  Camera, 
  Plane, 
  Heart, 
  Users, 
  Backpack, 
  MapPin,
  Compass,
  TreePine
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

const personas = [
  {
    id: 'nature-lover',
    title: 'Nature Lover',
    description: 'Enjoys hiking, wildlife, and outdoor adventures',
    icon: TreePine,
    color: 'bg-green-100 text-green-700',
    tags: ['Hiking', 'Wildlife', 'National Parks', 'Camping']
  },
  {
    id: 'foodie',
    title: 'Foodie',
    description: 'Passionate about local cuisine and culinary experiences',
    icon: Utensils,
    color: 'bg-orange-100 text-orange-700',
    tags: ['Local Cuisine', 'Street Food', 'Fine Dining', 'Food Tours']
  },
  {
    id: 'photographer',
    title: 'Photographer',
    description: 'Seeks scenic spots and Instagram-worthy locations',
    icon: Camera,
    color: 'bg-purple-100 text-purple-700',
    tags: ['Scenic Views', 'Photography', 'Sunrise/Sunset', 'Landmarks']
  },
  {
    id: 'adventure-seeker',
    title: 'Adventure Seeker',
    description: 'Loves thrilling activities and extreme sports',
    icon: Mountain,
    color: 'bg-red-100 text-red-700',
    tags: ['Extreme Sports', 'Rock Climbing', 'Water Sports', 'Trekking']
  },
  {
    id: 'cultural-explorer',
    title: 'Cultural Explorer',
    description: 'Interested in history, museums, and local traditions',
    icon: Compass,
    color: 'bg-blue-100 text-blue-700',
    tags: ['Museums', 'Heritage Sites', 'Local Culture', 'Festivals']
  },
  {
    id: 'luxury-traveler',
    title: 'Luxury Traveler',
    description: 'Prefers premium experiences and comfort',
    icon: Plane,
    color: 'bg-yellow-100 text-yellow-700',
    tags: ['Luxury Hotels', 'Spa & Wellness', 'Fine Dining', 'Premium Tours']
  },
  {
    id: 'budget-backpacker',
    title: 'Budget Backpacker',
    description: 'Travels on a budget and loves authentic experiences',
    icon: Backpack,
    color: 'bg-indigo-100 text-indigo-700',
    tags: ['Hostels', 'Public Transport', 'Local Markets', 'Budget Eats']
  },
  {
    id: 'family-traveler',
    title: 'Family Traveler',
    description: 'Plans trips suitable for all family members',
    icon: Users,
    color: 'bg-pink-100 text-pink-700',
    tags: ['Kid-Friendly', 'Family Activities', 'Safe Destinations', 'Group Tours']
  },
  {
    id: 'romantic-couple',
    title: 'Romantic Couple',
    description: 'Seeks romantic getaways and couple experiences',
    icon: Heart,
    color: 'bg-rose-100 text-rose-700',
    tags: ['Romantic Dinners', 'Couple Spas', 'Scenic Walks', 'Honeymoon Spots']
  },
  {
    id: 'solo-explorer',
    title: 'Solo Explorer',
    description: 'Enjoys independent travel and self-discovery',
    icon: MapPin,
    color: 'bg-teal-100 text-teal-700',
    tags: ['Solo-Friendly', 'Safe Destinations', 'Hostels', 'Group Activities']
  }
]

export function PersonaSelection() {
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handlePersonaToggle = (personaId: string) => {
    setSelectedPersonas(prev => 
      prev.includes(personaId)
        ? prev.filter(id => id !== personaId)
        : [...prev, personaId]
    )
  }

  const handleSkip = async () => {
    setLoading(true)
    
    try {
      console.log('Starting skip process...')
      
      const response = await fetch('/api/persona', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('API error:', data.error)
        toast({
          title: "Error",
          description: `Failed to complete onboarding: ${data.error}`,
          variant: "destructive",
        })
        return
      }

      console.log('Onboarding marked as complete, redirecting to dashboard')
      toast({
        title: "Welcome to Tripsy!",
        description: "You can set your travel preferences later in settings.",
      })
      
      // Immediate redirect to dashboard
      router.push('/dashboard')
      router.refresh() // Force refresh to update any cached data
    } catch (error) {
      console.error('Unexpected error:', error)
      toast({
        title: "Error",
        description: `Something went wrong: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = async () => {
    if (selectedPersonas.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select at least one persona that describes your travel style.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    
    try {
      console.log('Starting persona save process...')
      console.log('Selected personas:', selectedPersonas)
      
      const response = await fetch('/api/persona', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personas: selectedPersonas
        })
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('API error:', data.error)
        toast({
          title: "Error",
          description: `Failed to save your preferences: ${data.error}`,
          variant: "destructive",
        })
        return
      }

      console.log('Personas saved successfully, redirecting to dashboard')
      toast({
        title: "Preferences Saved!",
        description: `Your ${selectedPersonas.length} travel persona${selectedPersonas.length > 1 ? 's have' : ' has'} been saved successfully.`,
      })
      
      // Immediate redirect to dashboard
      router.push('/dashboard')
      router.refresh() // Force refresh to update any cached data
    } catch (error) {
      console.error('Unexpected error:', error)
      toast({
        title: "Error",
        description: `Something went wrong: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            What kind of traveler are you?
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-4">
            Select one or more personas that best describe your travel style. 
            This helps us personalize your experience and recommend the perfect trips for you.
          </p>
          <p className="text-sm text-gray-500">
            Don't worry - you can always skip this step and set your preferences later in settings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {personas.map((persona) => {
            const Icon = persona.icon
            const isSelected = selectedPersonas.includes(persona.id)
            
            return (
              <Card 
                key={persona.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  isSelected 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => handlePersonaToggle(persona.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${persona.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <Checkbox 
                      checked={isSelected}
                      onChange={() => {}} // Handled by card click
                    />
                  </div>
                  <CardTitle className="text-lg">{persona.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {persona.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {persona.tags.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500 mb-4">
            Selected: {selectedPersonas.length} persona{selectedPersonas.length !== 1 ? 's' : ''}
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button 
              variant="outline" 
              onClick={handleSkip}
              disabled={loading}
              className="min-w-32"
            >
              {loading ? 'Setting up...' : 'Skip for now'}
            </Button>
            <Button 
              onClick={handleContinue}
              disabled={loading}
              className="min-w-32"
            >
              {loading ? 'Saving...' : selectedPersonas.length === 0 ? 'Select personas first' : 'Save & Continue'}
            </Button>
          </div>
          
          <p className="text-xs text-gray-400 mt-3">
            You can update your travel preferences anytime in your profile settings
          </p>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { 
  Mountain, 
  Waves, 
  Church, 
  Camera, 
  Compass, 
  Utensils, 
  Heart, 
  Users, 
  User, 
  UserCheck,
  MapPin,
  Clock,
  DollarSign,
  Shield,
  Home,
  Hotel,
  Leaf
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface PersonalizationData {
  // Basic Travel Information
  preferredRegion: string
  tripDuration: string
  numberOfTravelers: number
  travelType: string
  
  // Interest Selection
  interests: string[]
  
  // Budget & Travel Style
  budgetPreference: string
  travelPace: string
  
  // Safety & Accessibility
  safetyPreferences: string[]
  
  // Optional Enhancements
  accommodationPreference: string
  foodPreference: string
}

const interests = [
  { id: 'nature-hills', label: 'Nature & Hills', icon: Mountain, color: 'bg-green-100 text-green-700' },
  { id: 'beaches', label: 'Beaches', icon: Waves, color: 'bg-blue-100 text-blue-700' },
  { id: 'religious-spiritual', label: 'Religious / Spiritual', icon: Church, color: 'bg-purple-100 text-purple-700' },
  { id: 'heritage-culture', label: 'Heritage & Culture', icon: Camera, color: 'bg-orange-100 text-orange-700' },
  { id: 'adventure', label: 'Adventure', icon: Compass, color: 'bg-red-100 text-red-700' },
  { id: 'food-cuisine', label: 'Food & Local Cuisine', icon: Utensils, color: 'bg-yellow-100 text-yellow-700' },
  { id: 'wellness-relaxation', label: 'Wellness & Relaxation', icon: Leaf, color: 'bg-indigo-100 text-indigo-700' }
]

const travelTypes = [
  { id: 'solo', label: 'Solo', icon: User },
  { id: 'family', label: 'Family', icon: Users },
  { id: 'friends', label: 'Friends', icon: UserCheck },
  { id: 'couple', label: 'Couple', icon: Heart }
]

export function ItineraryPersonalization() {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState<PersonalizationData>({
    preferredRegion: 'south-karnataka',
    tripDuration: '4-7-days',
    numberOfTravelers: 2,
    travelType: 'couple',
    interests: [],
    budgetPreference: 'medium',
    travelPace: 'balanced',
    safetyPreferences: [],
    accommodationPreference: 'any',
    foodPreference: 'no-preference'
  })

  const totalSteps = 5
  const progress = (currentStep / totalSteps) * 100

  const handleInterestToggle = (interestId: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(id => id !== interestId)
        : [...prev.interests, interestId]
    }))
  }

  const handleSafetyToggle = (preference: string) => {
    setFormData(prev => ({
      ...prev,
      safetyPreferences: prev.safetyPreferences.includes(preference)
        ? prev.safetyPreferences.filter(p => p !== preference)
        : [...prev.safetyPreferences, preference]
    }))
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSkip = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/personalization', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle database migration needed error
        if (data.migration_needed) {
          console.error('='.repeat(60))
          console.error('DATABASE MIGRATION REQUIRED')
          console.error('='.repeat(60))
          console.error('The personalization system requires database setup.')
          console.error('')
          console.error('QUICK FIX:')
          console.error('1. Go to your Supabase Dashboard')
          console.error('2. Navigate to SQL Editor')
          console.error('3. Run this SQL:')
          console.error('')
          console.error('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;')
          console.error('')
          console.error('4. Then refresh this page and try again')
          console.error('='.repeat(60))
          
          toast({
            title: "Database Setup Required",
            description: "Please check the browser console for setup instructions, then refresh and try again.",
            variant: "destructive",
          })
          return
        }
        
        throw new Error(data.error || 'Failed to complete onboarding')
      }

      toast({
        title: "Welcome to Tripsy!",
        description: "You can set your travel preferences later in settings.",
      })
      
      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      console.error('Skip error:', error)
      toast({
        title: "Error",
        description: `Something went wrong: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (formData.interests.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select at least one interest to personalize your experience.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/personalization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle database migration needed error
        if (data.migration_needed) {
          console.error('='.repeat(60))
          console.error('DATABASE MIGRATION REQUIRED')
          console.error('='.repeat(60))
          console.error('The personalization system requires database setup.')
          console.error('')
          console.error('QUICK FIX:')
          console.error('1. Go to your Supabase Dashboard')
          console.error('2. Navigate to SQL Editor')
          console.error('3. Run this SQL:')
          console.error('')
          console.error('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;')
          console.error('')
          console.error('4. Then refresh this page and try again')
          console.error('='.repeat(60))
          
          toast({
            title: "Database Setup Required",
            description: "Please check the browser console for setup instructions, then refresh and try again.",
            variant: "destructive",
          })
          return
        }
        
        throw new Error(data.error || 'Failed to save preferences')
      }

      toast({
        title: "Preferences Saved!",
        description: "Your travel preferences have been saved successfully. Get ready for personalized recommendations!",
      })
      
      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      console.error('Submit error:', error)
      toast({
        title: "Error",
        description: `Something went wrong: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Travel Information</h2>
              <p className="text-gray-600">Tell us about your typical travel preferences</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium">Preferred Travel Region</Label>
                <RadioGroup 
                  value={formData.preferredRegion} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, preferredRegion: value }))}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="south-karnataka" id="south-karnataka" />
                    <Label htmlFor="south-karnataka">South Karnataka (Default)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="north-karnataka" id="north-karnataka" />
                    <Label htmlFor="north-karnataka">North Karnataka</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other-states" id="other-states" />
                    <Label htmlFor="other-states">Other States</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base font-medium">Typical Trip Duration</Label>
                <RadioGroup 
                  value={formData.tripDuration} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, tripDuration: value }))}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1-3-days" id="1-3-days" />
                    <Label htmlFor="1-3-days">1–3 days (Weekend getaways)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="4-7-days" id="4-7-days" />
                    <Label htmlFor="4-7-days">4–7 days (Week-long trips)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1-week-plus" id="1-week-plus" />
                    <Label htmlFor="1-week-plus">1+ week (Extended vacations)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base font-medium">Number of Travelers (including you)</Label>
                <RadioGroup 
                  value={formData.numberOfTravelers.toString()} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, numberOfTravelers: parseInt(value) }))}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="travelers-1" />
                    <Label htmlFor="travelers-1">1 (Solo travel)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="travelers-2" />
                    <Label htmlFor="travelers-2">2 (Couple/Friend)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3-4" id="travelers-3-4" />
                    <Label htmlFor="travelers-3-4">3-4 (Small group)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="5-plus" id="travelers-5-plus" />
                    <Label htmlFor="travelers-5-plus">5+ (Large group/Family)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base font-medium">Travel Type</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  {travelTypes.map((type) => {
                    const Icon = type.icon
                    const isSelected = formData.travelType === type.id
                    
                    return (
                      <Card 
                        key={type.id}
                        className={`cursor-pointer transition-all duration-200 ${
                          isSelected 
                            ? 'ring-2 ring-blue-500 bg-blue-50' 
                            : 'hover:shadow-md'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, travelType: type.id }))}
                      >
                        <CardContent className="p-4 text-center">
                          <Icon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                          <p className="text-sm font-medium">{type.label}</p>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What interests you?</h2>
              <p className="text-gray-600">Select all that apply - this helps us personalize your recommendations</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {interests.map((interest) => {
                const Icon = interest.icon
                const isSelected = formData.interests.includes(interest.id)
                
                return (
                  <Card 
                    key={interest.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      isSelected 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => handleInterestToggle(interest.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-2 rounded-lg ${interest.color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <Checkbox 
                          checked={isSelected}
                          onChange={() => {}} // Handled by card click
                        />
                      </div>
                      <h3 className="font-medium text-gray-900">{interest.label}</h3>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                Selected: {formData.interests.length} interest{formData.interests.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Budget & Travel Style</h2>
              <p className="text-gray-600">Help us match you with the right experiences</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Budget Preference
                </Label>
                <RadioGroup 
                  value={formData.budgetPreference} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, budgetPreference: value }))}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="budget" id="budget" />
                    <Label htmlFor="budget">Budget (₹2,000 - ₹8,000 per person)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium">Medium (₹8,000 - ₹20,000 per person)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="premium" id="premium" />
                    <Label htmlFor="premium">Premium (₹20,000+ per person)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Travel Pace
                </Label>
                <RadioGroup 
                  value={formData.travelPace} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, travelPace: value }))}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="relaxed" id="relaxed" />
                    <Label htmlFor="relaxed">Relaxed (Fewer places, more time to explore)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="balanced" id="balanced" />
                    <Label htmlFor="balanced">Balanced (Good mix of activities and rest)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="packed" id="packed" />
                    <Label htmlFor="packed">Packed (Cover more places, action-packed)</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Safety & Accessibility</h2>
              <p className="text-gray-600">Let us know your preferences for a comfortable trip</p>
            </div>

            <div>
              <Label className="text-base font-medium flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4" />
                Safety & Accessibility Preferences (Select all that apply)
              </Label>
              
              <div className="space-y-3">
                {[
                  { id: 'safe-connected', label: 'Prefer safe & well-connected locations' },
                  { id: 'avoid-isolated', label: 'Avoid isolated or remote places' },
                  { id: 'senior-friendly', label: 'Senior-friendly travel options' },
                  { id: 'minimal-walking', label: 'Minimal walking preference' }
                ].map((preference) => (
                  <div key={preference.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={preference.id}
                      checked={formData.safetyPreferences.includes(preference.id)}
                      onCheckedChange={() => handleSafetyToggle(preference.id)}
                    />
                    <Label htmlFor={preference.id}>{preference.label}</Label>
                  </div>
                ))}
              </div>
              
              <p className="text-sm text-gray-500 mt-3">
                These preferences help us filter suggestions to match your comfort level
              </p>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Final Touches</h2>
              <p className="text-gray-600">Optional preferences to enhance your experience</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium flex items-center gap-2">
                  <Hotel className="w-4 h-4" />
                  Accommodation Preference
                </Label>
                <RadioGroup 
                  value={formData.accommodationPreference} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, accommodationPreference: value }))}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hotel" id="hotel" />
                    <Label htmlFor="hotel">Hotel (Standard rooms, hotel services)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="homestay" id="homestay" />
                    <Label htmlFor="homestay">Homestay (Local experience, family-run)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="any" id="any" />
                    <Label htmlFor="any">Any (Show me all options)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base font-medium flex items-center gap-2">
                  <Leaf className="w-4 h-4" />
                  Food Preference
                </Label>
                <RadioGroup 
                  value={formData.foodPreference} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, foodPreference: value }))}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="vegetarian" id="vegetarian" />
                    <Label htmlFor="vegetarian">Vegetarian</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="non-vegetarian" id="non-vegetarian" />
                    <Label htmlFor="non-vegetarian">Non-vegetarian</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no-preference" id="no-preference" />
                    <Label htmlFor="no-preference">No preference</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Ready to explore!</h3>
              <p className="text-sm text-blue-700">
                Your preferences will be used to generate personalized itineraries and recommendations. 
                You can always update these settings later in your profile.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Personalize Your Travel Experience
          </h1>
          <p className="text-gray-600 mb-4">
            Step {currentStep} of {totalSteps}: Help us create the perfect itineraries for you
          </p>
          <Progress value={progress} className="w-full max-w-md mx-auto" />
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardContent className="p-8">
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            {currentStep > 1 && (
              <Button 
                variant="outline" 
                onClick={handleBack}
                disabled={loading}
              >
                Back
              </Button>
            )}
            <Button 
              variant="ghost" 
              onClick={handleSkip}
              disabled={loading}
              className="text-gray-500 hover:text-gray-700"
            >
              {loading ? 'Setting up...' : 'Skip for now'}
            </Button>
          </div>
          
          <div>
            {currentStep < totalSteps ? (
              <Button 
                onClick={handleNext}
                disabled={loading}
                className="min-w-32"
              >
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={loading || formData.interests.length === 0}
                className="min-w-32"
              >
                {loading ? 'Saving...' : 'Complete Setup'}
              </Button>
            )}
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          You can update your travel preferences anytime in your profile settings
        </p>
      </div>
    </div>
  )
}
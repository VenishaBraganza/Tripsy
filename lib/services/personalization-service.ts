import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export interface PersonalizationData {
  preferredRegion: string
  tripDuration: string
  numberOfTravelers: number
  travelType: string
  interests: string[]
  budgetPreference: string
  travelPace: string
  safetyPreferences: string[]
  accommodationPreference: string
  foodPreference: string
}

export interface UserPersonalization {
  id: string
  userId: string
  preferredRegion: string
  tripDuration: string
  numberOfTravelers: number
  travelType: string
  interests: string[]
  budgetPreference: string
  travelPace: string
  safetyPreferences: string[]
  accommodationPreference: string
  foodPreference: string
  createdAt: string
  updatedAt: string
}

export class PersonalizationService {
  private static readonly STORAGE_KEY = 'tripsy_offline_personalization'
  private static readonly MAX_RETRY_ATTEMPTS = 3
  private static readonly RETRY_DELAY_BASE = 1000 // 1 second

  // Save personalization data with retry logic
  static async savePersonalization(data: PersonalizationData): Promise<void> {
    const supabase = getSupabaseBrowserClient()
    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    let lastError: Error | null = null
    
    // Try to save with exponential backoff
    for (let attempt = 1; attempt <= this.MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        const response = await fetch('/api/personalization', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        })

        const responseData = await response.json()

        if (!response.ok) {
          throw new Error(responseData.error || 'Failed to save personalization')
        }

        // Success - clear any offline data
        this.clearOfflineData()
        return

      } catch (error) {
        lastError = error as Error
        console.warn(`Personalization save attempt ${attempt} failed:`, error)

        // If this is the last attempt, save offline and throw
        if (attempt === this.MAX_RETRY_ATTEMPTS) {
          await this.saveOffline(user.id, data)
          throw new Error(`Failed to save personalization after ${this.MAX_RETRY_ATTEMPTS} attempts. Saved offline for later sync.`)
        }

        // Wait before retrying (exponential backoff)
        await this.delay(this.RETRY_DELAY_BASE * Math.pow(2, attempt - 1))
      }
    }

    throw lastError || new Error('Unknown error occurred')
  }

  // Skip personalization (mark onboarding complete without saving detailed preferences)
  static async skipPersonalization(): Promise<void> {
    const supabase = getSupabaseBrowserClient()
    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    let lastError: Error | null = null
    
    // Try to skip with exponential backoff
    for (let attempt = 1; attempt <= this.MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        const response = await fetch('/api/personalization', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          }
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to complete onboarding')
        }

        // Success - clear any offline data
        this.clearOfflineData()
        return

      } catch (error) {
        lastError = error as Error
        console.warn(`Personalization skip attempt ${attempt} failed:`, error)

        // If this is the last attempt, save offline and throw
        if (attempt === this.MAX_RETRY_ATTEMPTS) {
          await this.saveOffline(user.id, this.getDefaultPersonalization())
          throw new Error(`Failed to complete onboarding after ${this.MAX_RETRY_ATTEMPTS} attempts. Saved offline for later sync.`)
        }

        // Wait before retrying (exponential backoff)
        await this.delay(this.RETRY_DELAY_BASE * Math.pow(2, attempt - 1))
      }
    }

    throw lastError || new Error('Unknown error occurred')
  }

  // Get user personalization data
  static async getPersonalization(): Promise<UserPersonalization | null> {
    try {
      const response = await fetch('/api/personalization', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch personalization')
      }

      return data.personalization || null
    } catch (error) {
      console.error('Failed to fetch personalization:', error)
      return null
    }
  }

  // Get default personalization for skip functionality
  private static getDefaultPersonalization(): PersonalizationData {
    return {
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
    }
  }

  // Save personalization data offline
  private static async saveOffline(userId: string, data: PersonalizationData): Promise<void> {
    try {
      const offlineData = {
        userId,
        data,
        timestamp: Date.now(),
        synced: false
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(offlineData))
      console.log('Personalization data saved offline:', offlineData)
    } catch (error) {
      console.error('Failed to save personalization data offline:', error)
    }
  }

  // Get offline personalization data
  static getOfflineData(): { userId: string; data: PersonalizationData; timestamp: number; synced: boolean } | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Failed to get offline personalization data:', error)
      return null
    }
  }

  // Check if there's pending offline data
  static hasPendingOfflineData(): boolean {
    const data = this.getOfflineData()
    return data !== null && !data.synced
  }

  // Sync offline data
  static async syncOfflineData(): Promise<boolean> {
    const offlineData = this.getOfflineData()
    if (!offlineData || offlineData.synced) {
      return true // Nothing to sync
    }

    try {
      if (offlineData.data.interests.length > 0) {
        await this.savePersonalization(offlineData.data)
      } else {
        await this.skipPersonalization()
      }
      
      // Mark as synced
      offlineData.synced = true
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(offlineData))
      
      return true
    } catch (error) {
      console.error('Failed to sync offline personalization data:', error)
      return false
    }
  }

  // Clear offline data
  static clearOfflineData(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear offline personalization data:', error)
    }
  }

  // Check if user is online
  static isOnline(): boolean {
    return navigator.onLine
  }

  // Delay utility for retry logic
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Validate personalization data
  static validatePersonalization(data: PersonalizationData): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Validate required fields
    if (!data.preferredRegion) {
      errors.push('Preferred region is required')
    }

    if (!data.tripDuration) {
      errors.push('Trip duration is required')
    }

    if (!data.travelType) {
      errors.push('Travel type is required')
    }

    if (!data.budgetPreference) {
      errors.push('Budget preference is required')
    }

    if (!data.travelPace) {
      errors.push('Travel pace is required')
    }

    // Validate enum values
    const validRegions = ['south-karnataka', 'north-karnataka', 'other-states']
    if (!validRegions.includes(data.preferredRegion)) {
      errors.push('Invalid preferred region')
    }

    const validDurations = ['1-3-days', '4-7-days', '1-week-plus']
    if (!validDurations.includes(data.tripDuration)) {
      errors.push('Invalid trip duration')
    }

    const validTravelTypes = ['solo', 'family', 'friends', 'couple']
    if (!validTravelTypes.includes(data.travelType)) {
      errors.push('Invalid travel type')
    }

    const validBudgets = ['budget', 'medium', 'premium']
    if (!validBudgets.includes(data.budgetPreference)) {
      errors.push('Invalid budget preference')
    }

    const validPaces = ['relaxed', 'balanced', 'packed']
    if (!validPaces.includes(data.travelPace)) {
      errors.push('Invalid travel pace')
    }

    const validInterests = [
      'nature-hills', 'beaches', 'religious-spiritual', 
      'heritage-culture', 'adventure', 'food-cuisine', 'wellness-relaxation'
    ]
    const invalidInterests = data.interests.filter(interest => !validInterests.includes(interest))
    if (invalidInterests.length > 0) {
      errors.push(`Invalid interests: ${invalidInterests.join(', ')}`)
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Generate personalized recommendations based on user preferences
  static generateRecommendationFilters(personalization: UserPersonalization): Record<string, any> {
    const filters: Record<string, any> = {}

    // Budget filters
    if (personalization.budgetPreference === 'budget') {
      filters.maxPrice = 8000
    } else if (personalization.budgetPreference === 'medium') {
      filters.minPrice = 8000
      filters.maxPrice = 20000
    } else if (personalization.budgetPreference === 'premium') {
      filters.minPrice = 20000
    }

    // Interest-based tags
    filters.tags = personalization.interests

    // Travel pace affects itinerary density
    filters.travelPace = personalization.travelPace

    // Safety preferences
    if (personalization.safetyPreferences.includes('safe-connected')) {
      filters.safetyLevel = 'high'
    }
    if (personalization.safetyPreferences.includes('avoid-isolated')) {
      filters.excludeRemote = true
    }

    // Group size considerations
    filters.maxGroupSize = personalization.numberOfTravelers

    return filters
  }
}
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

interface OfflinePersonaData {
  userId: string
  personas: string[]
  timestamp: number
  synced: boolean
}

export class PersonaService {
  private static readonly STORAGE_KEY = 'tripsy_offline_personas'
  private static readonly MAX_RETRY_ATTEMPTS = 3
  private static readonly RETRY_DELAY_BASE = 1000 // 1 second

  // Save personas with retry logic
  static async savePersonas(personas: string[]): Promise<void> {
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
        const response = await fetch('/api/persona', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ personas })
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to save personas')
        }

        // Success - clear any offline data
        this.clearOfflineData()
        return

      } catch (error) {
        lastError = error as Error
        console.warn(`Persona save attempt ${attempt} failed:`, error)

        // If this is the last attempt, save offline and throw
        if (attempt === this.MAX_RETRY_ATTEMPTS) {
          await this.saveOffline(user.id, personas)
          throw new Error(`Failed to save personas after ${this.MAX_RETRY_ATTEMPTS} attempts. Saved offline for later sync.`)
        }

        // Wait before retrying (exponential backoff)
        await this.delay(this.RETRY_DELAY_BASE * Math.pow(2, attempt - 1))
      }
    }

    throw lastError || new Error('Unknown error occurred')
  }

  // Skip personas (mark onboarding complete without saving personas)
  static async skipPersonas(): Promise<void> {
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
        const response = await fetch('/api/persona', {
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
        console.warn(`Persona skip attempt ${attempt} failed:`, error)

        // If this is the last attempt, save offline and throw
        if (attempt === this.MAX_RETRY_ATTEMPTS) {
          await this.saveOffline(user.id, []) // Empty array for skip
          throw new Error(`Failed to complete onboarding after ${this.MAX_RETRY_ATTEMPTS} attempts. Saved offline for later sync.`)
        }

        // Wait before retrying (exponential backoff)
        await this.delay(this.RETRY_DELAY_BASE * Math.pow(2, attempt - 1))
      }
    }

    throw lastError || new Error('Unknown error occurred')
  }

  // Save persona data offline
  private static async saveOffline(userId: string, personas: string[]): Promise<void> {
    try {
      const offlineData: OfflinePersonaData = {
        userId,
        personas,
        timestamp: Date.now(),
        synced: false
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(offlineData))
      console.log('Persona data saved offline:', offlineData)
    } catch (error) {
      console.error('Failed to save persona data offline:', error)
    }
  }

  // Get offline persona data
  static getOfflineData(): OfflinePersonaData | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Failed to get offline persona data:', error)
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
      if (offlineData.personas.length > 0) {
        await this.savePersonas(offlineData.personas)
      } else {
        await this.skipPersonas()
      }
      
      // Mark as synced
      offlineData.synced = true
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(offlineData))
      
      return true
    } catch (error) {
      console.error('Failed to sync offline persona data:', error)
      return false
    }
  }

  // Clear offline data
  static clearOfflineData(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear offline persona data:', error)
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

  // Validate persona IDs
  static validatePersonas(personas: string[]): boolean {
    const validPersonas = [
      'nature-lover',
      'foodie', 
      'photographer',
      'adventure-seeker',
      'cultural-explorer',
      'luxury-traveler',
      'budget-backpacker',
      'family-traveler',
      'romantic-couple',
      'solo-explorer'
    ]

    return personas.every(persona => validPersonas.includes(persona))
  }
}
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Enhanced interest to category mapping for comprehensive personalization
const INTEREST_CATEGORIES = {
  'nature-hills': ['nature', 'hills', 'mountains', 'trekking', 'wildlife', 'eco-friendly', 'scenic'],
  'beaches': ['beach', 'coastal', 'water sports', 'swimming', 'surfing', 'marine'],
  'religious-spiritual': ['temple', 'spiritual', 'religious', 'pilgrimage', 'meditation', 'heritage'],
  'heritage-culture': ['heritage', 'culture', 'museums', 'historical', 'architecture', 'monuments'],
  'adventure': ['adventure', 'extreme sports', 'rock climbing', 'paragliding', 'rafting', 'trekking'],
  'food-cuisine': ['culinary', 'food tours', 'local cuisine', 'street food', 'restaurants', 'cooking'],
  'wellness-relaxation': ['spa', 'wellness', 'yoga', 'meditation', 'relaxation', 'ayurveda', 'retreat']
}

// Budget range mappings
const BUDGET_RANGES = {
  'budget': { min: 0, max: 8000 },
  'medium': { min: 8000, max: 20000 },
  'premium': { min: 20000, max: 100000 }
}

// Travel pace to itinerary density mapping
const PACE_MULTIPLIERS = {
  'relaxed': 0.7,    // Fewer activities, more time per place
  'balanced': 1.0,   // Standard activity level
  'packed': 1.3      // More activities, faster pace
}

interface RecommendationInput {
  userId: string
  location?: { lat: number, lng: number }
  limit?: number
  excludePackageIds?: string[]
}

interface PersonalizationData {
  preferred_region: string
  trip_duration: string
  number_of_travelers: number
  travel_type: string
  interests: string[]
  budget_preference: string
  travel_pace: string
  safety_preferences: string[]
  accommodation_preference: string
  food_preference: string
}

interface ScoredPackage {
  package: any
  score: number
  reasoning: string[]
  personalizationMatches: string[]
  confidenceLevel: 'high' | 'medium' | 'low'
}

export class PersonalizedRecommendationEngine {
  private supabase: any

  constructor() {
    // Initialize Supabase client
    this.initSupabase()
  }

  private async initSupabase() {
    const cookieStore = await cookies()
    this.supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Server component limitation
            }
          },
        },
      }
    )
  }

  // Enhanced recommendation generation using comprehensive personalization data
  async generateRecommendations(input: RecommendationInput): Promise<ScoredPackage[]> {
    try {
      console.log('🤖 Generating personalized recommendations for user:', input.userId)
      
      // Get comprehensive user personalization data
      const personalizationData = await this.getUserPersonalization(input.userId)
      const userProfile = await this.getUserProfile(input.userId)
      
      console.log('User personalization data:', personalizationData)
      console.log('User profile:', userProfile)

      // Get packages with enhanced filtering based on personalization
      const packages = await this.getFilteredPackages(personalizationData, input)

      if (!packages || packages.length === 0) {
        console.log('No packages found matching criteria, returning empty recommendations')
        return []
      }

      console.log(`Found ${packages.length} packages to score with personalization`)

      // Enhanced scoring using comprehensive personalization data
      const scoredPackages: ScoredPackage[] = packages.map((pkg) => {
        return this.scorePackageWithPersonalization(pkg, personalizationData, userProfile)
      })

      // Sort by score and return top results
      const sortedPackages = scoredPackages
        .sort((a, b) => b.score - a.score)
        .slice(0, input.limit || 10)

      console.log(`Returning ${sortedPackages.length} personalized recommendations`)
      console.log('Top recommendation scores:', sortedPackages.slice(0, 3).map(p => ({ 
        name: p.package.name, 
        score: p.score, 
        confidence: p.confidenceLevel 
      })))

      return sortedPackages

    } catch (error) {
      console.error('Error generating personalized recommendations:', error)
      
      // Fallback to basic recommendations if personalization fails
      return await this.generateBasicRecommendations(input)
    }
  }

  private async getUserPersonalization(userId: string): Promise<PersonalizationData | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_personalization')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.warn('Could not fetch user personalization:', error.message)
        return null
      }
      
      return data
    } catch (error) {
      console.warn('Error fetching user personalization:', error)
      return null
    }
  }

  private async getUserProfile(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('travel_personas, onboarding_completed')
        .eq('id', userId)
        .single()

      if (error) {
        console.warn('Could not fetch user profile:', error.message)
        return null
      }
      
      return data
    } catch (error) {
      console.warn('Error fetching user profile:', error)
      return null
    }
  }

  private async getFilteredPackages(personalizationData: PersonalizationData | null, input: RecommendationInput) {
    let query = this.supabase
      .from('packages')
      .select(`
        *,
        destinations (
          id,
          name,
          state,
          region,
          tags,
          average_rating,
          highlights,
          hidden_gem_score
        )
      `)
      .eq('status', 'live')

    // Apply budget filter if personalization data exists
    if (personalizationData?.budget_preference) {
      const budgetRange = BUDGET_RANGES[personalizationData.budget_preference as keyof typeof BUDGET_RANGES]
      if (budgetRange) {
        query = query
          .gte('base_price', budgetRange.min)
          .lte('base_price', budgetRange.max)
      }
    }

    // Apply region filter
    if (personalizationData?.preferred_region && personalizationData.preferred_region !== 'other-states') {
      const regionMap = {
        'south-karnataka': 'South Karnataka',
        'north-karnataka': 'North Karnataka'
      }
      const region = regionMap[personalizationData.preferred_region as keyof typeof regionMap]
      if (region) {
        query = query.eq('destinations.region', region)
      }
    }

    // Apply group size filter
    if (personalizationData?.number_of_travelers) {
      query = query.gte('max_group_size', personalizationData.number_of_travelers)
    }

    // Exclude specified packages
    if (input.excludePackageIds && input.excludePackageIds.length > 0) {
      query = query.not('id', 'in', `(${input.excludePackageIds.join(',')})`)
    }

    const { data: packages, error } = await query.limit(50)

    if (error) {
      console.error('Error fetching filtered packages:', error)
      throw error
    }

    return packages || []
  }

  private scorePackageWithPersonalization(
    pkg: any, 
    personalizationData: PersonalizationData | null, 
    userProfile: any
  ): ScoredPackage {
    let score = 0.5 // Base score
    const reasoning: string[] = []
    const personalizationMatches: string[] = []
    let confidenceLevel: 'high' | 'medium' | 'low' = 'low'

    if (!personalizationData) {
      // Fallback to basic scoring if no personalization data
      return this.scorePackageBasic(pkg, userProfile)
    }

    // Interest matching (40% of score)
    const interestScore = this.calculateInterestScore(pkg, personalizationData.interests)
    score += interestScore * 0.4
    if (interestScore > 0.5) {
      reasoning.push(`Matches your ${personalizationData.interests.join(', ')} interests`)
      personalizationMatches.push('interests')
    }

    // Budget alignment (20% of score)
    const budgetScore = this.calculateBudgetScore(pkg, personalizationData.budget_preference)
    score += budgetScore * 0.2
    if (budgetScore > 0.7) {
      reasoning.push(`Perfect fit for your ${personalizationData.budget_preference} budget`)
      personalizationMatches.push('budget')
    }

    // Travel type compatibility (15% of score)
    const travelTypeScore = this.calculateTravelTypeScore(pkg, personalizationData.travel_type)
    score += travelTypeScore * 0.15
    if (travelTypeScore > 0.6) {
      reasoning.push(`Great for ${personalizationData.travel_type} travel`)
      personalizationMatches.push('travel_type')
    }

    // Safety preferences (10% of score)
    const safetyScore = this.calculateSafetyScore(pkg, personalizationData.safety_preferences)
    score += safetyScore * 0.1
    if (safetyScore > 0.7) {
      reasoning.push('Meets your safety preferences')
      personalizationMatches.push('safety')
    }

    // Travel pace alignment (10% of score)
    const paceScore = this.calculatePaceScore(pkg, personalizationData.travel_pace)
    score += paceScore * 0.1

    // Quality indicators (5% of score)
    const qualityScore = this.calculateQualityScore(pkg)
    score += qualityScore * 0.05
    if (qualityScore > 0.8) {
      reasoning.push('Highly rated destination')
    }

    // Determine confidence level
    if (personalizationMatches.length >= 3) {
      confidenceLevel = 'high'
    } else if (personalizationMatches.length >= 2) {
      confidenceLevel = 'medium'
    }

    // Ensure score is within bounds
    score = Math.max(0, Math.min(1, score))

    // Add fallback reasoning if none provided
    if (reasoning.length === 0) {
      reasoning.push('Recommended based on your preferences')
    }

    return {
      package: pkg,
      score: Math.round(score * 100) / 100,
      reasoning: reasoning.slice(0, 3), // Max 3 reasons
      personalizationMatches,
      confidenceLevel
    }
  }

  private calculateInterestScore(pkg: any, interests: string[]): number {
    if (!interests || interests.length === 0) return 0.5

    const packageTags = [...(pkg.tags || []), ...(pkg.destinations?.tags || []), ...(pkg.destinations?.highlights || [])]
    let matchScore = 0
    let totalPossibleMatches = 0

    for (const interest of interests) {
      const categories = INTEREST_CATEGORIES[interest as keyof typeof INTEREST_CATEGORIES] || []
      totalPossibleMatches += categories.length

      for (const category of categories) {
        const hasMatch = packageTags.some(tag => 
          tag.toLowerCase().includes(category.toLowerCase()) ||
          category.toLowerCase().includes(tag.toLowerCase())
        )
        if (hasMatch) {
          matchScore += 1
        }
      }
    }

    return totalPossibleMatches > 0 ? Math.min(matchScore / totalPossibleMatches, 1) : 0.5
  }

  private calculateBudgetScore(pkg: any, budgetPreference: string): number {
    if (!pkg.base_price || !budgetPreference) return 0.5

    const budgetRange = BUDGET_RANGES[budgetPreference as keyof typeof BUDGET_RANGES]
    if (!budgetRange) return 0.5

    const price = pkg.base_price
    
    // Perfect score if within range
    if (price >= budgetRange.min && price <= budgetRange.max) {
      return 1.0
    }
    
    // Partial score if close to range
    const rangeMid = (budgetRange.min + budgetRange.max) / 2
    const distance = Math.abs(price - rangeMid)
    const maxDistance = (budgetRange.max - budgetRange.min) / 2
    
    return Math.max(0, 1 - (distance / maxDistance))
  }

  private calculateTravelTypeScore(pkg: any, travelType: string): number {
    // Simple travel type compatibility scoring
    const travelTypeBoosts = {
      'solo': pkg.min_group_size === 1 ? 1.0 : 0.7,
      'couple': pkg.max_group_size >= 2 ? 1.0 : 0.5,
      'family': pkg.max_group_size >= 4 ? 1.0 : 0.6,
      'friends': pkg.max_group_size >= 3 ? 1.0 : 0.7
    }

    return travelTypeBoosts[travelType as keyof typeof travelTypeBoosts] || 0.5
  }

  private calculateSafetyScore(pkg: any, safetyPreferences: string[]): number {
    if (!safetyPreferences || safetyPreferences.length === 0) return 0.5

    let score = 0.5
    
    // Check for safety-related tags or features
    const packageTags = [...(pkg.tags || []), ...(pkg.destinations?.tags || [])]
    
    if (safetyPreferences.includes('safe-connected')) {
      const hasSafetyTags = packageTags.some(tag => 
        ['safe', 'well-connected', 'popular', 'guided'].some(safety => 
          tag.toLowerCase().includes(safety)
        )
      )
      if (hasSafetyTags) score += 0.3
    }

    if (safetyPreferences.includes('avoid-isolated')) {
      const hasIsolatedTags = packageTags.some(tag => 
        ['remote', 'isolated', 'offbeat'].some(isolated => 
          tag.toLowerCase().includes(isolated)
        )
      )
      if (!hasIsolatedTags) score += 0.2
    }

    return Math.min(score, 1.0)
  }

  private calculatePaceScore(pkg: any, travelPace: string): number {
    // This would ideally check itinerary density, for now use duration as proxy
    const paceMultiplier = PACE_MULTIPLIERS[travelPace as keyof typeof PACE_MULTIPLIERS] || 1.0
    
    // Simple scoring based on package duration and pace preference
    if (pkg.duration_days) {
      const idealDuration = pkg.duration_days * paceMultiplier
      return idealDuration > 0 ? Math.min(1.0, 1 / idealDuration) : 0.5
    }
    
    return 0.5
  }

  private calculateQualityScore(pkg: any): number {
    let score = 0.5
    
    // Rating boost
    if (pkg.destinations?.average_rating) {
      score += (pkg.destinations.average_rating - 3) / 2 * 0.3
    }
    
    // Hidden gem score boost
    if (pkg.destinations?.hidden_gem_score) {
      score += pkg.destinations.hidden_gem_score / 100 * 0.2
    }
    
    return Math.max(0, Math.min(1, score))
  }

  // Fallback method for basic recommendations
  private scorePackageBasic(pkg: any, userProfile: any): ScoredPackage {
    let score = 0.5
    const reasoning: string[] = []
    
    // Use legacy persona system if available
    if (userProfile?.travel_personas) {
      // Legacy persona scoring logic here
      score += 0.2
      reasoning.push('Based on your travel personas')
    }
    
    // Basic quality scoring
    if (pkg.destinations?.average_rating > 4) {
      score += 0.3
      reasoning.push('Highly rated destination')
    }
    
    reasoning.push('Popular choice for travelers')
    
    return {
      package: pkg,
      score: Math.round(score * 100) / 100,
      reasoning,
      personalizationMatches: [],
      confidenceLevel: 'low'
    }
  }

  // Fallback to basic recommendations if personalization fails
  private async generateBasicRecommendations(input: RecommendationInput): Promise<ScoredPackage[]> {
    try {
      const { data: packages, error } = await this.supabase
        .from('packages')
        .select(`
          *,
          destinations (
            id,
            name,
            state,
            region,
            tags,
            average_rating,
            highlights
          )
        `)
        .eq('status', 'live')
        .limit(20)

      if (error || !packages) {
        return []
      }

      return packages.map(pkg => ({
        package: pkg,
        score: 0.5 + Math.random() * 0.3,
        reasoning: ['Popular destination'],
        personalizationMatches: [],
        confidenceLevel: 'low' as const
      }))
    } catch (error) {
      console.error('Error generating basic recommendations:', error)
      return []
    }
  }

  // Enhanced tracking method
  async trackRecommendation(userId: string, packageId: string, action: 'shown' | 'clicked' | 'booked') {
    try {
      console.log(`📊 Tracking personalized recommendation: ${action} for package ${packageId}`)
      
      const { error } = await this.supabase
        .from('ai_recommendations')
        .upsert({
          user_id: userId,
          package_id: packageId,
          recommendation_type: 'personalized',
          shown_at: new Date().toISOString(),
          clicked: action === 'clicked' || action === 'booked',
          booked: action === 'booked'
        })

      if (error) {
        console.warn('Could not save tracking data:', error.message)
      }
    } catch (error) {
      console.warn('Error tracking recommendation:', error)
    }
  }
}

export const recommendationEngine = new PersonalizedRecommendationEngine()
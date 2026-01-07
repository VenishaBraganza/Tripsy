import { NextResponse } from 'next/server'
import { getPersonalizedRecommendations, getPackages, getUserPreferences } from '@/lib/supabase/queries'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { recommendationEngine } from '@/lib/recommendation/engine'

export async function GET(request: Request) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { searchParams } = new URL(request.url)
  const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 10
  const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1
  const lat = searchParams.get('lat') ? Number(searchParams.get('lat')) : undefined
  const lng = searchParams.get('lng') ? Number(searchParams.get('lng')) : undefined
  const excludeIds = searchParams.get('exclude')?.split(',') || []
  const filterInterests = searchParams.get('interests')?.split(',') || []
  const filterBudget = searchParams.get('budget') || undefined
  const persona = searchParams.get('persona') || undefined // Legacy support
  
  try {
    console.log('Generating personalized recommendations for user:', user.id)
    
    // Use the enhanced recommendation engine with comprehensive personalization
    const recommendations = await recommendationEngine.generateRecommendations({
      userId: user.id,
      location: lat && lng ? { lat, lng } : undefined,
      limit: limit * 2, // Get more for better pagination
      excludePackageIds: excludeIds
    })
    
    // Apply additional filters if specified
    let filteredRecommendations = recommendations
    
    if (filterInterests.length > 0) {
      filteredRecommendations = filteredRecommendations.filter(rec =>
        rec.personalizationMatches.includes('interests') &&
        filterInterests.some(interest => 
          rec.reasoning.some(reason => 
            reason.toLowerCase().includes(interest.toLowerCase())
          )
        )
      )
    }
    
    if (filterBudget) {
      filteredRecommendations = filteredRecommendations.filter(rec =>
        rec.personalizationMatches.includes('budget')
      )
    }
    
    // Legacy persona filter support
    if (persona) {
      filteredRecommendations = filteredRecommendations.filter(rec =>
        rec.reasoning.some(reason => 
          reason.toLowerCase().includes(persona.replace('-', ' ').toLowerCase())
        )
      )
    }
    
    // Apply pagination
    const offset = (page - 1) * limit
    const paginatedRecommendations = filteredRecommendations.slice(offset, offset + limit)
    
    // Get user personalization summary for response metadata
    const { data: personalizationData } = await supabase
      .from('user_personalization')
      .select('interests, budget_preference, travel_type, preferred_region')
      .eq('user_id', user.id)
      .single()
    
    // Calculate confidence distribution
    const confidenceDistribution = {
      high: filteredRecommendations.filter(r => r.confidenceLevel === 'high').length,
      medium: filteredRecommendations.filter(r => r.confidenceLevel === 'medium').length,
      low: filteredRecommendations.filter(r => r.confidenceLevel === 'low').length
    }
    
    // Transform to API response format with enhanced data
    const responsePackages = paginatedRecommendations.map(rec => ({
      ...rec.package,
      recommendation_score: rec.score,
      recommendation_reasoning: rec.reasoning,
      personalization_matches: rec.personalizationMatches,
      confidence_level: rec.confidenceLevel,
      confidence_score: Math.round(rec.score * 100),
      // Legacy support
      persona_matches: rec.personalizationMatches.includes('interests') ? ['personalized'] : []
    }))
    
    // Track recommendations shown
    for (const rec of paginatedRecommendations) {
      await recommendationEngine.trackRecommendation(user.id, rec.package.id, 'shown')
        .catch(err => console.warn('Failed to track recommendation:', err))
    }
    
    return NextResponse.json({ 
      packages: responsePackages,
      count: paginatedRecommendations.length,
      total: filteredRecommendations.length,
      page,
      limit,
      source: 'personalized-engine',
      algorithm: 'comprehensive-personalization',
      has_location: !!(lat && lng),
      has_personalization: !!personalizationData,
      confidence_distribution: confidenceDistribution,
      personalization_summary: personalizationData ? {
        interests: personalizationData.interests || [],
        budget_preference: personalizationData.budget_preference,
        travel_type: personalizationData.travel_type,
        preferred_region: personalizationData.preferred_region,
        has_personalization: true
      } : {
        interests: [],
        budget_preference: 'medium',
        travel_type: 'couple',
        preferred_region: 'south-karnataka',
        has_personalization: false
      }
    })
    
  } catch (error: any) {
    console.error('Error generating personalized recommendations:', error)
    
    // Fallback to simple package listing
    try {
      const packages = await getPackages({
        status: 'live',
        limit: limit
      })
      
      return NextResponse.json({ 
        packages: packages.map((pkg: any, index: number) => ({
          ...pkg,
          recommendation_score: 0.5,
          confidence_score: 50 - (index * 2),
          confidence_level: 'low',
          recommendation_reasoning: ['Popular travel package'],
          personalization_matches: [],
          persona_matches: [] // Legacy support
        })),
        count: packages.length,
        total: packages.length,
        page: 1,
        limit,
        source: 'fallback',
        algorithm: 'popularity-based',
        has_location: false,
        has_personalization: false,
        confidence_distribution: { high: 0, medium: 0, low: packages.length },
        personalization_summary: {
          interests: [],
          budget_preference: 'medium',
          travel_type: 'couple',
          preferred_region: 'south-karnataka',
          has_personalization: false
        },
        error: 'Recommendation engine failed, showing popular packages'
      })
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError)
      return NextResponse.json(
        { error: 'Failed to fetch recommendations', details: error.message },
        { status: 500 }
      )
    }
  }
}

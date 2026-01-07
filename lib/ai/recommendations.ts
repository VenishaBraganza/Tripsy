import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { getUserPreferences, getTravelDNA, getPackages } from '@/lib/supabase/queries'

export async function generatePersonalizedRecommendations(userId: string) {
  try {
    const [preferences, travelDNA, allPackages] = await Promise.all([
      getUserPreferences(userId),
      getTravelDNA(userId),
      getPackages({ status: 'live', limit: 50 })
    ])
    
    const prompt = `You are a travel recommendation AI for Tripsy, an AI-powered travel app.

User Profile:
- Favorite regions: ${preferences.favorite_regions?.join(', ') || 'Not specified'}
- Hidden gem intensity: ${preferences.hidden_gem_intensity}% (0=mainstream, 100=offbeat)
- Travel pace: ${preferences.travel_pace}
- Budget range: ${preferences.budget_range}
- Interests: ${preferences.interests?.join(', ') || 'Not specified'}

Travel DNA Scores (0-100):
- Hidden Gem Seeker: ${travelDNA.hidden_gem_seeker_score}
- Mountain Lover: ${travelDNA.mountain_lover_score}
- Beach Bum: ${travelDNA.beach_bum_score}
- Heritage Hunter: ${travelDNA.heritage_hunter_score}
- Food Pilgrim: ${travelDNA.food_pilgrim_score}
- Adventure: ${travelDNA.adventure_score}

Available Packages:
${allPackages.map(pkg => `- ${pkg.name} (${pkg.destinations?.name}, ${pkg.destinations?.state}) - ₹${pkg.base_price} - ${pkg.duration_text}`).join('\n')}

Task: Recommend the top 5 packages that best match this user's profile. For each recommendation:
1. Explain WHY it matches their preferences (be specific)
2. Give a confidence score (0-100)
3. Highlight what makes it special for them

Return as JSON array with: package_name, reasoning, confidence_score, special_highlight`

    const result = await streamText({
      model: openai('gpt-4-turbo'),
      prompt,
      temperature: 0.7,
    })
    
    return result
  } catch (error) {
    console.error('Error generating recommendations:', error)
    throw error
  }
}

export async function generatePackageIdeas(context: {
  currentTrends?: string[]
  seasonality?: string
  targetRegion?: string
}) {
  const prompt = `You are a travel package creator AI for Tripsy.

Context:
- Current booking trends: ${context.currentTrends?.join(', ') || 'General travel'}
- Season: ${context.seasonality || 'Year-round'}
- Target region: ${context.targetRegion || 'India'}

Task: Generate 5 unique, compelling travel package ideas that:
1. Are offbeat/hidden gems (not mainstream tourist spots)
2. Have high demand potential
3. Are feasible to organize
4. Include specific locations, activities, and pricing

For each package, provide:
- Package name (catchy and descriptive)
- Duration (e.g., "4N/5D")
- Destination details
- Key highlights (3-4 points)
- Suggested price range
- Why it will be popular
- Confidence score (0-100)

Return as JSON array.`

  try {
    const result = await streamText({
      model: openai('gpt-4-turbo'),
      prompt,
      temperature: 0.8,
    })
    
    return result
  } catch (error) {
    console.error('Error generating package ideas:', error)
    throw error
  }
}

export async function analyzePricingOpportunity(packageId: string) {
  // This would analyze competitor pricing, demand, and suggest optimal pricing
  const prompt = `Analyze pricing opportunity for a travel package.
  
  Consider:
  - Current market demand
  - Seasonal factors
  - Competitor pricing
  - Historical booking patterns
  
  Suggest:
  - Optimal price point
  - Price increase/decrease recommendation
  - Reasoning
  - Confidence level`
  
  try {
    const result = await streamText({
      model: openai('gpt-4-turbo'),
      prompt,
      temperature: 0.5,
    })
    
    return result
  } catch (error) {
    console.error('Error analyzing pricing:', error)
    throw error
  }
}

export async function generateItinerary(destination: string, duration: number, preferences: any) {
  const prompt = `Create a detailed day-by-day itinerary for a ${duration}-day trip to ${destination}.

User preferences:
- Travel pace: ${preferences.travel_pace}
- Interests: ${preferences.interests?.join(', ')}
- Budget: ${preferences.budget_range}

For each day, include:
- Morning, afternoon, and evening activities
- Meal suggestions
- Accommodation recommendations
- Transportation details
- Estimated costs
- Hidden gems and local experiences

Return as structured JSON with day-wise breakdown.`

  try {
    const result = await streamText({
      model: openai('gpt-4-turbo'),
      prompt,
      temperature: 0.7,
    })
    
    return result
  } catch (error) {
    console.error('Error generating itinerary:', error)
    throw error
  }
}

'use client'

import { usePersonalizedRecommendations } from '@/hooks/use-personalized-recommendations'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Star, MapPin, Users, Clock, Sparkles, Target, TrendingUp } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface PersonalizedRecommendationsProps {
  limit?: number
  showHeader?: boolean
  showConfidenceLevels?: boolean
}

export function PersonalizedRecommendations({ 
  limit = 6, 
  showHeader = true,
  showConfidenceLevels = false 
}: PersonalizedRecommendationsProps) {
  const { 
    recommendations, 
    loading, 
    error, 
    metadata, 
    personalizationSummary,
    handlePackageClick,
    getRecommendationsByConfidence
  } = usePersonalizedRecommendations({ limit })

  if (loading) {
    return (
      <div className="space-y-4">
        {showHeader && (
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Personalized for You</h2>
            <Skeleton className="h-4 w-20" />
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-6 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <div className="text-red-600 mb-2">Failed to load recommendations</div>
        <p className="text-sm text-gray-600">{error}</p>
      </Card>
    )
  }

  if (recommendations.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations yet</h3>
        <p className="text-gray-600 mb-4">
          Complete your travel personalization to get tailored recommendations
        </p>
        <Button asChild>
          <Link href="/personalization">Personalize Now</Link>
        </Button>
      </Card>
    )
  }

  const highConfidenceRecs = getRecommendationsByConfidence('high')
  const mediumConfidenceRecs = getRecommendationsByConfidence('medium')
  const lowConfidenceRecs = getRecommendationsByConfidence('low')

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Personalized for You</h2>
            {metadata?.has_personalization && (
              <Badge variant="secondary" className="text-xs">
                <Target className="w-3 h-3 mr-1" />
                {metadata.confidence_distribution?.high || 0} high confidence
              </Badge>
            )}
          </div>
          {personalizationSummary?.has_personalization && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Based on your {personalizationSummary.interests.length} interests</span>
              <Badge variant="outline" className="text-xs">
                {personalizationSummary.budget_preference}
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* Personalization Summary */}
      {personalizationSummary?.has_personalization && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Recommendations tailored for {personalizationSummary.travel_type} travel
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {personalizationSummary.interests.slice(0, 3).map((interest) => (
                <Badge key={interest} variant="secondary" className="text-xs">
                  {interest.replace('-', ' ')}
                </Badge>
              ))}
              {personalizationSummary.interests.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{personalizationSummary.interests.length - 3} more
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* High Confidence Recommendations */}
      {showConfidenceLevels && highConfidenceRecs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-green-600" />
            <h3 className="text-lg font-medium">Perfect Matches</h3>
            <Badge className="bg-green-100 text-green-800 text-xs">
              High Confidence
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {highConfidenceRecs.slice(0, 3).map((rec) => (
              <RecommendationCard 
                key={rec.id} 
                recommendation={rec} 
                onPackageClick={handlePackageClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Recommendations */}
      {!showConfidenceLevels && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec) => (
            <RecommendationCard 
              key={rec.id} 
              recommendation={rec} 
              onPackageClick={handlePackageClick}
            />
          ))}
        </div>
      )}

      {/* Medium and Low Confidence (if showing confidence levels) */}
      {showConfidenceLevels && (mediumConfidenceRecs.length > 0 || lowConfidenceRecs.length > 0) && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700">More Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...mediumConfidenceRecs, ...lowConfidenceRecs].slice(0, 3).map((rec) => (
              <RecommendationCard 
                key={rec.id} 
                recommendation={rec} 
                onPackageClick={handlePackageClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* View More */}
      {recommendations.length >= limit && (
        <div className="text-center">
          <Button variant="outline" asChild>
            <Link href="/explore">View All Recommendations</Link>
          </Button>
        </div>
      )}
    </div>
  )
}

interface RecommendationCardProps {
  recommendation: any
  onPackageClick: (packageId: string) => void
}

function RecommendationCard({ recommendation, onPackageClick }: RecommendationCardProps) {
  const handleClick = () => {
    onPackageClick(recommendation.id)
  }

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group" onClick={handleClick}>
      <div className="relative">
        <Image
          src={recommendation.image_url || '/placeholder-destination.jpg'}
          alt={recommendation.name}
          width={400}
          height={200}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
        />
        <div className="absolute top-2 right-2">
          <Badge className={`text-xs ${getConfidenceColor(recommendation.confidence_level)}`}>
            {Math.round(recommendation.recommendation_score * 100)}% match
          </Badge>
        </div>
        {recommendation.discounted_price && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-red-500 text-white text-xs">
              Sale
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-1">{recommendation.name}</h3>
          
          {recommendation.destinations && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <MapPin className="w-3 h-3" />
              <span>{recommendation.destinations.name}</span>
              {recommendation.destinations.average_rating && (
                <div className="flex items-center gap-1 ml-2">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span>{recommendation.destinations.average_rating}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {recommendation.duration_days && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{recommendation.duration_days}D</span>
                </div>
              )}
              {recommendation.max_group_size && (
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>Max {recommendation.max_group_size}</span>
                </div>
              )}
            </div>
            
            <div className="text-right">
              {recommendation.discounted_price ? (
                <div>
                  <span className="text-sm text-gray-500 line-through">
                    ₹{recommendation.base_price?.toLocaleString()}
                  </span>
                  <div className="text-lg font-semibold text-green-600">
                    ₹{recommendation.discounted_price.toLocaleString()}
                  </div>
                </div>
              ) : (
                <div className="text-lg font-semibold">
                  ₹{recommendation.base_price?.toLocaleString()}
                </div>
              )}
            </div>
          </div>

          {/* Personalization Reasoning */}
          {recommendation.recommendation_reasoning && recommendation.recommendation_reasoning.length > 0 && (
            <div className="pt-2 border-t">
              <div className="flex items-center gap-1 mb-1">
                <Sparkles className="w-3 h-3 text-blue-500" />
                <span className="text-xs font-medium text-blue-700">Why this matches you:</span>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2">
                {recommendation.recommendation_reasoning[0]}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
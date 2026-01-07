import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock Supabase
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
  },
}

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: vi.fn(() => mockSupabaseClient),
}))

// Mock queries
const mockGetPersonalizedRecommendations = vi.fn()
const mockGetPackages = vi.fn()
const mockGetUserPreferences = vi.fn()

vi.mock('@/lib/supabase/queries', () => ({
  getPersonalizedRecommendations: mockGetPersonalizedRecommendations,
  getPackages: mockGetPackages,
  getUserPreferences: mockGetUserPreferences,
}))

describe('/api/recommendations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
      })

      const { GET } = await import('../recommendations/route')
      const request = new NextRequest('http://localhost:3000/api/recommendations')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return AI recommendations when available', async () => {
      const mockUser = { id: 'user-123' }
      const mockRecommendations = [
        {
          id: 'rec-1',
          user_id: 'user-123',
          package_id: 'pkg-1',
          confidence_score: 95,
          reasoning: 'Based on your travel history',
          packages: {
            id: 'pkg-1',
            name: 'Paris Adventure',
            description: 'Explore the City of Light',
            base_price: 1500,
            category: 'cultural',
          },
        },
      ]

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })
      mockGetPersonalizedRecommendations.mockResolvedValue(mockRecommendations)

      const { GET } = await import('../recommendations/route')
      const request = new NextRequest('http://localhost:3000/api/recommendations')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.packages).toHaveLength(1)
      expect(data.packages[0].name).toBe('Paris Adventure')
      expect(data.source).toBe('ai')
      expect(data.count).toBe(1)
      expect(data.total).toBe(1)
    })

    it('should fall back to rule-based recommendations when no AI recommendations exist', async () => {
      const mockUser = { id: 'user-123' }
      const mockPackages = [
        {
          id: 'pkg-1',
          name: 'Popular Package',
          description: 'A popular travel package',
          base_price: 1200,
          category: 'adventure',
          total_bookings: 50,
        },
      ]

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })
      mockGetPersonalizedRecommendations.mockResolvedValue([])
      mockGetUserPreferences.mockRejectedValue(new Error('No preferences'))
      mockGetPackages.mockResolvedValue(mockPackages)

      const { GET } = await import('../recommendations/route')
      const request = new NextRequest('http://localhost:3000/api/recommendations')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.packages).toHaveLength(1)
      expect(data.packages[0].name).toBe('Popular Package')
      expect(data.source).toBe('rule-based')
      expect(mockGetPackages).toHaveBeenCalledWith({
        status: 'live',
        limit: 10,
      })
    })

    it('should handle pagination parameters', async () => {
      const mockUser = { id: 'user-123' }
      const mockRecommendations = Array.from({ length: 15 }, (_, i) => ({
        id: `rec-${i}`,
        user_id: 'user-123',
        package_id: `pkg-${i}`,
        confidence_score: 90 - i,
        packages: {
          id: `pkg-${i}`,
          name: `Package ${i}`,
          description: `Description ${i}`,
          base_price: 1000 + i * 100,
        },
      }))

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })
      mockGetPersonalizedRecommendations.mockResolvedValue(mockRecommendations)

      const { GET } = await import('../recommendations/route')
      const request = new NextRequest('http://localhost:3000/api/recommendations?limit=5&page=2')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.packages).toHaveLength(5)
      expect(data.count).toBe(5)
      expect(data.total).toBe(15)
      expect(data.page).toBe(2)
      expect(data.limit).toBe(5)
    })

    it('should handle database errors', async () => {
      const mockUser = { id: 'user-123' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })
      mockGetPersonalizedRecommendations.mockRejectedValue(new Error('Database error'))

      const { GET } = await import('../recommendations/route')
      const request = new NextRequest('http://localhost:3000/api/recommendations')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch recommendations')
      expect(data.details).toBe('Database error')
    })
  })
})
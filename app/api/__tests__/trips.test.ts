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
const mockGetUserTrips = vi.fn()
const mockCreateTrip = vi.fn()

vi.mock('@/lib/supabase/queries', () => ({
  getUserTrips: mockGetUserTrips,
  createTrip: mockCreateTrip,
}))

describe('/api/trips', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
      })

      const { GET } = await import('../trips/route')
      const request = new NextRequest('http://localhost:3000/api/trips')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should fetch trips successfully for authenticated user', async () => {
      const mockUser = { id: 'user-123' }
      const mockTrips = [
        {
          id: 'trip-1',
          destination: 'Paris',
          start_date: '2024-01-01',
          end_date: '2024-01-07',
          travelers_count: 2,
          status: 'upcoming',
          total_cost: 2000,
        },
      ]

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })

      mockGetUserTrips.mockResolvedValue(mockTrips)

      const { GET } = await import('../trips/route')
      const request = new NextRequest('http://localhost:3000/api/trips')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.trips).toEqual(mockTrips)
      expect(data.count).toBe(1)
      expect(mockGetUserTrips).toHaveBeenCalledWith('user-123', undefined)
    })

    it('should filter trips by status', async () => {
      const mockUser = { id: 'user-123' }
      const mockTrips = [
        {
          id: 'trip-1',
          destination: 'Paris',
          status: 'upcoming',
        },
      ]

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })
      mockGetUserTrips.mockResolvedValue(mockTrips)

      const request = new NextRequest('http://localhost:3000/api/trips?status=upcoming')
      const response = await GET(request)

      expect(mockGetUserTrips).toHaveBeenCalledWith('user-123', 'upcoming')
    })

    it('should handle database errors', async () => {
      const mockUser = { id: 'user-123' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })
      mockGetUserTrips.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/trips')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch trips')
      expect(data.details).toBe('Database error')
    })
  })

  describe('POST', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
      })

      const request = new NextRequest('http://localhost:3000/api/trips', {
        method: 'POST',
        body: JSON.stringify({
          destination: 'Paris',
          start_date: '2024-01-01',
          end_date: '2024-01-07',
          travelers_count: 2,
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should create trip successfully for authenticated user', async () => {
      const mockUser = { id: 'user-123' }
      const tripData = {
        destination: 'Paris',
        start_date: '2024-01-01',
        end_date: '2024-01-07',
        travelers_count: 2,
      }
      const mockTrip = {
        id: 'trip-1',
        ...tripData,
        user_id: 'user-123',
        status: 'upcoming',
        total_cost: 0,
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })
      mockCreateTrip.mockResolvedValue(mockTrip)

      const { POST } = await import('../trips/route')
      const request = new NextRequest('http://localhost:3000/api/trips', {
        method: 'POST',
        body: JSON.stringify(tripData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.trip).toEqual(mockTrip)
      expect(mockCreateTrip).toHaveBeenCalledWith({
        ...tripData,
        user_id: 'user-123',
      })
    })

    it('should handle creation errors', async () => {
      const mockUser = { id: 'user-123' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })
      mockCreateTrip.mockRejectedValue(new Error('Creation failed'))

      const { POST } = await import('../trips/route')
      const request = new NextRequest('http://localhost:3000/api/trips', {
        method: 'POST',
        body: JSON.stringify({
          destination: 'Paris',
          start_date: '2024-01-01',
          end_date: '2024-01-07',
          travelers_count: 2,
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to create trip')
      expect(data.details).toBe('Creation failed')
    })
  })
})
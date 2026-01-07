import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from '../bookings/route'

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
const mockGetUserBookings = vi.fn()
const mockCreateBooking = vi.fn()

vi.mock('@/lib/supabase/queries', () => ({
  getUserBookings: mockGetUserBookings,
  createBooking: mockCreateBooking,
}))

describe('/api/bookings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
      })

      const request = new NextRequest('http://localhost:3000/api/bookings')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should fetch bookings successfully for authenticated user', async () => {
      const mockUser = { id: 'user-123' }
      const mockBookings = [
        {
          id: 'booking-1',
          trip_id: 'trip-1',
          booking_type: 'flight',
          title: 'Flight to Paris',
          status: 'confirmed',
          cost: 500,
        },
      ]

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })
      mockGetUserBookings.mockResolvedValue(mockBookings)

      const request = new NextRequest('http://localhost:3000/api/bookings')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.bookings).toEqual(mockBookings)
      expect(data.count).toBe(1)
      expect(mockGetUserBookings).toHaveBeenCalledWith('user-123')
    })

    it('should handle database errors', async () => {
      const mockUser = { id: 'user-123' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })
      mockGetUserBookings.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/bookings')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch bookings')
      expect(data.details).toBe('Database error')
    })
  })

  describe('POST', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
      })

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify({
          trip_id: 'trip-1',
          booking_type: 'flight',
          title: 'Flight to Paris',
          cost: 500,
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should create booking successfully for authenticated user', async () => {
      const mockUser = { id: 'user-123' }
      const bookingData = {
        trip_id: 'trip-1',
        booking_type: 'flight',
        title: 'Flight to Paris',
        cost: 500,
      }
      const mockBooking = {
        id: 'booking-1',
        ...bookingData,
        user_id: 'user-123',
        status: 'pending',
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })
      mockCreateBooking.mockResolvedValue(mockBooking)

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.booking).toEqual(mockBooking)
      expect(mockCreateBooking).toHaveBeenCalledWith({
        ...bookingData,
        user_id: 'user-123',
      })
    })

    it('should handle creation errors', async () => {
      const mockUser = { id: 'user-123' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })
      mockCreateBooking.mockRejectedValue(new Error('Creation failed'))

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        body: JSON.stringify({
          trip_id: 'trip-1',
          booking_type: 'flight',
          title: 'Flight to Paris',
          cost: 500,
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to create booking')
      expect(data.details).toBe('Creation failed')
    })
  })
})
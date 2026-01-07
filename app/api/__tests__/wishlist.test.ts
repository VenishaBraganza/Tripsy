import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST, DELETE } from '../wishlist/route'

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
const mockGetUserWishlist = vi.fn()
const mockAddToWishlist = vi.fn()
const mockRemoveFromWishlist = vi.fn()

vi.mock('@/lib/supabase/queries', () => ({
  getUserWishlist: mockGetUserWishlist,
  addToWishlist: mockAddToWishlist,
  removeFromWishlist: mockRemoveFromWishlist,
}))

// Mock validation middleware
vi.mock('@/lib/validation/middleware', () => ({
  validateRequestBody: vi.fn(),
  validateUUID: vi.fn(),
  rateLimit: vi.fn(() => ({ success: true })),
}))

describe('/api/wishlist', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
      })

      const request = new NextRequest('http://localhost:3000/api/wishlist')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should fetch wishlist successfully for authenticated user', async () => {
      const mockUser = { id: 'user-123' }
      const mockWishlist = [
        {
          id: 'wishlist-1',
          package_id: 'package-1',
          collection_name: 'all',
          created_at: '2024-01-01T00:00:00Z',
        },
      ]

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })
      mockGetUserWishlist.mockResolvedValue(mockWishlist)

      const request = new NextRequest('http://localhost:3000/api/wishlist')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.wishlist).toEqual(mockWishlist)
      expect(data.count).toBe(1)
      expect(mockGetUserWishlist).toHaveBeenCalledWith('user-123', undefined)
    })

    it('should filter wishlist by collection', async () => {
      const mockUser = { id: 'user-123' }
      const mockWishlist = [
        {
          id: 'wishlist-1',
          collection_name: 'favorites',
        },
      ]

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })
      mockGetUserWishlist.mockResolvedValue(mockWishlist)

      const request = new NextRequest('http://localhost:3000/api/wishlist?collection=favorites')
      const response = await GET(request)

      expect(mockGetUserWishlist).toHaveBeenCalledWith('user-123', 'favorites')
    })

    it('should handle database errors', async () => {
      const mockUser = { id: 'user-123' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })
      mockGetUserWishlist.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/wishlist')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch wishlist')
      expect(data.details).toBe('Database error')
    })
  })

  describe('POST', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
      })

      const request = new NextRequest('http://localhost:3000/api/wishlist', {
        method: 'POST',
        body: JSON.stringify({
          package_id: 'package-1',
          collection_name: 'favorites',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should add to wishlist successfully for authenticated user', async () => {
      const mockUser = { id: 'user-123' }
      const wishlistData = {
        package_id: 'package-1',
        collection_name: 'favorites',
      }
      const mockWishlistItem = {
        id: 'wishlist-1',
        ...wishlistData,
        user_id: 'user-123',
        created_at: '2024-01-01T00:00:00Z',
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })

      // Mock validation success
      const { validateRequestBody } = await import('@/lib/validation/middleware')
      ;(validateRequestBody as any).mockResolvedValue({
        success: true,
        data: wishlistData,
      })

      mockAddToWishlist.mockResolvedValue(mockWishlistItem)

      const request = new NextRequest('http://localhost:3000/api/wishlist', {
        method: 'POST',
        body: JSON.stringify(wishlistData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.item).toEqual(mockWishlistItem)
      expect(mockAddToWishlist).toHaveBeenCalledWith('user-123', wishlistData)
    })

    it('should handle validation errors', async () => {
      const mockUser = { id: 'user-123' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })

      // Mock validation failure
      const { validateRequestBody } = await import('@/lib/validation/middleware')
      ;(validateRequestBody as any).mockResolvedValue({
        success: false,
        response: new Response(JSON.stringify({ error: 'Invalid data' }), { status: 400 }),
      })

      const request = new NextRequest('http://localhost:3000/api/wishlist', {
        method: 'POST',
        body: JSON.stringify({ invalid: 'data' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid data')
    })
  })

  describe('DELETE', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
      })

      const request = new NextRequest('http://localhost:3000/api/wishlist?id=wishlist-1', {
        method: 'DELETE',
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 400 when wishlist ID is missing', async () => {
      const mockUser = { id: 'user-123' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })

      const request = new NextRequest('http://localhost:3000/api/wishlist', {
        method: 'DELETE',
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Wishlist ID required')
    })

    it('should remove from wishlist successfully', async () => {
      const mockUser = { id: 'user-123' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })

      // Mock UUID validation success
      const { validateUUID } = await import('@/lib/validation/middleware')
      ;(validateUUID as any).mockReturnValue({ success: true })

      mockRemoveFromWishlist.mockResolvedValue(undefined)

      const request = new NextRequest('http://localhost:3000/api/wishlist?id=wishlist-1', {
        method: 'DELETE',
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockRemoveFromWishlist).toHaveBeenCalledWith('wishlist-1')
    })

    it('should handle UUID validation errors', async () => {
      const mockUser = { id: 'user-123' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })

      // Mock UUID validation failure
      const { validateUUID } = await import('@/lib/validation/middleware')
      ;(validateUUID as any).mockReturnValue({
        success: false,
        response: new Response(JSON.stringify({ error: 'Invalid UUID' }), { status: 400 }),
      })

      const request = new NextRequest('http://localhost:3000/api/wishlist?id=invalid-uuid', {
        method: 'DELETE',
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid UUID')
    })
  })
})
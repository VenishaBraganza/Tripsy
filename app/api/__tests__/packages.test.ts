import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from '../packages/route'

// Mock Supabase
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
  })),
}

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: vi.fn(() => mockSupabaseClient),
}))

// Mock queries
const mockGetPackages = vi.fn()
const mockCreatePackage = vi.fn()

vi.mock('@/lib/supabase/queries', () => ({
  getPackages: mockGetPackages,
  createPackage: mockCreatePackage,
}))

describe('/api/packages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET', () => {
    it('should fetch packages successfully without authentication', async () => {
      const mockPackages = [
        {
          id: 'package-1',
          name: 'Paris Adventure',
          slug: 'paris-adventure',
          description: 'Explore the city of lights',
          base_price: 1000,
          status: 'live',
        },
      ]

      mockGetPackages.mockResolvedValue(mockPackages)

      const request = new NextRequest('http://localhost:3000/api/packages')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.packages).toEqual(mockPackages)
      expect(data.count).toBe(1)
      expect(mockGetPackages).toHaveBeenCalledWith({
        destinationId: undefined,
        category: undefined,
        minPrice: undefined,
        maxPrice: undefined,
        status: 'live',
        limit: undefined,
      })
    })

    it('should apply filters correctly', async () => {
      const mockPackages = [
        {
          id: 'package-1',
          name: 'Adventure Package',
          category: 'adventure',
          base_price: 1500,
          status: 'live',
        },
      ]

      mockGetPackages.mockResolvedValue(mockPackages)

      const request = new NextRequest(
        'http://localhost:3000/api/packages?category=adventure&minPrice=1000&maxPrice=2000&status=live&limit=10'
      )
      const response = await GET(request)

      expect(mockGetPackages).toHaveBeenCalledWith({
        destinationId: undefined,
        category: 'adventure',
        minPrice: 1000,
        maxPrice: 2000,
        status: 'live',
        limit: 10,
      })
    })

    it('should handle database errors', async () => {
      mockGetPackages.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/packages')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch packages')
      expect(data.details).toBe('Database error')
    })
  })

  describe('POST', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
      })

      const request = new NextRequest('http://localhost:3000/api/packages', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Package',
          description: 'A new travel package',
          base_price: 1000,
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 403 when user is not admin/operator', async () => {
      const mockUser = { id: 'user-123' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })

      // Mock profile query to return regular user
      const mockSelect = vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: { role: 'user' },
          }),
        })),
      }))
      mockSupabaseClient.from.mockReturnValue({
        select: mockSelect,
      })

      const request = new NextRequest('http://localhost:3000/api/packages', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Package',
          description: 'A new travel package',
          base_price: 1000,
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Forbidden')
    })

    it('should create package successfully for admin user', async () => {
      const mockUser = { id: 'admin-123' }
      const packageData = {
        name: 'New Package',
        description: 'A new travel package',
        base_price: 1000,
      }
      const mockPackage = {
        id: 'package-1',
        ...packageData,
        slug: 'new-package',
        status: 'draft',
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })

      // Mock profile query to return admin user
      const mockSelect = vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: { role: 'admin' },
          }),
        })),
      }))
      mockSupabaseClient.from.mockReturnValue({
        select: mockSelect,
      })

      mockCreatePackage.mockResolvedValue(mockPackage)

      const request = new NextRequest('http://localhost:3000/api/packages', {
        method: 'POST',
        body: JSON.stringify(packageData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.package).toEqual(mockPackage)
      expect(mockCreatePackage).toHaveBeenCalledWith(packageData, 'admin-123')
    })

    it('should handle creation errors', async () => {
      const mockUser = { id: 'admin-123' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      })

      // Mock profile query to return admin user
      const mockSelect = vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: { role: 'admin' },
          }),
        })),
      }))
      mockSupabaseClient.from.mockReturnValue({
        select: mockSelect,
      })

      mockCreatePackage.mockRejectedValue(new Error('Creation failed'))

      const request = new NextRequest('http://localhost:3000/api/packages', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Package',
          description: 'A new travel package',
          base_price: 1000,
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to create package')
      expect(data.details).toBe('Creation failed')
    })
  })
})
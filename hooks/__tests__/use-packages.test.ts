import { renderHook, waitFor } from '@testing-library/react'
import { usePackages, usePackage } from '../use-packages'

// Mock fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('usePackages', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    vi.clearAllMocks()
  })

  it('should fetch packages successfully', async () => {
    const mockPackages = [
      {
        id: '1',
        name: 'Paris Adventure',
        slug: 'paris-adventure',
        description: 'Explore the city of lights',
        base_price: 1000,
        duration_text: '7 days',
        image_url: 'https://example.com/paris.jpg',
        tags: ['city', 'culture'],
        status: 'live',
        total_bookings: 50,
      },
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ packages: mockPackages }),
    } as Response)

    const { result } = renderHook(() => usePackages())

    expect(result.current.loading).toBe(true)
    expect(result.current.packages).toEqual([])
    expect(result.current.error).toBe(null)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.packages).toEqual(mockPackages)
    expect(result.current.error).toBe(null)
    expect(mockFetch).toHaveBeenCalledWith('/api/packages?')
  })

  it('should handle fetch error', async () => {
    const errorMessage = 'Failed to fetch packages'
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
    } as Response)

    const { result } = renderHook(() => usePackages())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.packages).toEqual([])
    expect(result.current.error).toBe(errorMessage)
  })

  it('should apply filters correctly', async () => {
    const mockPackages = [
      {
        id: '1',
        name: 'Paris Adventure',
        slug: 'paris-adventure',
        description: 'Explore the city of lights',
        base_price: 1000,
        duration_text: '7 days',
        image_url: 'https://example.com/paris.jpg',
        tags: ['city', 'culture'],
        status: 'live',
        total_bookings: 50,
      },
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ packages: mockPackages }),
    } as Response)

    const filters = {
      category: 'adventure',
      minPrice: 500,
      maxPrice: 2000,
      status: 'live',
    }

    renderHook(() => usePackages(filters))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/packages?category=adventure&minPrice=500&maxPrice=2000&status=live'
      )
    })
  })

  it('should refetch when filters change', async () => {
    const mockPackages = [
      {
        id: '1',
        name: 'Paris Adventure',
        slug: 'paris-adventure',
        description: 'Explore the city of lights',
        base_price: 1000,
        duration_text: '7 days',
        image_url: 'https://example.com/paris.jpg',
        tags: ['city', 'culture'],
        status: 'live',
        total_bookings: 50,
      },
    ]

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ packages: mockPackages }),
    } as Response)

    const { rerender } = renderHook(
      ({ filters }) => usePackages(filters),
      {
        initialProps: { filters: { category: 'adventure' } },
      }
    )

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/packages?category=adventure')
    })

    mockFetch.mockClear()

    // Change filters
    rerender({ filters: { category: 'culture' } })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/packages?category=culture')
    })
  })
})

describe('usePackage', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    vi.clearAllMocks()
  })

  it('should fetch single package successfully', async () => {
    const mockPackage = {
      id: '1',
      name: 'Paris Adventure',
      slug: 'paris-adventure',
      description: 'Explore the city of lights',
      base_price: 1000,
      duration_text: '7 days',
      image_url: 'https://example.com/paris.jpg',
      tags: ['city', 'culture'],
      status: 'live',
      total_bookings: 50,
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ package: mockPackage }),
    } as Response)

    const { result } = renderHook(() => usePackage('paris-adventure'))

    expect(result.current.loading).toBe(true)
    expect(result.current.package).toBe(null)
    expect(result.current.error).toBe(null)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.package).toEqual(mockPackage)
    expect(result.current.error).toBe(null)
    expect(mockFetch).toHaveBeenCalledWith('/api/packages/paris-adventure')
  })

  it('should handle fetch error for single package', async () => {
    const errorMessage = 'Package not found'
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
    } as Response)

    const { result } = renderHook(() => usePackage('non-existent'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.package).toBe(null)
    expect(result.current.error).toBe(errorMessage)
  })

  it('should not fetch when slug is empty', () => {
    const { result } = renderHook(() => usePackage(''))

    expect(result.current.loading).toBe(true)
    expect(result.current.package).toBe(null)
    expect(result.current.error).toBe(null)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should refetch when slug changes', async () => {
    const mockPackage1 = {
      id: '1',
      name: 'Paris Adventure',
      slug: 'paris-adventure',
      description: 'Explore the city of lights',
      base_price: 1000,
      duration_text: '7 days',
      image_url: 'https://example.com/paris.jpg',
      tags: ['city', 'culture'],
      status: 'live',
      total_bookings: 50,
    }

    const mockPackage2 = {
      id: '2',
      name: 'Tokyo Experience',
      slug: 'tokyo-experience',
      description: 'Discover modern Japan',
      base_price: 1500,
      duration_text: '10 days',
      image_url: 'https://example.com/tokyo.jpg',
      tags: ['city', 'modern'],
      status: 'live',
      total_bookings: 30,
    }

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ package: mockPackage1 }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ package: mockPackage2 }),
      } as Response)

    const { rerender } = renderHook(
      ({ slug }) => usePackage(slug),
      {
        initialProps: { slug: 'paris-adventure' },
      }
    )

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/packages/paris-adventure')
    })

    // Change slug
    rerender({ slug: 'tokyo-experience' })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/packages/tokyo-experience')
    })
  })
})
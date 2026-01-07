import { renderHook, waitFor } from '@testing-library/react'
import { useWishlist } from '../use-wishlist'

// Mock fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('useWishlist', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    vi.clearAllMocks()
  })

  it('should fetch wishlist successfully', async () => {
    const mockWishlist = [
      {
        id: '1',
        package_id: 'package-1',
        collection_name: 'all',
        created_at: '2024-01-01T00:00:00Z',
        packages: {
          name: 'Paris Adventure',
          slug: 'paris-adventure',
          base_price: 1000,
          duration_text: '7 days',
          image_url: 'https://example.com/paris.jpg',
          tags: ['city', 'culture'],
        },
      },
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ wishlist: mockWishlist }),
    } as Response)

    const { result } = renderHook(() => useWishlist())

    expect(result.current.loading).toBe(true)
    expect(result.current.wishlist).toEqual([])
    expect(result.current.error).toBe(null)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.wishlist).toEqual(mockWishlist)
    expect(result.current.error).toBe(null)
    expect(mockFetch).toHaveBeenCalledWith('/api/wishlist?')
  })

  it('should handle fetch error', async () => {
    const errorMessage = 'Failed to fetch wishlist'
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
    } as Response)

    const { result } = renderHook(() => useWishlist())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.wishlist).toEqual([])
    expect(result.current.error).toBe(errorMessage)
  })

  it('should filter wishlist by collection', async () => {
    const mockWishlist = [
      {
        id: '1',
        package_id: 'package-1',
        collection_name: 'favorites',
        created_at: '2024-01-01T00:00:00Z',
      },
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ wishlist: mockWishlist }),
    } as Response)

    renderHook(() => useWishlist('favorites'))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/wishlist?collection=favorites')
    })
  })

  it('should add to wishlist successfully', async () => {
    const mockWishlistItem = {
      id: '1',
      package_id: 'package-1',
      collection_name: 'all',
      created_at: '2024-01-01T00:00:00Z',
    }

    // Mock initial fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ wishlist: [] }),
    } as Response)

    // Mock add to wishlist
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ wishlistItem: mockWishlistItem }),
    } as Response)

    // Mock refetch after add
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ wishlist: [mockWishlistItem] }),
    } as Response)

    const { result } = renderHook(() => useWishlist())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const addResult = await result.current.addToWishlist('package-1', 'favorites')

    expect(addResult.success).toBe(true)
    expect(mockFetch).toHaveBeenCalledWith('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        package_id: 'package-1',
        collection_name: 'favorites',
      }),
    })
  })

  it('should handle add to wishlist error', async () => {
    const errorMessage = 'Failed to add to wishlist'

    // Mock initial fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ wishlist: [] }),
    } as Response)

    // Mock add to wishlist error
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
    } as Response)

    const { result } = renderHook(() => useWishlist())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const addResult = await result.current.addToWishlist('package-1')

    expect(addResult.success).toBe(false)
    expect(addResult.error).toBe(errorMessage)
  })

  it('should remove from wishlist successfully', async () => {
    const mockWishlistItem = {
      id: '1',
      package_id: 'package-1',
      collection_name: 'all',
      created_at: '2024-01-01T00:00:00Z',
    }

    // Mock initial fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ wishlist: [mockWishlistItem] }),
    } as Response)

    // Mock remove from wishlist
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as Response)

    const { result } = renderHook(() => useWishlist())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.wishlist).toHaveLength(1)

    const removeResult = await result.current.removeFromWishlist('1')

    expect(removeResult.success).toBe(true)
    expect(result.current.wishlist).toHaveLength(0)
    expect(mockFetch).toHaveBeenCalledWith('/api/wishlist?id=1', {
      method: 'DELETE',
    })
  })

  it('should handle remove from wishlist error', async () => {
    const errorMessage = 'Failed to remove from wishlist'
    const mockWishlistItem = {
      id: '1',
      package_id: 'package-1',
      collection_name: 'all',
      created_at: '2024-01-01T00:00:00Z',
    }

    // Mock initial fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ wishlist: [mockWishlistItem] }),
    } as Response)

    // Mock remove from wishlist error
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
    } as Response)

    const { result } = renderHook(() => useWishlist())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const removeResult = await result.current.removeFromWishlist('1')

    expect(removeResult.success).toBe(false)
    expect(removeResult.error).toBe(errorMessage)
    expect(result.current.wishlist).toHaveLength(1) // Should remain unchanged
  })

  it('should refetch wishlist', async () => {
    const mockWishlist = [
      {
        id: '1',
        package_id: 'package-1',
        collection_name: 'all',
        created_at: '2024-01-01T00:00:00Z',
      },
    ]

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ wishlist: mockWishlist }),
    } as Response)

    const { result } = renderHook(() => useWishlist())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Clear previous calls
    mockFetch.mockClear()

    await result.current.refetch()

    expect(mockFetch).toHaveBeenCalledWith('/api/wishlist?')
  })
})
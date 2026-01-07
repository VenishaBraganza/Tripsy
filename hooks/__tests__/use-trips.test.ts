import { vi, describe, it, expect, beforeEach } from 'vitest'
import { ErrorHandler } from '@/lib/errors'

// Mock fetch
const mockFetch = global.fetch as any

describe('useTrips', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    vi.clearAllMocks()
  })

  it('should fetch trips successfully', async () => {
    const mockTrips = [
      {
        id: '1',
        destination: 'Paris',
        start_date: '2024-01-01',
        end_date: '2024-01-07',
        travelers_count: 2,
        status: 'upcoming',
        total_cost: 2000,
        payment_status: 'paid',
      },
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ trips: mockTrips }),
    } as Response)

    const { result } = renderHook(() => useTrips())

    expect(result.current.loading).toBe(true)
    expect(result.current.trips).toEqual([])
    expect(result.current.error).toBe(null)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.trips).toEqual(mockTrips)
    expect(result.current.error).toBe(null)
    expect(mockFetch).toHaveBeenCalledWith('/api/trips?')
  })

  it('should handle fetch error', async () => {
    const errorMessage = 'Failed to fetch trips'
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
    } as Response)

    const { result } = renderHook(() => useTrips())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.trips).toEqual([])
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe(errorMessage)
    expect(ErrorHandler.logError).toHaveBeenCalled()
  })

  it('should filter trips by status', async () => {
    const mockTrips = [
      {
        id: '1',
        destination: 'Paris',
        start_date: '2024-01-01',
        end_date: '2024-01-07',
        travelers_count: 2,
        status: 'upcoming',
        total_cost: 2000,
        payment_status: 'paid',
      },
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ trips: mockTrips }),
    } as Response)

    renderHook(() => useTrips('upcoming'))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/trips?status=upcoming')
    })
  })

  it('should create trip successfully', async () => {
    const mockTrip = {
      id: '1',
      destination: 'Paris',
      start_date: '2024-01-01',
      end_date: '2024-01-07',
      travelers_count: 2,
      status: 'upcoming',
      total_cost: 2000,
      payment_status: 'pending',
    }

    // Mock initial fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ trips: [] }),
    } as Response)

    // Mock create trip
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ trip: mockTrip }),
    } as Response)

    // Mock refetch after create
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ trips: [mockTrip] }),
    } as Response)

    const { result } = renderHook(() => useTrips())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const tripData = {
      destination: 'Paris',
      start_date: '2024-01-01',
      end_date: '2024-01-07',
      travelers_count: 2,
    }

    const createResult = await result.current.createTrip(tripData)

    expect(createResult.success).toBe(true)
    expect(createResult.trip).toEqual(mockTrip)
    expect(mockFetch).toHaveBeenCalledWith('/api/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tripData),
    })
  })

  it('should handle create trip error', async () => {
    const errorMessage = 'Failed to create trip'

    // Mock initial fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ trips: [] }),
    } as Response)

    // Mock create trip error
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
    } as Response)

    const { result } = renderHook(() => useTrips())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const tripData = {
      destination: 'Paris',
      start_date: '2024-01-01',
      end_date: '2024-01-07',
      travelers_count: 2,
    }

    const createResult = await result.current.createTrip(tripData)

    expect(createResult.success).toBe(false)
    expect(createResult.error).toBe(errorMessage)
    expect(ErrorHandler.logError).toHaveBeenCalled()
  })

  it('should update trip successfully', async () => {
    const mockTrip = {
      id: '1',
      destination: 'Paris',
      start_date: '2024-01-01',
      end_date: '2024-01-07',
      travelers_count: 2,
      status: 'upcoming',
      total_cost: 2000,
      payment_status: 'paid',
    }

    // Mock initial fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ trips: [mockTrip] }),
    } as Response)

    // Mock update trip
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ trip: { ...mockTrip, status: 'completed' } }),
    } as Response)

    // Mock refetch after update
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ trips: [{ ...mockTrip, status: 'completed' }] }),
    } as Response)

    const { result } = renderHook(() => useTrips())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const updateResult = await result.current.updateTrip('1', { status: 'completed' })

    expect(updateResult.success).toBe(true)
    expect(updateResult.trip?.status).toBe('completed')
    expect(mockFetch).toHaveBeenCalledWith('/api/trips/1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    })
  })

  it('should refetch trips', async () => {
    const mockTrips = [
      {
        id: '1',
        destination: 'Paris',
        start_date: '2024-01-01',
        end_date: '2024-01-07',
        travelers_count: 2,
        status: 'upcoming',
        total_cost: 2000,
        payment_status: 'paid',
      },
    ]

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ trips: mockTrips }),
    } as Response)

    const { result } = renderHook(() => useTrips())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Clear previous calls
    mockFetch.mockClear()

    await result.current.refetch()

    expect(mockFetch).toHaveBeenCalledWith('/api/trips?')
  })
})
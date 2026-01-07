import { renderHook, waitFor } from '@testing-library/react'
import { useBookings } from '../use-bookings'
import { ErrorHandler } from '@/lib/errors'

// Mock fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('useBookings', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    vi.clearAllMocks()
  })

  it('should fetch bookings successfully', async () => {
    const mockBookings = [
      {
        id: '1',
        trip_id: 'trip-1',
        booking_type: 'flight',
        title: 'Flight to Paris',
        status: 'confirmed',
        cost: 500,
      },
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ bookings: mockBookings }),
    } as Response)

    const { result } = renderHook(() => useBookings())

    expect(result.current.loading).toBe(true)
    expect(result.current.bookings).toEqual([])
    expect(result.current.error).toBe(null)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.bookings).toEqual(mockBookings)
    expect(result.current.error).toBe(null)
    expect(mockFetch).toHaveBeenCalledWith('/api/bookings?')
  })

  it('should handle fetch error', async () => {
    const errorMessage = 'Failed to fetch bookings'
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
    } as Response)

    const { result } = renderHook(() => useBookings())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.bookings).toEqual([])
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe(errorMessage)
    expect(ErrorHandler.logError).toHaveBeenCalled()
  })

  it('should filter bookings by trip ID', async () => {
    const mockBookings = [
      {
        id: '1',
        trip_id: 'trip-1',
        booking_type: 'flight',
        title: 'Flight to Paris',
        status: 'confirmed',
        cost: 500,
      },
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ bookings: mockBookings }),
    } as Response)

    renderHook(() => useBookings('trip-1'))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/bookings?trip_id=trip-1')
    })
  })

  it('should create booking successfully', async () => {
    const mockBooking = {
      id: '1',
      trip_id: 'trip-1',
      booking_type: 'flight',
      title: 'Flight to Paris',
      status: 'pending',
      cost: 500,
    }

    // Mock initial fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ bookings: [] }),
    } as Response)

    // Mock create booking
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ booking: mockBooking }),
    } as Response)

    // Mock refetch after create
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ bookings: [mockBooking] }),
    } as Response)

    const { result } = renderHook(() => useBookings())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const bookingData = {
      trip_id: 'trip-1',
      booking_type: 'flight',
      title: 'Flight to Paris',
      cost: 500,
    }

    const createResult = await result.current.createBooking(bookingData)

    expect(createResult.success).toBe(true)
    expect(createResult.booking).toEqual(mockBooking)
    expect(mockFetch).toHaveBeenCalledWith('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    })
  })

  it('should handle create booking error', async () => {
    const errorMessage = 'Failed to create booking'

    // Mock initial fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ bookings: [] }),
    } as Response)

    // Mock create booking error
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
    } as Response)

    const { result } = renderHook(() => useBookings())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const bookingData = {
      trip_id: 'trip-1',
      booking_type: 'flight',
      title: 'Flight to Paris',
      cost: 500,
    }

    const createResult = await result.current.createBooking(bookingData)

    expect(createResult.success).toBe(false)
    expect(createResult.error).toBe(errorMessage)
    expect(ErrorHandler.logError).toHaveBeenCalled()
  })

  it('should update booking status successfully', async () => {
    const mockBooking = {
      id: '1',
      trip_id: 'trip-1',
      booking_type: 'flight',
      title: 'Flight to Paris',
      status: 'pending',
      cost: 500,
    }

    // Mock initial fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ bookings: [mockBooking] }),
    } as Response)

    // Mock update booking
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ booking: { ...mockBooking, status: 'confirmed' } }),
    } as Response)

    // Mock refetch after update
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ bookings: [{ ...mockBooking, status: 'confirmed' }] }),
    } as Response)

    const { result } = renderHook(() => useBookings())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const updateResult = await result.current.updateBookingStatus('1', 'confirmed')

    expect(updateResult.success).toBe(true)
    expect(updateResult.booking?.status).toBe('confirmed')
    expect(mockFetch).toHaveBeenCalledWith('/api/bookings/1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'confirmed' }),
    })
  })

  it('should refetch bookings', async () => {
    const mockBookings = [
      {
        id: '1',
        trip_id: 'trip-1',
        booking_type: 'flight',
        title: 'Flight to Paris',
        status: 'confirmed',
        cost: 500,
      },
    ]

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ bookings: mockBookings }),
    } as Response)

    const { result } = renderHook(() => useBookings())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Clear previous calls
    mockFetch.mockClear()

    await result.current.refetch()

    expect(mockFetch).toHaveBeenCalledWith('/api/bookings?')
  })
})
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

// Mock Supabase client with realtime functionality
const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockReturnThis(),
  unsubscribe: vi.fn(),
}

const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
  },
  channel: vi.fn(() => mockChannel),
  removeChannel: vi.fn(),
}

vi.mock('@/lib/supabase/client', () => ({
  getSupabaseBrowserClient: () => mockSupabaseClient,
}))

describe('Real-time Updates', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
    })
  })

  it('should update booking status in real-time', async () => {
    const initialBookings = [
      {
        id: 'booking-1',
        title: 'Flight to Paris',
        status: 'pending',
        booking_type: 'flight',
      },
    ]

    const BookingsList = () => {
      const [bookings, setBookings] = React.useState(initialBookings)

      React.useEffect(() => {
        // Set up real-time subscription
        const channel = mockSupabaseClient
          .channel('bookings-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'bookings',
              filter: 'user_id=eq.user-123',
            },
            (payload: any) => {
              if (payload.eventType === 'UPDATE') {
                setBookings(prev => 
                  prev.map(booking => 
                    booking.id === payload.new.id ? payload.new : booking
                  )
                )
              }
            }
          )
          .subscribe()

        return () => {
          mockSupabaseClient.removeChannel(channel)
        }
      }, [])

      return (
        <div>
          {bookings.map((booking) => (
            <div key={booking.id} data-testid={`booking-${booking.id}`}>
              <h3>{booking.title}</h3>
              <span data-testid={`status-${booking.id}`}>{booking.status}</span>
            </div>
          ))}
        </div>
      )
    }

    render(<BookingsList />)

    // Verify initial state
    expect(screen.getByTestId('status-booking-1')).toHaveTextContent('pending')

    // Verify subscription was set up
    expect(mockSupabaseClient.channel).toHaveBeenCalledWith('bookings-changes')
    expect(mockChannel.on).toHaveBeenCalledWith(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter: 'user_id=eq.user-123',
      },
      expect.any(Function)
    )
    expect(mockChannel.subscribe).toHaveBeenCalled()

    // Simulate real-time update
    const updateCallback = mockChannel.on.mock.calls[0][2]
    updateCallback({
      eventType: 'UPDATE',
      new: {
        id: 'booking-1',
        title: 'Flight to Paris',
        status: 'confirmed',
        booking_type: 'flight',
      },
    })

    // Verify UI updated
    await waitFor(() => {
      expect(screen.getByTestId('status-booking-1')).toHaveTextContent('confirmed')
    })
  })

  it('should add new notifications in real-time', async () => {
    const NotificationsList = () => {
      const [notifications, setNotifications] = React.useState<any[]>([])

      React.useEffect(() => {
        const channel = mockSupabaseClient
          .channel('notifications-changes')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: 'user_id=eq.user-123',
            },
            (payload: any) => {
              setNotifications(prev => [payload.new, ...prev])
            }
          )
          .subscribe()

        return () => {
          mockSupabaseClient.removeChannel(channel)
        }
      }, [])

      return (
        <div>
          <h2>Notifications ({notifications.length})</h2>
          {notifications.length === 0 ? (
            <div data-testid="no-notifications">No notifications</div>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} data-testid={`notification-${notification.id}`}>
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>
              </div>
            ))
          )}
        </div>
      )
    }

    render(<NotificationsList />)

    // Verify initial empty state
    expect(screen.getByTestId('no-notifications')).toBeInTheDocument()
    expect(screen.getByText('Notifications (0)')).toBeInTheDocument()

    // Simulate new notification
    const insertCallback = mockChannel.on.mock.calls[0][2]
    insertCallback({
      eventType: 'INSERT',
      new: {
        id: 'notif-1',
        title: 'Booking Confirmed',
        message: 'Your flight to Paris has been confirmed',
        user_id: 'user-123',
        created_at: new Date().toISOString(),
      },
    })

    // Verify notification was added
    await waitFor(() => {
      expect(screen.getByText('Notifications (1)')).toBeInTheDocument()
      expect(screen.getByTestId('notification-notif-1')).toBeInTheDocument()
      expect(screen.getByText('Booking Confirmed')).toBeInTheDocument()
      expect(screen.getByText('Your flight to Paris has been confirmed')).toBeInTheDocument()
      expect(screen.queryByTestId('no-notifications')).not.toBeInTheDocument()
    })
  })

  it('should handle real-time trip updates', async () => {
    const initialTrips = [
      {
        id: 'trip-1',
        destination: 'Paris',
        status: 'planning',
        start_date: '2024-06-01',
      },
    ]

    const TripsList = () => {
      const [trips, setTrips] = React.useState(initialTrips)

      React.useEffect(() => {
        const channel = mockSupabaseClient
          .channel('trips-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'trips',
              filter: 'user_id=eq.user-123',
            },
            (payload: any) => {
              if (payload.eventType === 'UPDATE') {
                setTrips(prev => 
                  prev.map(trip => 
                    trip.id === payload.new.id ? payload.new : trip
                  )
                )
              } else if (payload.eventType === 'INSERT') {
                setTrips(prev => [...prev, payload.new])
              } else if (payload.eventType === 'DELETE') {
                setTrips(prev => prev.filter(trip => trip.id !== payload.old.id))
              }
            }
          )
          .subscribe()

        return () => {
          mockSupabaseClient.removeChannel(channel)
        }
      }, [])

      return (
        <div>
          <h2>My Trips ({trips.length})</h2>
          {trips.map((trip) => (
            <div key={trip.id} data-testid={`trip-${trip.id}`}>
              <h3>{trip.destination}</h3>
              <span data-testid={`trip-status-${trip.id}`}>{trip.status}</span>
            </div>
          ))}
        </div>
      )
    }

    render(<TripsList />)

    // Verify initial state
    expect(screen.getByText('My Trips (1)')).toBeInTheDocument()
    expect(screen.getByTestId('trip-status-trip-1')).toHaveTextContent('planning')

    // Simulate trip status update
    const updateCallback = mockChannel.on.mock.calls[0][2]
    updateCallback({
      eventType: 'UPDATE',
      new: {
        id: 'trip-1',
        destination: 'Paris',
        status: 'upcoming',
        start_date: '2024-06-01',
      },
    })

    // Verify status updated
    await waitFor(() => {
      expect(screen.getByTestId('trip-status-trip-1')).toHaveTextContent('upcoming')
    })

    // Simulate new trip addition
    updateCallback({
      eventType: 'INSERT',
      new: {
        id: 'trip-2',
        destination: 'Tokyo',
        status: 'planning',
        start_date: '2024-07-01',
      },
    })

    // Verify new trip added
    await waitFor(() => {
      expect(screen.getByText('My Trips (2)')).toBeInTheDocument()
      expect(screen.getByTestId('trip-trip-2')).toBeInTheDocument()
      expect(screen.getByText('Tokyo')).toBeInTheDocument()
    })

    // Simulate trip deletion
    updateCallback({
      eventType: 'DELETE',
      old: { id: 'trip-1' },
    })

    // Verify trip removed
    await waitFor(() => {
      expect(screen.getByText('My Trips (1)')).toBeInTheDocument()
      expect(screen.queryByTestId('trip-trip-1')).not.toBeInTheDocument()
      expect(screen.getByTestId('trip-trip-2')).toBeInTheDocument()
    })
  })

  it('should clean up subscriptions on unmount', async () => {
    const TestComponent = () => {
      React.useEffect(() => {
        const channel = mockSupabaseClient
          .channel('test-channel')
          .on('postgres_changes', {}, () => {})
          .subscribe()

        return () => {
          mockSupabaseClient.removeChannel(channel)
        }
      }, [])

      return <div>Test Component</div>
    }

    const { unmount } = render(<TestComponent />)

    // Verify subscription was created
    expect(mockSupabaseClient.channel).toHaveBeenCalledWith('test-channel')
    expect(mockChannel.subscribe).toHaveBeenCalled()

    // Unmount component
    unmount()

    // Verify cleanup was called
    expect(mockSupabaseClient.removeChannel).toHaveBeenCalledWith(mockChannel)
  })
})
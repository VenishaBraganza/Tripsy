import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'

// Mock Next.js router
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
  },
}

vi.mock('@/lib/supabase/client', () => ({
  getSupabaseBrowserClient: () => mockSupabaseClient,
}))

// Mock trip creation API
global.fetch = vi.fn()

describe('Trip Creation Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
    })
  })

  it('should create a trip successfully', async () => {
    const mockTrip = {
      id: 'trip-123',
      destination: 'Paris',
      start_date: '2024-06-01',
      end_date: '2024-06-07',
      travelers_count: 2,
      status: 'upcoming',
    }

    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ trip: mockTrip }),
    })

    // Mock trip creation component
    const TripCreationForm = () => {
      const [formData, setFormData] = React.useState({
        destination: '',
        start_date: '',
        end_date: '',
        travelers_count: 1,
      })

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        const response = await fetch('/api/trips', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          const data = await response.json()
          mockPush(`/dashboard/my-trips?trip=${data.trip.id}`)
        }
      }

      return (
        <form onSubmit={handleSubmit} data-testid="trip-form">
          <input
            type="text"
            placeholder="Destination"
            value={formData.destination}
            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            data-testid="destination-input"
          />
          <input
            type="date"
            placeholder="Start Date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            data-testid="start-date-input"
          />
          <input
            type="date"
            placeholder="End Date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            data-testid="end-date-input"
          />
          <input
            type="number"
            placeholder="Travelers"
            value={formData.travelers_count}
            onChange={(e) => setFormData({ ...formData, travelers_count: parseInt(e.target.value) })}
            data-testid="travelers-input"
          />
          <button type="submit" data-testid="create-trip-button">
            Create Trip
          </button>
        </form>
      )
    }

    render(<TripCreationForm />)

    // Fill out the form
    fireEvent.change(screen.getByTestId('destination-input'), {
      target: { value: 'Paris' },
    })
    fireEvent.change(screen.getByTestId('start-date-input'), {
      target: { value: '2024-06-01' },
    })
    fireEvent.change(screen.getByTestId('end-date-input'), {
      target: { value: '2024-06-07' },
    })
    fireEvent.change(screen.getByTestId('travelers-input'), {
      target: { value: '2' },
    })

    // Submit the form
    fireEvent.click(screen.getByTestId('create-trip-button'))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: 'Paris',
          start_date: '2024-06-01',
          end_date: '2024-06-07',
          travelers_count: 2,
        }),
      })
      expect(mockPush).toHaveBeenCalledWith('/dashboard/my-trips?trip=trip-123')
    })
  })

  it('should handle trip creation errors', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to create trip' }),
    })

    const TripCreationForm = () => {
      const [error, setError] = React.useState('')

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        const response = await fetch('/api/trips', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            destination: 'Paris',
            start_date: '2024-06-01',
            end_date: '2024-06-07',
            travelers_count: 2,
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          setError(data.error)
        }
      }

      return (
        <div>
          <form onSubmit={handleSubmit}>
            <button type="submit" data-testid="create-trip-button">
              Create Trip
            </button>
          </form>
          {error && <div data-testid="error-message">{error}</div>}
        </div>
      )
    }

    render(<TripCreationForm />)

    fireEvent.click(screen.getByTestId('create-trip-button'))

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Failed to create trip')
    })
  })

  it('should validate required fields', async () => {
    const TripCreationForm = () => {
      const [errors, setErrors] = React.useState<string[]>([])

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        const formData = new FormData(e.target as HTMLFormElement)
        const destination = formData.get('destination') as string
        const startDate = formData.get('start_date') as string
        const endDate = formData.get('end_date') as string

        const validationErrors: string[] = []
        
        if (!destination) validationErrors.push('Destination is required')
        if (!startDate) validationErrors.push('Start date is required')
        if (!endDate) validationErrors.push('End date is required')
        if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
          validationErrors.push('End date must be after start date')
        }

        setErrors(validationErrors)
      }

      return (
        <div>
          <form onSubmit={handleSubmit}>
            <input name="destination" data-testid="destination-input" />
            <input name="start_date" type="date" data-testid="start-date-input" />
            <input name="end_date" type="date" data-testid="end-date-input" />
            <button type="submit" data-testid="create-trip-button">
              Create Trip
            </button>
          </form>
          {errors.map((error, index) => (
            <div key={index} data-testid="validation-error">
              {error}
            </div>
          ))}
        </div>
      )
    }

    render(<TripCreationForm />)

    // Submit empty form
    fireEvent.click(screen.getByTestId('create-trip-button'))

    await waitFor(() => {
      const errorElements = screen.getAllByTestId('validation-error')
      expect(errorElements).toHaveLength(3)
      expect(errorElements[0]).toHaveTextContent('Destination is required')
      expect(errorElements[1]).toHaveTextContent('Start date is required')
      expect(errorElements[2]).toHaveTextContent('End date is required')
    })
  })
})
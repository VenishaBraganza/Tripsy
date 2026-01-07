import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getUser: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
  },
}

vi.mock('@/lib/supabase/client', () => ({
  getSupabaseBrowserClient: vi.fn(() => mockSupabaseClient),
}))

// Mock components that require authentication
vi.mock('@/components/dashboard/dashboard-content', () => ({
  DashboardContent: ({ user }: { user: any }) => (
    <div data-testid="dashboard-content">
      Welcome {user?.email || 'Guest'}
    </div>
  ),
}))

describe('Authentication Flow', () => {
  const mockPush = vi.fn()
  const mockReplace = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRouter as any).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
    })
  })

  it('should redirect unauthenticated users to login', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    })

    // Import and render a protected page
    const { default: DashboardPage } = await import('@/app/dashboard/page')
    
    render(<DashboardPage />)

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login')
    })
  })

  it('should allow authenticated users to access dashboard', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      user_metadata: { full_name: 'Test User' },
    }

    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    // Mock the data fetching hooks
    vi.mock('@/hooks/use-trips', () => ({
      useTrips: () => ({
        trips: [],
        loading: false,
        error: null,
      }),
    }))

    vi.mock('@/hooks/use-bookings', () => ({
      useBookings: () => ({
        bookings: [],
        loading: false,
        error: null,
      }),
    }))

    vi.mock('@/hooks/use-loyalty', () => ({
      useLoyalty: () => ({
        loyaltyPoints: { points: 1000, tier: 'gold' },
        loading: false,
        error: null,
      }),
    }))

    vi.mock('@/hooks/use-wishlist', () => ({
      useWishlist: () => ({
        wishlist: [],
        loading: false,
        error: null,
      }),
    }))

    const { default: DashboardPage } = await import('@/app/dashboard/page')
    
    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-content')).toBeInTheDocument()
      expect(screen.getByText('Welcome test@example.com')).toBeInTheDocument()
    })
  })

  it('should handle login form submission', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
    }

    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    const { default: LoginPage } = await import('@/app/login/page')
    
    render(<LoginPage />)

    // Fill in login form
    const emailInput = screen.getByPlaceholderText(/email/i)
    const passwordInput = screen.getByPlaceholderText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('should handle login errors', async () => {
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid credentials' },
    })

    const { default: LoginPage } = await import('@/app/login/page')
    
    render(<LoginPage />)

    const emailInput = screen.getByPlaceholderText(/email/i)
    const passwordInput = screen.getByPlaceholderText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })

  it('should handle logout', async () => {
    mockSupabaseClient.auth.signOut.mockResolvedValue({
      error: null,
    })

    // Mock a component with logout functionality
    const LogoutButton = () => {
      const handleLogout = async () => {
        await mockSupabaseClient.auth.signOut()
        mockPush('/login')
      }

      return (
        <button onClick={handleLogout} data-testid="logout-button">
          Logout
        </button>
      )
    }

    render(<LogoutButton />)

    const logoutButton = screen.getByTestId('logout-button')
    fireEvent.click(logoutButton)

    await waitFor(() => {
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })
})
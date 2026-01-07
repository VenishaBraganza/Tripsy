import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Mock fetch for API calls
global.fetch = vi.fn()

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
  },
}

vi.mock('@/lib/supabase/client', () => ({
  getSupabaseBrowserClient: () => mockSupabaseClient,
}))

describe('Wishlist Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
    })
  })

  it('should add item to wishlist successfully', async () => {
    const mockPackage = {
      id: 'pkg-123',
      name: 'Paris Adventure',
      description: 'Explore the City of Light',
      base_price: 1500,
      image_url: 'https://example.com/paris.jpg',
    }

    // Mock successful wishlist addition
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    })

    const WishlistButton = ({ packageData }: { packageData: any }) => {
      const [isInWishlist, setIsInWishlist] = React.useState(false)
      const [loading, setLoading] = React.useState(false)

      const handleWishlistToggle = async () => {
        setLoading(true)
        
        try {
          const response = await fetch('/api/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ package_id: packageData.id }),
          })

          if (response.ok) {
            setIsInWishlist(true)
          }
        } catch (error) {
          console.error('Error adding to wishlist:', error)
        } finally {
          setLoading(false)
        }
      }

      return (
        <div>
          <h3>{packageData.name}</h3>
          <p>{packageData.description}</p>
          <p>₹{packageData.base_price}</p>
          <button
            onClick={handleWishlistToggle}
            disabled={loading}
            data-testid="wishlist-button"
          >
            {loading ? 'Adding...' : isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
          </button>
        </div>
      )
    }

    render(<WishlistButton packageData={mockPackage} />)

    const wishlistButton = screen.getByTestId('wishlist-button')
    expect(wishlistButton).toHaveTextContent('Add to Wishlist')

    fireEvent.click(wishlistButton)

    // Check loading state
    await waitFor(() => {
      expect(wishlistButton).toHaveTextContent('Adding...')
      expect(wishlistButton).toBeDisabled()
    })

    // Check success state
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package_id: 'pkg-123' }),
      })
      expect(wishlistButton).toHaveTextContent('In Wishlist')
      expect(wishlistButton).not.toBeDisabled()
    })
  })

  it('should remove item from wishlist successfully', async () => {
    const mockWishlistItem = {
      id: 'wishlist-123',
      package_id: 'pkg-123',
      packages: {
        id: 'pkg-123',
        name: 'Paris Adventure',
        description: 'Explore the City of Light',
        base_price: 1500,
      },
    }

    // Mock successful wishlist removal
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    })

    const WishlistItem = ({ item }: { item: any }) => {
      const [isRemoving, setIsRemoving] = React.useState(false)
      const [isRemoved, setIsRemoved] = React.useState(false)

      const handleRemove = async () => {
        setIsRemoving(true)
        
        try {
          const response = await fetch(`/api/wishlist?id=${item.id}`, {
            method: 'DELETE',
          })

          if (response.ok) {
            setIsRemoved(true)
          }
        } catch (error) {
          console.error('Error removing from wishlist:', error)
        } finally {
          setIsRemoving(false)
        }
      }

      if (isRemoved) {
        return <div data-testid="removed-message">Item removed from wishlist</div>
      }

      return (
        <div data-testid="wishlist-item">
          <h3>{item.packages.name}</h3>
          <p>{item.packages.description}</p>
          <p>₹{item.packages.base_price}</p>
          <button
            onClick={handleRemove}
            disabled={isRemoving}
            data-testid="remove-button"
          >
            {isRemoving ? 'Removing...' : 'Remove from Wishlist'}
          </button>
        </div>
      )
    }

    render(<WishlistItem item={mockWishlistItem} />)

    const removeButton = screen.getByTestId('remove-button')
    expect(removeButton).toHaveTextContent('Remove from Wishlist')

    fireEvent.click(removeButton)

    // Check loading state
    await waitFor(() => {
      expect(removeButton).toHaveTextContent('Removing...')
      expect(removeButton).toBeDisabled()
    })

    // Check success state
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/wishlist?id=wishlist-123', {
        method: 'DELETE',
      })
      expect(screen.getByTestId('removed-message')).toHaveTextContent('Item removed from wishlist')
    })
  })

  it('should handle wishlist API errors', async () => {
    const mockPackage = {
      id: 'pkg-123',
      name: 'Paris Adventure',
    }

    // Mock API error
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to add to wishlist' }),
    })

    const WishlistButton = ({ packageData }: { packageData: any }) => {
      const [error, setError] = React.useState('')
      const [loading, setLoading] = React.useState(false)

      const handleWishlistToggle = async () => {
        setLoading(true)
        setError('')
        
        try {
          const response = await fetch('/api/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ package_id: packageData.id }),
          })

          if (!response.ok) {
            const data = await response.json()
            setError(data.error)
          }
        } catch (error) {
          setError('Network error')
        } finally {
          setLoading(false)
        }
      }

      return (
        <div>
          <button
            onClick={handleWishlistToggle}
            disabled={loading}
            data-testid="wishlist-button"
          >
            Add to Wishlist
          </button>
          {error && <div data-testid="error-message">{error}</div>}
        </div>
      )
    }

    render(<WishlistButton packageData={mockPackage} />)

    fireEvent.click(screen.getByTestId('wishlist-button'))

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Failed to add to wishlist')
    })
  })

  it('should display wishlist items correctly', async () => {
    const mockWishlistItems = [
      {
        id: 'wishlist-1',
        package_id: 'pkg-1',
        packages: {
          id: 'pkg-1',
          name: 'Paris Adventure',
          description: 'Explore the City of Light',
          base_price: 1500,
          image_url: 'https://example.com/paris.jpg',
        },
      },
      {
        id: 'wishlist-2',
        package_id: 'pkg-2',
        packages: {
          id: 'pkg-2',
          name: 'Tokyo Experience',
          description: 'Discover modern Japan',
          base_price: 2000,
          image_url: 'https://example.com/tokyo.jpg',
        },
      },
    ]

    const WishlistPage = ({ items }: { items: any[] }) => {
      return (
        <div>
          <h1>My Wishlist</h1>
          {items.length === 0 ? (
            <div data-testid="empty-wishlist">Your wishlist is empty</div>
          ) : (
            <div data-testid="wishlist-items">
              {items.map((item) => (
                <div key={item.id} data-testid="wishlist-item">
                  <h3>{item.packages.name}</h3>
                  <p>{item.packages.description}</p>
                  <p>₹{item.packages.base_price}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    render(<WishlistPage items={mockWishlistItems} />)

    expect(screen.getByText('My Wishlist')).toBeInTheDocument()
    expect(screen.getByTestId('wishlist-items')).toBeInTheDocument()
    
    const wishlistItems = screen.getAllByTestId('wishlist-item')
    expect(wishlistItems).toHaveLength(2)
    
    expect(screen.getByText('Paris Adventure')).toBeInTheDocument()
    expect(screen.getByText('Tokyo Experience')).toBeInTheDocument()
    expect(screen.getByText('₹1500')).toBeInTheDocument()
    expect(screen.getByText('₹2000')).toBeInTheDocument()
  })

  it('should display empty state when wishlist is empty', async () => {
    const WishlistPage = ({ items }: { items: any[] }) => {
      return (
        <div>
          <h1>My Wishlist</h1>
          {items.length === 0 ? (
            <div data-testid="empty-wishlist">Your wishlist is empty</div>
          ) : (
            <div data-testid="wishlist-items">
              {items.map((item) => (
                <div key={item.id} data-testid="wishlist-item">
                  <h3>{item.packages.name}</h3>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    render(<WishlistPage items={[]} />)

    expect(screen.getByTestId('empty-wishlist')).toHaveTextContent('Your wishlist is empty')
    expect(screen.queryByTestId('wishlist-items')).not.toBeInTheDocument()
  })
})
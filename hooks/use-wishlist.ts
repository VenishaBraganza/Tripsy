import { useState, useEffect } from 'react'

export interface WishlistItem {
  id: string
  package_id: string
  collection_name: string
  notes?: string
  created_at: string
  packages?: {
    name: string
    slug: string
    base_price: number
    discounted_price?: number
    duration_text: string
    image_url: string
    tags: string[]
    destinations?: {
      name: string
      state: string
    }
  }
}

export function useWishlist(collection?: string) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const fetchWishlist = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (collection) params.append('collection', collection)
      
      const response = await fetch(`/api/wishlist?${params.toString()}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch wishlist')
      }
      
      setWishlist(data.wishlist)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchWishlist()
  }, [collection])
  
  const addToWishlist = async (packageId: string, collectionName: string = 'all') => {
    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          package_id: packageId,
          collection_name: collectionName,
        }),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add to wishlist')
      }
      
      await fetchWishlist()
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }
  
  const removeFromWishlist = async (wishlistId: string) => {
    try {
      const response = await fetch(`/api/wishlist?id=${wishlistId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to remove from wishlist')
      }
      
      setWishlist(wishlist.filter(item => item.id !== wishlistId))
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }
  
  return {
    wishlist,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    refetch: fetchWishlist,
  }
}

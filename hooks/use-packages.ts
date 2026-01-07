import { useState, useEffect } from 'react'

export interface Package {
  id: string
  name: string
  slug: string
  description: string
  base_price: number
  discounted_price?: number
  duration_text: string
  image_url: string
  tags: string[]
  status: string
  total_bookings: number
  destinations?: {
    name: string
    state: string
  }
}

export function usePackages(filters?: {
  category?: string
  minPrice?: number
  maxPrice?: number
  status?: string
}) {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    async function fetchPackages() {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        
        if (filters?.category) params.append('category', filters.category)
        if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString())
        if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString())
        if (filters?.status) params.append('status', filters.status)
        
        const response = await fetch(`/api/packages?${params.toString()}`)
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch packages')
        }
        
        setPackages(data.packages)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchPackages()
  }, [filters?.category, filters?.minPrice, filters?.maxPrice, filters?.status])
  
  return { packages, loading, error, refetch: () => setLoading(true) }
}

export function usePackage(slug: string) {
  const [packageData, setPackageData] = useState<Package | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    async function fetchPackage() {
      try {
        setLoading(true)
        const response = await fetch(`/api/packages/${slug}`)
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch package')
        }
        
        setPackageData(data.package)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    if (slug) {
      fetchPackage()
    }
  }, [slug])
  
  return { package: packageData, loading, error }
}

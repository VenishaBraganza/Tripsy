'use client'

import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

/**
 * Client-side authentication utilities
 */

/**
 * Hook to get current user on client-side
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    // Get initial session
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          setError(error)
          setUser(null)
        } else {
          setUser(user)
          setError(null)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to get user'))
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (event === 'SIGNED_OUT') {
          router.push('/login')
        } else if (event === 'SIGNED_IN') {
          router.refresh()
        } else if (event === 'TOKEN_REFRESHED') {
          router.refresh()
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  return { user, loading, error, isAuthenticated: !!user }
}

/**
 * Sign out user
 */
export async function signOut() {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    throw error
  }
  
  // Redirect will be handled by onAuthStateChange
}

/**
 * Check if user is authenticated (client-side)
 */
export async function isAuthenticatedClient(): Promise<boolean> {
  const supabase = getSupabaseBrowserClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user !== null
}

/**
 * Require authentication on client-side
 * Redirects to login if not authenticated
 */
export function useRequireAuth() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?error=session_required')
    }
  }, [user, loading, router])

  return { user, loading }
}

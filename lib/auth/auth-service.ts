import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

/**
 * Authentication Service
 * Provides utilities for managing user authentication and sessions
 */

export interface AuthResult {
  user: User | null
  error: Error | null
}

/**
 * Get the current authenticated user (server-side)
 */
export async function getCurrentUser(): Promise<AuthResult> {
  try {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      return { user: null, error }
    }
    
    return { user, error: null }
  } catch (error) {
    return { 
      user: null, 
      error: error instanceof Error ? error : new Error('Unknown authentication error')
    }
  }
}

/**
 * Check if user is authenticated (server-side)
 */
export async function isAuthenticated(): Promise<boolean> {
  const { user } = await getCurrentUser()
  return user !== null
}

/**
 * Require authentication - redirect to login if not authenticated (server-side)
 * Use this in server components and route handlers
 */
export async function requireAuth(): Promise<User> {
  const { user, error } = await getCurrentUser()
  
  if (!user || error) {
    redirect('/login?error=session_required')
  }
  
  return user
}

/**
 * Require authentication with custom redirect (server-side)
 */
export async function requireAuthWithRedirect(redirectTo: string): Promise<User> {
  const { user, error } = await getCurrentUser()
  
  if (!user || error) {
    redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`)
  }
  
  return user
}

/**
 * Handle session expiration
 * Redirects to login with session expired message
 */
export function handleSessionExpired(): never {
  redirect('/login?error=session_expired')
}

/**
 * Get user session info
 */
export async function getSession() {
  try {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    
    const { data: { session }, error } = await supabase.auth.getSession()
    
    return { session, error }
  } catch (error) {
    return { 
      session: null, 
      error: error instanceof Error ? error : new Error('Failed to get session')
    }
  }
}

/**
 * Refresh the current session
 */
export async function refreshSession() {
  try {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    
    const { data: { session }, error } = await supabase.auth.refreshSession()
    
    return { session, error }
  } catch (error) {
    return { 
      session: null, 
      error: error instanceof Error ? error : new Error('Failed to refresh session')
    }
  }
}

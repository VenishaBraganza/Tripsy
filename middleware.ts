import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from "next/server"

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/dashboard/my-trips',
  '/dashboard/bookings',
  '/dashboard/wishlist',
  '/dashboard/history',
  '/dashboard/manage-packages',
  '/settings',
  '/support',
  '/explore',
  '/hidden-gems',
  '/packages',
  '/destinations',
  '/persona', // Persona page requires authentication
  '/personalization', // Personalization page requires authentication
]

// Public routes that don't require authentication (informational only)
const PUBLIC_ROUTES = [
  '/login',
  '/signup',
  '/auth/callback',
  '/stories',
  '/journal',
  '/about',
  '/careers',
  '/press',
  '/faq',
  '/terms',
  '/privacy',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Create response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Check if route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname.startsWith(route)
  )
  
  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname.startsWith(route) || pathname === '/'
  )

  // Get user session
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect to login if accessing protected route without authentication
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    redirectUrl.searchParams.set('error', 'session_required')
    return NextResponse.redirect(redirectUrl)
  }

  // Handle authenticated user redirects
  if (user && (pathname === '/login' || pathname === '/signup')) {
    // Check if user has completed onboarding
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()

      // If onboarding not completed, redirect to personalization
      if (!profile?.onboarding_completed) {
        return NextResponse.redirect(new URL('/personalization', request.url))
      }
    } catch (error) {
      console.warn('Error checking onboarding status:', error)
    }
    
    // If onboarding completed, redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Check onboarding status for dashboard access
  if (user && pathname.startsWith('/dashboard')) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()

      // If onboarding not completed, redirect to personalization
      if (!profile?.onboarding_completed) {
        return NextResponse.redirect(new URL('/personalization', request.url))
      }
    } catch (error) {
      console.warn('Error checking onboarding status:', error)
      // Allow access if there's an error checking onboarding status
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

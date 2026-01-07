/**
 * Authentication utilities
 * 
 * Server-side:
 * - getCurrentUser() - Get current user
 * - isAuthenticated() - Check if authenticated
 * - requireAuth() - Require auth or redirect
 * - getSession() - Get session info
 * - refreshSession() - Refresh session
 * 
 * Client-side:
 * - useAuth() - Hook to get user and auth state
 * - useRequireAuth() - Hook to require auth
 * - signOut() - Sign out user
 * - isAuthenticatedClient() - Check if authenticated
 */

// Server-side exports
export {
  getCurrentUser,
  isAuthenticated,
  requireAuth,
  requireAuthWithRedirect,
  handleSessionExpired,
  getSession,
  refreshSession,
  type AuthResult,
} from './auth-service'

// Client-side exports
export {
  useAuth,
  useRequireAuth,
  signOut,
  isAuthenticatedClient,
} from './auth-client'

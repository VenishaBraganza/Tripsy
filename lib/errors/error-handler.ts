/**
 * Error Handler Service
 * Centralized error handling with user-friendly messages
 */

export interface UserFriendlyError {
  title: string
  message: string
  action?: {
    label: string
    handler: () => void
  }
}

export class ErrorHandler {
  /**
   * Handle database errors
   */
  static handleDatabaseError(error: Error): UserFriendlyError {
    console.error('[Database Error]:', error)

    // Check for specific error types
    if (error.message.includes('timeout')) {
      return {
        title: 'Request Timeout',
        message: 'The request took too long to complete. Please try again.',
        action: {
          label: 'Retry',
          handler: () => window.location.reload(),
        },
      }
    }

    if (error.message.includes('connection')) {
      return {
        title: 'Connection Error',
        message: 'Unable to connect to the database. Please check your internet connection.',
        action: {
          label: 'Retry',
          handler: () => window.location.reload(),
        },
      }
    }

    if (error.message.includes('permission') || error.message.includes('RLS')) {
      return {
        title: 'Permission Denied',
        message: 'You don\'t have permission to access this data.',
      }
    }

    // Generic database error
    return {
      title: 'Database Error',
      message: 'We encountered an error while accessing the database. Please try again later.',
      action: {
        label: 'Retry',
        handler: () => window.location.reload(),
      },
    }
  }

  /**
   * Handle API errors
   */
  static handleAPIError(error: Error): UserFriendlyError {
    console.error('[API Error]:', error)

    // Check for rate limiting
    if (error.message.includes('rate limit') || error.message.includes('429')) {
      return {
        title: 'Too Many Requests',
        message: 'You\'ve made too many requests. Please try again in a few minutes.',
      }
    }

    // Check for service unavailable
    if (error.message.includes('503') || error.message.includes('unavailable')) {
      return {
        title: 'Service Unavailable',
        message: 'The service is temporarily unavailable. Please try again later.',
        action: {
          label: 'Retry',
          handler: () => window.location.reload(),
        },
      }
    }

    // Check for bad request
    if (error.message.includes('400') || error.message.includes('bad request')) {
      return {
        title: 'Invalid Request',
        message: 'The request was invalid. Please check your input and try again.',
      }
    }

    // Generic API error
    return {
      title: 'API Error',
      message: 'We encountered an error while communicating with the server. Please try again.',
      action: {
        label: 'Retry',
        handler: () => window.location.reload(),
      },
    }
  }

  /**
   * Handle authentication errors
   */
  static handleAuthError(error: Error): UserFriendlyError {
    console.error('[Auth Error]:', error)

    // Check for session expired
    if (error.message.includes('expired') || error.message.includes('invalid')) {
      return {
        title: 'Session Expired',
        message: 'Your session has expired. Please log in again.',
        action: {
          label: 'Log In',
          handler: () => {
            window.location.href = '/login?error=session_expired'
          },
        },
      }
    }

    // Check for invalid credentials
    if (error.message.includes('credentials') || error.message.includes('password')) {
      return {
        title: 'Invalid Credentials',
        message: 'The email or password you entered is incorrect.',
      }
    }

    // Check for permission denied
    if (error.message.includes('permission') || error.message.includes('unauthorized')) {
      return {
        title: 'Access Denied',
        message: 'You don\'t have permission to access this resource.',
      }
    }

    // Generic auth error
    return {
      title: 'Authentication Error',
      message: 'We encountered an authentication error. Please try logging in again.',
      action: {
        label: 'Log In',
        handler: () => {
          window.location.href = '/login'
        },
      },
    }
  }

  /**
   * Handle network errors
   */
  static handleNetworkError(error: Error): UserFriendlyError {
    console.error('[Network Error]:', error)

    // Check for offline
    if (!navigator.onLine) {
      return {
        title: 'No Internet Connection',
        message: 'You appear to be offline. Please check your internet connection.',
        action: {
          label: 'Retry',
          handler: () => window.location.reload(),
        },
      }
    }

    // Check for timeout
    if (error.message.includes('timeout')) {
      return {
        title: 'Request Timeout',
        message: 'The request took too long. Please check your connection and try again.',
        action: {
          label: 'Retry',
          handler: () => window.location.reload(),
        },
      }
    }

    // Generic network error
    return {
      title: 'Network Error',
      message: 'We encountered a network error. Please check your connection and try again.',
      action: {
        label: 'Retry',
        handler: () => window.location.reload(),
      },
    }
  }

  /**
   * Display error to user (can be extended with toast notifications)
   */
  static displayError(error: UserFriendlyError): void {
    // For now, just log to console
    // TODO: Integrate with toast notification system
    console.error('User-facing error:', error)
    
    // Could also show a modal or toast here
    alert(`${error.title}\n\n${error.message}`)
  }

  /**
   * Log error for debugging
   */
  static logError(error: Error, context: string): void {
    console.error(`[${context}]`, {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    })

    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
  }

  /**
   * Handle any error and return user-friendly version
   */
  static handleError(error: Error, context?: string): UserFriendlyError {
    if (context) {
      this.logError(error, context)
    }

    // Determine error type and handle accordingly
    if (error.message.includes('auth') || error.message.includes('session')) {
      return this.handleAuthError(error)
    }

    if (error.message.includes('network') || error.message.includes('fetch')) {
      return this.handleNetworkError(error)
    }

    if (error.message.includes('database') || error.message.includes('supabase')) {
      return this.handleDatabaseError(error)
    }

    if (error.message.includes('api') || error.message.includes('http')) {
      return this.handleAPIError(error)
    }

    // Generic error
    return {
      title: 'Something Went Wrong',
      message: 'We encountered an unexpected error. Please try again.',
      action: {
        label: 'Retry',
        handler: () => window.location.reload(),
      },
    }
  }
}

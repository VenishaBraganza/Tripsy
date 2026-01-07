// Error tracking and reporting system

import { logger } from './logger'

export interface ErrorReport {
  id: string
  message: string
  stack?: string
  url: string
  lineNumber?: number
  columnNumber?: number
  timestamp: number
  userId?: string
  sessionId?: string
  userAgent: string
  metadata?: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export class ErrorTracker {
  private static instance: ErrorTracker
  private errorQueue: ErrorReport[] = []
  private maxQueueSize = 100
  private isOnline = true

  private constructor() {
    if (typeof window !== 'undefined') {
      this.setupGlobalErrorHandlers()
      this.setupNetworkMonitoring()
    }
  }

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker()
    }
    return ErrorTracker.instance
  }

  private setupGlobalErrorHandlers() {
    // Catch JavaScript errors
    window.addEventListener('error', (event) => {
      this.captureError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename,
        lineNumber: event.lineno,
        columnNumber: event.colno,
        severity: 'high',
        metadata: {
          type: 'javascript_error',
          error: event.error
        }
      })
    })

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href,
        severity: 'high',
        metadata: {
          type: 'unhandled_promise_rejection',
          reason: event.reason
        }
      })
    })

    // Catch React errors (if using React error boundaries)
    const originalConsoleError = console.error
    console.error = (...args) => {
      // Check if this looks like a React error
      const message = args.join(' ')
      if (message.includes('React') || message.includes('component')) {
        this.captureError({
          message: `React Error: ${message}`,
          url: window.location.href,
          severity: 'medium',
          metadata: {
            type: 'react_error',
            args
          }
        })
      }
      originalConsoleError.apply(console, args)
    }
  }

  private setupNetworkMonitoring() {
    // Monitor online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true
      this.flushErrorQueue()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
    })

    // Monitor fetch failures
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args)
        
        // Track API errors
        if (!response.ok) {
          this.captureError({
            message: `API Error: ${response.status} ${response.statusText}`,
            url: typeof args[0] === 'string' ? args[0] : args[0].url,
            severity: response.status >= 500 ? 'high' : 'medium',
            metadata: {
              type: 'api_error',
              status: response.status,
              statusText: response.statusText,
              method: typeof args[1] === 'object' ? args[1]?.method : 'GET'
            }
          })
        }
        
        return response
      } catch (error) {
        this.captureError({
          message: `Network Error: ${error}`,
          url: typeof args[0] === 'string' ? args[0] : args[0].url,
          severity: 'high',
          metadata: {
            type: 'network_error',
            error: error instanceof Error ? error.message : String(error)
          }
        })
        throw error
      }
    }
  }

  captureError(errorData: Partial<ErrorReport>) {
    const errorReport: ErrorReport = {
      id: this.generateErrorId(),
      message: errorData.message || 'Unknown error',
      stack: errorData.stack,
      url: errorData.url || (typeof window !== 'undefined' ? window.location.href : ''),
      lineNumber: errorData.lineNumber,
      columnNumber: errorData.columnNumber,
      timestamp: Date.now(),
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      metadata: errorData.metadata,
      severity: errorData.severity || 'medium'
    }

    // Log the error
    logger.error(errorReport.message, undefined, 'ERROR_TRACKER', {
      errorId: errorReport.id,
      severity: errorReport.severity,
      ...errorReport.metadata
    })

    // Add to queue
    this.errorQueue.push(errorReport)

    // Prevent queue overflow
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue = this.errorQueue.slice(-this.maxQueueSize)
    }

    // Try to send immediately for critical errors
    if (errorReport.severity === 'critical' && this.isOnline) {
      this.sendError(errorReport)
    }

    // Batch send for other errors
    this.scheduleFlush()
  }

  private generateErrorId(): string {
    return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private getCurrentUserId(): string | undefined {
    if (typeof window !== 'undefined') {
      try {
        const user = JSON.parse(localStorage.getItem('supabase.auth.token') || '{}')
        return user?.user?.id
      } catch {
        return undefined
      }
    }
    return undefined
  }

  private getSessionId(): string | undefined {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('app-session-id') || undefined
    }
    return undefined
  }

  private flushTimeout?: NodeJS.Timeout

  private scheduleFlush() {
    if (this.flushTimeout) return

    this.flushTimeout = setTimeout(() => {
      this.flushErrorQueue()
      this.flushTimeout = undefined
    }, 5000) // Flush every 5 seconds
  }

  private async flushErrorQueue() {
    if (this.errorQueue.length === 0 || !this.isOnline) return

    const errorsToSend = [...this.errorQueue]
    this.errorQueue = []

    try {
      await this.sendErrors(errorsToSend)
    } catch (error) {
      // Put errors back in queue if sending failed
      this.errorQueue.unshift(...errorsToSend)
      logger.error('Failed to send error reports', error as Error, 'ERROR_TRACKER')
    }
  }

  private async sendError(error: ErrorReport) {
    try {
      await this.sendErrors([error])
    } catch (err) {
      logger.error('Failed to send single error report', err as Error, 'ERROR_TRACKER')
    }
  }

  private async sendErrors(errors: ErrorReport[]) {
    // In production, send to error tracking service (Sentry, Bugsnag, etc.)
    if (process.env.NODE_ENV === 'production') {
      await this.sendToErrorService(errors)
    } else {
      // In development, just log to console
      console.group('🐛 Error Reports')
      errors.forEach(error => {
        console.error(`[${error.severity.toUpperCase()}] ${error.message}`, error)
      })
      console.groupEnd()
    }
  }

  private async sendToErrorService(errors: ErrorReport[]) {
    try {
      // Example: Send to custom error tracking endpoint
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ errors }),
      })
    } catch (error) {
      console.error('Failed to send errors to service:', error)
    }
  }

  // Manual error reporting
  reportError(
    message: string,
    error?: Error,
    severity: ErrorReport['severity'] = 'medium',
    metadata?: Record<string, any>
  ) {
    this.captureError({
      message,
      stack: error?.stack,
      severity,
      metadata: {
        manual: true,
        ...metadata
      }
    })
  }

  // User feedback on errors
  reportUserFeedback(errorId: string, feedback: string, userEmail?: string) {
    this.captureError({
      message: `User feedback for error ${errorId}: ${feedback}`,
      severity: 'low',
      metadata: {
        type: 'user_feedback',
        errorId,
        feedback,
        userEmail
      }
    })
  }

  // Get error statistics
  getErrorStats(): Record<string, any> {
    const stats = {
      total: this.errorQueue.length,
      bySeverity: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      recent: this.errorQueue.slice(-10)
    }

    this.errorQueue.forEach(error => {
      // Count by severity
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1
      
      // Count by type
      const type = error.metadata?.type || 'unknown'
      stats.byType[type] = (stats.byType[type] || 0) + 1
    })

    return stats
  }

  // Clear error queue
  clear() {
    this.errorQueue = []
  }
}

// Global error tracker
export const errorTracker = ErrorTracker.getInstance()

// Convenience functions
export const trackError = {
  capture: (message: string, error?: Error, severity?: ErrorReport['severity'], metadata?: Record<string, any>) =>
    errorTracker.reportError(message, error, severity, metadata),
  feedback: (errorId: string, feedback: string, userEmail?: string) =>
    errorTracker.reportUserFeedback(errorId, feedback, userEmail),
  stats: () => errorTracker.getErrorStats(),
}
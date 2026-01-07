// Comprehensive logging system for the application

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: string
  metadata?: Record<string, any>
  userId?: string
  sessionId?: string
  requestId?: string
}

export class Logger {
  private static instance: Logger
  private logLevel: LogLevel = LogLevel.INFO
  private logBuffer: LogEntry[] = []
  private maxBufferSize = 1000
  private flushInterval = 30000 // 30 seconds

  private constructor() {
    // Set log level based on environment
    if (typeof window !== 'undefined') {
      this.logLevel = process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.WARN
    } else {
      this.logLevel = process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO
    }

    // Start periodic flush
    if (typeof window !== 'undefined') {
      setInterval(() => this.flush(), this.flushInterval)
    }
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: string,
    metadata?: Record<string, any>
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      metadata,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      requestId: this.getRequestId(),
    }
  }

  private getCurrentUserId(): string | undefined {
    // Try to get user ID from various sources
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
      let sessionId = sessionStorage.getItem('app-session-id')
      if (!sessionId) {
        sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        sessionStorage.setItem('app-session-id', sessionId)
      }
      return sessionId
    }
    return undefined
  }

  private getRequestId(): string | undefined {
    // This would be set by middleware in API routes
    return undefined
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel
  }

  private formatMessage(entry: LogEntry): string {
    const levelName = LogLevel[entry.level]
    const contextStr = entry.context ? `[${entry.context}] ` : ''
    const metadataStr = entry.metadata ? ` ${JSON.stringify(entry.metadata)}` : ''
    return `${entry.timestamp} ${levelName} ${contextStr}${entry.message}${metadataStr}`
  }

  private addToBuffer(entry: LogEntry) {
    this.logBuffer.push(entry)
    
    // Prevent buffer overflow
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer = this.logBuffer.slice(-this.maxBufferSize)
    }

    // Auto-flush on errors
    if (entry.level >= LogLevel.ERROR) {
      this.flush()
    }
  }

  debug(message: string, context?: string, metadata?: Record<string, any>) {
    if (!this.shouldLog(LogLevel.DEBUG)) return
    
    const entry = this.createLogEntry(LogLevel.DEBUG, message, context, metadata)
    console.debug(this.formatMessage(entry))
    this.addToBuffer(entry)
  }

  info(message: string, context?: string, metadata?: Record<string, any>) {
    if (!this.shouldLog(LogLevel.INFO)) return
    
    const entry = this.createLogEntry(LogLevel.INFO, message, context, metadata)
    console.info(this.formatMessage(entry))
    this.addToBuffer(entry)
  }

  warn(message: string, context?: string, metadata?: Record<string, any>) {
    if (!this.shouldLog(LogLevel.WARN)) return
    
    const entry = this.createLogEntry(LogLevel.WARN, message, context, metadata)
    console.warn(this.formatMessage(entry))
    this.addToBuffer(entry)
  }

  error(message: string, error?: Error, context?: string, metadata?: Record<string, any>) {
    if (!this.shouldLog(LogLevel.ERROR)) return
    
    const errorMetadata = error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...metadata
    } : metadata

    const entry = this.createLogEntry(LogLevel.ERROR, message, context, errorMetadata)
    console.error(this.formatMessage(entry))
    this.addToBuffer(entry)
  }

  // Performance logging
  time(label: string, context?: string) {
    const startTime = performance.now()
    return {
      end: (metadata?: Record<string, any>) => {
        const duration = performance.now() - startTime
        this.info(`${label} completed in ${duration.toFixed(2)}ms`, context, {
          duration,
          ...metadata
        })
      }
    }
  }

  // API request logging
  logApiRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    metadata?: Record<string, any>
  ) {
    const level = statusCode >= 400 ? LogLevel.ERROR : LogLevel.INFO
    const message = `${method} ${url} ${statusCode} ${duration}ms`
    
    if (level === LogLevel.ERROR) {
      this.error(message, undefined, 'API', { method, url, statusCode, duration, ...metadata })
    } else {
      this.info(message, 'API', { method, url, statusCode, duration, ...metadata })
    }
  }

  // User action logging
  logUserAction(action: string, metadata?: Record<string, any>) {
    this.info(`User action: ${action}`, 'USER', metadata)
  }

  // Database operation logging
  logDatabaseOperation(
    operation: string,
    table: string,
    duration: number,
    metadata?: Record<string, any>
  ) {
    this.info(`DB ${operation} on ${table} (${duration}ms)`, 'DATABASE', {
      operation,
      table,
      duration,
      ...metadata
    })
  }

  // Flush logs to external service
  private async flush() {
    if (this.logBuffer.length === 0) return

    const logsToFlush = [...this.logBuffer]
    this.logBuffer = []

    try {
      // In production, send to logging service (e.g., Sentry, LogRocket, etc.)
      if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
        await this.sendToLoggingService(logsToFlush)
      }
    } catch (error) {
      console.error('Failed to flush logs:', error)
      // Put logs back in buffer
      this.logBuffer.unshift(...logsToFlush)
    }
  }

  private async sendToLoggingService(logs: LogEntry[]) {
    // Example: Send to a logging API endpoint
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs }),
      })
    } catch (error) {
      console.error('Failed to send logs to service:', error)
    }
  }

  // Get recent logs for debugging
  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logBuffer.slice(-count)
  }

  // Clear logs
  clear() {
    this.logBuffer = []
  }
}

// Global logger instance
export const logger = Logger.getInstance()

// Convenience functions
export const log = {
  debug: (message: string, context?: string, metadata?: Record<string, any>) => 
    logger.debug(message, context, metadata),
  info: (message: string, context?: string, metadata?: Record<string, any>) => 
    logger.info(message, context, metadata),
  warn: (message: string, context?: string, metadata?: Record<string, any>) => 
    logger.warn(message, context, metadata),
  error: (message: string, error?: Error, context?: string, metadata?: Record<string, any>) => 
    logger.error(message, error, context, metadata),
  time: (label: string, context?: string) => logger.time(label, context),
  apiRequest: (method: string, url: string, statusCode: number, duration: number, metadata?: Record<string, any>) =>
    logger.logApiRequest(method, url, statusCode, duration, metadata),
  userAction: (action: string, metadata?: Record<string, any>) => 
    logger.logUserAction(action, metadata),
  dbOperation: (operation: string, table: string, duration: number, metadata?: Record<string, any>) =>
    logger.logDatabaseOperation(operation, table, duration, metadata),
}
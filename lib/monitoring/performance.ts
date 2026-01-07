// Performance monitoring utilities

import { logger } from './logger'

export interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: number
  metadata?: Record<string, any>
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetric[] = []
  private maxMetrics = 1000
  private observers: PerformanceObserver[] = []

  private constructor() {
    if (typeof window !== 'undefined') {
      this.setupPerformanceObservers()
      this.setupWebVitals()
    }
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  private setupPerformanceObservers() {
    try {
      // Navigation timing
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming
            this.recordMetric('page_load_time', navEntry.loadEventEnd - navEntry.navigationStart, 'ms')
            this.recordMetric('dom_content_loaded', navEntry.domContentLoadedEventEnd - navEntry.navigationStart, 'ms')
            this.recordMetric('first_paint', navEntry.responseEnd - navEntry.requestStart, 'ms')
          }
        }
      })
      navObserver.observe({ entryTypes: ['navigation'] })
      this.observers.push(navObserver)

      // Resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming
            this.recordMetric('resource_load_time', resourceEntry.responseEnd - resourceEntry.requestStart, 'ms', {
              resource: resourceEntry.name,
              type: resourceEntry.initiatorType
            })
          }
        }
      })
      resourceObserver.observe({ entryTypes: ['resource'] })
      this.observers.push(resourceObserver)

      // Long tasks
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'longtask') {
            this.recordMetric('long_task', entry.duration, 'ms', {
              startTime: entry.startTime
            })
            logger.warn(`Long task detected: ${entry.duration}ms`, 'PERFORMANCE')
          }
        }
      })
      longTaskObserver.observe({ entryTypes: ['longtask'] })
      this.observers.push(longTaskObserver)

    } catch (error) {
      logger.error('Failed to setup performance observers', error as Error, 'PERFORMANCE')
    }
  }

  private setupWebVitals() {
    // Core Web Vitals monitoring
    try {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        this.recordMetric('lcp', lastEntry.startTime, 'ms')
        
        if (lastEntry.startTime > 2500) {
          logger.warn(`Poor LCP: ${lastEntry.startTime}ms`, 'WEB_VITALS')
        }
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      this.observers.push(lcpObserver)

      // First Input Delay (FID) - approximated with first-input
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fid = entry.processingStart - entry.startTime
          this.recordMetric('fid', fid, 'ms')
          
          if (fid > 100) {
            logger.warn(`Poor FID: ${fid}ms`, 'WEB_VITALS')
          }
        }
      })
      fidObserver.observe({ entryTypes: ['first-input'] })
      this.observers.push(fidObserver)

      // Cumulative Layout Shift (CLS)
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
          }
        }
        this.recordMetric('cls', clsValue, 'score')
        
        if (clsValue > 0.1) {
          logger.warn(`Poor CLS: ${clsValue}`, 'WEB_VITALS')
        }
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
      this.observers.push(clsObserver)

    } catch (error) {
      logger.error('Failed to setup Web Vitals monitoring', error as Error, 'PERFORMANCE')
    }
  }

  recordMetric(name: string, value: number, unit: string, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      metadata
    }

    this.metrics.push(metric)

    // Prevent memory leaks
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }

    // Log significant metrics
    if (this.isSignificantMetric(metric)) {
      logger.info(`Performance metric: ${name} = ${value}${unit}`, 'PERFORMANCE', metadata)
    }
  }

  private isSignificantMetric(metric: PerformanceMetric): boolean {
    const significantMetrics = ['page_load_time', 'lcp', 'fid', 'cls']
    return significantMetrics.includes(metric.name)
  }

  // API response time tracking
  trackApiCall<T>(
    apiCall: () => Promise<T>,
    endpoint: string,
    method: string = 'GET'
  ): Promise<T> {
    const startTime = performance.now()
    
    return apiCall()
      .then((result) => {
        const duration = performance.now() - startTime
        this.recordMetric('api_response_time', duration, 'ms', {
          endpoint,
          method,
          success: true
        })
        logger.apiRequest(method, endpoint, 200, duration)
        return result
      })
      .catch((error) => {
        const duration = performance.now() - startTime
        this.recordMetric('api_response_time', duration, 'ms', {
          endpoint,
          method,
          success: false,
          error: error.message
        })
        logger.apiRequest(method, endpoint, 500, duration, { error: error.message })
        throw error
      })
  }

  // Database query tracking
  trackDbQuery<T>(
    query: () => Promise<T>,
    operation: string,
    table: string
  ): Promise<T> {
    const startTime = performance.now()
    
    return query()
      .then((result) => {
        const duration = performance.now() - startTime
        this.recordMetric('db_query_time', duration, 'ms', {
          operation,
          table,
          success: true
        })
        logger.dbOperation(operation, table, duration)
        return result
      })
      .catch((error) => {
        const duration = performance.now() - startTime
        this.recordMetric('db_query_time', duration, 'ms', {
          operation,
          table,
          success: false,
          error: error.message
        })
        logger.dbOperation(operation, table, duration, { error: error.message })
        throw error
      })
  }

  // Component render tracking
  trackComponentRender(componentName: string, renderTime: number) {
    this.recordMetric('component_render_time', renderTime, 'ms', {
      component: componentName
    })

    if (renderTime > 16) { // More than one frame at 60fps
      logger.warn(`Slow component render: ${componentName} took ${renderTime}ms`, 'PERFORMANCE')
    }
  }

  // Memory usage tracking
  trackMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      this.recordMetric('memory_used', memory.usedJSHeapSize, 'bytes')
      this.recordMetric('memory_total', memory.totalJSHeapSize, 'bytes')
      this.recordMetric('memory_limit', memory.jsHeapSizeLimit, 'bytes')

      // Warn if memory usage is high
      const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      if (usagePercent > 80) {
        logger.warn(`High memory usage: ${usagePercent.toFixed(1)}%`, 'PERFORMANCE')
      }
    }
  }

  // Get performance summary
  getPerformanceSummary(): Record<string, any> {
    const summary: Record<string, any> = {}
    
    // Group metrics by name and calculate averages
    const metricGroups = this.metrics.reduce((groups, metric) => {
      if (!groups[metric.name]) {
        groups[metric.name] = []
      }
      groups[metric.name].push(metric.value)
      return groups
    }, {} as Record<string, number[]>)

    for (const [name, values] of Object.entries(metricGroups)) {
      summary[name] = {
        average: values.reduce((sum, val) => sum + val, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length
      }
    }

    return summary
  }

  // Clear metrics
  clear() {
    this.metrics = []
  }

  // Cleanup observers
  cleanup() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

// Global performance monitor
export const perfMonitor = PerformanceMonitor.getInstance()

// Convenience functions
export const perf = {
  recordMetric: (name: string, value: number, unit: string, metadata?: Record<string, any>) =>
    perfMonitor.recordMetric(name, value, unit, metadata),
  trackApi: <T>(apiCall: () => Promise<T>, endpoint: string, method?: string) =>
    perfMonitor.trackApiCall(apiCall, endpoint, method),
  trackDb: <T>(query: () => Promise<T>, operation: string, table: string) =>
    perfMonitor.trackDbQuery(query, operation, table),
  trackRender: (componentName: string, renderTime: number) =>
    perfMonitor.trackComponentRender(componentName, renderTime),
  trackMemory: () => perfMonitor.trackMemoryUsage(),
  getSummary: () => perfMonitor.getPerformanceSummary(),
}
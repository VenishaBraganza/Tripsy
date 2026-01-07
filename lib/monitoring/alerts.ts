// Alert system for monitoring critical issues

import { logger } from './logger'
import { errorTracker } from './error-tracking'

export interface AlertRule {
  id: string
  name: string
  condition: (metrics: any) => boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
  cooldown: number // minutes
  enabled: boolean
}

export interface Alert {
  id: string
  ruleId: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: number
  resolved: boolean
  resolvedAt?: number
}

class AlertManager {
  private rules: AlertRule[] = []
  private alerts: Alert[] = []
  private lastTriggered = new Map<string, number>()
  private webhookUrl?: string

  constructor() {
    this.setupDefaultRules()
  }

  private setupDefaultRules() {
    this.rules = [
      {
        id: 'high-error-rate',
        name: 'High Error Rate',
        condition: (metrics) => {
          const errorRate = metrics.errorRate || 0
          return errorRate > 0.05 // 5% error rate
        },
        severity: 'high',
        cooldown: 15,
        enabled: true,
      },
      {
        id: 'slow-api-response',
        name: 'Slow API Response',
        condition: (metrics) => {
          const avgResponseTime = metrics.api_response_time?.average || 0
          return avgResponseTime > 5000 // 5 seconds
        },
        severity: 'medium',
        cooldown: 10,
        enabled: true,
      },
      {
        id: 'high-memory-usage',
        name: 'High Memory Usage',
        condition: (metrics) => {
          const memoryUsage = metrics.memory_used?.average || 0
          const memoryLimit = metrics.memory_limit?.average || Infinity
          return memoryUsage / memoryLimit > 0.9 // 90% memory usage
        },
        severity: 'high',
        cooldown: 5,
        enabled: true,
      },
      {
        id: 'database-connection-errors',
        name: 'Database Connection Errors',
        condition: (metrics) => {
          const dbErrors = metrics.dbConnectionErrors || 0
          return dbErrors > 3 // More than 3 DB connection errors
        },
        severity: 'critical',
        cooldown: 5,
        enabled: true,
      },
      {
        id: 'authentication-failures',
        name: 'High Authentication Failures',
        condition: (metrics) => {
          const authFailures = metrics.authFailures || 0
          return authFailures > 10 // More than 10 auth failures in window
        },
        severity: 'medium',
        cooldown: 10,
        enabled: true,
      },
    ]
  }

  setWebhookUrl(url: string) {
    this.webhookUrl = url
  }

  addRule(rule: AlertRule) {
    this.rules.push(rule)
  }

  removeRule(ruleId: string) {
    this.rules = this.rules.filter(rule => rule.id !== ruleId)
  }

  updateRule(ruleId: string, updates: Partial<AlertRule>) {
    const ruleIndex = this.rules.findIndex(rule => rule.id === ruleId)
    if (ruleIndex !== -1) {
      this.rules[ruleIndex] = { ...this.rules[ruleIndex], ...updates }
    }
  }

  checkAlerts(metrics: any) {
    const now = Date.now()

    for (const rule of this.rules) {
      if (!rule.enabled) continue

      // Check cooldown
      const lastTriggered = this.lastTriggered.get(rule.id) || 0
      const cooldownMs = rule.cooldown * 60 * 1000
      if (now - lastTriggered < cooldownMs) continue

      // Check condition
      if (rule.condition(metrics)) {
        this.triggerAlert(rule, metrics)
        this.lastTriggered.set(rule.id, now)
      }
    }
  }

  private async triggerAlert(rule: AlertRule, metrics: any) {
    const alert: Alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      message: this.generateAlertMessage(rule, metrics),
      severity: rule.severity,
      timestamp: Date.now(),
      resolved: false,
    }

    this.alerts.unshift(alert)

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(0, 100)
    }

    // Log the alert
    logger.error(`ALERT: ${alert.message}`, 'alerts', {
      alertId: alert.id,
      ruleId: rule.id,
      severity: rule.severity,
      metrics,
    })

    // Track as error
    errorTracker.trackError(
      new Error(`Alert: ${rule.name}`),
      'alert',
      rule.severity,
      { alertId: alert.id, metrics }
    )

    // Send webhook notification
    if (this.webhookUrl) {
      try {
        await this.sendWebhookNotification(alert, rule)
      } catch (error) {
        logger.error('Failed to send webhook notification', 'alerts', { error })
      }
    }

    // Browser notification for critical alerts
    if (rule.severity === 'critical' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(`Critical Alert: ${rule.name}`, {
          body: alert.message,
          icon: '/favicon.ico',
        })
      }
    }
  }

  private generateAlertMessage(rule: AlertRule, metrics: any): string {
    switch (rule.id) {
      case 'high-error-rate':
        return `Error rate is ${((metrics.errorRate || 0) * 100).toFixed(1)}% (threshold: 5%)`
      case 'slow-api-response':
        return `API response time is ${(metrics.api_response_time?.average || 0).toFixed(0)}ms (threshold: 5000ms)`
      case 'high-memory-usage':
        const memUsage = ((metrics.memory_used?.average || 0) / (metrics.memory_limit?.average || 1) * 100).toFixed(1)
        return `Memory usage is ${memUsage}% (threshold: 90%)`
      case 'database-connection-errors':
        return `${metrics.dbConnectionErrors || 0} database connection errors detected`
      case 'authentication-failures':
        return `${metrics.authFailures || 0} authentication failures detected`
      default:
        return `Alert condition met for ${rule.name}`
    }
  }

  private async sendWebhookNotification(alert: Alert, rule: AlertRule) {
    if (!this.webhookUrl) return

    const payload = {
      text: `🚨 ${rule.severity.toUpperCase()} ALERT: ${rule.name}`,
      attachments: [
        {
          color: this.getSeverityColor(rule.severity),
          fields: [
            {
              title: 'Message',
              value: alert.message,
              short: false,
            },
            {
              title: 'Severity',
              value: rule.severity.toUpperCase(),
              short: true,
            },
            {
              title: 'Time',
              value: new Date(alert.timestamp).toISOString(),
              short: true,
            },
          ],
        },
      ],
    }

    await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  }

  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical': return 'danger'
      case 'high': return 'warning'
      case 'medium': return '#ffeb3b'
      case 'low': return 'good'
      default: return '#9e9e9e'
    }
  }

  resolveAlert(alertId: string) {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert && !alert.resolved) {
      alert.resolved = true
      alert.resolvedAt = Date.now()
      
      logger.info(`Alert resolved: ${alert.message}`, 'alerts', {
        alertId,
        resolvedAt: alert.resolvedAt,
      })
    }
  }

  getActiveAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.resolved)
  }

  getAllAlerts(): Alert[] {
    return [...this.alerts]
  }

  getAlertRules(): AlertRule[] {
    return [...this.rules]
  }

  clearResolvedAlerts() {
    this.alerts = this.alerts.filter(alert => !alert.resolved)
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false

    if (Notification.permission === 'granted') return true

    if (Notification.permission === 'denied') return false

    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }
}

export const alertManager = new AlertManager()

// Initialize webhook URL from environment
if (typeof window === 'undefined' && process.env.ALERT_WEBHOOK_URL) {
  alertManager.setWebhookUrl(process.env.ALERT_WEBHOOK_URL)
}
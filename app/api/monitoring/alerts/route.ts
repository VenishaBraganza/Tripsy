import { NextResponse } from 'next/server'
import { alertManager } from '@/lib/monitoring/alerts'
import { perfMonitor } from '@/lib/monitoring/performance'
import { errorTracker } from '@/lib/monitoring/error-tracking'

export async function GET() {
  try {
    const activeAlerts = alertManager.getActiveAlerts()
    const allAlerts = alertManager.getAllAlerts()
    const rules = alertManager.getAlertRules()

    return NextResponse.json({
      success: true,
      data: {
        active: activeAlerts,
        all: allAlerts,
        rules,
        counts: {
          active: activeAlerts.length,
          total: allAlerts.length,
          critical: activeAlerts.filter(a => a.severity === 'critical').length,
          high: activeAlerts.filter(a => a.severity === 'high').length,
          medium: activeAlerts.filter(a => a.severity === 'medium').length,
          low: activeAlerts.filter(a => a.severity === 'low').length,
        }
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch alerts', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, alertId, ruleId, rule } = body

    switch (action) {
      case 'resolve':
        if (!alertId) {
          return NextResponse.json(
            { success: false, error: 'Alert ID is required' },
            { status: 400 }
          )
        }
        alertManager.resolveAlert(alertId)
        break

      case 'check':
        // Manually trigger alert check
        const performanceData = perfMonitor.getPerformanceSummary()
        const errorStats = errorTracker.getErrorStats()
        
        const metrics = {
          ...performanceData,
          errorRate: errorStats.total > 0 ? errorStats.total / 100 : 0, // Simple calculation
          dbConnectionErrors: errorStats.byType?.database || 0,
          authFailures: errorStats.byType?.authentication || 0,
        }
        
        alertManager.checkAlerts(metrics)
        break

      case 'add_rule':
        if (!rule) {
          return NextResponse.json(
            { success: false, error: 'Rule data is required' },
            { status: 400 }
          )
        }
        alertManager.addRule(rule)
        break

      case 'update_rule':
        if (!ruleId || !rule) {
          return NextResponse.json(
            { success: false, error: 'Rule ID and rule data are required' },
            { status: 400 }
          )
        }
        alertManager.updateRule(ruleId, rule)
        break

      case 'remove_rule':
        if (!ruleId) {
          return NextResponse.json(
            { success: false, error: 'Rule ID is required' },
            { status: 400 }
          )
        }
        alertManager.removeRule(ruleId)
        break

      case 'clear_resolved':
        alertManager.clearResolvedAlerts()
        break

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to process alert action', details: error.message },
      { status: 500 }
    )
  }
}
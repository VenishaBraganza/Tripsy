"use client"

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { 
  Activity, AlertTriangle, Clock, Database, 
  Globe, Memory, Zap, RefreshCw, Download 
} from 'lucide-react'
import { perfMonitor } from '@/lib/monitoring/performance'
import { errorTracker } from '@/lib/monitoring/error-tracking'
import { logger } from '@/lib/monitoring/logger'

interface MonitoringDashboardProps {
  className?: string
}

export function MonitoringDashboard({ className = '' }: MonitoringDashboardProps) {
  const [performanceData, setPerformanceData] = useState<any>({})
  const [errorStats, setErrorStats] = useState<any>({})
  const [recentLogs, setRecentLogs] = useState<any[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    refreshData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshData, 30000)
    return () => clearInterval(interval)
  }, [])

  const refreshData = async () => {
    setIsRefreshing(true)
    
    try {
      // Get performance metrics
      const perfSummary = perfMonitor.getPerformanceSummary()
      setPerformanceData(perfSummary)
      
      // Get error statistics
      const errorData = errorTracker.getErrorStats()
      setErrorStats(errorData)
      
      // Get recent logs
      const logs = logger.getRecentLogs(50)
      setRecentLogs(logs)
      
      // Track memory usage
      perfMonitor.trackMemoryUsage()
    } catch (error) {
      console.error('Failed to refresh monitoring data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const downloadLogs = () => {
    const logs = logger.getRecentLogs(1000)
    const dataStr = JSON.stringify(logs, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `app-logs-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    
    URL.revokeObjectURL(url)
  }

  const clearData = () => {
    perfMonitor.clear()
    errorTracker.clear()
    logger.clear()
    refreshData()
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getLogLevelColor = (level: number) => {
    switch (level) {
      case 0: return 'text-gray-500' // DEBUG
      case 1: return 'text-blue-500' // INFO
      case 2: return 'text-yellow-500' // WARN
      case 3: return 'text-red-500' // ERROR
      default: return 'text-gray-500'
    }
  }

  const getLogLevelName = (level: number) => {
    return ['DEBUG', 'INFO', 'WARN', 'ERROR'][level] || 'UNKNOWN'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Monitoring Dashboard</h2>
          <p className="text-gray-600">Real-time application performance and error tracking</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={downloadLogs}>
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
          <Button variant="outline" size="sm" onClick={clearData}>
            Clear Data
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Page Load Time</p>
              <p className="text-xl font-semibold">
                {performanceData.page_load_time?.average?.toFixed(0) || 0}ms
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Globe className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">API Response</p>
              <p className="text-xl font-semibold">
                {performanceData.api_response_time?.average?.toFixed(0) || 0}ms
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Database className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">DB Query Time</p>
              <p className="text-xl font-semibold">
                {performanceData.db_query_time?.average?.toFixed(0) || 0}ms
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Errors</p>
              <p className="text-xl font-semibold">{errorStats.total || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Performance Metrics */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Performance Metrics
              </h3>
              <div className="space-y-3">
                {Object.entries(performanceData).map(([metric, data]: [string, any]) => (
                  <div key={metric} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{metric.replace(/_/g, ' ')}</span>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {data?.average?.toFixed(1) || 0}ms avg
                      </div>
                      <div className="text-xs text-gray-500">
                        {data?.min?.toFixed(0)}-{data?.max?.toFixed(0)}ms range
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Memory Usage */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Memory className="w-5 h-5" />
                Memory Usage
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Used Memory</span>
                  <span className="text-sm font-medium">
                    {((performanceData.memory_used?.average || 0) / 1024 / 1024).toFixed(1)} MB
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Memory</span>
                  <span className="text-sm font-medium">
                    {((performanceData.memory_total?.average || 0) / 1024 / 1024).toFixed(1)} MB
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Memory Limit</span>
                  <span className="text-sm font-medium">
                    {((performanceData.memory_limit?.average || 0) / 1024 / 1024).toFixed(1)} MB
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Error Statistics */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Error Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Errors</span>
                  <Badge variant="outline">{errorStats.total || 0}</Badge>
                </div>
                {Object.entries(errorStats.bySeverity || {}).map(([severity, count]) => (
                  <div key={severity} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{severity}</span>
                    <Badge className={getSeverityColor(severity)}>
                      {count as number}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Errors */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Errors</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {errorStats.recent?.map((error: any, index: number) => (
                  <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getSeverityColor(error.severity)} size="sm">
                        {error.severity}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(error.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-gray-800 truncate">{error.message}</div>
                  </div>
                )) || <p className="text-gray-500 text-sm">No recent errors</p>}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Logs
            </h3>
            <div className="space-y-1 max-h-96 overflow-y-auto font-mono text-sm">
              {recentLogs.map((log, index) => (
                <div key={index} className="flex items-start gap-2 py-1">
                  <span className="text-xs text-gray-500 w-20 flex-shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className={`text-xs w-12 flex-shrink-0 ${getLogLevelColor(log.level)}`}>
                    {getLogLevelName(log.level)}
                  </span>
                  {log.context && (
                    <span className="text-xs text-purple-600 w-20 flex-shrink-0">
                      [{log.context}]
                    </span>
                  )}
                  <span className="text-xs flex-1">{log.message}</span>
                </div>
              ))}
              {recentLogs.length === 0 && (
                <p className="text-gray-500 text-sm">No logs available</p>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
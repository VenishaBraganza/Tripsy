import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { logs } = await request.json()
    
    if (!Array.isArray(logs)) {
      return NextResponse.json({ error: 'Invalid logs format' }, { status: 400 })
    }

    // In production, you might want to:
    // 1. Store logs in a database
    // 2. Send to external logging service (e.g., Sentry, LogRocket)
    // 3. Filter sensitive information
    // 4. Rate limit requests

    // For now, just log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Client Logs Received:', logs.length, 'entries')
      logs.forEach((log: any) => {
        const level = ['DEBUG', 'INFO', 'WARN', 'ERROR'][log.level] || 'INFO'
        console.log(`[${level}] ${log.timestamp} ${log.context ? `[${log.context}] ` : ''}${log.message}`)
      })
    }

    // In production, store critical logs
    if (process.env.NODE_ENV === 'production') {
      const criticalLogs = logs.filter((log: any) => log.level >= 2) // WARN and ERROR
      
      if (criticalLogs.length > 0) {
        const supabase = await getSupabaseServerClient()
        
        // Store in database (you'd need to create a logs table)
        const { error } = await supabase
          .from('application_logs')
          .insert(
            criticalLogs.map((log: any) => ({
              level: log.level,
              message: log.message,
              context: log.context,
              metadata: log.metadata,
              user_id: log.userId,
              session_id: log.sessionId,
              timestamp: log.timestamp,
            }))
          )
        
        if (error) {
          console.error('Failed to store logs:', error)
        }
      }
    }

    return NextResponse.json({ success: true, received: logs.length })
  } catch (error) {
    console.error('Error processing logs:', error)
    return NextResponse.json({ error: 'Failed to process logs' }, { status: 500 })
  }
}